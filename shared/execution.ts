import { z } from "zod";

export const supportedLanguages = ["Python", "C", "C++", "Java", "JavaScript", "TypeScript", "C#", "Go", "Rust", "PHP", "Kotlin", "Ruby"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const executionRequestSchema = z.object({
  language: z.enum(supportedLanguages),
  code: z.string().trim().min(1, "Code cannot be empty").max(20_000, "Code is too large"),
  stdin: z.string().max(4_000, "Input is too large").default(""),
});

export type ExecutionRequest = z.infer<typeof executionRequestSchema>;

export const executionResultSchema = z.object({
  status: z.enum(["success", "compile_error", "runtime_error", "timeout", "service_unavailable"]),
  language: z.enum(supportedLanguages),
  stdout: z.string().max(20_000),
  stderr: z.string().max(20_000),
  line: z.number().int().positive().nullable(),
  errorType: z.string().max(100).nullable(),
  explanation: z.string().max(1_000),
  hint: z.string().max(500),
  executionTimeMs: z.number().int().nonnegative(),
  isDemo: z.boolean(),
});

export type ExecutionResult = z.infer<typeof executionResultSchema>;

export const testCaseSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().trim().min(1).max(80),
  stdin: z.string().max(4_000, "Test input is too large"),
  expectedOutput: z.string().max(20_000, "Expected output is too large"),
});

export type TestCase = z.infer<typeof testCaseSchema>;

export const testExecutionRequestSchema = z.object({
  language: z.enum(supportedLanguages),
  code: z.string().trim().min(1, "Code cannot be empty").max(20_000, "Code is too large"),
  testCases: z.array(testCaseSchema).min(1).max(6),
});

export const testCaseResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["passed", "failed", "error", "timeout"]),
  expectedOutput: z.string(),
  actualOutput: z.string(),
  stderr: z.string(),
  executionTimeMs: z.number().int().nonnegative(),
});

export const testExecutionResultSchema = z.object({
  language: z.enum(supportedLanguages),
  status: z.enum(["passed", "failed", "compile_error", "service_unavailable"]),
  passed: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  tests: z.array(testCaseResultSchema),
  message: z.string().max(1_000),
  isDemo: z.boolean(),
});

export type TestExecutionResult = z.infer<typeof testExecutionResultSchema>;

export const debugExplanationSchema = z.object({
  whatHappened: z.string().min(1).max(1_000),
  whyItHappened: z.string().min(1).max(1_000),
  hint: z.string().min(1).max(500),
  concept: z.string().min(1).max(120),
  suggestedFix: z.string().max(4_000).nullable(),
});

export type DebugExplanation = z.infer<typeof debugExplanationSchema>;

export const debugExplanationRequestSchema = z.object({
  language: z.enum(supportedLanguages),
  code: z.string().trim().min(1).max(20_000),
  stderr: z.string().max(20_000),
  line: z.number().int().positive().nullable(),
  errorType: z.string().max(100).nullable(),
});
