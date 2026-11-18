# BUCKSHOT — Full-Color Anime Manga AI Interview Coach

> **Load the Logic. Fire the Proof.**
> A full-color Shonen Manga Book platform for mastering Algorithms, Systems, Concurrency, System Design, and Frontier AI with **Sensei Reiko**.

## Features
- **3 Live Manga Coloring Modes:** Switch between **Full-Color Spread**, **B&W Ink Mode** (only unlocked breakthroughs pop in anime color!), and **Midnight Shonen**.
- **Shell Break Arena (`/shell-break`):** Proof-Before-Code cognitive scaffolding. Unsolved Breakthrough Panels start in B&W halftone ink and burst into anime color as you prove invariants to Sensei Reiko, breaking the seal on the code editor + live test runner + **Manga Action Replay** step-through visualizer.
- **The Chamber (`/chamber`):** 7-Axis Anime Combat Stat Radar, Adaptive 5-Round Magazine dealer calibrated to your 800–3500 Power Rating, and Sprint Agenda.
- **VOL. 04 Blueprint (`/blueprint`):** Interactive React Flow system design board with Web Speech API voice input, Human-in-the-Loop Ghost Node Approval stamps, and a live 4-Pillar Mock Interview Rubric.
- **Bounty Guessr & Rank Ladder (`/guessr`):** Wanted-poster problem rating estimation game + 6-tier `D → SS` progression ladder.
- **5 Manga Volumes & Career Arsenal (`/volumes`):** Volumes 01–05, GitHub Repo Interrogation, Resume Forge, and Classified Company Intel.
- **Sensei's Character Dossier (`/dossier`):** Transparent, user-editable persistent AI memory injected into every Sensei Reiko prompt.

## Local Development
```bash
npm install
npx prisma db push
npm run dev
```
Open `http://localhost:3000`.

### Optional Live AI Keys (`.env`)
BUCKSHOT works out of the box with zero API keys using its Interactive Local Sensei Engine. To enable live LLM reasoning via the **Vercel AI SDK**, add any one key to `.env` (or Vercel Environment Variables):
- `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini 2.5 Flash)
- `OPENAI_API_KEY` (GPT-4o-mini)
- `ANTHROPIC_API_KEY` (Claude 3.5 Haiku)

## Hosting on Vercel with GitHub Actions

This repo includes [`.github/workflows/deploy-vercel.yml`](.github/workflows/deploy-vercel.yml) and [`vercel.json`](vercel.json).

1. **Create a GitHub repo and push `main`:**
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO>.git
   git push -u origin main
   ```
2. **Link project on Vercel (once) to get IDs:**
   ```bash
   npx vercel link
   ```
   This creates `.vercel/project.json` containing your `orgId` and `projectId`.
3. **Add 3 GitHub Actions Secrets** (`GitHub Repo → Settings → Secrets and variables → Actions`):
   - `VERCEL_TOKEN` — create at https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` — from `.vercel/project.json`
   - `VERCEL_PROJECT_ID` — from `.vercel/project.json`
4. **Optional Production Database:** Out of the box, BUCKSHOT auto-initializes a writable `/tmp/buckshot.db` SQLite database on Vercel so deployments work immediately. For permanent cross-region persistence, connect a free **Neon** or **Supabase** PostgreSQL database, update `provider = "postgresql"` in `prisma/schema.prisma`, and set `DATABASE_URL` in Vercel Project Settings.
