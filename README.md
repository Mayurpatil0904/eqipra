# Equipra — Frontend

The web client for **Equipra**, a last-mile logistics platform for university lab equipment. Built for the **FAR AWAY International Hackathon 2026** under the **Logistics & Transit** theme.

Students request equipment, faculty verify, lab admins approve and hand out QR-based collection passes — and every return goes through a condition-rated inspection workflow with a 24-hour quarantine before re-entering the available pool.

---
## Live Demo
https://equipra-app.vercel.app/login

## Test Credentials
| Role | Enrollment ID | Password |
|------|--------------|----------|
| Student | PU-STU-001 | student123 |
| Faculty | PU-FAC-001 | faculty123 |
| Admin | Admin123 | Admin123@ |

## Tech Stack

- **React 18 + TypeScript**
- **Vite** — build tool & dev server
- **React Router** — client-side routing
- **Tailwind CSS** + **tailwindcss-animate** — styling
- **shadcn/ui** (Radix primitives: dialog, dropdown, select, tabs, toast, tooltip...)
- **@tanstack/react-query** — data fetching/caching
- **react-hook-form + zod + @hookform/resolvers** — forms & validation
- **recharts** — admin analytics charts
- **qrcode** — collection pass QR generation
- **lucide-react** — icons
- **sonner** — toast notifications
- **next-themes** — dark/light mode

---

## Project Structure

```
frontend/
├── src/
│   ├── pages/           # Route-level views (Dashboard, Inventory, Requests, FaultScan, Admin...)
│   ├── components/       # Reusable UI components (shadcn/ui based)
│   ├── context/          # Auth/role context, app-wide state
│   ├── lib/               # API client, utils
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env                  # VITE_API_URL
└── vite.config.ts
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

The `.env` file is safe to commit (no secrets) — it just points to your backend:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, set this to your deployed backend URL, e.g.:

```env
VITE_API_URL=https://your-backend.onrender.com/api
```

### 3. Run in development

```bash
npm run dev
```

App runs on `http://localhost:5173` by default.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Production build (output in `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |

---

## Core Features by Role

**Student**
- Browse equipment available to their department (or general-access items)
- Submit requests with project details, duration, and team info
- Track request status in real time
- Receive a **QR collection pass** once approved — printable, scoped to that pass only
- Messaging with faculty/lab admins (50-word limit)

**Faculty**
- Verify/approve student requests before they reach the lab admin
- See department equipment overview

**Lab Admin**
- Approve/reject requests, generate collection passes
- Scan QR codes to check equipment in/out
- Run return inspections — rate condition, log damage, trigger 24-hour quarantine
- Fault Scan lookup — enter an Equipment ID to view its **full usage/timeline history**
- Manage inventory, view top-requested equipment stats

**Super Admin**
- Manage universities/colleges and admin accounts across institutions

---

## Key UI Notes

- **Inventory detail view** shows only the **latest 5** timeline entries per item; the **Fault Scan** page shows the complete history for a given Equipment ID.
- **Collection Pass** printing is scoped to just the pass component (not the whole page) via a dedicated print stylesheet/print target.
- Equipment returned with condition rating ≥ 4 enters a **24-hour quarantine** (`pendingUnits` / `availableAt`) before becoming available again — this is enforced backend-side and reflected automatically in inventory counts.

---

## Deployment

Deployed on **Vercel**. Set `VITE_API_URL` as an environment variable in the Vercel project settings to point at your production backend (Render).

```bash
npm run build
```

Output directory: `dist/`

---

## License

Built for FAR AWAY International Hackathon 2026 — Logistics & Transit theme.
