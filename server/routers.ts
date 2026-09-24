import { COOKIE_NAME } from "@shared/const";
import {
  debugExplanationRequestSchema,
  debugExplanationSchema,
  executionRequestSchema,
  type ExecutionResult,
} from "@shared/execution";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { runInSandbox } from "./services/runner";

function analyzeDemoExecution(input: ReturnType<typeof executionRequestSchema.parse>): ExecutionResult {
  const startedAt = Date.now();
  const lines = input.code.split("\n");

  if (input.language === "Python") {
    const errorLine = lines.findIndex((line) => line.includes("print(message") && !line.includes("print(message)"));
    if (errorLine >= 0) {
      return {
        status: "compile_error",
        language: input.language,
        stdout: "",
        stderr: "SyntaxError: '(' was never closed",
        line: errorLine + 1,
        errorType: "SyntaxError",
        explanation: "This function call opens a parenthesis but the line ends before it closes.",
        hint: `Look at the end of line ${errorLine + 1}. Which symbol closes the function call?`,
        executionTimeMs: Date.now() - startedAt,
        isDemo: true,
      };
    }

    if (input.code.includes("greet(\"Mina\")") && input.code.includes("print(message)")) {
      return {
        status: "success",
        language: input.language,
        stdout: "Hello, Mina\n",
        stderr: "",
        line: null,
        errorType: null,
        explanation: "Your function ran successfully.",
        hint: "Try changing the name argument and run it again.",
        executionTimeMs: Date.now() - startedAt,
        isDemo: true,
      };
    }
  }

  return {
    status: "success",
    language: input.language,
    stdout: "Demo run completed.\n",
    stderr: "",
    line: null,
    errorType: null,
    explanation: "This preview confirms the request contract. A secure runner will provide real compiler output in the next integration.",
    hint: "Keep experimenting, then connect the sandbox runner before describing this as live execution.",
    executionTimeMs: Date.now() - startedAt,
    isDemo: true,
  };
}

async function createDebugExplanation(
  input: ReturnType<typeof debugExplanationRequestSchema.parse>,
) {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are DebugTest, a patient debugging tutor. Explain errors simply for a student. Give a hint before a fix. Never invent compiler output, never encourage unsafe code, and return only the requested JSON.",
        },
        {
          role: "user",
          content: JSON.stringify({
            task: "Explain this coding error",
            language: input.language,
            code: input.code,
            errorType: input.errorType,
            line: input.line,
            stderr: input.stderr,
          }),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "debugtest_debug_explanation",
          strict: true,
          schema: {
            type: "object",
            properties: {
              whatHappened: { type: "string" },
              whyItHappened: { type: "string" },
              hint: { type: "string" },
              concept: { type: "string" },
              suggestedFix: { type: ["string", "null"] },
            },
            required: ["whatHappened", "whyItHappened", "hint", "concept", "suggestedFix"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("AI response was not text");
    return debugExplanationSchema.parse(JSON.parse(content));
  } catch (error) {
    console.warn("[AI] Falling back to deterministic explanation:", error);
    return debugExplanationSchema.parse({
      whatHappened: `${input.errorType ?? "The compiler"} reported a problem${input.line ? ` on line ${input.line}` : ""}.`,
      whyItHappened: "The submitted code does not match the syntax or runtime rules expected by this language.",
      hint: "Read the error line slowly and compare the opening and closing symbols around it.",
      concept: "Reading compiler errors",
      suggestedFix: null,
    });
  }
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  execution: router({
    run: publicProcedure.input(executionRequestSchema).mutation(({ input }) =>
      process.env.CODE_RUNNER_BASE_URL ? runInSandbox(input) : analyzeDemoExecution(input),
    ),
    explain: publicProcedure.input(debugExplanationRequestSchema).mutation(({ input }) => createDebugExplanation(input)),
  }),
});

export type AppRouter = typeof appRouter;
