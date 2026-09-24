# DebugTest v4.0

**Secure, Test-Driven Coding Debugger & Learning Assistant**

DebugTest is a student-first coding workspace created by **Md. Iftee Raiyan**. It helps learners understand programming mistakes, verify fixes with test cases, and grow across twelve language paths.

> **Core philosophy:** Don't just fix the code. Understand the error. Learn from the mistake.

## Current milestone: v4.0 guided performance release

DebugTest v3 introduces a completely rebuilt interface around one focused loop:
**write, scan, diagnose, test, resolve**. The release includes:

- Up to six editable test cases with standard input and expected output
- Individual pass/fail/error feedback and exact normalized-output comparison
- Protected Vercel API adapter for a separate sandboxed execution provider
- Honest preview fallback when the secure runner is not configured

- Python, C, C++, Java, JavaScript, TypeScript, C#, Go, Rust, PHP, Kotlin, and Ruby selection
- Balanced bracket, parenthesis, brace, entry-point, and Python block checks
- Responsive code editor workspace
- Run-code interaction with clear states
- Student-friendly error explanation pattern
- Progressive hint before answer reveal
- Suggested fix and apply-fix journey
- Debug journey progress tracker
- Twenty-four interactive debugging challenges with language filtering
- Recent-check history and passed-check count saved locally on the learner's device
- Real daily practice streak saved locally on the learner's device
- XP, learner levels, challenge completion, and progress-to-next-level tracking
- Source-code download using the correct language file extension
- Real JavaScript execution in a network-disabled browser worker with a 1.5-second timeout
- Automatic per-language drafts, source-file import, and shareable code links
- Original DebugTest favicon, app mark, install icons, and web-app manifest
- Per-language proficiency progress with Beginner, Developing, and Proficient states
- Three-check daily goal and automatic recommended-next-challenge guidance
- One-click code copy, reset, and keyboard run shortcut
- Learner mode copy and analogy card
- Mobile-first responsive layout
- Dark violet-and-cyan workbench visual system for a credible developer-tool experience
- Purpose-built motion system with scan, orbit, loading, success, and reduced-motion states
- Five-stage debugging workflow with an integrated diagnostic console
- New DebugTest identity, app mark, social metadata, install icons, and launch copy
- Progressive learning flow that reveals a hint first and keeps the solution hidden until requested

The current browser prototype uses deterministic local guided checks so it is safe to preview publicly. It **does not execute arbitrary user code on the web server** and does not pretend that guided output is a complete compiler result.

For the complete release gates, Vercel setup notes, runner security requirements, and device-testing checklist, see [`DEPLOYMENT.md`](./DEPLOYMENT.md). The current site should be described publicly as a DebugTest product preview until those gates are complete.

## Architecture direction

DebugTest is scaffolded as a Vite + React + TypeScript + Tailwind + Express + tRPC application with Manus OAuth, database, storage, and server-side integration hooks available for future milestones.

The planned public architecture is:

```text
React workspace
      |
      v
Typed backend API
      |
      +--> sandboxed execution service (12 languages)
      |
      +--> AI error analyzer
```

Arbitrary code execution must stay behind a dedicated sandbox boundary with resource limits, rate limiting, input validation, and language-specific isolation. It should not be implemented as an unrestricted `subprocess` call inside a public web endpoint.

## Roadmap

- **v1.x — Learning workspace:** editor, guided practice, twelve languages, twenty-four challenges, XP, streaks, drafts, sharing, and proficiency. **Complete.**
- **v3.0 — Diagnostic workflow:** new DebugTest identity, rebuilt interface and motion system, editable test cases, protected execution adapter, normalized results, and creator profile. **Complete.**
- **v3.1 — Guided reveal:** compact diagnostics, clearer text, hint-first learning, and learner-controlled solutions. **Complete.**
- **v3.2 — Combined reliability:** consistent test verdicts, language-aware expected output, Focus view, and accessibility polish. **Complete.**
- **v4.0 — Guided performance:** interactive walkthrough, touch-first Android controls, safe-area support, lightweight viewport rendering, and richer state animation. **Complete.**
- **Next — Production runner:** deploy hardened containers or microVMs, durable rate limits, job queues, and abuse monitoring.
- **Later — Adaptive learning:** richer concepts, difficulty adaptation, and optional accounts.

## Local development

```bash
pnpm install
pnpm dev
```

For the standalone frontend preview, use `pnpm dev:client`. Vercel reads the included
`vercel.json`, builds only the frontend, and publishes `dist/public`.

Useful checks:

```bash
pnpm check
pnpm build:client
pnpm test
```

## Security

Never commit or distribute `.env` or `.project-config.json`. Configure production
credentials in the hosting provider's encrypted environment settings. The public
preview does not require database, OAuth, AI, or code-runner credentials.

## Product positioning

DebugTest is intentionally more specific than an online compiler or generic AI code generator. Its product identity is an **AI debugging tutor for students**: a tool that helps learners build debugging judgment through explanation, hints, and deliberate practice.
