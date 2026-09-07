# Task Tracer — Frontend

Next.js 16 (App Router) UI for the [Task Tracer API](../task-tracer-backend).

## How the frontend reaches the API

The task store is a client-side store (`'use client'`), so every request is made
**by the browser**, not by the Next.js server. That rules out pointing the app at
a Docker service name like `http://api:3000` — that hostname only resolves inside
the compose network, not on the user's machine.

So requests go through a same-origin proxy instead:

```
browser ──GET /api/tasks──> Next.js (web:3001) ──> http://api:3000/tasks ──> Nest
```

- `src/app/api/[...path]/route.ts` forwards `/api/*` to the backend.
- `src/environments/environment.ts` defaults `apiUrl` to the relative `/api`.

Two things fall out of this that are worth knowing:

- **No CORS.** The browser only ever talks to its own origin.
- **`API_URL` is a runtime setting.** It is read per request on the server, so the
  same image can be repointed at another backend with a restart, no rebuild.
  A `NEXT_PUBLIC_*` variable could not do this: those are inlined into the client
  bundle during `next build`.

To bypass the proxy and have the browser call the backend directly, set
`NEXT_PUBLIC_API_URL` at **build** time (the backend already enables CORS).

## Running with Docker

The backend's own compose project owns Postgres and the API, so this compose file
runs only `web` and attaches to the network that project already created.

**Start the backend first:**

```bash
cd ../task-tracer-backend
docker compose up -d
```

**Then the frontend:**

```bash
cd ../task-tracer-frontend
docker compose up --build
```

The UI is on <http://localhost:3001>.

### Configuration

`docker-compose.yml` reads these from `.env` (all optional):

| Variable          | Default                       | Purpose                                               |
| ----------------- | ----------------------------- | ----------------------------------------------------- |
| `BACKEND_URL`     | `http://api:3000`             | Backend base URL as seen from the Next.js **server**. |
| `WEB_PORT`        | `3001`                        | Host port the UI is published on.                     |
| `BACKEND_NETWORK` | `task-tracer-backend_default` | Existing network to join.                             |

Compose passes `BACKEND_URL` into the container as `API_URL`, which is the name
the proxy actually reads. The two are deliberately different: Next.js auto-loads
`.env` as well, so an `API_URL` sitting in that file would also apply to
`pnpm dev` and point local development at a hostname only Docker can resolve.

If `docker compose up` fails with a missing-network error, the backend's project
named its network something else. List them and set `BACKEND_NETWORK` to match:

```bash
docker network ls
```

(Compose derives the name from the backend's directory, as `<dir>_default`.)

## Local development

```bash
pnpm install
pnpm dev
```

Runs on <http://localhost:3001>. Requests to `/api/*` are proxied to
`http://localhost:3000` by default, which is where the backend listens locally —
so `pnpm dev` and Docker behave the same way, with no code change between them.

## Notes on the image

- `next.config.ts` sets `output: 'standalone'`, so the runtime stage copies a
  self-contained server and needs no `node_modules` install.
- `next build` downloads the Geist fonts used in `app/layout.tsx` from Google
  Fonts, so the build stage needs network access.
- The container runs as the non-root `node` user.
