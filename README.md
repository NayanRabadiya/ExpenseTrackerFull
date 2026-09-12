# Expense Tracker

A full-stack personal expense tracking application with separate user and admin experiences.

The project is split into two independent parts, each with its own README covering setup, running, and deployment:

- **[ExpenseTrackerApi/](ExpenseTrackerApi/README.md)** — FastAPI + MongoDB backend (REST API).
- **[expenseTracker/](expenseTracker/README.md)** — React 18 + Vite frontend (SPA).

## What it does

- Regular users register, log in, record expenses against categories, set per-category budgets (with overspending indicators), and view analytics/reports with optional PDF export and email delivery.
- Admins log in separately, manage expense categories, view aggregate usage stats, and manage users.

## Repository layout

```
ExpenseTrackerFull-main/
├── ExpenseTrackerApi/   # Backend — FastAPI service (see ExpenseTrackerApi/README.md)
└── expenseTracker/      # Frontend — React + Vite SPA (see expenseTracker/README.md)
```

## Tech stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI + Uvicorn |
| Database | MongoDB Atlas (free M0 tier), accessed via Motor (async) |
| Auth | `bcrypt` password hashing, `pyjwt` password-reset tokens |
| Image storage | Cloudinary |
| Email | SMTP (configured for Gmail by default) |
| Scheduled jobs | APScheduler (daily Mongo backup) |
| Frontend framework | React 18 + React Router 7 |
| Build tool | Vite 6 |
| UI | MUI, Lucide/React Icons, custom CSS |
| Charts | Chart.js / react-chartjs-2, Recharts |
| PDF export | jsPDF + html2canvas |

## Getting started

The backend and frontend must both be running, and their env vars (`CORS_ORIGIN` on the backend, `VITE_API_BASE_URL` on the frontend) must point at each other. Follow, in order:

1. **[ExpenseTrackerApi/README.md](ExpenseTrackerApi/README.md)** — Atlas cluster setup, Python venv, installing dependencies, environment variables, seeding the required role documents, and running the API.
2. **[expenseTracker/README.md](expenseTracker/README.md)** — installing dependencies, environment variables, and running/building the frontend.
