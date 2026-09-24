# Secure runner setup

DebugTest v3.0 never compiles untrusted code inside the Vercel function. The browser sends a validated request to `/api/execute`; that server-side adapter forwards one test at a time to an isolated execution provider.

## Required Vercel environment variables

- `CODE_RUNNER_BASE_URL`: HTTPS base URL for your private sandbox service.
- `CODE_RUNNER_API_KEY`: bearer token shared only with that service.

Add them under **Vercel → Project → Settings → Environment Variables**, then redeploy.

## Runner contract

The adapter sends `POST {CODE_RUNNER_BASE_URL}/execute` with:

```json
{
  "language": "Python",
  "code": "print(input())",
  "stdin": "hello"
}
```

The runner must return the `ExecutionResult` shape defined in `shared/execution.ts`. It should execute every job in a fresh container or microVM with:

- no outbound network access;
- a read-only base filesystem and disposable working directory;
- an unprivileged user, no host mounts, and no Docker socket;
- strict CPU, memory, process, output, and wall-clock limits;
- a language allowlist and pinned compiler images;
- automatic deletion of source and artifacts after every run.

DebugTest enforces request sizes, a maximum of six test cases, an eight-second upstream timeout, a per-instance request limit, hidden runner credentials, and `no-store` responses. Production infrastructure should also use a durable rate limiter and abuse monitoring at the runner or gateway.

## Safe preview behavior

Without these variables, `/api/execute` returns `503` and the UI clearly labels results as **preview**. JavaScript can still run in the isolated browser worker; other languages use guided structural checks. Preview results are never labelled as secure-runner output.
