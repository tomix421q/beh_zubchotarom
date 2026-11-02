# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@1.2.0 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:typography" enhanced-img sveltekit-adapter="adapter:bun" --install bun ./
```

## Adding features

Add features to your project with `sv add`:

```sh
npx sv add
```

For example, to add Tailwind CSS:

```sh
npx sv add tailwindcss
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Environment variables

Copy `.env.example` to `.env` for local development. In production (Coolify) set the same variables in the app's environment.

| Variable               | Purpose                                                                         | Default         |
| ---------------------- | ------------------------------------------------------------------------------- | --------------- |
| `ADMIN_PASSWORD`       | Password for `/admin`; without it every login is refused                        | none            |
| `ADMIN_SESSION_SECRET` | Signs the admin session cookie, e.g. `openssl rand -hex 32`                     | none            |
| `DATABASE_URL`         | SQLite database file                                                            | `file:./dev.db` |
| `UPLOADS_DIR`          | Folder for uploaded images                                                      | `./uploads`     |
| `BODY_SIZE_LIMIT`      | Largest request body the production server accepts; set `6M` so 5 MB photos fit | `512K`          |

In production, point `DATABASE_URL` and `UPLOADS_DIR` at a persistent volume (on Coolify `file:/data/app.db` and `/data/uploads`). Otherwise the database and uploads are lost on every redeploy. `DATABASE_URL` must also be set where `prisma migrate` runs.
