# Expense Tracker API

FastAPI + MongoDB backend for the Expense Tracker app. See the [root README](../README.md) for the overall project.

## Directory structure

```
ExpenseTrackerApi/
├── main.py              # App entrypoint: CORS, routers, startup/daily Mongo backup job
├── config/
│   ├── settings.py       # Loads & validates required env vars from .env
│   └── database.py       # Motor client + Mongo collection handles
├── models/                # Pydantic request/response schemas, one per resource
├── controllers/           # Business logic for each resource (called by routes)
├── routes/                 # APIRouter definitions — one router per resource, mounted in main.py
├── utils/
│   ├── CloudinaryUtil.py  # Uploads profile images to Cloudinary
│   └── SendMail.py        # Sends password-reset / report emails via SMTP
├── uploads/                # Locally stored uploaded files (expense receipts, etc.)
├── backups/                # mongodump output, written by the scheduled backup job
├── requirements.txt        # Python dependencies
└── .env.example             # Template for .env
```

Each resource follows the same three-layer pattern: `routes/*.py` declares the HTTP endpoints and delegates to `controllers/*.py`, which contains the actual MongoDB logic and returns data shaped by `models/*.py`.

## Resources and endpoints

| Resource | Collection | Endpoints |
|---|---|---|
| Role | `roles` | `GET /roles`, `GET /role/{id}`, `POST /role`, `DELETE /role/{id}` |
| User | `users` | `GET /users`, `GET /user/{id}`, `GET /user/role/{id}`, `POST /user`, `POST /user/url`, `PUT /user/{id}`, `PUT /user/role/{id}`, `DELETE /user/{id}`, `POST /sendmail/{userId}`, `POST /login/user`, `POST /login/admin`, `POST /forgotpassword`, `POST /resetpassword`, `GET /admindata` |
| Category | `category` | `GET /categories`, `GET /category/{id}`, `POST /category`, `PUT /category/{id}`, `DELETE /category/{id}` |
| Expense | `expenses` | `GET /expenses`, `GET /expenses/{id}`, `POST /expense`, `PUT /expense/{id}`, `DELETE /expense/{id}` |
| Budget | `budget` | `GET /budgets`, `GET /budget/user/{id}`, `POST /budget`, `PUT /budget/{id}`, `DELETE /budget/{id}` |

`main.py` also runs a MongoDB backup (`mongodump`) once on startup and daily at 12:00 via APScheduler, writing to `backups/`.

## Prerequisites

- Python 3.10+
- A **MongoDB Atlas** account — the free M0 tier (512 MB, no credit card) is enough. This project targets Atlas only; there is no local MongoDB setup path.
- Optional: MongoDB Database Tools (`mongodump` on `PATH`) for the backup job to actually succeed
- Optional: `mongosh` for inspecting the database from a shell (see [Using `mongosh`](#using-mongosh)) — the Atlas UI can do the same things without it
- Optional: a Cloudinary account (profile image uploads) and a Gmail account with an App Password (password-reset / report emails) — the server starts without these being valid, but those specific features fail at request time

## Setup

### 1. Create the Atlas cluster

1. Register at [mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register).
2. **Deploy a cluster** — choose the **M0 / Free** tier (confirm it reads $0.00/month before continuing). Pick any provider and a nearby region; leave the name as `Cluster0`.
3. **Create a database user** — Atlas prompts for one right after deployment, or add it later under **Database Access**. Copy the password immediately; it is shown only once.
   > Keep the password alphanumeric. Characters like `@ : / ? # %` must be percent-encoded in the connection string and are a common cause of silent auth failures.
4. **Allow your IP** — under **Network Access**, add your current IP. If you move between networks, add `0.0.0.0/0` (allow from anywhere) instead; acceptable for local development, never for production.
5. **Copy the connection string** — cluster → **Connect** → **Drivers** → Python 3.12 or later:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```

Replace `<username>` and `<password>` (angle brackets removed) with the credentials from step 3. Do **not** append a database name to the URI — `config/database.py` selects it via `DATABASE_NAME`. No manual database/collection creation is needed; Atlas creates both on first write.

### 2. Create and activate a virtual environment

```powershell
python -m venv venv
venv\Scripts\activate
```

macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```powershell
pip install -r requirements.txt
```

`mongodb+srv://` URIs are resolved via `dnspython`, which current PyMongo (4.x) installs as a hard dependency — no `[srv]` extra is needed. `pymongo` is listed in `requirements.txt` in its own right because the controllers and models import `bson.ObjectId` from it directly.

### 4. Configure environment variables

```powershell
copy .env.example .env
```

macOS/Linux: `cp .env.example .env`

The app loads `.env` via `python-dotenv` and **fails immediately at startup** with `RuntimeError: Missing required environment variable: <NAME>` if any of these are missing:

| Variable | Purpose | Where to get it |
|---|---|---|
| `MONGO_URL` | Atlas `mongodb+srv://` connection string, credentials included | From step 1 |
| `DATABASE_NAME` | Database to use inside the cluster | `ExpenseTracker` (created on first write) |
| `JWT_SECRET_KEY` | Signs password-reset tokens | Any random string, e.g. `python -c "import secrets; print(secrets.token_hex(32))"` |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Profile image uploads | Cloudinary Dashboard (free account) |
| `SMTP_SERVER`, `SMTP_PORT`, `SMTP_EMAIL`, `SMTP_PASSWORD` | Password-reset & report emails | For Gmail: `smtp.gmail.com` / `587` / your address / a 16-character App Password (requires 2-Step Verification — generate under Google Account → Security → App passwords) |
| `CORS_ORIGIN` | Allowed frontend origin (also used in password-reset email links) | The URL the frontend runs on, e.g. `http://localhost:5173` |

`.env` is gitignored — never commit it, and never put real secrets in `.env.example`.

### 5. Seed the two required role documents

There is no seed script or admin-registration endpoint. The app hardcodes two MongoDB `_id` values to distinguish admins from regular users:

- Admin role id: `67c7e9207afd6879270eb870`
- Standard-user role id: `67c7e9367afd6879270eb871`

Create these two documents in the `roles` collection with those **exact** `_id`s before login/registration will work as expected.

**Option A — Atlas UI (no tools to install).** Cluster → **Browse Collections** → **Add My Own Data**: database `ExpenseTracker`, collection `roles`. Then **INSERT DOCUMENT**, switch to the `{}` (JSON) view, and paste each of these in turn:

```json
{ "_id": { "$oid": "67c7e9207afd6879270eb870" }, "name": "admin", "description": "Administrator" }
```
```json
{ "_id": { "$oid": "67c7e9367afd6879270eb871" }, "name": "user", "description": "Standard user" }
```

The `$oid` wrapper is what makes Atlas store these as real `ObjectId`s rather than strings — as plain strings they will not match and login will fail.

> What makes an account an admin is the **role `_id`**, not the name — `loginAdmin` matches on `67c7e9207afd6879270eb870`. The frontend compares the role *name* against `"admin"` case-insensitively (`AdminLogin.jsx`, `PrivateAdminRoutes.jsx`), so `admin`, `Admin` and `ADMIN` all work; a different word entirely would not.

**Option B — `mongosh`.** Connect as described in [Using `mongosh`](#using-mongosh), select the database, then insert both documents:

```javascript
use ExpenseTracker
db.roles.insertOne({ _id: ObjectId("67c7e9207afd6879270eb870"), name: "admin", description: "Administrator" })
db.roles.insertOne({ _id: ObjectId("67c7e9367afd6879270eb871"), name: "user", description: "Standard user" })
```

`ObjectId(...)` here plays the same role as the `$oid` wrapper in Option A — without it the ids are stored as strings and login fails.

### 6. Create the first admin account

**There is no "register as admin" option** — the signup form always creates a standard user, and the API has no admin-registration endpoint. So the first admin is made by registering normally and then promoting that account in the database.

1. **Register through the app** as you normally would (`/register`, or `POST /user`). This creates a standard user.
2. **Promote them to admin** — connect with `mongosh` (see [Using `mongosh`](#using-mongosh)) and flip that account's `roleId`, using the email you just signed up with:

   ```javascript
   use ExpenseTracker
   db.users.updateOne(
     { email: "you@example.com" },
     { $set: { roleId: ObjectId("67c7e9207afd6879270eb870") } }
   )
   ```

   Expect `matchedCount: 1, modifiedCount: 1`. If `matchedCount` is `0`, the email doesn't match any user — check `db.users.find({}, { email: 1 })`.

   In the Atlas UI instead: **Browse Collections** → `users` → find the document → edit `roleId` to `67c7e9207afd6879270eb870`, keeping it an `ObjectId`, not a string.

3. **Log in at the admin page** — `/login/admin` in the app (`POST /login/admin`). Logging in through the normal user page won't grant admin access, because that's what gates the admin dashboard.

Verify it took effect:
```javascript
db.users.findOne({ email: "you@example.com" }, { email: 1, roleId: 1 })
```

Repeat step 2 for any further admins. Once an admin exists, you can change other users' roles from the admin **Users** page instead of touching the database.

## Using `mongosh`

`mongosh` is the MongoDB shell. It is a client only — this project's data lives in Atlas, so there is nothing to install or run locally beyond the shell itself. It's useful for seeding the role documents (step 5 above), checking what the API actually wrote, and clearing test data.

### Install

```powershell
winget install MongoDB.Shell
```

macOS: `brew install mongosh`. Otherwise download the archive from [mongodb.com/try/download/shell](https://www.mongodb.com/try/download/shell) and add its `bin/` directory to `PATH`.

Open a **new** terminal afterwards so the updated `PATH` is picked up, then confirm:

```powershell
mongosh --version
```

### Connect

Pass the same connection string as `MONGO_URL`, quoted:

```powershell
mongosh "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
```

The quotes are required — an unquoted `&` is a control operator in bash and a parse error in PowerShell, so the URI would be truncated at the first one.

To avoid copying credentials around, read the value straight out of `.env`:

```powershell
$uri = ((Select-String -Path .env -Pattern '^MONGO_URL=').Line -replace '^MONGO_URL=','').Trim('"')
mongosh "$uri"
```

macOS/Linux:
```bash
mongosh "$(grep '^MONGO_URL=' .env | cut -d= -f2- | tr -d '"')"
```

### Common commands

```javascript
use ExpenseTracker          // switch to the database named by DATABASE_NAME
show collections
db.roles.find()                                  // verify the two seeded role documents
db.users.find({}, { name: 1, email: 1, roleId: 1 })
db.expenses.countDocuments()
db.expenses.deleteMany({})                       // wipe test expenses
exit
```

Switch databases with `use`, not by appending the name to the URI — the Atlas string ends in a `?...` query section, so `.../ExpenseTracker?retryWrites=...` is the only correct placement and `use` avoids having to edit the string at all.

`mongosh` does **not** include `mongodump`; the backup job in `main.py` needs the separate MongoDB Database Tools package (`winget install MongoDB.DatabaseTools`).

## Running (development)

```powershell
uvicorn main:app --reload
```

Serves on `http://localhost:8000` (Uvicorn's default — no host/port override in code). Verify with a browser at `http://localhost:8000/`:
```json
{"message": "Expense Tracker API with MongoDB backup job running."}
```

### Interactive API docs

FastAPI generates these automatically from the routers and Pydantic models — no extra setup:

| URL | What it is |
|---|---|
| `http://localhost:8000/docs` | **Swagger UI** — every endpoint grouped by router, expandable, with a "Try it out" button that sends real requests |
| `http://localhost:8000/redoc` | ReDoc — the same spec in a read-only reference layout |
| `http://localhost:8000/openapi.json` | Raw OpenAPI schema, for importing into Postman/Insomnia |

`/docs` is the quickest way to see what's available and poke at it. Note that the routes don't declare a security scheme, so Swagger UI shows no **Authorize** button — a JWT from `POST /login/user` or `POST /login/admin` won't be attached automatically, and endpoints that expect one have to be tested with `curl`/Postman instead.

## Running (production-style)

No containerization is used here — running the same way but hardened for a long-lived process:

```powershell
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

- Drop `--reload` (it's for development only and adds overhead/instability under load).
- `--workers N` runs multiple worker processes to handle concurrent requests; size it to available CPU cores.
- Put a reverse proxy (e.g. nginx, Caddy) in front for TLS termination and to serve on port 80/443.
- Set real environment variables on the host (or a secrets manager) instead of shipping a `.env` file — same variable names as above.
- Set `CORS_ORIGIN` to the frontend's actual production URL.
- Run the process under a supervisor (systemd unit, `pm2`, Windows Task Scheduler/NSSM, etc.) so it restarts on crash/reboot.
- Ensure `backups/` and `uploads/` are on persistent storage the process can write to.
- Add the host's outbound IP to Atlas **Network Access**, and replace any `0.0.0.0/0` rule left over from development with that specific address.
- Use a dedicated Atlas database user for the deployment (Atlas → Database Access) rather than reusing your development credentials, and scope it to `readWrite` on `ExpenseTracker` only.
- Install the MongoDB Database Tools on the host if you want the scheduled `mongodump` backup job to actually run. Note that `main.py` passes `MONGO_URL` to `mongodump` via `os.system`, so the Atlas credentials appear in the host's process list while the dump runs.

## Troubleshooting

- **`RuntimeError: Missing required environment variable: X`** — a value in `.env` is missing or empty; fill it in and restart.
- **`ServerSelectionTimeoutError` after ~30s** — your current IP isn't in Atlas **Network Access**, or the cluster is paused (Atlas auto-pauses idle M0 clusters; resume it from the cluster page).
- **`ConfigurationError: The "dnspython" module must be installed`** — only happens on an old PyMongo; run `pip install -U pymongo dnspython`.
- **`OperationFailure: bad auth : authentication failed`** — wrong username/password, the `<`/`>` brackets were left in the URI, or the password contains characters that need percent-encoding. Resetting it to an alphanumeric password under Database Access is the quickest fix.
- **CORS errors in the browser** — `CORS_ORIGIN` doesn't match the URL the frontend is actually served from.
- **Login/registration doesn't work** — the two role documents from step 5 don't exist yet with the exact required `_id` values.
- **Mongo backup errors on startup** — harmless if `mongodump` isn't installed; the server still starts.
- **`mongosh : The term 'mongosh' is not recognized`** — not installed, or installed but `PATH` hasn't refreshed; see [Using `mongosh`](#using-mongosh) and open a new terminal.
- **`mongosh` reports `Invalid scheme` or hangs on connect** — the URI wasn't quoted, so the shell split it at `&` or `?`; wrap the whole connection string in double quotes.
- **Password reset / report emails fail** — for Gmail, `SMTP_PASSWORD` must be a 16-character App Password, not your normal password.
