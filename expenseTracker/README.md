# Expense Tracker Frontend

React 18 + Vite single-page app for the Expense Tracker. See the [root README](../README.md) for the overall project, and [ExpenseTrackerApi/README.md](../ExpenseTrackerApi/README.md) for the backend this talks to.

## Directory structure

```
expenseTracker/
├── src/
│   ├── main.jsx           # React root / ReactDOM render
│   ├── App.jsx             # Route definitions (public, user, admin routes)
│   ├── components/
│   │   ├── user/           # Login, Register, Dashboard, ExpenseForm, ExpenseList,
│   │   │                   #   BudgetForm, Reports, Profile, UserNavbar
│   │   ├── admin/           # AdminLogin, AdminDashboard, CategoryManager, Users,
│   │   │                   #   AdminNavbar, AdminProfile, AddSampleData
│   │   ├── common/           # ForgotPassword, ResetPassword, ErrorPage, TestForm
│   │   ├── hooks/             # PrivateUserRoutes / PrivateAdminRoutes — route guards
│   │   ├── layouts/            # Footer and other shared layout pieces
│   │   └── styles/              # Per-component CSS files
│   └── assets/                   # Static images used in components
├── public/                        # Static files served as-is (logo, favicon, sample images)
├── package.json                    # npm scripts (dev, build, lint, preview) and dependencies
└── .env.example                     # Template for .env
```

## Routes

- **Public** — `/`, `/login/user`, `/login/admin`, `/register`, `/forgotpassword`, `/resetpassword/:token`.
- **User** (guarded by `PrivateUserRoutes`, under `/user`) — `dashboard`, `add-expense`, `expenses`, `budget-form`, `reports`, `profile`.
- **Admin** (guarded by `PrivateAdminRoutes`, under `/admin`) — `dashboard`, `categories`, `users`, `profile`.

All API calls go through `axios`, with `axios.defaults.baseURL` set from `VITE_API_BASE_URL` in `src/App.jsx`.

## Prerequisites

- Node.js 18+ and npm
- The backend ([ExpenseTrackerApi/](../ExpenseTrackerApi/README.md)) running and reachable

## Setup

### 1. Install dependencies

```powershell
npm install
```

### 2. Configure environment variables

```powershell
copy .env.example .env
```

macOS/Linux: `cp .env.example .env`

Set:

```
VITE_API_BASE_URL=http://localhost:8000
```

This must point at wherever the backend is actually running. A missing value throws `Error: Missing required environment variable: VITE_API_BASE_URL` at app load.

**Important:** `VITE_API_BASE_URL` here and `CORS_ORIGIN` in the backend's `.env` must point at each other — the frontend's base URL is the backend's real address, and `CORS_ORIGIN` is the frontend's real address — or the browser will block requests with a CORS error.

## Running (development)

```powershell
npm run dev
```

Serves at `http://localhost:5173` by default (Vite's default; `vite.config.js` sets no custom port or proxy).

Other scripts:
```powershell
npm run lint       # run ESLint
npm run preview    # preview a production build locally
```

## Building for production

```powershell
npm run build
```

Outputs static files to `dist/`. Notes:

- Vite inlines `VITE_`-prefixed env vars **at build time** — set `VITE_API_BASE_URL` to the backend's real production URL in `.env` *before* running `npm run build`; changing `.env` afterwards has no effect on an already-built `dist/`.
- No containerization is used here — deploy `dist/` as static files behind any web server or static host (nginx, Caddy, a static-hosting service, etc.). It's a client-side-routed SPA (`react-router-dom`), so the server must fall back to `index.html` for unknown paths (e.g. nginx `try_files $uri /index.html;`) or deep links like `/user/dashboard` will 404 on refresh.
- Serve over HTTPS in production and make sure the backend's `CORS_ORIGIN` matches this deployed origin exactly.

## Troubleshooting

- **`Error: Missing required environment variable: VITE_API_BASE_URL`** — set it in `.env` and restart `npm run dev` (Vite only reads `.env` at startup/build).
- **CORS errors in the browser console** — the backend's `CORS_ORIGIN` doesn't match this app's actual origin; fix it in the backend's `.env` and restart the backend.
- **API calls fail / network errors** — confirm the backend is running and `VITE_API_BASE_URL` points at it.
- **Deep links 404 after building** — the static host isn't falling back to `index.html` for client-side routes (see "Building for production" above).
