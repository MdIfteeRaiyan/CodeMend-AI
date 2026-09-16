import { describe, expect, it } from "vitest";
import { debugExplanationSchema, executionRequestSchema } from "@shared/execution";
import { appRouter } from "./routers";
import { runInSandbox } from "./services/runner";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("execution.run", () => {
  it("accepts every guided language", () => {
    for (const language of ["Python", "C++", "Java", "JavaScript", "TypeScript", "C#"] as const) {
      expect(executionRequestSchema.parse({ language, code: "example", stdin: "" }).language).toBe(language);
    }
  });
  it("returns a structured compile error for the guided Python example", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.execution.run({
      language: "Python",
      code: 'def greet(name):\n    print(message',
      stdin: "",
    });

    expect(result).toMatchObject({
      status: "compile_error",
      language: "Python",
      line: 2,
      errorType: "SyntaxError",
      isDemo: true,
    });
    expect(result.explanation.length).toBeGreaterThan(10);
    expect(result.hint.length).toBeGreaterThan(10);
  });

  it("returns success for the fixed Python example", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.execution.run({
      language: "Python",
      code: 'def greet(name):\n    message = "Hello, " + name\n    print(message)\n\ngreet("Mina")',
      stdin: "",
    });

    expect(result).toMatchObject({
      status: "success",
      stdout: "Hello, Mina\n",
      line: null,
      errorType: null,
      isDemo: true,
    });
  });

  it("rejects oversized code before analysis", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(
      caller.execution.run({
        language: "Java",
        code: "x".repeat(20_001),
        stdin: "",
      }),
    ).rejects.toThrow("Code is too large");
  });

  it("accepts only complete structured AI explanations", () => {
    expect(() =>
      debugExplanationSchema.parse({
        whatHappened: "A closing parenthesis is missing.",
        whyItHappened: "The function call is incomplete.",
        hint: "Check the end of the error line.",
        concept: "Syntax errors",
        suggestedFix: "print(message)",
      }),
    ).not.toThrow();

    expect(() => debugExplanationSchema.parse({ whatHappened: "Only a partial response" })).toThrow();
  });

  it("reports an explicit unavailable state when no runner is configured", async () => {
    const previousUrl = process.env.CODE_RUNNER_BASE_URL;
    const previousKey = process.env.CODE_RUNNER_API_KEY;
    delete process.env.CODE_RUNNER_BASE_URL;
    delete process.env.CODE_RUNNER_API_KEY;

    const result = await runInSandbox({ language: "Python", code: "print(1)", stdin: "" });

    expect(result).toMatchObject({
      status: "service_unavailable",
      errorType: "RunnerUnavailable",
      isDemo: false,
    });

    if (previousUrl === undefined) delete process.env.CODE_RUNNER_BASE_URL;
    else process.env.CODE_RUNNER_BASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.CODE_RUNNER_API_KEY;
    else process.env.CODE_RUNNER_API_KEY = previousKey;
  });
});
