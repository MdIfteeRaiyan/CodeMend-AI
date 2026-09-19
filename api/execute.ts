import type { IncomingMessage, ServerResponse } from "node:http";
import {
  executionResultSchema,
  testExecutionRequestSchema,
  testExecutionResultSchema,
  type ExecutionResult,
  type TestCase,
} from "../shared/execution";

const MAX_BODY_BYTES = 140_000;
const RUNNER_TIMEOUT_MS = 8_000;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const requests = new Map<string, { count: number; resetAt: number }>();

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-content-type-options", "nosniff");
  res.end(JSON.stringify(body));
}

function clientKey(req: IncomingMessage) {
  const forwarded = req.headers["x-forwarded-for"];
  return (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0])?.trim() || req.socket.remoteAddress || "unknown";
}

function isRateLimited(req: IncomingMessage) {
  const key = clientKey(req);
  const now = Date.now();
  const current = requests.get(key);
  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

async function readBody(req: IncomingMessage) {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > MAX_BODY_BYTES) throw new Error("PAYLOAD_TOO_LARGE");
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function normalizeOutput(value: string) {
  return value.replace(/\r\n/g, "\n").trimEnd();
}

async function executeOne(language: string, code: string, test: TestCase): Promise<ExecutionResult> {
  const baseUrl = process.env.CODE_RUNNER_BASE_URL?.trim();
  if (!baseUrl) throw new Error("RUNNER_NOT_CONFIGURED");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RUNNER_TIMEOUT_MS);
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/execute`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.CODE_RUNNER_API_KEY ? { authorization: `Bearer ${process.env.CODE_RUNNER_API_KEY}` } : {}),
      },
      body: JSON.stringify({ language, code, stdin: test.stdin }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`RUNNER_${response.status}`);
    return executionResultSchema.parse(await response.json());
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.setHeader("allow", "POST");
    return send(res, 405, { error: "Method not allowed" });
  }
  if (isRateLimited(req)) return send(res, 429, { error: "Too many runs. Please wait a minute." });

  try {
    const input = testExecutionRequestSchema.parse(await readBody(req));
    if (!process.env.CODE_RUNNER_BASE_URL) {
      return send(res, 503, {
        error: "Secure runner not configured",
        message: "Add CODE_RUNNER_BASE_URL and CODE_RUNNER_API_KEY in Vercel to enable real multi-language execution.",
      });
    }

    const tests = [];
    let compileError = false;
    for (const test of input.testCases) {
      const result = await executeOne(input.language, input.code, test);
      const passed = result.status === "success" && normalizeOutput(result.stdout) === normalizeOutput(test.expectedOutput);
      if (result.status === "compile_error") compileError = true;
      tests.push({
        id: test.id,
        name: test.name,
        status: result.status === "timeout" ? "timeout" as const : result.status === "success" ? (passed ? "passed" as const : "failed" as const) : "error" as const,
        expectedOutput: test.expectedOutput,
        actualOutput: result.stdout,
        stderr: result.stderr,
        executionTimeMs: result.executionTimeMs,
      });
      if (compileError) break;
    }
    const passed = tests.filter((test) => test.status === "passed").length;
    const result = testExecutionResultSchema.parse({
      language: input.language,
      status: compileError ? "compile_error" : passed === input.testCases.length ? "passed" : "failed",
      passed,
      total: input.testCases.length,
      tests,
      message: compileError ? "Compilation stopped before all tests could run." : `${passed} of ${input.testCases.length} tests passed.`,
      isDemo: false,
    });
    return send(res, 200, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Execution failed";
    const status = message === "PAYLOAD_TOO_LARGE" ? 413 : message.includes("aborted") ? 504 : 400;
    return send(res, status, { error: status === 504 ? "Execution timed out" : "Invalid execution request", message });
  }
}
