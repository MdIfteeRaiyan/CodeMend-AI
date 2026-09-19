# CodeMend v1.7 branch handoff

Recommended branch: `feature/learning-paths-v1.7`

```bash
git switch -c feature/learning-paths-v1.7
git add -A
git commit -m "Release CodeMend v1.7 complete learning paths"
git push -u origin feature/learning-paths-v1.7
```

After review, merge this branch into `main` and let Vercel deploy the merge commit.
The deployed page footer must show `v1.7`, and the browser tab must show the
mint CodeMend icon.
