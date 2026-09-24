# DebugTest v4.0 branch handoff

Recommended branch: `release/debugtest-v4`

```bash
git switch -c release/debugtest-v4
git add -A
git commit -m "Release DebugTest v4 guided performance workflow"
git push -u origin release/debugtest-v4
```

After review, merge this branch into `main` and let Vercel deploy the merge commit.
The deployed page footer must show `v4.0`, and the browser tab must show the
violet-and-cyan DebugTest icon.
