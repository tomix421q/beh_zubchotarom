# 02-public-layout-and-hero.md

## 1. Cieľ (Goal)

Vytvoriť verejný frontendový layout (mobile-first), serverový loader pre načítanie aktuálneho ročníka (`isCurrent: true`) z Prisma SQLite databázy a Hero sekciu s ročníkom, dátumom pretekov, odpočtom a registračným CTA tlačidlom.

## 2. Kontrakty & Architektúra (Contracts)

- **Server Loader:** `src/routes/+page.server.ts` načíta aktuálny ročník cez `prisma.edition.findFirst({ where: { isCurrent: true }, include: { routes: true, sponsors: true } })`. Pri absencii vyhodí prehľadnú 404 chybu cez SvelteKit `error()`.
- **Layout:** `src/routes/+layout.svelte` zabezpečí mobilnú štruktúru, základný kontajner, Tailwind tému a responzívnu navigáciu (`Navbar.svelte`).
- **Komponenty (Svelte 5 runes):**
  - `$lib/components/molecules/Navbar.svelte`: mobilné menu (hamburger), logo, odkazy na sekcie (`#propozicie`, `#trasy`, `#vysledky`, `#kontakt`).
  - `$lib/components/organism/Hero.svelte`: ročník, dátum, dynamické CTA tlačidlo (registrácia / výsledky podľa dátumu ročníka), jemný podklad.
  - `$lib/components/atoms/Button.svelte` (alebo tlačidlo zo shadcn-svelte): jednotné tlačidlo rešpektujúce tokeny.
- **Dizajnové tokeny:** Používať výhradne sémantický Tailwind (`bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `border-border`). Žiadne priame náhodné farby.

## 3. Checklist implementácie (Kroky pre agenta)

- [x] 1. Vytvoriť `src/routes/+layout.svelte` s globálnym štýlovaním, sémantickými triedami a základným layout obalom.
- [x] 2. Vytvoriť `src/routes/+page.server.ts`, ktorý načíta aktuálny ročník vrátane trás a sponzorov zo seedu z Fázy 1.
- [x] 3. Vytvoriť `$lib/components/organism/Navbar.svelte` s podporou mobilného zobrazenia (otváranie/zatváranie cez Svelte 5 `$state`). _(Odchýlka: presunuté z `molecules/` do `organism/` podľa AGENTS.md §2.)_
- [x] 4. Vytvoriť `$lib/components/organism/Hero.svelte` prijímajúci prop `edition` cez `$props()`, s formátovaným dátumom a odkazom na registráciu.
- [x] 5. Zložiť `src/routes/+page.svelte`, zobraziť Hero sekciu a overiť správne pretekanie dát zo servera.
- [x] 6. Spustiť `bun run check` a `bun run test` – overiť nulové typové a syntaktické chyby.

## 4. Čo nerobiť (Non-Goals & Constraints)

- Neriešiť zatiaľ Tiptap editor ani administrátorské rozhranie (`/admin`).
- Neriešiť archív starých ročníkov (`/rocnik/[year]`) – to bude samostatná fáza.
- Neriešiť interaktívne mapy (Leaflet, Mapy.cz embed) ani zložité tabuľky výsledkov.
- Nevytvárať inline štýly ani neinštalovať žiadne ťažké externé CSS knižnice.
