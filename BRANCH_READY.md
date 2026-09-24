# DebugTest v3.2 branch handoff

Recommended branch: `release/debugtest-v3`

```bash
git switch -c release/debugtest-v3
git add -A
git commit -m "Release DebugTest v3.2 combined premium workflow"
git push -u origin release/debugtest-v3
```

After review, merge this branch into `main` and let Vercel deploy the merge commit.
The deployed page footer must show `v3.2`, and the browser tab must show the
violet-and-cyan DebugTest icon.
