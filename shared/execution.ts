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
