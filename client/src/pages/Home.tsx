import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Code2,
  Command,
  Compass,
  ExternalLink,
  Github,
  GraduationCap,
  Lightbulb,
  Menu,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import type { ExecutionResult } from "@shared/execution";

type Language = "Python" | "C++" | "Java";
type RunState = "idle" | "error" | "fixed";

const starterCode: Record<Language, string> = {
  Python: `def greet(name):\n    message = "Hello, " + name\n    print(message\n\ngreet("Mina")`,
  "C++": `#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, CodeMend!" << endl;\n  return 0;\n}`,
  Java: `public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, CodeMend!");\n  }\n}`,
};

const fixedPython = `def greet(name):\n    message = "Hello, " + name\n    print(message)\n\ngreet("Mina")`;

const languageMeta: Record<Language, { tone: string; version: string }> = {
  Python: { tone: "#70d6a3", version: "3.12" },
  "C++": { tone: "#87a8ff", version: "17" },
  Java: { tone: "#ffb56d", version: "21" },
};

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

  if (language === "Python") {
    const missingParenthesis = lines.findIndex((line) => line.includes("print(message") && !line.includes("print(message)"));
    if (missingParenthesis >= 0) {
      return finish({ status: "compile_error", stdout: "", stderr: "'(' was never closed", line: missingParenthesis + 1, errorType: "SyntaxError", explanation: "This function call opens a parenthesis but the line ends before it closes.", hint: `Look at the end of line ${missingParenthesis + 1}. Which symbol closes the function call?` });
    }
    const greeting = code.match(/greet\(["']([^"']+)["']\)/)?.[1] ?? "Mina";
    return finish({ status: "success", stdout: code.includes("print") ? `Hello, ${greeting}\n` : "Guided check passed.\n", stderr: "", line: null, errorType: null, explanation: "The guided syntax check passed.", hint: "Change the name and run the example again." });
  }

  const hasEntryPoint = language === "C++" ? /int\s+main\s*\(/.test(code) : /static\s+void\s+main\s*\(/.test(code);
  if (!hasEntryPoint) {
    return finish({ status: "compile_error", stdout: "", stderr: "Program entry point not found", line: 1, errorType: "EntryPointError", explanation: `CodeMend could not find the ${language} program entry point.`, hint: language === "C++" ? "Add an int main() function." : "Add a public static void main(String[] args) method." });
  }
  const output = code.match(/(?:cout\s*<<|System\.out\.println\s*\()[\s]*["']([^"']+)["']/)?.[1] ?? "Guided check passed.";
  return finish({ status: "success", stdout: `${output}\n`, stderr: "", line: null, errorType: null, explanation: "The guided structure check passed.", hint: "Connect a secure runner later for full compilation and runtime output." });
}

function AppMark() {
  return (
    <div className="app-mark" aria-label="CodeMend">
      <span className="app-mark-icon"><Code2 size={17} strokeWidth={2.5} /></span>
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

  const codeLines = useMemo(() => code.split("\n").length, [code]);
  const activeMeta = languageMeta[language];

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    setCode(starterCode[next]);
    setRunState("idle");
    setResult(null);
    setAiExplanation(null);
    setShowAnswer(false);
  };

  const runCode = () => {
    setIsRunning(true);
    setShowAnswer(false);
    window.setTimeout(() => {
      const nextResult = runGuidedCheck(language, code);
      setResult(nextResult);
      setRunState(nextResult.status === "success" ? "fixed" : "error");
      setAiExplanation(nextResult.status === "success" ? null : { whatHappened: nextResult.explanation, hint: nextResult.hint, concept: nextResult.errorType ?? "Debugging" });
      setIsRunning(false);
    }, 260);
  };

  const applyFix = () => {
    setCode(fixedPython);
    setShowAnswer(false);
    setRunState("fixed");
    setResult(runGuidedCheck("Python", fixedPython));
    setAiExplanation(null);
  };

  const resetCode = () => {
    setCode(starterCode[language]);
    setRunState("idle");
    setResult(null);
    setAiExplanation(null);
    setShowAnswer(false);
  };

  const statusLabel = runState === "error" ? "Needs attention" : runState === "fixed" ? "All clear" : "Ready to run";

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
            <button className="profile-button" type="button" aria-label="Open profile menu">
              <span className="profile-avatar">M</span>
              <ChevronDown size={14} />
            </button>
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
              <div><strong>3 day streak</strong><span>Keep the habit going</span></div>
              <ArrowRight size={16} className="muted-arrow" />
            </div>
            <div className="command-hint"><Command size={13} /> Press <kbd>Ctrl/⌘</kbd><kbd>Enter</kbd> to check</div>
          </div>
        </section>

        <section className="workspace-grid">
          <div className="editor-column">
            <div className="panel editor-panel">
              <div className="panel-toolbar">
                <div className="file-tab"><span className="file-dot" style={{ background: activeMeta.tone }} /> main.{language === "Python" ? "py" : language === "C++" ? "cpp" : "java"}</div>
                <div className="toolbar-actions">
                  <div className="language-select-wrap">
                    <select value={language} onChange={(event) => changeLanguage(event.target.value as Language)} aria-label="Choose programming language">
                      <option>Python</option><option>C++</option><option>Java</option>
                    </select>
                    <ChevronDown size={14} />
                  </div>
                  <button className="icon-button" onClick={resetCode} type="button" aria-label="Reset code"><RotateCcw size={16} /></button>
                  <button className="run-button" onClick={runCode} type="button" disabled={isRunning}>
                    {isRunning ? <span className="spinner" /> : <Play size={14} fill="currentColor" />}
                    {isRunning ? "Checking" : "Run code"}
                  </button>
                </div>
              </div>
              <div className="editor-meta"><span><span className="live-dot" /> Guided check · runs safely in your browser</span><span>{codeLines} lines · {activeMeta.version}</span></div>
              <div className="editor-body">
                <CodeLines code={code} errorLine={runState === "error" ? result?.line : null} />
                <textarea
                  className="code-input"
                  value={code}
                  onChange={(event) => { setCode(event.target.value); setRunState("idle"); setShowAnswer(false); }}
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
                <span className="result-time">{runState === "idle" ? "Waiting for your first check" : `${result?.executionTimeMs ?? 1}ms · guided mode`}</span>
              </div>

              {runState === "idle" && (
                <div className="empty-result"><span>Output and explanations will appear here.</span><button type="button" onClick={runCode}>Run the starter code <ArrowRight size={14} /></button></div>
              )}

              {runState === "fixed" && (
                <div className="success-result"><div className="output-label">Expected output</div><pre>{result?.stdout || "Check completed successfully."}</pre><div className="success-note"><Check size={14} /> Your code passed this guided check. Nice debugging.</div></div>
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
                    <div className="answer-actions"><button className="ghost-button" type="button" onClick={() => setShowAnswer(false)}>Try myself</button>{language === "Python" && result?.errorType === "SyntaxError" && <button className="primary-button" type="button" onClick={() => setShowAnswer(true)}><WandSparkles size={15} /> Show answer</button>}</div>
                  </div>
                  {showAnswer && language === "Python" && <div className="suggested-fix"><div className="fix-heading"><span><Check size={14} /> Suggested fix</span><span className="fix-tag">1 line changed</span></div><div className="diff-line removed"><span>−</span><code>print(message</code></div><div className="diff-line added"><span>+</span><code>print(message)</code></div><button className="apply-button" type="button" onClick={applyFix}>Apply fix and check <ArrowRight size={15} /></button></div>}
                </div>
              )}
            </div>
          </div>

          <aside className="sidebar-column">
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

            <div className="panel practice-card" id="practice">
              <div className="practice-icon"><BookOpen size={17} /></div><div><span className="card-eyebrow">Next practice</span><h3>Functions &amp; parameters</h3><p>5 min · Beginner</p></div><button type="button" aria-label="Open practice"><ArrowRight size={16} /></button>
            </div>

            <div className="mini-note" id="how-it-works"><div className="mini-note-icon"><Compass size={15} /></div><div><strong>Good debugging is a skill.</strong><span>Build yours by understanding every error, not hiding it.</span></div></div>
          </aside>
        </section>

        <footer className="page-footer"><div><AppMark /><span className="footer-copy">A guided coding debugger &amp; learning assistant</span></div><div className="footer-links"><a href="#workspace">Workspace</a><a href="#how-it-works">About the method</a><a href="https://github.com/MdIfteeRaiyan/CodeLens" target="_blank" rel="noreferrer"><Github size={14} /> GitHub <ExternalLink size={11} /></a></div></footer>
      </main>
    </div>
  );
}
