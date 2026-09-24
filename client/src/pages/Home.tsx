import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Command,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Github,
  GraduationCap,
  History,
  Lightbulb,
  Menu,
  Play,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  Trash2,
  Upload,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import type { ExecutionResult, TestCase, TestExecutionResult } from "@shared/execution";

type Language = "Python" | "C" | "C++" | "Java" | "JavaScript" | "TypeScript" | "C#" | "Go" | "Rust" | "PHP" | "Kotlin" | "Ruby";
type RunState = "idle" | "error" | "fixed";

type PracticeChallenge = {
  id: string;
  title: string;
  language: Language;
  level: "Beginner" | "Intermediate";
  minutes: number;
  xp: number;
  code: string;
};

type SavedRun = { language: Language; status: "Passed" | "Review"; at: string };

const starterExpectedOutput: Record<Language, string> = {
  Python: "Hello, Mina", C: "Hello, DebugTest!", "C++": "Hello, DebugTest!", Java: "Hello, DebugTest!",
  JavaScript: "Hello, Mina", TypeScript: "Hello, Mina", "C#": "Hello, DebugTest!", Go: "Hello, DebugTest!",
  Rust: "Hello, DebugTest!", PHP: "Hello, Mina", Kotlin: "Hello, DebugTest!", Ruby: "Hello, Mina!",
};

const createTestCase = (index: number, language: Language = "Python", expectedOutput = starterExpectedOutput[language]): TestCase => ({
  id: `case-${Date.now()}-${index}`,
  name: `Test ${index}`,
  stdin: "",
  expectedOutput: index === 1 ? expectedOutput : "",
});

const starterCode: Record<Language, string> = {
  Python: `def greet(name):\n    message = "Hello, " + name\n    print(message\n\ngreet("Mina")`,
  C: `#include <stdio.h>\n\nint main(void) {\n  printf("Hello, DebugTest!\\n");\n  return 0;\n}`,
  "C++": `#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, DebugTest!" << endl;\n  return 0;\n}`,
  Java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, DebugTest!");\n  }\n}`,
  JavaScript: `function greet(name) {\n  const message = "Hello, " + name;\n  console.log(message);\n}\n\ngreet("Mina");`,
  TypeScript: `function greet(name: string): void {\n  const message: string = "Hello, " + name;\n  console.log(message);\n}\n\ngreet("Mina");`,
  "C#": `using System;\n\nclass Program {\n  static void Main(string[] args) {\n    Console.WriteLine("Hello, DebugTest!");\n  }\n}`,
  Go: `package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello, DebugTest!")\n}`,
  Rust: `fn main() {\n    println!("Hello, DebugTest!");\n}`,
  PHP: `<?php\n\nfunction greet($name) {\n  echo "Hello, " . $name;\n}\n\ngreet("Mina");`,
  Kotlin: `fun main() {\n  println("Hello, DebugTest!")\n}`,
  Ruby: `def greet(name)\n  puts "Hello, #{name}!"\nend\n\ngreet("Mina")`,
};

const challenges: PracticeChallenge[] = [
  { id: "py-paren", title: "Close the function call", language: "Python", level: "Beginner", minutes: 3, xp: 20, code: starterCode.Python },
  { id: "py-colon", title: "Restore the missing colon", language: "Python", level: "Intermediate", minutes: 4, xp: 30, code: `def is_even(number)\n    if number % 2 == 0:\n        print("Even")\n\nis_even(8)` },
  { id: "c-main", title: "Restore the C entry point", language: "C", level: "Beginner", minutes: 4, xp: 20, code: `#include <stdio.h>\n\nint start(void) {\n  printf("Hello!\\n");\n  return 0;\n}` },
  { id: "c-brace", title: "Close the C main block", language: "C", level: "Intermediate", minutes: 5, xp: 30, code: `#include <stdio.h>\n\nint main(void) {\n  printf("Keep learning!\\n");\n  return 0;` },
  { id: "cpp-main", title: "Repair the entry point", language: "C++", level: "Beginner", minutes: 5, xp: 20, code: `#include <iostream>\nusing namespace std;\n\nint start() {\n  cout << "Hello, DebugTest!" << endl;\n  return 0;\n}` },
  { id: "cpp-brace", title: "Close the main block", language: "C++", level: "Intermediate", minutes: 5, xp: 30, code: `#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Keep going!" << endl;` },
  { id: "java-brace", title: "Balance the class braces", language: "Java", level: "Intermediate", minutes: 6, xp: 30, code: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Keep learning!");\n  }` },
  { id: "java-main", title: "Find the missing main", language: "Java", level: "Beginner", minutes: 4, xp: 20, code: `public class Main {\n  public static void start(String[] args) {\n    System.out.println("Hello!");\n  }\n}` },
  { id: "js-function", title: "Complete the function", language: "JavaScript", level: "Beginner", minutes: 4, xp: 20, code: `function add(a, b) {\n  return a + b;\n\nconsole.log(add(2, 3));` },
  { id: "js-array", title: "Close the array", language: "JavaScript", level: "Intermediate", minutes: 4, xp: 30, code: `const skills = ["debug", "test", "learn";\nconsole.log(skills);` },
  { id: "ts-greeting", title: "Fix the typed greeting", language: "TypeScript", level: "Intermediate", minutes: 5, xp: 30, code: `function greet(name: string): string {\n  return "Hello, " + name;\n\nconsole.log(greet("Mina"));` },
  { id: "ts-object", title: "Balance the user object", language: "TypeScript", level: "Beginner", minutes: 4, xp: 20, code: `const learner: { name: string } = {\n  name: "Mina"\n;\nconsole.log(learner.name);` },
  { id: "cs-main", title: "Repair the Main method", language: "C#", level: "Beginner", minutes: 5, xp: 20, code: `using System;\n\nclass Program {\n  static void Start() {\n    Console.WriteLine("Hello!");\n  }\n}` },
  { id: "cs-brace", title: "Close the Program class", language: "C#", level: "Intermediate", minutes: 5, xp: 30, code: `using System;\n\nclass Program {\n  static void Main(string[] args) {\n    Console.WriteLine("Ready");\n  }` },
  { id: "go-main", title: "Restore the Go entry point", language: "Go", level: "Beginner", minutes: 4, xp: 20, code: `package main\n\nimport "fmt"\n\nfunc start() {\n  fmt.Println("Hello!")\n}` },
  { id: "go-brace", title: "Close the Go function", language: "Go", level: "Intermediate", minutes: 5, xp: 30, code: `package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Keep building!")` },
  { id: "rust-main", title: "Find the Rust main function", language: "Rust", level: "Beginner", minutes: 4, xp: 20, code: `fn start() {\n  println!("Hello!");\n}` },
  { id: "rust-macro", title: "Close the Rust macro", language: "Rust", level: "Intermediate", minutes: 5, xp: 30, code: `fn main() {\n  println!("Keep learning!";\n}` },
  { id: "php-function", title: "Complete the PHP function", language: "PHP", level: "Beginner", minutes: 4, xp: 20, code: `<?php\n\nfunction greet($name) {\n  echo "Hello, " . $name;\n\ngreet("Mina");` },
  { id: "php-array", title: "Balance the PHP array", language: "PHP", level: "Intermediate", minutes: 5, xp: 30, code: `<?php\n\n$skills = ["debug", "test", "learn";\necho count($skills);` },
  { id: "kt-main", title: "Restore Kotlin main", language: "Kotlin", level: "Beginner", minutes: 4, xp: 20, code: `fun start() {\n  println("Hello!")\n}` },
  { id: "kt-brace", title: "Close the Kotlin function", language: "Kotlin", level: "Intermediate", minutes: 5, xp: 30, code: `fun main() {\n  val skills = listOf("debug", "test")\n  println(skills.size)` },
  { id: "rb-block", title: "Close the Ruby method", language: "Ruby", level: "Beginner", minutes: 4, xp: 20, code: `def greet(name)\n  puts "Hello, #{name}!"\n\ngreet("Mina")` },
  { id: "rb-array", title: "Balance the Ruby array", language: "Ruby", level: "Intermediate", minutes: 5, xp: 30, code: `skills = ["debug", "test", "learn"\nputs skills.length` },
];

const fixedPython = `def greet(name):\n    message = "Hello, " + name\n    print(message)\n\ngreet("Mina")`;

const languageMeta: Record<Language, { tone: string; version: string; extension: string }> = {
  Python: { tone: "#70d6a3", version: "3.12", extension: "py" },
  C: { tone: "#8fa9ff", version: "C17", extension: "c" },
  "C++": { tone: "#87a8ff", version: "17", extension: "cpp" },
  Java: { tone: "#ffb56d", version: "21", extension: "java" },
  JavaScript: { tone: "#f5d76e", version: "ES2023", extension: "js" },
  TypeScript: { tone: "#69a7ff", version: "5.9", extension: "ts" },
  "C#": { tone: "#b38cff", version: ".NET 8", extension: "cs" },
  Go: { tone: "#63d3e8", version: "1.23", extension: "go" },
  Rust: { tone: "#e89b72", version: "2024", extension: "rs" },
  PHP: { tone: "#9ca7ee", version: "8.3", extension: "php" },
  Kotlin: { tone: "#c88cff", version: "2.0", extension: "kt" },
  Ruby: { tone: "#ef7777", version: "3.3", extension: "rb" },
};

function suggestedOutput(language: Language, code: string) {
  const calledName = code.match(/greet\(["']([^"']+)["']\)/)?.[1];
  if (calledName && language === "Ruby" && code.includes("#{name}")) return `Hello, ${calledName}!`;
  if (calledName && ["Python", "JavaScript", "TypeScript", "PHP"].includes(language)) return `Hello, ${calledName}`;
  return code.match(/(?:printf\s*\(|cout\s*<<|System\.out\.println\s*\(|Console\.WriteLine\s*\(|console\.log\s*\(|fmt\.Println\s*\(|println!\s*\(|println\s*\(|echo\s+|puts\s+)[\s]*["']([^"']+)["']/)?.[1] ?? "";
}

function dayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calculateStreak(days: string[]) {
  const unique = new Set(days);
  const cursor = new Date();
  let count = 0;
  while (unique.has(dayKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

function decodeSharedCode(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return new TextDecoder().decode(Uint8Array.from(atob(base64), (character) => character.charCodeAt(0)));
}

function CodeLines({ code, errorLine }: { code: string; errorLine?: number | null }) {
  const count = Math.max(code.split("\n").length, 1);
  return (
    <div className="line-numbers" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className={errorLine === index + 1 ? "line-number-error" : ""}>
          {String(index + 1).padStart(2, "0")}
        </span>
      ))}
    </div>
  );
}

function runGuidedCheck(language: Language, code: string): ExecutionResult {
  const startedAt = performance.now();
  const lines = code.split("\n");
  const finish = (result: Omit<ExecutionResult, "language" | "executionTimeMs" | "isDemo">): ExecutionResult => ({
    ...result,
    language,
    executionTimeMs: Math.max(1, Math.round(performance.now() - startedAt)),
    isDemo: true,
  });

  if (!code.trim()) {
    return finish({ status: "compile_error", stdout: "", stderr: "No code to check", line: 1, errorType: "EmptyEditor", explanation: "The editor is empty, so there is nothing to check yet.", hint: "Reset the editor to load a guided example." });
  }

  const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
  const stack: Array<{ token: string; line: number }> = [];
  let quote: string | null = null;
  for (let index = 0; index < code.length; index += 1) {
    const token = code[index];
    if ((token === '"' || token === "'") && code[index - 1] !== "\\") quote = quote === token ? null : quote ? quote : token;
    if (quote) continue;
    const line = code.slice(0, index).split("\n").length;
    if (pairs[token]) stack.push({ token, line });
    else if (Object.values(pairs).includes(token)) {
      const open = stack.pop();
      if (!open || pairs[open.token] !== token) {
        return finish({ status: "compile_error", stdout: "", stderr: `Unexpected '${token}'`, line, errorType: "DelimiterError", explanation: "A closing symbol does not match the symbol opened before it.", hint: `Check the brackets and parentheses around line ${line}.` });
      }
    }
  }
  if (stack.length) {
    const open = stack[stack.length - 1];
    return finish({ status: "compile_error", stdout: "", stderr: `'${open.token}' was never closed`, line: open.line, errorType: "DelimiterError", explanation: `This code opens '${open.token}' but never closes it with '${pairs[open.token]}'.`, hint: `Add the matching '${pairs[open.token]}' after the unfinished block or expression.` });
  }

  if (language === "Python") {
    const missingColon = lines.findIndex((line) => /^\s*(def|if|elif|else|for|while)\b/.test(line) && !line.trimEnd().endsWith(":"));
    if (missingColon >= 0) {
      return finish({ status: "compile_error", stdout: "", stderr: "Expected ':'", line: missingColon + 1, errorType: "SyntaxError", explanation: "Python block statements end with a colon before their indented body.", hint: `Add ':' to the end of line ${missingColon + 1}.` });
    }
    const greeting = code.match(/greet\(["']([^"']+)["']\)/)?.[1] ?? "Mina";
    return finish({ status: "success", stdout: code.includes("print") ? `Hello, ${greeting}\n` : "Guided check passed.\n", stderr: "", line: null, errorType: null, explanation: "The guided syntax check passed.", hint: "Change the name and run the example again." });
  }

  if (language === "Ruby") {
    const blocks = lines.filter((line) => /^\s*(def|if|unless|case|while|for|class|module)\b/.test(line)).length;
    const ends = lines.filter((line) => /^\s*end\s*$/.test(line)).length;
    if (ends < blocks) return finish({ status: "compile_error", stdout: "", stderr: "Expected 'end'", line: lines.length, errorType: "BlockError", explanation: "A Ruby block was opened but not closed with end.", hint: "Add end after the final statement in the unfinished method or block." });
    const output = code.match(/puts\s+["']([^"']+)/)?.[1] ?? "Guided check passed.";
    return finish({ status: "success", stdout: `${output}\n`, stderr: "", line: null, errorType: null, explanation: "The guided Ruby structure check passed.", hint: "Try the next Ruby challenge." });
  }

  const requiresEntryPoint = ["C", "C++", "Java", "C#", "Go", "Rust", "Kotlin"].includes(language);
  const hasEntryPoint = language === "C" || language === "C++" ? /int\s+main\s*\(/i.test(code) : language === "C#" ? /static\s+void\s+Main\s*\(/.test(code) : language === "Go" ? /func\s+main\s*\(/.test(code) : language === "Rust" ? /fn\s+main\s*\(/.test(code) : language === "Kotlin" ? /fun\s+main\s*\(/.test(code) : /static\s+void\s+main\s*\(/.test(code);
  if (requiresEntryPoint && !hasEntryPoint) {
    const hint = language === "C" || language === "C++" ? "Add an int main() function." : language === "C#" ? "Add a static void Main(string[] args) method." : language === "Go" ? "Add a func main() function." : language === "Rust" ? "Add an fn main() function." : language === "Kotlin" ? "Add a fun main() function." : "Add a public static void main(String[] args) method.";
    return finish({ status: "compile_error", stdout: "", stderr: "Program entry point not found", line: 1, errorType: "EntryPointError", explanation: `DebugTest could not find the ${language} program entry point.`, hint });
  }
  const output = code.match(/(?:printf\s*\(|cout\s*<<|System\.out\.println\s*\(|Console\.WriteLine\s*\(|console\.log\s*\(|fmt\.Println\s*\(|println!\s*\(|println\s*\(|echo\s+)[\s]*["']([^"']+)["']/)?.[1] ?? "Guided check passed.";
  return finish({ status: "success", stdout: `${output}\n`, stderr: "", line: null, errorType: null, explanation: "The guided structure check passed.", hint: "Connect a secure runner later for full compilation and runtime output." });
}

function runJavaScriptInWorker(code: string): Promise<ExecutionResult> {
  const startedAt = performance.now();
  return new Promise((resolve) => {
    const workerSource = `
      self.fetch = undefined; self.XMLHttpRequest = undefined; self.WebSocket = undefined; self.importScripts = undefined;
      const format = (value) => typeof value === "string" ? value : (() => { try { return JSON.stringify(value); } catch { return String(value); } })();
      self.onmessage = async (event) => {
        const output = [];
        console.log = (...values) => output.push(values.map(format).join(" "));
        console.info = console.log; console.warn = console.log; console.error = console.log;
        try {
          const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
          await new AsyncFunction('"use strict";\\n' + event.data)();
          self.postMessage({ ok: true, output: output.join("\\n") });
        } catch (error) {
          self.postMessage({ ok: false, name: error?.name || "RuntimeError", message: error?.message || String(error), output: output.join("\\n") });
        }
      };
    `;
    const workerUrl = URL.createObjectURL(new Blob([workerSource], { type: "text/javascript" }));
    const worker = new Worker(workerUrl);
    const finish = (result: ExecutionResult) => { worker.terminate(); URL.revokeObjectURL(workerUrl); resolve(result); };
    const timeout = window.setTimeout(() => finish({ status: "timeout", language: "JavaScript", stdout: "", stderr: "Execution stopped after 1.5 seconds", line: null, errorType: "TimeoutError", explanation: "The program ran for too long, so DebugTest stopped the isolated browser worker.", hint: "Check for an infinite loop or reduce the amount of work.", executionTimeMs: 1500, isDemo: false }), 1500);
    worker.onmessage = (event: MessageEvent<{ ok: boolean; output: string; name?: string; message?: string }>) => {
      window.clearTimeout(timeout);
      const elapsed = Math.max(1, Math.round(performance.now() - startedAt));
      if (event.data.ok) finish({ status: "success", language: "JavaScript", stdout: event.data.output ? `${event.data.output}\n` : "Program completed with no console output.\n", stderr: "", line: null, errorType: null, explanation: "JavaScript ran inside an isolated browser worker.", hint: "Try another input or practice challenge.", executionTimeMs: elapsed, isDemo: false });
      else finish({ status: "runtime_error", language: "JavaScript", stdout: event.data.output ? `${event.data.output}\n` : "", stderr: event.data.message ?? "JavaScript runtime error", line: null, errorType: event.data.name ?? "RuntimeError", explanation: "JavaScript started but encountered a runtime error.", hint: "Use the error name and message to inspect the related variable or expression.", executionTimeMs: elapsed, isDemo: false });
    };
    worker.onerror = () => { window.clearTimeout(timeout); finish({ status: "runtime_error", language: "JavaScript", stdout: "", stderr: "The browser worker could not run this program.", line: null, errorType: "WorkerError", explanation: "The isolated JavaScript runner could not complete.", hint: "Check the syntax and try again.", executionTimeMs: Math.max(1, Math.round(performance.now() - startedAt)), isDemo: false }); };
    worker.postMessage(code);
  });
}

function AppMark() {
  return (
    <div className="app-mark" aria-label="DebugTest">
      <span className="app-mark-icon"><img src="/debugtest-mark.svg" alt="" /></span>
      <span>DebugTest</span>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("Python");
  const [code, setCode] = useState(starterCode.Python);
  const [runState, setRunState] = useState<RunState>("idle");
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [learnerMode, setLearnerMode] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [aiExplanation, setAiExplanation] = useState<{ whatHappened: string; hint: string; concept: string } | null>(null);
  const [history, setHistory] = useState<SavedRun[]>([]);
  const [practiceDays, setPracticeDays] = useState<string[]>([]);
  const [activeChallenge, setActiveChallenge] = useState<number | null>(0);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [challengeFilter, setChallengeFilter] = useState<"All" | Language>("All");
  const [copied, setCopied] = useState(false);
  const [workspaceNotice, setWorkspaceNotice] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([createTestCase(1)]);
  const [testResults, setTestResults] = useState<TestExecutionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("debugtest-history") ?? window.localStorage.getItem("codemend-history");
      if (saved) setHistory(JSON.parse(saved) as SavedRun[]);
      const savedDays = window.localStorage.getItem("debugtest-practice-days") ?? window.localStorage.getItem("codemend-practice-days");
      if (savedDays) setPracticeDays(JSON.parse(savedDays) as string[]);
      const savedChallenges = window.localStorage.getItem("debugtest-completed-challenges") ?? window.localStorage.getItem("codemend-completed-challenges");
      if (savedChallenges) setCompletedChallenges(JSON.parse(savedChallenges) as string[]);
      const shared = new URLSearchParams(window.location.hash.slice(1)).get("code");
      if (shared) {
        const payload = JSON.parse(decodeSharedCode(shared)) as { language: Language; code: string };
        if (languageMeta[payload.language] && typeof payload.code === "string" && payload.code.length <= 20_000) {
          setLanguage(payload.language); setCode(payload.code); setActiveChallenge(null); setWorkspaceNotice("Shared code loaded");
        }
      } else {
        const draft = window.localStorage.getItem("debugtest-draft-Python") ?? window.localStorage.getItem("codemend-draft-Python");
        if (draft) setCode(draft);
      }
    } catch {
      // Progress storage is optional; the checker still works in private browsing.
    }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(`debugtest-draft-${language}`, code); } catch { /* optional */ }
  }, [code, language]);

  const codeLines = useMemo(() => code.split("\n").length, [code]);
  const activeMeta = languageMeta[language];

  const changeLanguage = (next: Language) => {
    setActiveChallenge(null);
    setLanguage(next);
    setCode(window.localStorage.getItem(`debugtest-draft-${next}`) ?? window.localStorage.getItem(`codemend-draft-${next}`) ?? starterCode[next]);
    setRunState("idle");
    setResult(null);
    setAiExplanation(null);
    setShowHint(false);
    setShowAnswer(false);
    setTestResults(null);
    setTestCases([createTestCase(1, next)]);
  };

  const runSecureTests = async (): Promise<TestExecutionResult | null> => {
    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language, code, testCases }),
      });
      if (!response.ok) return null;
      return await response.json() as TestExecutionResult;
    } catch {
      return null;
    }
  };

  const runCode = () => {
    setIsRunning(true);
    setShowHint(false);
    setShowAnswer(false);
    window.setTimeout(async () => {
      const secureTests = await runSecureTests();
      setTestResults(secureTests);
      let nextResult: ExecutionResult;
      if (secureTests) {
        const firstProblem = secureTests.tests.find((test) => test.status !== "passed");
        nextResult = {
          status: secureTests.status === "passed" ? "success" : secureTests.status === "compile_error" ? "compile_error" : "runtime_error",
          language,
          stdout: secureTests.tests.map((test) => test.actualOutput).filter(Boolean).join("\n"),
          stderr: firstProblem?.stderr ?? "",
          line: null,
          errorType: secureTests.status === "passed" ? null : secureTests.status === "compile_error" ? "CompileError" : "TestFailure",
          explanation: secureTests.message,
          hint: firstProblem ? `Compare the actual output with the expected output in ${firstProblem.name}.` : "All test cases passed.",
          executionTimeMs: secureTests.tests.reduce((total, test) => total + test.executionTimeMs, 0),
          isDemo: false,
        };
      } else {
        nextResult = language === "JavaScript" ? await runJavaScriptInWorker(code) : runGuidedCheck(language, code);
        const actual = nextResult.stdout.trimEnd();
        const fallbackTests = testCases.map((test) => ({
          id: test.id,
          name: test.name,
          status: nextResult.status === "success" && actual === test.expectedOutput.trimEnd() ? "passed" as const : nextResult.status === "success" ? "failed" as const : "error" as const,
          expectedOutput: test.expectedOutput,
          actualOutput: nextResult.stdout,
          stderr: nextResult.stderr,
          executionTimeMs: nextResult.executionTimeMs,
        }));
        const passed = fallbackTests.filter((test) => test.status === "passed").length;
        const fallbackResult: TestExecutionResult = { language, status: passed === testCases.length ? "passed" : "failed", passed, total: testCases.length, tests: fallbackTests, message: `${passed} of ${testCases.length} preview tests passed. Connect the secure runner for real compilation.`, isDemo: true };
        setTestResults(fallbackResult);
        if (nextResult.status === "success" && passed !== testCases.length) {
          const firstFailure = fallbackTests.find((test) => test.status !== "passed");
          nextResult = {
            ...nextResult,
            status: "runtime_error",
            stderr: `${firstFailure?.name ?? "A test"} produced output that did not match the expected result.`,
            errorType: "TestFailure",
            explanation: "The code structure passed, but at least one output comparison failed.",
            hint: "Compare the expected and actual output, including punctuation, capitalization, and spaces.",
          };
        }
      }
      setResult(nextResult);
      setRunState(nextResult.status === "success" ? "fixed" : "error");
      setAiExplanation(nextResult.status === "success" ? null : { whatHappened: nextResult.explanation, hint: nextResult.hint, concept: nextResult.errorType ?? "Debugging" });
      const savedRun: SavedRun = { language, status: nextResult.status === "success" ? "Passed" : "Review", at: new Date().toISOString() };
      const nextHistory: SavedRun[] = [
        savedRun,
        ...history,
      ].slice(0, 6);
      setHistory(nextHistory);
      const today = dayKey();
      const nextDays = Array.from(new Set([...practiceDays, today])).slice(-365);
      setPracticeDays(nextDays);
      const completedId = nextResult.status === "success" && activeChallenge !== null ? challenges[activeChallenge]?.id : null;
      const nextCompleted = completedId ? Array.from(new Set([...completedChallenges, completedId])) : completedChallenges;
      setCompletedChallenges(nextCompleted);
      try {
        window.localStorage.setItem("debugtest-history", JSON.stringify(nextHistory));
        window.localStorage.setItem("debugtest-practice-days", JSON.stringify(nextDays));
        window.localStorage.setItem("debugtest-completed-challenges", JSON.stringify(nextCompleted));
      } catch { /* optional */ }
      setIsRunning(false);
    }, 260);
  };

  const loadChallenge = (index: number) => {
    const challenge = challenges[index];
    setActiveChallenge(index);
    setLanguage(challenge.language);
    setCode(challenge.code);
    setRunState("idle");
    setResult(null);
    setAiExplanation(null);
    setShowHint(false);
    setShowAnswer(false);
    setTestResults(null);
    setTestCases([createTestCase(1, challenge.language, suggestedOutput(challenge.language, challenge.code))]);
    document.querySelector("#workspace")?.scrollIntoView({ behavior: "smooth" });
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `main.${activeMeta.extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importCode = async (file: File) => {
    if (file.size > 20_000) { setWorkspaceNotice("File is too large (20 KB maximum)"); return; }
    const extension = file.name.split(".").pop()?.toLowerCase();
    const languageByExtension: Record<string, Language> = { py: "Python", c: "C", cpp: "C++", cc: "C++", java: "Java", js: "JavaScript", ts: "TypeScript", cs: "C#", go: "Go", rs: "Rust", php: "PHP", kt: "Kotlin", kts: "Kotlin", rb: "Ruby" };
    const nextLanguage = extension ? languageByExtension[extension] : undefined;
    if (!nextLanguage) { setWorkspaceNotice("Unsupported file type"); return; }
    setLanguage(nextLanguage); setCode(await file.text()); setActiveChallenge(null); setRunState("idle"); setResult(null); setShowHint(false); setShowAnswer(false); setWorkspaceNotice(`${file.name} imported`);
  };

  const shareCode = async () => {
    const bytes = new TextEncoder().encode(JSON.stringify({ language, code }));
    let binary = ""; bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    const encoded = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const url = new URL(window.location.href); url.hash = `code=${encoded}`;
    await navigator.clipboard.writeText(url.toString());
    setWorkspaceNotice("Share link copied");
  };

  const applyFix = () => {
    setCode(fixedPython);
    setShowAnswer(false);
    setRunState("fixed");
    setResult(runGuidedCheck("Python", fixedPython));
    setAiExplanation(null);
    const nextCompleted = Array.from(new Set([...completedChallenges, "py-paren"]));
    setCompletedChallenges(nextCompleted);
    try { window.localStorage.setItem("debugtest-completed-challenges", JSON.stringify(nextCompleted)); } catch { /* optional */ }
  };

  const resetCode = () => {
    setCode(starterCode[language]);
    setRunState("idle");
    setResult(null);
    setAiExplanation(null);
    setShowHint(false);
    setShowAnswer(false);
    setTestResults(null);
  };

  const updateTestCase = (id: string, field: "name" | "stdin" | "expectedOutput", value: string) => {
    setTestCases((current) => current.map((test) => test.id === id ? { ...test, [field]: value } : test));
    setTestResults(null);
  };

  const statusLabel = runState === "error" ? "Needs attention" : runState === "fixed" ? "All clear" : "Ready to run";
  const streak = calculateStreak(practiceDays);
  const xp = challenges.filter((challenge) => completedChallenges.includes(challenge.id)).reduce((total, challenge) => total + challenge.xp, 0);
  const level = Math.floor(xp / 100) + 1;
  const levelProgress = xp % 100;
  const visibleChallenges = challengeFilter === "All" ? challenges : challenges.filter((challenge) => challenge.language === challengeFilter);
  const proficiency = (Object.keys(languageMeta) as Language[]).map((item) => {
    const languageChallenges = challenges.filter((challenge) => challenge.language === item);
    const completed = languageChallenges.filter((challenge) => completedChallenges.includes(challenge.id)).length;
    const percent = languageChallenges.length ? Math.round((completed / languageChallenges.length) * 100) : 0;
    const label = percent === 100 ? "Proficient" : percent > 0 ? "Developing" : "Beginner";
    return { language: item, completed, total: languageChallenges.length, percent, label, tone: languageMeta[item].tone };
  });
  const dailyPassed = Math.min(3, history.filter((item) => item.status === "Passed" && dayKey(new Date(item.at)) === dayKey()).length);
  const recommendedIndex = challenges.findIndex((challenge) => !completedChallenges.includes(challenge.id));
  const workflowStage = isRunning ? 2 : runState === "error" ? 3 : runState === "fixed" ? 5 : 1;
  const workflowSteps = [
    ["01", "Write", "Shape the idea"],
    ["02", "Scan", "Inspect safely"],
    ["03", "Diagnose", "Understand the cause"],
    ["04", "Test", "Compare every case"],
    ["05", "Resolve", "Prove the repair"],
  ];
  const progressiveHint = result?.errorType === "DelimiterError"
    ? `Inspect the opening and closing symbols around line ${result.line ?? "the highlighted area"}. One pair is incomplete or mismatched.`
    : result?.errorType === "SyntaxError"
      ? `Look closely at the punctuation and structure near line ${result.line ?? "the highlighted area"}. Compare it with the language's block syntax.`
      : result?.errorType === "EntryPointError"
        ? `${language} expects a standard function where program execution begins. Check the function name and signature.`
        : result?.errorType === "TestFailure"
          ? "Compare the expected and actual output carefully, including spaces, capitalization, and edge cases."
          : "Use the error type and highlighted line to narrow the problem before changing the code.";

  return (
    <div className={"debugtest-shell " + (learnerMode ? "" : "focus-mode")}>
      <div className="mesh mesh-one" />
      <div className="mesh mesh-two" />
      <header className="dt-header">
        <div className="dt-header-inner">
          <AppMark />
          <nav className={"dt-nav " + (mobileNavOpen ? "dt-nav-open" : "")} aria-label="Primary navigation">
            <a href="#workspace">Workbench</a><a href="#workflow">Workflow</a><a href="#tests">Tests</a><a href="#practice">Practice</a>
          </nav>
          <div className="dt-header-actions">
            <button className="mode-button hide-mobile" type="button" aria-pressed={!learnerMode} onClick={() => setLearnerMode(!learnerMode)}><GraduationCap size={15} /> {learnerMode ? "Focus view" : "Exit focus"}</button>
            <span className="level-pill hide-mobile"><Trophy size={14} /> L{level} · {xp} XP</span>
            <button className="menu-button" type="button" aria-label="Toggle navigation" onClick={() => setMobileNavOpen(!mobileNavOpen)}>{mobileNavOpen ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </div>
      </header>

      <main className="dt-main" id="workspace">
        <section className="dt-hero">
          <div className="hero-content">
            <div className="hero-label"><span /> Multi-language debugging workspace</div>
            <h1>Debug the cause.<br /><em>Test the solution.</em></h1>
            <p>DebugTest turns compiler noise into a clear learning path—inspect the issue, understand why it happened, and verify the repair with real test cases.</p>
            <div className="hero-actions">
              <button type="button" className="hero-primary" onClick={() => document.querySelector(".code-editor")?.scrollIntoView({ behavior: "smooth" })}><Terminal size={16} /> Open workbench</button>
              <button type="button" className="hero-secondary" onClick={() => document.querySelector("#practice")?.scrollIntoView({ behavior: "smooth" })}><BookOpen size={16} /> Browse challenges</button>
            </div>
            <div className="hero-proof"><span><ShieldCheck size={14} /> Safe preview fallback</span><span>12 languages</span><span>24 challenges</span></div>
          </div>
          <div className={"scan-orbit " + (isRunning ? "scanning" : runState === "fixed" ? "resolved" : runState === "error" ? "detected" : "")} aria-hidden="true">
            <div className="orbit-ring ring-a" /><div className="orbit-ring ring-b" />
            <div className="orbit-core"><img src="/debugtest-mark.svg" alt="" /><strong>{isRunning ? "SCANNING" : runState === "fixed" ? "RESOLVED" : runState === "error" ? "ISSUE FOUND" : "READY"}</strong><span>{language} · {activeMeta.version}</span></div>
            <i className="orbit-node node-one" /><i className="orbit-node node-two" /><i className="orbit-node node-three" />
          </div>
        </section>

        <section className="workflow-strip" id="workflow" aria-label="Debugging workflow">
          {workflowSteps.map((step, index) => {
            const stage = index + 1;
            return <div className={"workflow-step " + (stage < workflowStage ? "done" : stage === workflowStage ? "active" : "")} key={step[1]}><span>{stage < workflowStage ? <Check size={13} /> : step[0]}</span><div><strong>{step[1]}</strong><small>{step[2]}</small></div></div>;
          })}
        </section>

        <section className="workbench-grid">
          <div className="code-editor glass-panel">
            <div className="workbench-bar">
              <div className="file-identity"><i style={{ background: activeMeta.tone }} /><span>main.{activeMeta.extension}</span><small>{codeLines} lines</small></div>
              <div className="editor-actions">
                <label className="language-picker"><select value={language} onChange={(event) => changeLanguage(event.target.value as Language)} aria-label="Choose programming language">{(Object.keys(languageMeta) as Language[]).map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={13} /></label>
                <button type="button" onClick={resetCode} aria-label="Reset code" title="Reset"><RotateCcw size={15} /></button>
                <button type="button" onClick={copyCode} aria-label="Copy code" title="Copy"><Copy size={15} /></button>
                <button type="button" onClick={downloadCode} aria-label="Download code" title="Download"><Download size={15} /></button>
                <button type="button" onClick={() => fileInputRef.current?.click()} aria-label="Import code" title="Import"><Upload size={15} /></button>
                <input ref={fileInputRef} className="visually-hidden" type="file" accept=".py,.c,.cpp,.cc,.java,.js,.ts,.cs,.go,.rs,.php,.kt,.kts,.rb" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importCode(file); event.target.value = ""; }} />
                <button type="button" onClick={() => void shareCode()} aria-label="Share code" title="Share"><Share2 size={15} /></button>
              </div>
            </div>
            <div className="editor-signal"><span><i /> {language === "JavaScript" ? "Isolated browser execution" : "Guided preview · secure runner ready"}</span><span>{workspaceNotice || (copied ? "Code copied" : activeMeta.version)}</span></div>
            <div className="editor-canvas">{isRunning && <div className="scan-line" />}<CodeLines code={code} errorLine={runState === "error" ? result?.line : null} /><textarea className="code-input" value={code} onChange={(event) => { setCode(event.target.value); setRunState("idle"); setShowHint(false); setShowAnswer(false); setWorkspaceNotice(""); setTestResults(null); }} onKeyDown={(event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") { event.preventDefault(); runCode(); } }} spellCheck={false} aria-label="Code editor" /></div>
            <div className="editor-bottom"><span>UTF-8</span><span>Spaces: 4</span><span>Ln {result?.line ?? codeLines}</span><button type="button" className="run-main" onClick={runCode} disabled={isRunning}>{isRunning ? <span className="spinner" /> : <Play size={14} fill="currentColor" />}{isRunning ? "Scanning…" : "Run diagnosis"}<kbd>⌘↵</kbd></button></div>
          </div>

          <aside className={"diagnostic-panel glass-panel state-" + runState} aria-live="polite" aria-busy={isRunning}>
            <div className="diagnostic-head"><div><span className="section-tag">DIAGNOSTIC CONSOLE</span><h2>{statusLabel}</h2></div><span className={"status-orb " + (isRunning ? "running" : runState)}>{isRunning ? <span className="spinner" /> : runState === "fixed" ? <Check size={17} /> : runState === "error" ? <X size={17} /> : <Terminal size={17} />}</span></div>
            {isRunning ? <div className="diagnostic-loading"><div className="pulse-bars"><i /><i /><i /><i /><i /></div><strong>Inspecting structure and test contract</strong><span>Validating input · tracing syntax · preparing cases</span></div> :
            runState === "idle" ? <div className="diagnostic-empty"><Sparkles size={24} /><strong>Your diagnosis will appear here</strong><p>Run the code to receive a plain-language explanation, a focused hint, and test evidence.</p><button type="button" onClick={runCode}>Start diagnosis <ArrowRight size={14} /></button></div> :
            runState === "fixed" ? <div className="diagnostic-success"><div className="success-ring"><Check size={24} /></div><div className="success-copy"><span className="section-tag">OUTPUT VERIFIED</span><p>{result?.explanation || "The current check passed."}</p></div><pre>{result?.stdout || "Check completed successfully."}</pre><div className="success-meta"><span>{result?.executionTimeMs ?? 1}ms</span><span>{testResults ? testResults.passed + "/" + testResults.total + " tests" : "Structure passed"}</span></div></div> :
            <div className="diagnostic-error">
              <div className="error-summary"><span>{result?.errorType ?? "CodeError"}</span><strong>{result?.line ? "Line " + result.line : "Review required"}</strong></div>
              <p className="stderr">{result?.stderr || "The checker found an issue that needs attention."}</p>
              {learnerMode && <div className="concept-chip"><CircleHelp size={13} /> Concept: {aiExplanation?.concept || result?.errorType || "Debugging"}</div>}
              {!showHint ? <button className="learning-action hint-action" type="button" onClick={() => setShowHint(true)}><Lightbulb size={14} /> Give me a hint</button> : <div className="hint-block"><span><Lightbulb size={13} /> Hint</span><p>{progressiveHint}</p></div>}
              {showHint && !showAnswer && <button className="learning-action answer-action" type="button" onClick={() => setShowAnswer(true)}><WandSparkles size={14} /> Show the solution</button>}
              {showAnswer && <div className="answer-reveal"><div className="diagnosis-block"><span><Sparkles size={13} /> Solution explained</span><p>{aiExplanation?.whatHappened || result?.explanation}</p><p className="repair-guidance">{aiExplanation?.hint || result?.hint}</p></div>{language === "Python" && activeChallenge !== null && challenges[activeChallenge]?.id === "py-paren" && <><div className="mini-diff"><div><span>−</span><code>print(message</code></div><div><span>+</span><code>print(message)</code></div></div><button className="apply-repair" type="button" onClick={applyFix}>Apply this fix <ArrowRight size={14} /></button></>}</div>}
            </div>}
          </aside>
        </section>

        <section className="test-studio glass-panel" id="tests">
          <div className="studio-heading"><div><span className="section-tag"><ShieldCheck size={13} /> TEST STUDIO</span><h2>Prove the fix, case by case.</h2><p>Give each case its own input and expected output. DebugTest compares results after ignoring trailing whitespace.</p></div><span className="case-counter">{testCases.length}/6 cases</span></div>
          <div className="test-grid">
            {testCases.map((test, index) => {
              const testResult = testResults?.tests.find((item) => item.id === test.id);
              return <article className={"test-card " + (testResult?.status || "")} key={test.id}>
                <div className="test-card-top"><span className="case-number">{String(index + 1).padStart(2, "0")}</span><input value={test.name} maxLength={80} aria-label={"Name for test " + (index + 1)} onChange={(event) => updateTestCase(test.id, "name", event.target.value)} /><span className="case-result">{testResult?.status || "ready"}</span>{testCases.length > 1 && <button type="button" aria-label={"Remove " + test.name} onClick={() => { setTestCases((current) => current.filter((item) => item.id !== test.id)); setTestResults(null); }}><Trash2 size={13} /></button>}</div>
                <div className="case-fields"><label>Input<textarea value={test.stdin} maxLength={4000} placeholder="Optional stdin" onChange={(event) => updateTestCase(test.id, "stdin", event.target.value)} /></label><label>Expected<textarea value={test.expectedOutput} maxLength={20000} placeholder="Expected output" onChange={(event) => updateTestCase(test.id, "expectedOutput", event.target.value)} /></label></div>
                {testResult && testResult.status !== "passed" && <div className="actual-output"><span>Actual</span><pre>{testResult.actualOutput || testResult.stderr || "No output"}</pre></div>}
              </article>;
            })}
            {testCases.length < 6 && <button className="add-case" type="button" onClick={() => setTestCases((current) => [...current, createTestCase(current.length + 1)])}><Plus size={19} /><strong>Add another case</strong><span>Test edge conditions and alternate inputs</span></button>}
          </div>
          <div className="studio-footer"><span>{testResults ? testResults.message : "Cases run with your next diagnosis."}</span><button type="button" onClick={runCode} disabled={isRunning}><Play size={13} /> Run all cases</button></div>
        </section>

        <section className="insight-grid" id="practice">
          <article className="insight-card progress-insight"><div className="insight-title"><span><Target size={14} /> PROGRESS</span><strong>Level {level}</strong></div><div className="level-display"><b>{xp}</b><span>XP earned</span></div><div className="level-track"><i style={{ width: levelProgress + "%" }} /></div><div className="stat-pair"><span><b>{completedChallenges.length}</b> solved</span><span><b>{100 - levelProgress}</b> XP to L{level + 1}</span></div></article>
          <article className="insight-card daily-insight"><div className="insight-title"><span><Zap size={14} /> DAILY LOOP</span><strong>{streak} day streak</strong></div><div className="goal-orbs">{[0, 1, 2].map((item) => <i key={item} className={item < dailyPassed ? "complete" : ""}>{item < dailyPassed ? <Check size={13} /> : item + 1}</i>)}</div><p>{dailyPassed === 3 ? "Daily target complete. Strong work." : (3 - dailyPassed) + " successful checks left today."}</p>{recommendedIndex >= 0 && <button type="button" onClick={() => loadChallenge(recommendedIndex)}>Continue with {challenges[recommendedIndex].language} <ArrowRight size={14} /></button>}</article>
          <article className="insight-card history-insight"><div className="insight-title"><span><History size={14} /> RECENT RUNS</span>{history.length > 0 && <button type="button" onClick={() => { setHistory([]); window.localStorage.removeItem("debugtest-history"); }}>Clear</button>}</div><div className="compact-history">{history.length === 0 ? <p>No runs yet. Your last six diagnoses stay on this device.</p> : history.slice(0, 4).map((item, index) => <div key={item.at + index}><span>{item.language}</span><i className={item.status === "Passed" ? "pass" : "review"}>{item.status}</i></div>)}</div></article>
        </section>

        <section className="practice-lab">
          <div className="practice-heading"><div><span className="section-tag"><BookOpen size={13} /> PRACTICE PATHS</span><h2>Train the debugging reflex.</h2></div><label><select value={challengeFilter} onChange={(event) => setChallengeFilter(event.target.value as "All" | Language)} aria-label="Filter challenges"><option>All</option>{(Object.keys(languageMeta) as Language[]).map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={13} /></label></div>
          <div className="challenge-grid">{visibleChallenges.map((challenge) => { const index = challenges.findIndex((item) => item.id === challenge.id); const complete = completedChallenges.includes(challenge.id); return <button className={"challenge-tile " + (activeChallenge === index ? "active" : "")} type="button" key={challenge.id} onClick={() => loadChallenge(index)}><span className="challenge-language" style={{ color: languageMeta[challenge.language].tone }}>{challenge.language}</span><strong>{complete && <Check size={13} />} {challenge.title}</strong><small>{challenge.level} · {challenge.minutes} min · +{challenge.xp} XP</small><ArrowRight size={15} /></button>; })}</div>
        </section>

        <section className="language-map">
          <div><span className="section-tag">LANGUAGE MAP</span><h2>One workflow. Twelve languages.</h2></div>
          <div className="language-chips">{proficiency.map((item) => <button type="button" key={item.language} onClick={() => { setChallengeFilter(item.language); document.querySelector("#practice")?.scrollIntoView({ behavior: "smooth" }); }}><i style={{ background: item.tone }} /><span>{item.language}</span><small>{item.label}</small></button>)}</div>
        </section>

        <footer className="dt-footer" id="about">
          <div className="footer-brand"><AppMark /><span className="version-badge">v3.2</span></div>
          <div className="footer-about"><strong>Built by Md. Iftee Raiyan</strong><span>A test-driven workspace for learning how software fails—and how to repair it.</span></div>
          <div className="footer-links"><a href="#workspace">Workbench</a><a href="#tests">Tests</a><a href="https://github.com/MdIfteeRaiyan/DebugTest" target="_blank" rel="noreferrer"><Github size={14} /> GitHub <ExternalLink size={11} /></a></div>
        </footer>
      </main>
    </div>
  );
}
