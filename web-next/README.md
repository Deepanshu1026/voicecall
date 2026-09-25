# web-next — A Visa Experts (Next.js marketing site)

This app serves the **public/static pages** of avisaexperts.com with server-side rendering
for SEO:

- `/` (home)
- `/about`
- `/services`
- `/tourist-visa`
- `/work-visa`
- `/transit-visa`
- `/blogs`
- `/blog/[id]/[[...slug]]` (blog detail)

Everything else (auth, chat, consultants/"Our Advisor", appointment, agent & admin dashboard)
stays on the existing **Vite** app (`../frontend`) and is untouched.

## Deploy (Vercel)

1. Create a **new Vercel project** with **Root Directory = `web-next`**.
2. Environment variable:
   - `NEXT_PUBLIC_API_URL = https://voicecall-6ylg.onrender.com/api`
3. Deploy. Note the production URL, e.g. `https://avisaexperts-next.vercel.app`.

## Wiring into the domain (Option B — Vite stays the domain owner)

The existing Vite project (`../frontend`, deployed at `avisaexperts.com`) keeps serving every
route. We only forward the 8 marketing routes (and Next's `/_next` assets) to this Next app.

Replace your **Next project URL** below and set `frontend/vercel.json` to:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "redirects": [
    { "source": "/home", "destination": "/", "permanent": true }
  ],
  "rewrites": [
    { "source": "/", "destination": "https://avisaexperts-next.vercel.app/" },
    { "source": "/about", "destination": "https://avisaexperts-next.vercel.app/about" },
    { "source": "/services", "destination": "https://avisaexperts-next.vercel.app/services" },
    { "source": "/tourist-visa", "destination": "https://avisaexperts-next.vercel.app/tourist-visa" },
    { "source": "/work-visa", "destination": "https://avisaexperts-next.vercel.app/work-visa" },
    { "source": "/transit-visa", "destination": "https://avisaexperts-next.vercel.app/transit-visa" },
    { "source": "/blogs", "destination": "https://avisaexperts-next.vercel.app/blogs" },
    { "source": "/blog/:id", "destination": "https://avisaexperts-next.vercel.app/blog/:id" },
    { "source": "/blog/:id/:slug", "destination": "https://avisaexperts-next.vercel.app/blog/:id/:slug" },
    { "source": "/_next/:path*", "destination": "https://avisaexperts-next.vercel.app/_next/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> Important: only apply this once the Next project is live at that URL, otherwise the marketing
> routes will 502. Rollback = restore the previous `vercel.json` (the prerendered `.html` rewrites).

## SEO safeguards (Option B)

- Next pages emit **canonical = https://avisaexperts.com/...** (absolute), not the vercel.app URL.
- Add a Vercel **deployment protection** / `noindex` on the `*.vercel.app` domain so it isn't
  indexed as duplicate content.
- `sitemap.xml` / `robots.txt` remain served by the Vite project (`frontend/public`).
- `/home` → 301 → `/` (single canonical home).

## Local dev

```bash
npm install
npm run dev
```

## Notes

- Images are still served by the Vite project from `/images/...` (domain owner), so no asset move.
- Cross-app links (e.g. `/consultants`, `/appointment`, `/login`) use full page loads (`<a>` /
  `window.location`), which the domain owner routes to the Vite app.
