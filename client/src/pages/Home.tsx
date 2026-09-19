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
  RotateCcw,
  Share2,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  Upload,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import type { ExecutionResult } from "@shared/execution";

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

const starterCode: Record<Language, string> = {
  Python: `def greet(name):\n    message = "Hello, " + name\n    print(message\n\ngreet("Mina")`,
  C: `#include <stdio.h>\n\nint main(void) {\n  printf("Hello, CodeMend!\\n");\n  return 0;\n}`,
  "C++": `#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, CodeMend!" << endl;\n  return 0;\n}`,
  Java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, CodeMend!");\n  }\n}`,
  JavaScript: `function greet(name) {\n  const message = "Hello, " + name;\n  console.log(message);\n}\n\ngreet("Mina");`,
  TypeScript: `function greet(name: string): void {\n  const message: string = "Hello, " + name;\n  console.log(message);\n}\n\ngreet("Mina");`,
  "C#": `using System;\n\nclass Program {\n  static void Main(string[] args) {\n    Console.WriteLine("Hello, CodeMend!");\n  }\n}`,
  Go: `package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello, CodeMend!")\n}`,
  Rust: `fn main() {\n    println!("Hello, CodeMend!");\n}`,
  PHP: `<?php\n\nfunction greet($name) {\n  echo "Hello, " . $name;\n}\n\ngreet("Mina");`,
  Kotlin: `fun main() {\n  println("Hello, CodeMend!")\n}`,
  Ruby: `def greet(name)\n  puts "Hello, #{name}!"\nend\n\ngreet("Mina")`,
};

const challenges: PracticeChallenge[] = [
  { id: "py-paren", title: "Close the function call", language: "Python", level: "Beginner", minutes: 3, xp: 20, code: starterCode.Python },
  { id: "py-colon", title: "Restore the missing colon", language: "Python", level: "Intermediate", minutes: 4, xp: 30, code: `def is_even(number)\n    if number % 2 == 0:\n        print("Even")\n\nis_even(8)` },
  { id: "c-main", title: "Restore the C entry point", language: "C", level: "Beginner", minutes: 4, xp: 20, code: `#include <stdio.h>\n\nint start(void) {\n  printf("Hello!\\n");\n  return 0;\n}` },
  { id: "c-brace", title: "Close the C main block", language: "C", level: "Intermediate", minutes: 5, xp: 30, code: `#include <stdio.h>\n\nint main(void) {\n  printf("Keep learning!\\n");\n  return 0;` },
  { id: "cpp-main", title: "Repair the entry point", language: "C++", level: "Beginner", minutes: 5, xp: 20, code: `#include <iostream>\nusing namespace std;\n\nint start() {\n  cout << "Hello, CodeMend!" << endl;\n  return 0;\n}` },
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
    return finish({ status: "compile_error", stdout: "", stderr: "Program entry point not found", line: 1, errorType: "EntryPointError", explanation: `CodeMend could not find the ${language} program entry point.`, hint });
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
    const timeout = window.setTimeout(() => finish({ status: "timeout", language: "JavaScript", stdout: "", stderr: "Execution stopped after 1.5 seconds", line: null, errorType: "TimeoutError", explanation: "The program ran for too long, so CodeMend stopped the isolated browser worker.", hint: "Check for an infinite loop or reduce the amount of work.", executionTimeMs: 1500, isDemo: false }), 1500);
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
    <div className="app-mark" aria-label="CodeMend">
      <span className="app-mark-icon"><img src="/codemend-mark.svg" alt="" /></span>
      <span>CodeMend</span>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("Python");
  const [code, setCode] = useState(starterCode.Python);
  const [runState, setRunState] = useState<RunState>("idle");
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("codemend-history");
      if (saved) setHistory(JSON.parse(saved) as SavedRun[]);
      const savedDays = window.localStorage.getItem("codemend-practice-days");
      if (savedDays) setPracticeDays(JSON.parse(savedDays) as string[]);
      const savedChallenges = window.localStorage.getItem("codemend-completed-challenges");
      if (savedChallenges) setCompletedChallenges(JSON.parse(savedChallenges) as string[]);
      const shared = new URLSearchParams(window.location.hash.slice(1)).get("code");
      if (shared) {
        const payload = JSON.parse(decodeSharedCode(shared)) as { language: Language; code: string };
        if (languageMeta[payload.language] && typeof payload.code === "string" && payload.code.length <= 20_000) {
          setLanguage(payload.language); setCode(payload.code); setActiveChallenge(null); setWorkspaceNotice("Shared code loaded");
        }
      } else {
        const draft = window.localStorage.getItem("codemend-draft-Python");
        if (draft) setCode(draft);
      }
    } catch {
      // Progress storage is optional; the checker still works in private browsing.
    }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(`codemend-draft-${language}`, code); } catch { /* optional */ }
  }, [code, language]);

  const codeLines = useMemo(() => code.split("\n").length, [code]);
  const activeMeta = languageMeta[language];

  const changeLanguage = (next: Language) => {
    setActiveChallenge(null);
    setLanguage(next);
    setCode(window.localStorage.getItem(`codemend-draft-${next}`) ?? starterCode[next]);
    setRunState("idle");
    setResult(null);
    setAiExplanation(null);
    setShowAnswer(false);
  };

  const runCode = () => {
    setIsRunning(true);
    setShowAnswer(false);
    window.setTimeout(async () => {
      const nextResult = language === "JavaScript" ? await runJavaScriptInWorker(code) : runGuidedCheck(language, code);
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
        window.localStorage.setItem("codemend-history", JSON.stringify(nextHistory));
        window.localStorage.setItem("codemend-practice-days", JSON.stringify(nextDays));
        window.localStorage.setItem("codemend-completed-challenges", JSON.stringify(nextCompleted));
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
    setLanguage(nextLanguage); setCode(await file.text()); setActiveChallenge(null); setRunState("idle"); setResult(null); setWorkspaceNotice(`${file.name} imported`);
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
    try { window.localStorage.setItem("codemend-completed-challenges", JSON.stringify(nextCompleted)); } catch { /* optional */ }
  };

  const resetCode = () => {
    setCode(starterCode[language]);
    setRunState("idle");
    setResult(null);
    setAiExplanation(null);
    setShowAnswer(false);
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

  return (
    <div className="codemend-shell">
      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />
      <header className="topbar">
        <div className="topbar-inner">
          <AppMark />
          <nav className={`topnav ${mobileNavOpen ? "topnav-open" : ""}`} aria-label="Primary navigation">
            <a href="#workspace" className="nav-link active">Workspace</a>
            <a href="#how-it-works" className="nav-link">How it works</a>
            <a href="#practice" className="nav-link">Practice</a>
          </nav>
          <div className="topbar-actions">
            <button className="text-button hide-mobile" type="button" onClick={() => setLearnerMode(!learnerMode)}>
              <GraduationCap size={16} />
              {learnerMode ? "Learner mode" : "Focus mode"}
            </button>
            <span className="session-stat hide-mobile"><Trophy size={15} /> Level {level} · {xp} XP</span>
            <button className="mobile-menu-button" type="button" aria-label="Toggle navigation" onClick={() => setMobileNavOpen(!mobileNavOpen)}>
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="page-wrap" id="workspace">
        <section className="hero-row">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> Your coding workspace</div>
            <h1>Make mistakes.<br /><em>Understand them.</em></h1>
            <p className="hero-copy">CodeMend helps you debug with intention — one clear explanation, useful hint, and small win at a time.</p>
          </div>
          <div className="hero-aside">
            <div className="streak-card">
              <div className="streak-icon"><Zap size={16} fill="currentColor" /></div>
              <div><strong>{streak} day streak</strong><span>{streak ? "Practice again tomorrow" : "Run a check to begin"}</span></div>
              <ArrowRight size={16} className="muted-arrow" />
            </div>
            <div className="command-hint"><Command size={13} /> Press <kbd>Ctrl/⌘</kbd><kbd>Enter</kbd> to check</div>
          </div>
        </section>

        <section className="workspace-grid">
          <div className="editor-column">
            <div className="panel editor-panel">
              <div className="panel-toolbar">
                <div className="file-tab"><span className="file-dot" style={{ background: activeMeta.tone }} /> main.{activeMeta.extension}</div>
                <div className="toolbar-actions">
                  <div className="language-select-wrap">
                    <select value={language} onChange={(event) => changeLanguage(event.target.value as Language)} aria-label="Choose programming language">
                      <option>Python</option><option>C</option><option>C++</option><option>Java</option><option>JavaScript</option><option>TypeScript</option><option>C#</option><option>Go</option><option>Rust</option><option>PHP</option><option>Kotlin</option><option>Ruby</option>
                    </select>
                    <ChevronDown size={14} />
                  </div>
                  <button className="icon-button" onClick={resetCode} type="button" aria-label="Reset code"><RotateCcw size={16} /></button>
                  <button className={copied ? "icon-button copied" : "icon-button"} onClick={copyCode} type="button" aria-label={copied ? "Code copied" : "Copy code"} title={copied ? "Copied!" : "Copy code"}><Copy size={16} /></button>
                  <button className="icon-button" onClick={downloadCode} type="button" aria-label="Download code" title="Download code"><Download size={16} /></button>
                  <button className="icon-button" onClick={() => fileInputRef.current?.click()} type="button" aria-label="Import code file" title="Import code file"><Upload size={16} /></button>
                  <input ref={fileInputRef} className="visually-hidden" type="file" accept=".py,.c,.cpp,.cc,.java,.js,.ts,.cs,.go,.rs,.php,.kt,.kts,.rb" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importCode(file); event.target.value = ""; }} />
                  <button className="icon-button" onClick={() => void shareCode()} type="button" aria-label="Copy share link" title="Copy share link"><Share2 size={16} /></button>
                  <button className="run-button" onClick={runCode} type="button" disabled={isRunning}>
                    {isRunning ? <span className="spinner" /> : <Play size={14} fill="currentColor" />}
                    {isRunning ? "Checking" : "Run code"}
                  </button>
                </div>
              </div>
              <div className="editor-meta"><span><span className="live-dot" /> {language === "JavaScript" ? "Live execution · isolated browser worker" : "Guided check · runs safely in your browser"}</span><span>{workspaceNotice || `${codeLines} lines · ${activeMeta.version}`}</span></div>
              <div className="editor-body">
                <CodeLines code={code} errorLine={runState === "error" ? result?.line : null} />
                <textarea
                  className="code-input"
                  value={code}
                  onChange={(event) => { setCode(event.target.value); setRunState("idle"); setShowAnswer(false); setWorkspaceNotice(""); }}
                  onKeyDown={(event) => {
                    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                      event.preventDefault();
                      runCode();
                    }
                  }}
                  spellCheck={false}
                  aria-label="Code editor"
                />
              </div>
              <div className="editor-footer"><span>Spaces: 4</span><span>UTF-8</span><span>Ln {runState === "error" ? result?.line ?? 1 : codeLines}, Col 5</span></div>
            </div>

            <div className={`result-panel ${runState === "error" ? "result-error" : runState === "fixed" ? "result-success" : "result-idle"}`}>
              <div className="result-heading">
                <div className="result-title-wrap">
                  <span className={`result-status-icon ${runState === "error" ? "error-icon" : runState === "fixed" ? "success-icon" : "idle-icon"}`}>
                    {runState === "error" ? <X size={15} /> : runState === "fixed" ? <Check size={15} /> : <Terminal size={15} />}
                  </span>
                  <div><span className="result-kicker">Run result</span><h2>{statusLabel}</h2></div>
                </div>
                <span className="result-time">{runState === "idle" ? "Waiting for your first check" : `${result?.executionTimeMs ?? 1}ms · ${result?.isDemo ? "guided mode" : "live browser run"}`}</span>
              </div>

              {runState === "idle" && (
                <div className="empty-result"><span>Output and explanations will appear here.</span><button type="button" onClick={runCode}>Run the starter code <ArrowRight size={14} /></button></div>
              )}

              {runState === "fixed" && (
                <div className="success-result"><div className="output-label">{result?.isDemo ? "Expected output" : "Console output"}</div><pre>{result?.stdout || "Check completed successfully."}</pre><div className="success-note"><Check size={14} /> {result?.isDemo ? "Your code passed this guided check. Nice debugging." : "JavaScript finished in the isolated browser runner."}</div></div>
              )}

              {runState === "error" && (
                <div className="error-result">
                  <div className="error-banner"><span className="error-code">{result?.errorType ?? "CodeError"}</span><span>{result?.line ? `Line ${result.line} · ` : ""}{result?.stderr || "Review the highlighted issue"}</span><button type="button" aria-label="Dismiss error" onClick={() => setRunState("idle")}><X size={15} /></button></div>
                  <div className="explanation-grid">
                    <div className="explanation-main">
                      <div className="section-label"><Sparkles size={14} /> What happened?</div>
                      <p>{aiExplanation?.whatHappened ?? <>Your <code>print</code> call opens a parenthesis, but the line ends before it closes. Python stops here because it cannot tell where the function call ends.</>}</p>
                      {learnerMode && <div className="analogy-card"><div className="analogy-icon"><Lightbulb size={16} /></div><div><strong>Think of it like a sentence</strong><span>You opened a quotation mark but never added the closing one. The reader is still waiting for the thought to finish.</span></div></div>}
                    </div>
                  <div className="hint-card"><div className="section-label"><CircleHelp size={14} /> Hint</div><p>{aiExplanation?.hint ?? <>Read the highlighted line and compare its opening and closing symbols.</>}</p><div className="hint-line"><span>{String(result?.line ?? 1).padStart(2, "0")}</span><code>{code.split("\n")[(result?.line ?? 1) - 1] || "Start with a small example"}<span className="cursor-mark">▌</span></code></div></div>
                  </div>
                  <div className="answer-row">
                    <div><strong>Ready to see a suggested fix?</strong><span>Try to solve it yourself first — or reveal the answer when you’re ready.</span></div>
                    <div className="answer-actions"><button className="ghost-button" type="button" onClick={() => setShowAnswer(false)}>Try myself</button>{language === "Python" && activeChallenge !== null && challenges[activeChallenge]?.id === "py-paren" && (result?.errorType === "SyntaxError" || result?.errorType === "DelimiterError") && <button className="primary-button" type="button" onClick={() => setShowAnswer(true)}><WandSparkles size={15} /> Show answer</button>}</div>
                  </div>
                  {showAnswer && language === "Python" && <div className="suggested-fix"><div className="fix-heading"><span><Check size={14} /> Suggested fix</span><span className="fix-tag">1 line changed</span></div><div className="diff-line removed"><span>−</span><code>print(message</code></div><div className="diff-line added"><span>+</span><code>print(message)</code></div><button className="apply-button" type="button" onClick={applyFix}>Apply fix and check <ArrowRight size={15} /></button></div>}
                </div>
              )}
            </div>
          </div>

          <aside className="sidebar-column">
            <div className="panel daily-goal-card">
              <div className="daily-goal-top"><div><span className="card-eyebrow">Daily goal</span><h2>{dailyPassed === 3 ? "Goal complete" : `${3 - dailyPassed} checks to go`}</h2></div><span>{dailyPassed}/3</span></div>
              <div className="daily-segments" aria-label={`${dailyPassed} of 3 daily checks complete`}>{[0, 1, 2].map((step) => <i key={step} className={step < dailyPassed ? "complete" : ""} />)}</div>
              {recommendedIndex >= 0 ? <button type="button" onClick={() => loadChallenge(recommendedIndex)}><span><strong>Recommended next</strong><small>{challenges[recommendedIndex].language} · {challenges[recommendedIndex].title}</small></span><ArrowRight size={15} /></button> : <p>Every challenge is complete. Keep your streak alive with a fresh editor run.</p>}
            </div>

            <div className="panel progress-card">
              <div className="progress-card-top"><div className="progress-level"><span><Target size={14} /> Learner level</span><strong>Level {level}</strong></div><span className="xp-badge">{xp} XP</span></div>
              <div className="xp-track" aria-label={`${levelProgress}% progress to next level`}><span style={{ width: `${levelProgress}%` }} /></div>
              <div className="progress-stats"><span><strong>{completedChallenges.length}</strong> / {challenges.length} challenges</span><span>{100 - levelProgress} XP to level {level + 1}</span></div>
            </div>

            <div className="panel proficiency-card">
              <div className="proficiency-heading"><span className="card-eyebrow">Language proficiency</span><strong>12 language paths</strong></div>
              <div className="proficiency-list">
                {proficiency.map((item) => <button type="button" className="proficiency-row" key={item.language} onClick={() => { setChallengeFilter(item.language); document.querySelector("#practice")?.scrollIntoView({ behavior: "smooth" }); }}><span className="proficiency-name"><i style={{ background: item.tone }} />{item.language}</span><span className="proficiency-track"><i style={{ width: `${item.percent}%`, background: item.tone }} /></span><span className={`proficiency-label ${item.percent === 100 ? "complete" : ""}`}>{item.label}</span></button>)}
              </div>
            </div>

            <div className="panel journey-card">
              <div className="card-topline"><div><span className="card-eyebrow">Debug journey</span><h2>Learn as you fix</h2></div><span className="step-count">{runState === "fixed" ? "4 / 4" : runState === "error" ? "2 / 4" : "1 / 4"}</span></div>
              <div className="journey-list">
                <div className={`journey-step complete`}><span className="journey-marker"><Check size={13} /></span><div><strong>Write your code</strong><span>Start with a question</span></div></div>
                <div className={`journey-step ${runState !== "idle" ? "complete" : "current"}`}><span className="journey-marker">{runState !== "idle" ? <Check size={13} /> : "2"}</span><div><strong>Spot the pattern</strong><span>See what went wrong</span></div></div>
                <div className={`journey-step ${runState === "fixed" ? "complete" : runState === "error" ? "current" : ""}`}><span className="journey-marker">{runState === "fixed" ? <Check size={13} /> : "3"}</span><div><strong>Choose your fix</strong><span>Hints before answers</span></div></div>
                <div className={`journey-step ${runState === "fixed" ? "current" : ""}`}><span className="journey-marker">{runState === "fixed" ? <Check size={13} /> : "4"}</span><div><strong>Run with confidence</strong><span>Prove it works</span></div></div>
              </div>
              <div className="journey-progress"><span style={{ width: `${runState === "fixed" ? 100 : runState === "error" ? 50 : 25}%` }} /></div>
              <p className="journey-caption">CodeMend never skips the learning part.</p>
            </div>

            <div className="panel challenge-card" id="practice">
              <div className="challenge-heading"><div className="practice-icon"><BookOpen size={17} /></div><div><span className="card-eyebrow">Practice lab</span><h3>Choose a bug to mend</h3></div></div>
              <div className="challenge-filter"><select value={challengeFilter} onChange={(event) => setChallengeFilter(event.target.value as "All" | Language)} aria-label="Filter challenges by language"><option>All</option><option>Python</option><option>C</option><option>C++</option><option>Java</option><option>JavaScript</option><option>TypeScript</option><option>C#</option><option>Go</option><option>Rust</option><option>PHP</option><option>Kotlin</option><option>Ruby</option></select><span>{visibleChallenges.length} challenges</span></div>
              <div className="challenge-list">
                {visibleChallenges.map((challenge) => {
                  const index = challenges.findIndex((item) => item.id === challenge.id);
                  const isComplete = completedChallenges.includes(challenge.id);
                  return <button className={activeChallenge === index ? "challenge-item active" : "challenge-item"} type="button" key={challenge.id} onClick={() => loadChallenge(index)}><span><strong>{isComplete && <Check size={11} />} {challenge.title}</strong><small>{challenge.language} · {challenge.minutes} min · {challenge.level} · {challenge.xp} XP</small></span><ArrowRight size={14} /></button>;
                })}
              </div>
            </div>

            <div className="panel history-card">
              <div className="history-heading"><span><History size={14} /> Recent activity</span>{history.length > 0 && <button type="button" onClick={() => { setHistory([]); window.localStorage.removeItem("codemend-history"); }}>Clear</button>}</div>
              {history.length === 0 ? <p>Your checks will be saved here on this device.</p> : history.slice(0, 4).map((item, index) => <div className="history-row" key={`${item.at}-${index}`}><span>{item.language}</span><span className={item.status === "Passed" ? "passed" : "review"}>{item.status}</span></div>)}
            </div>

            <div className="mini-note" id="how-it-works"><div className="mini-note-icon"><Compass size={15} /></div><div><strong>Good debugging is a skill.</strong><span>Build yours by understanding every error, not hiding it.</span></div></div>
          </aside>
        </section>

        <footer className="page-footer"><div><AppMark /><span className="version-badge">v1.7</span><span className="footer-copy">A guided coding debugger &amp; learning assistant</span></div><div className="footer-links"><a href="#workspace">Workspace</a><a href="#how-it-works">About the method</a><a href="https://github.com/MdIfteeRaiyan/CodeLens" target="_blank" rel="noreferrer"><Github size={14} /> GitHub <ExternalLink size={11} /></a></div></footer>
      </main>
    </div>
  );
}
