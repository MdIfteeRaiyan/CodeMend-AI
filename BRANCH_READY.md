# CodeMend v1.6 branch handoff

Recommended branch: `feature/language-proficiency-v1.6`

```bash
git switch -c feature/language-proficiency-v1.6
git add -A
git commit -m "Add CodeMend v1.6 languages and proficiency tracking"
git push -u origin feature/language-proficiency-v1.6
```

After review, merge this branch into `main` and let Vercel deploy the merge commit.
The deployed page footer must show `v1.6`, and the browser tab must show the
mint CodeMend icon.
