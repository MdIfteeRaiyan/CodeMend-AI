# CodeMend

**Guided Coding Debugger & Learning Assistant**

CodeMend is a student-first coding workspace designed to help learners understand programming mistakes instead of hiding them. It combines a focused editor, error explanations, progressive hints, suggested fixes, and a short feedback loop that ends with proving the fix works.

> **Core philosophy:** Don't just fix the code. Understand the error. Learn from the mistake.

## Current milestone: V2.2 guided practice

The first complete product slice includes:

- Python, C++, and Java language selection
- Balanced bracket, parenthesis, brace, entry-point, and Python block checks
- Responsive code editor workspace
- Run-code interaction with clear states
- Student-friendly error explanation pattern
- Progressive hint before answer reveal
- Suggested fix and apply-fix journey
- Debug journey progress tracker
- Three interactive debugging challenges
- Recent-check history and passed-check count saved locally on the learner's device
- One-click code copy, reset, and keyboard run shortcut
- Learner mode copy and analogy card
- Mobile-first responsive layout
- Dark workbench visual system for a credible developer-tool experience

The current browser prototype uses deterministic local guided checks so it is safe to preview publicly. It **does not execute arbitrary user code on the web server** and does not pretend that guided output is a complete compiler result.

For the complete release gates, Vercel setup notes, runner security requirements, and device-testing checklist, see [`DEPLOYMENT.md`](./DEPLOYMENT.md). The current site should be described publicly as a CodeMend product preview until those gates are complete.

## Architecture direction

CodeMend is scaffolded as a Vite + React + TypeScript + Tailwind + Express + tRPC application with Manus OAuth, database, storage, and server-side integration hooks available for future milestones.

The planned public architecture is:

```text
React workspace
      |
      v
Typed backend API
      |
      +--> sandboxed execution service
      |       +--> Python
      |       +--> C++
      |       +--> Java
      |
      +--> AI error analyzer
```

Arbitrary code execution must stay behind a dedicated sandbox boundary with resource limits, rate limiting, input validation, and language-specific isolation. It should not be implemented as an unrestricted `subprocess` call inside a public web endpoint.

## Roadmap

- **V2.1 — Workspace foundation:** editor, run flow, result states, responsive UI. **Complete.**
- **V2.2 — Guided practice:** local error patterns, challenges, progress history, copy/reset shortcuts. **Complete.**
- **V2.3 — Secure execution:** connect an isolated runner and parse real compiler/runtime output.
- **V2.4 — Adaptive learning:** larger challenge library, concepts, difficulty, and optional accounts.

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

CodeMend is intentionally more specific than an online compiler or generic AI code generator. Its product identity is an **AI debugging tutor for students**: a tool that helps learners build debugging judgment through explanation, hints, and deliberate practice.
