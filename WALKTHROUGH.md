# DebugTest v4 walkthrough

## First visit

New users receive a small, dismissible invitation to a five-step walkthrough. The Tour button in the header can reopen it at any time. Completing the tour is remembered only in the current browser.

## Product flow

1. **Understand the loop** — Write → Scan → Diagnose → Test → Resolve.
2. **Choose a language** — Select one of twelve languages, import a supported source file, or open a practice challenge.
3. **Run a diagnosis** — Use the main button or `Ctrl/Command + Enter`.
4. **Study the evidence** — The console reports the error type, relevant line, and compiler or comparison evidence.
5. **Request help progressively** — Open a hint first. The solution remains hidden until the learner requests it.
6. **Verify the repair** — Add up to six cases with input and expected output, then run all cases.
7. **Build proficiency** — Complete challenges, collect XP, maintain the daily loop, and track each language path.

## Focus view

Desktop users can select **Focus view** to hide the hero, workflow overview, progress cards, challenge library, and language map while actively debugging. Test Studio remains visible because verification is part of the core task.

## Android and small-screen behavior

- The layout collapses to one column below 1050px.
- Editor controls use larger touch targets below 760px.
- The Run button becomes full-width and at least 44px tall.
- Walkthrough panels respect Android and iOS safe areas.
- Expensive backdrop blur is disabled on mobile.
- Lower-page sections use viewport-aware rendering to reduce initial paint work.
- Motion is minimized automatically when the device requests reduced motion.

## Execution modes

- **Guided preview:** deterministic local learning checks; no credentials required.
- **Browser execution:** JavaScript runs in a disposable, network-disabled worker with a timeout.
- **Secure runner:** real multi-language compilation requires a separately isolated provider configured with `CODE_RUNNER_BASE_URL` and, when required, `CODE_RUNNER_API_KEY`.

Never describe the guided preview as full compilation. Vercel coordinates the web experience; unrestricted code must remain inside the separate sandbox boundary.
