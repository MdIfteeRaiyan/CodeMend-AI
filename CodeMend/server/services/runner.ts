import {
  executionResultSchema,
  type ExecutionRequest,
  type ExecutionResult,
} from "@shared/execution";

const RUNNER_TIMEOUT_MS = 10_000;

function unavailableResult(input: ExecutionRequest): ExecutionResult {
  return {
    status: "service_unavailable",
    language: input.language,
    stdout: "",
    stderr: "The secure execution service is not configured.",
    line: null,
    errorType: "RunnerUnavailable",
    explanation: "CodeMend is in preview mode until a sandboxed execution provider is connected.",
    hint: "Use the guided demo or connect a runner before enabling live execution.",
    executionTimeMs: 0,
    isDemo: false,
  };
}

export async function runInSandbox(input: ExecutionRequest): Promise<ExecutionResult> {
  const baseUrl = process.env.CODE_RUNNER_BASE_URL?.trim();
  if (!baseUrl) return unavailableResult(input);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RUNNER_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/execute`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(process.env.CODE_RUNNER_API_KEY
          ? { authorization: `Bearer ${process.env.CODE_RUNNER_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Runner responded with ${response.status}`);
    return executionResultSchema.parse(await response.json());
  } catch (error) {
    console.warn("[Runner] Execution service unavailable:", error);
    return unavailableResult(input);
  } finally {
    clearTimeout(timeout);
  }
}
