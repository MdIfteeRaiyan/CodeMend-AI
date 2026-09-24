# DebugTest release notes

## 4.0.0 — Guided performance release

- Added a five-step interactive walkthrough covering the workflow, editor, diagnostics, tests, and progress.
- Added a lightweight first-visit tour invitation and a persistent Tour control.
- Added Android safe-area handling, dynamic viewport sizing, larger touch targets, and mobile-friendly tour controls.
- Disabled expensive background blur on mobile while retaining the premium glass appearance on capable desktops.
- Added viewport rendering containment for lower-page sections to reduce initial layout and paint work.
- Added animated active workflow states and diagnostic success/error ambience using transform, opacity, and shadow only.
- Added a distraction-free Focus view, progressive hints, reliable test verdicts, and all earlier v3 improvements.

## 3.2.0 — Combined workflow reliability release

- Fixed a state mismatch where the diagnostic console could report success while a test case had failed.
- Added language-aware expected output when switching languages or loading challenges.
- Added a true Focus view that removes secondary learning sections during active debugging.
- Added visible keyboard focus styling and live diagnostic status announcements.
- Combined the v3 interface, progressive hints, test workflow, twelve-language paths, metadata, and deployment documentation in one release.

## 3.1.0 — Progressive learning and interface polish

- Fixed the diagnostic header status icon alignment on narrow screens.
- Removed unnecessary empty space from successful diagnostic cards.
- Increased contrast and text size for diagnostic explanations and output.
- Changed error guidance to a progressive sequence: evidence → optional hint → optional solution.
- Kept repair instructions and automatic fixes hidden until the learner explicitly reveals them.
- Simplified success and error states for a cleaner, more premium workbench.

## 3.0.0 — DebugTest diagnostic workflow

- Replaced the complete interface with a focused Write → Scan → Diagnose → Test → Resolve workflow.
- Introduced a new graphite, violet, and cyan design system with an original DebugTest identity.
- Added purposeful scan, orbit, loading, success, and transition animations with reduced-motion support.
- Rebuilt the workspace around a language-aware editor, diagnostic console, and integrated Test Studio.
- Preserved support for twelve programming languages and twenty-four guided challenges.
- Added migration fallbacks so existing local progress and drafts from the previous release remain available.
- Updated application metadata, install assets, GitHub and Vercel handoff instructions, and LinkedIn launch copy.
- Added new responsive layouts and clearer preview-versus-secure-runner status messaging.

## 2.0.0 — Secure runner and verification lab

- Added up to six editable test cases with standard input and expected output.
- Added per-case pass, fail, error, timeout, actual-output, and execution-time feedback.
- Added a validated, rate-limited Vercel API adapter that keeps runner credentials server-side.
- Added explicit secure-runner and preview modes; guided checks are never presented as real compilation.
- Added deployment documentation for isolated container or microVM execution.
- Added an About section for creator Md. Iftee Raiyan.
- Refined the creator credit into a compact responsive footer and added LinkedIn-ready Open Graph metadata.

## 1.7.0 — Complete learning paths

- Added C, Kotlin, and Ruby for twelve supported language paths.
- Expanded the practice library from eighteen to twenty-four challenges.
- Added a three-check daily goal with live completion segments.
- Added an automatic recommended-next-challenge action.
- Added `.c`, `.kt`, `.kts`, and `.rb` imports and downloads.

## 1.6.0 — Languages and proficiency

- Added Go, Rust, and PHP for nine supported language paths.
- Expanded the practice library from twelve to eighteen challenges.
- Added per-language Beginner, Developing, and Proficient tracking.
- Made proficiency rows open the matching language challenge list.
- Added `.go`, `.rs`, and `.php` imports and downloads.

## 1.5.0 — Brand identity

- Added an original DebugTest logo optimized for browser-tab sizes.
- Added SVG, favicon, 192px, and 512px brand assets.
- Added web-app manifest and mobile home-screen metadata.
- Replaced the generic header icon with the DebugTest mark.
- Removed development-only public assets from production builds.

## 1.4.0 — Productive workspace

- Added real JavaScript execution inside a disposable browser worker.
- Disabled worker network APIs and added a 1.5-second timeout for safer execution.
- Added automatic per-language draft saving.
- Added import support for `.py`, `.cpp`, `.cc`, `.java`, `.js`, `.ts`, and `.cs` files.
- Added shareable code links and retained language-aware source downloads.

## 1.3.0 — Learning progression

- Expanded the practice lab from six to twelve debugging challenges.
- Added per-language challenge filtering and completion indicators.
- Added XP, learner levels, and next-level progress tracking.
- Added source-code downloads with the correct language extension.
- Kept all progress private and available without an account.

## 1.2.0 — Languages and real streaks

- Added JavaScript, TypeScript, and C# for six supported languages in total.
- Expanded the practice lab from three to six selectable debugging challenges.
- Replaced the decorative streak with a real daily streak stored in the browser.
- Kept DebugTest guest-first: no account is required until cloud sync becomes useful.

## 1.1.0 — Guided practice upgrade

- Added three selectable Python, C++, and Java debugging challenges.
- Added general unmatched delimiter checks plus Python colon and Java/C++ entry-point guidance.
- Added recent run history and passed-check statistics stored only in the browser.
- Added copy-code feedback and improved the practice sidebar.
- Preserved the zero-credential, static Vercel deployment model.

## What changed

- Renamed the product from CodeLens to DebugTest.
- Added a Vercel configuration that publishes the real Vite frontend from
  `dist/public` instead of exposing the Node server bundle.
- Made the public preview fully usable without database, OAuth, AI, or runner
  credentials.
- Added guided Python, C++, and Java checks with dynamic output, error lines,
  explanations, and hints.
- Added Ctrl/Command + Enter execution and corrected the project link.
- Removed production-only dependencies on the old Manus analytics/runtime hooks.
- Removed `.project-config.json` from the distributable because it contained secrets.

## Publish on Vercel

1. Replace the GitHub repository contents with this package and push to `main`.
2. Import or reconnect the repository in Vercel.
3. Leave Framework Preset, Build Command, and Output Directory on their automatic
   values so Vercel reads `vercel.json`.
4. Redeploy without the previous build cache.

The public version uses an honest guided fallback until `CODE_RUNNER_BASE_URL`
and `CODE_RUNNER_API_KEY` connect it to a separate isolated runner service.

## Required security action

Credentials were present in the original `.project-config.json`. Rotate the old
database password, JWT secret, and Forge/API credentials before reusing any backend
integration. Do not upload that file again.
