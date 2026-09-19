# CodeMend v2.0 branch handoff

Recommended branch: `feature/secure-runner-v2`

```bash
git switch -c feature/secure-runner-v2
git add -A
git commit -m "Release CodeMend v2 secure runner and test lab"
git push -u origin feature/secure-runner-v2
```

After review, merge this branch into `main` and let Vercel deploy the merge commit.
The deployed page footer must show `v2.0`, and the browser tab must show the
mint CodeMend icon.
