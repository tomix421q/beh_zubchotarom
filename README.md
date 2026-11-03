## Environment variables

Copy `.env.example` to `.env` for local development. In production (Coolify) set them in the app's environment; the Docker image already defaults the last three, see [Deploying on Coolify](#deploying-on-coolify).

| Variable               | Purpose                                                                         | Default         |
| ---------------------- | ------------------------------------------------------------------------------- | --------------- |
| `ADMIN_PASSWORD`       | Password for `/admin`; without it every login is refused                        | none            |
| `ADMIN_SESSION_SECRET` | Signs the admin session cookie, e.g. `openssl rand -hex 32`                     | none            |
| `DATABASE_URL`         | SQLite database file                                                            | `file:./dev.db` |
| `UPLOADS_DIR`          | Folder for uploaded images                                                      | `./uploads`     |
| `BODY_SIZE_LIMIT`      | Largest request body the production server accepts; set `6M` so 5 MB photos fit | `512K`          |

In production, point `DATABASE_URL` and `UPLOADS_DIR` at a persistent volume (on Coolify `file:/data/app.db` and `/data/uploads`). Otherwise the database and uploads are lost on every redeploy. `DATABASE_URL` must also be set where `prisma migrate` runs.

## Deploying on Coolify

Coolify builds the app from the `Dockerfile` (multi-stage: Bun builds, plain Node runs the `adapter-node` output as the non-root `node` user). There is no `docker-compose.yml`; the volume and variables are set in the Coolify UI.

1. Create the application from this repository with the **Dockerfile** build pack and port `3000`.
2. Add **Persistent Storage** mounted at `/data`. It holds the SQLite database (`/data/app.db`) and the uploaded files (`/data/uploads`). Everything else in the container is recreated on every deploy.
3. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` (see [Environment variables](#environment-variables)). `DATABASE_URL` (`file:/data/app.db`), `UPLOADS_DIR` (`/data/uploads`) and `BODY_SIZE_LIMIT` (`6M`) already default to the right values in the image.

Notes:

- Pending migrations (`prisma migrate deploy`) run on every container start. The seed is never run in production; the admin creates the first edition in `/admin`.
- The app needs no `ORIGIN` variable. `adapter-node` takes the origin from the `Host` header and assumes `https`, which is what Coolify's proxy serves. If the site is served over plain `http`, every admin form is rejected as cross-site; set `PROTOCOL_HEADER=x-forwarded-proto` and `HOST_HEADER=x-forwarded-host` to fix that.
- The app user has uid 1000. A named Docker volume inherits the ownership of `/data` from the image. If the storage is a bind mount owned by root, run `chown -R 1000:1000` on it, otherwise the migration cannot create the database.
- Backups: back up the persistent storage mounted at `/data` (Coolify can schedule this).

To try the image locally:

```sh
docker build -t beh-zubchotarom .
docker run --rm -p 3000:3000 -v bz-data:/data \
  -e ADMIN_PASSWORD=change-me -e ADMIN_SESSION_SECRET=$(openssl rand -hex 32) \
  beh-zubchotarom
```

Over plain `http://localhost` the admin login cookie is `Secure`, so the browser will not keep it; test the admin behind HTTPS or with the dev server.
