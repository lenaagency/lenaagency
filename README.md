# LENA Agency · 레나에이전시 (Next.js)

Seoul literary rights agency website — Next.js 15 (App Router), ready for **Vercel**.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Deploy to Vercel

### Option A — CLI
```bash
npm i -g vercel
vercel
```

### Option B — GitHub
1. Push this folder to a GitHub repository
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Framework: **Next.js** (auto-detected)
4. Deploy

No env vars required for the demo form (saves to `localStorage`).

## Project structure

```
src/app/           # Routes: /, /about, /import, /export, /export/[id], /contact
src/components/    # Header, Footer, CoverCard
src/context/       # KO/EN language provider
src/lib/data.ts    # Titles, bestsellers, services
public/covers/     # Book cover images
```

## Content updates

Edit `src/lib/data.ts`:
- `exportTitles` — Korean titles for rights sales
- `importHighlights` — licensed bestsellers showcase
- `services`, `stats`, `agency`

Cover images go in `public/covers/` and paths like `/covers/filename.png`.


## Contact form email

Inquiries are sent to **lena.lenaagency@gmail.com** via `/api/contact`.

### Default (FormSubmit)
No API key needed. On the **first** real submission, open that Gmail inbox and click the FormSubmit confirmation link.

### Recommended for production (Web3Forms)
1. Go to https://web3forms.com and create a free access key for `lena.lenaagency@gmail.com`
2. In Vercel → Project → Settings → Environment Variables:
   - `WEB3FORMS_ACCESS_KEY` = your key
   - `CONTACT_EMAIL` = `lena.lenaagency@gmail.com` (optional)
3. Redeploy

### Optional (Formspree)
Set `FORMSPREE_FORM_ID` to your form id instead.

## Newsletter subscribe (`/contact`)

The contact page includes an email form with **checkboxes** that adds the address to Brevo via `POST /api/newsletter/subscribe`.

| Site language | Checkbox options | Env var | List id |
|---------------|------------------|---------|---------|
| KO | 아동 | `BREVO_LIST_ID_KO_KIDS` | 40 |
| KO | 영미·유럽 | `BREVO_LIST_ID_KO_ANGLO` | 38 |
| KO | 일본 | `BREVO_LIST_ID_KO_JAPAN` | 39 |
| EN | Adults | `BREVO_LIST_ID_EN_ADULTS` | 48 |
| EN | Kids | `BREVO_LIST_ID_EN_KIDS` | 50 |

Also set `BREVO_API_KEY` (same key as the weekly newsletter Apps Script). Redeploy on Vercel after adding env vars.
