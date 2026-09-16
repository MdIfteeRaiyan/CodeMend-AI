# CodeMend release notes

## 1.5.0 — Brand identity

- Added an original CodeMend logo optimized for browser-tab sizes.
- Added SVG, favicon, 192px, and 512px brand assets.
- Added web-app manifest and mobile home-screen metadata.
- Replaced the generic header icon with the CodeMend mark.
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
- Kept CodeMend guest-first: no account is required until cloud sync becomes useful.

## 1.1.0 — Guided practice upgrade

- Added three selectable Python, C++, and Java debugging challenges.
- Added general unmatched delimiter checks plus Python colon and Java/C++ entry-point guidance.
- Added recent run history and passed-check statistics stored only in the browser.
- Added copy-code feedback and improved the practice sidebar.
- Preserved the zero-credential, static Vercel deployment model.

## What changed

- Renamed the product from CodeLens to CodeMend.
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

The public version is an honest guided-learning prototype. It does not execute
arbitrary code. Real compilation requires a separate isolated runner service.

## Required security action

Credentials were present in the original `.project-config.json`. Rotate the old
database password, JWT secret, and Forge/API credentials before reusing any backend
integration. Do not upload that file again.
