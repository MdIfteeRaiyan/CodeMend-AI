# CodeMend v1.5 branch handoff

Recommended branch: `feature/brand-identity-v1.5`

```bash
git switch -c feature/brand-identity-v1.5
git add -A
git commit -m "Add CodeMend v1.5 brand identity and favicon"
git push -u origin feature/brand-identity-v1.5
```

After review, merge this branch into `main` and let Vercel deploy the merge commit.
The deployed page footer must show `v1.5`, and the browser tab must show the
mint CodeMend icon.
