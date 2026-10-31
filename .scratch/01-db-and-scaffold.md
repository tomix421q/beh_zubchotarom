# 01-db-and-scaffold.md

## 1. Cieľ (Goal)

Nastaviť dátovú vrstvu pre Beh Zubrohlava pomocou SQLite a Prisma ORM. Pripraviť dátové modely pre ročníky (`Edition`), bežecké trasy (`Route`) a partnerov (`Sponsor`), vygenerovať Prisma klienta a inicializovať databázu pomocou seed skriptu s ukážkovými dátami.

## 2. Kontrakty & Architektúra (Contracts)

- **Konfigurácia:** `prisma/schema.prisma` s SQLite providerom (`file:./dev.db`).
- **Singleton klienta:** `$lib/server/db.ts` exportujúci inštanciu `prisma` ošetrenú proti duplicitným spojeniam v DEV režime (HMR).
- **Počiatočný seed:** `prisma/seed.ts` spúšťaný cez `bun prisma/seed.ts`.
- **Dátové entity:**
  - `Edition`: `id`, `year` (unique int), `editionNumber` (int), `eventDate` (DateTime), `isCurrent` (boolean, default false), `registrationUrl` (string?), `resultsUrl` (string?), `galleryUrl` (string?), `propositionsHtml` (string?), `infoHtml` (string?).
  - `Route`: `id`, `editionId` (FK -> Edition.id, onDelete: Cascade), `name` (string), `distanceKm` (float), `elevationM` (int?), `gpxUrl` (string?), `mapEmbedUrl` (string?).
  - `Sponsor`: `id`, `editionId` (FK -> Edition.id, onDelete: Cascade), `name` (string), `logoUrl` (string), `webUrl` (string?), `order` (int default 0).

## 3. Checklist implementácie (Kroky pre agenta)

- [x] 1. Vytvoriť/upraviť `prisma/schema.prisma` s modelmi `Edition`, `Route` a `Sponsor` vrátane indexov a kaskádového mazania.
- [x] 2. Vytvoriť `$lib/server/db.ts` s bezpečným globálnym singletonom pre PrismaClient.
- [x] 3. Vytvoriť `prisma/seed.ts`, ktorý naplní databázu aktuálnym ročníkom (2026, `isCurrent: true`, trasy 5 km a 10 km) a jedným archivovaným ročníkom (2025).
- [x] 4. Pridať `"prisma": { "seed": "bun prisma/seed.ts" }` do `package.json`. _(Odchýlka: Prisma 7 ignoruje tento kľúč, seed je v `prisma.config.ts` pod `migrations.seed`.)_
- [x] 5. Spustiť migráciu cez `bunx prisma migrate dev --name init_editions` a aplikovať seed.
- [x] 6. Spustiť `bun run check` na overenie, že Prisma typy sú korektne vygenerované a importovateľné.

## 4. Čo nerobiť (Non-Goals & Constraints)

- Nevytvárať zatiaľ žiadne frontendové Svelte súbory, layouty ani stránky (rieši sa v ďalšej fáze).
- Neriešiť autentifikáciu (BetterAuth) ani admin rozhranie.
- Neinštalovať Tiptap ani knižnice na spracovanie obrázkov.
- Neriešiť ukladanie fyzických súborov na disk; všetky linky a obrázky reprezentovať ako textové URL.
