# Ai-resume-builder

An AI resume builder made with Next.js. Sign up, build resumes and letters, download them as PDF, and use Claude AI to write, review and practise interviews.

## Run it

```bash
npm install
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000 and create an account.

## What works

- **Accounts:** sign up, sign in, sign out (passwords hashed, 30-day sessions).
- **Dashboard:** resumes, cover letters and resignation letters, saved per account, with sections, sorting and grid/list views. Drop a PDF or DOCX to import it.
- **Editor:** form with live preview, autosave, and Download PDF (uses the browser's print dialog, "Save as PDF").
- **AI (needs `ANTHROPIC_API_KEY`):** write/improve summaries and bullet points, write letters, AI Resume Agent chat, AI interview questions with feedback, and resume reviews. Imported resumes are split into fields by AI.
- **Job Search and Sample Library:** sample listings; saves, applications and bookmarks are stored per account.

UI work follows the rules in [AGENTS.md](AGENTS.md): build screens with shadcn/ui, Mantine and Tremor.

Data is stored in a local SQLite file at `data/app.db` (not committed).
