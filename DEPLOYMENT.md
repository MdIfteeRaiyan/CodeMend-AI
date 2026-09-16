# CodeMend public launch checklist

## Important: repository root

Upload the **contents** of this project directly to the GitHub repository root.
`package.json`, `vercel.json`, `client`, and `server` must be visible at the top
level of the repository. Do not upload them inside another `CodeMend` folder.
After deployment, the page footer must show `v1.4`.

This document separates what is ready now from what must be completed before presenting CodeMend as a real online compiler.

## Current launch status

The current V2.4 workspace is safe to host as a **product preview**. Its run interaction is deterministic guided behavior in the browser. It does not execute arbitrary code on the public server.

Do not advertise the current deployment as a production compiler until the execution items below are complete.

## Recommended public architecture

```text
Vercel / web frontend
        |
        v
Typed API (server-side)
        |
        +--> authenticated, rate-limited execution gateway
        |          |
        |          +--> isolated Python runner
        |          +--> isolated C++ runner
        |          +--> isolated Java runner
        |
        +--> AI analyzer
```

The frontend should never receive runner credentials. The API should validate the language, code size, standard input size, and request frequency before forwarding a job. The runner should return structured output rather than raw unbounded process output.

## Before connecting real execution

- [ ] Choose a sandbox provider or deploy isolated language containers.
- [ ] Disable outbound network access from execution containers.
- [ ] Apply CPU, memory, process-count, wall-clock, and output-size limits.
- [ ] Use a temporary filesystem and delete it after every job.
- [ ] Reject oversized code and input before queueing a job.
- [ ] Rate-limit by IP and authenticated user.
- [ ] Add request IDs and server-side audit logs without storing secrets.
- [ ] Normalize Python, C++, and Java compiler/runtime errors into one schema.
- [ ] Add timeout and provider-failure states to the UI.
- [ ] Test infinite loops, fork bombs, large output, file access, network access, and malformed payloads.

## Before connecting AI analysis

- [ ] Keep the AI credential server-side only.
- [ ] Send only the minimum required code and compiler context.
- [ ] Validate AI output against a strict schema before rendering it.
- [ ] Keep hints separate from suggested answers.
- [ ] Require an explicit user action before applying a suggested fix.
- [ ] Add request limits and a fallback explanation when the AI is unavailable.
- [ ] Add a privacy notice explaining what code is sent for analysis.

## Vercel deployment checks

The included `vercel.json` is the source of truth for the public preview:

- Build command: `corepack pnpm build:client`
- Output directory: `dist/public`
- Framework preset: Vite

Do not set the output directory to `dist`. That folder also contains the bundled
Node server and caused the previous deployment to display JavaScript as the page.

1. Connect the repository and configure the production branch.
2. Confirm the frontend build command and output directory match the project configuration.
3. Add production environment variables in the Vercel project settings; never commit `.env` files.
4. Configure the production OAuth callback URL if authentication is enabled.
5. Set the API base URL to the separately hosted backend or execution gateway.
6. Configure CORS to allow only the production frontend origin.
7. Verify that API secrets are not included in client-side bundles.
8. Exercise the production build with an empty editor, valid code, compile error, timeout, provider failure, and mobile layout.
9. Enable error monitoring and review logs after the first deployment.
10. Add a simple health endpoint for the API and runner gateway.

Vercel is appropriate for the web experience and lightweight API coordination. It is not the place for an unrestricted long-running compiler process inside a public request handler.

## Browser and accessibility checks

Test at minimum on desktop Chrome, Safari, and Firefox; iPhone Safari; Android Chrome; and tablet widths. Verify 320px, 390px, 768px, and 1280px layouts. Also test keyboard navigation, visible focus states, textarea scrolling, reduced-motion preferences, screen-reader labels, and the on-screen keyboard covering the editor.

## Release gates

A production launch is ready only when all of these are true:

- Real execution returns correct results for all supported languages.
- Malicious and resource-exhaustion inputs are contained.
- AI failures degrade gracefully.
- Production environment variables and callback URLs are verified.
- Mobile and desktop smoke tests pass.
- The site labels any remaining preview/demo limitations honestly.
- A rollback checkpoint exists immediately before publishing.

## Implemented adapter behavior

The application now has a provider-agnostic server adapter at `server/services/runner.ts`. When `CODE_RUNNER_BASE_URL` is configured, it sends a validated request to `POST /execute` with a ten-second timeout and validates the returned JSON against the execution result schema. When it is not configured, the UI remains in safe demo mode; an adapter call returns `service_unavailable` rather than claiming that code executed.

The AI explanation procedure is server-only and uses the platform's built-in model proxy. Its response is requested as strict JSON and validated before the UI receives it. If the model is unavailable or returns malformed data, CodeMend falls back to a deterministic student-friendly explanation.

## Values still required outside this repository

- `CODE_RUNNER_BASE_URL`: the HTTPS base URL of the isolated execution gateway.
- `CODE_RUNNER_API_KEY`: the gateway credential, if the provider requires one.
- Production OAuth and database values supplied by the managed hosting environment.
- A Vercel project connected to the repository, with its production environment variables configured.

These values are intentionally not invented or committed. The project can be previewed safely without them, but live compilation cannot be honestly marked complete until the runner provider is selected, configured, and security-tested.
