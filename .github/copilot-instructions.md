# Projektové štandardy a inštrukcie pre Agenta

## 1. UI komponenty a dizajn systém

- **Zákaz duplicity UI:** Nikdy nevytváraj inline tabuľky, modaly, karty ani selektory, ak už v projekte existuje riešenie.
- **Dostupné zdieľané komponenty:**
  - Vstupy, comboboxy, tlačidlá a modaly VŽDY primárne hľadaj a používaj z `$lib/components/atoms/`.
  - Ak komponent neexistuje a ide o často opakovaný prvok, NEVYTVÁRAJ ho autonómne – najprv navrhni jeho univerzálne rozhranie v chate.
- **Dizajnové pravidlá a Tailwind:**
  - NIKDY nepoužívaj priame hex ani náhodné farby (napr. `bg-blue-500`, `text-gray-400`, `border-zinc-700`).
  - VŽDY používaj sémantické CSS tokeny: `bg-card`, `bg-background`, `text-primary`, `text-muted-foreground`, `border-border`.
  - Opakujúce sa Tailwind zoskupenia ukladaj do projektových tried (napr. `.cardNormalize`, `.headingNormalize`, `.inputNormalize`).
  - **Dizajnový jazyk (tmavý, glass):** web je tmavý. Pozadie je `static/bg.jpg` s tmavým prekrytím `bg-background/75`, text je svetlý (`text-foreground`).
  - Každá sekcia a karta nad pozadím je glass karta: trieda `.glassCard` z `src/lib/styles/theme.css`. Novú kartu nerob vlastným `bg-*`.
  - Farby sa menia len v tokenoch v `src/lib/styles/theme.css`. Nová farba znamená nový token, nie priamu hodnotu v komponente.
  - Dlhý formátovaný text (`infoHtml`, propozície) je v `prose prose-invert`, inak je na tmavom pozadí nečitateľný.
  - Hlavná akcia je `Button` variant `primary`, sekundárna variant `ghost`.
- **Tvorba nových komponentov:**
  - Komponenty organizuj podľa veľkosti do `$lib/components/[atoms,molecules,organism]`.
  - Zváž použitie čistých `$props()` verzus kompozíciu cez Svelte 5 snippets (`Snippet`, `{@render children()}`).

## 2. Architektúra a layout projektu

- `$lib/components/atoms/` – základné znovupoužiteľné stavebné kamene prenositeľné aj do iných projektov (tlačidlá, inputy, ikony).
- `$lib/components/molecules/` – zložené celky (filtre, riadky tabuliek, karty položiek).
- `$lib/components/organism/` – komplexné sekcie webu (Hero slider, NavBar, Footer, Admin formuláre).
- `$lib/utils/` – univerzálne pomocné funkcie (`index.ts`, `dateUtils.ts`, `errorHandler.ts`).
- `$lib/utils/server/` – pomocná logika určená výhradne pre backend (`+page.server.ts` / API).
- `$lib/utils/front/` – rozsiahle pomocné výpočty a transformácie pre frontend.
- `$lib/styles/` – globálna konfigurácia štýlov, tokeny, Tailwind a shadcn štýly.

## 3. Technologický stack

- **Framework:** SvelteKit (Svelte 5 Runes).
- **Styling:** Tailwind CSS, shadcn-svelte (port pre Svelte / bits-ui).
- **Databáza & ORM:** SQLite s Prisma ORM (lokálny `dev.db`).›
- **Ikony:** Lucide Svelte (`@lucide/svelte`).
- **Rich Text:** Tiptap (`@tiptap/core`, `@tiptap/starter-kit`) pre formátovanie propozícií.

## 4. Kontext aplikácie: Beh Zubrohlava

- **Účel projektu:** Moderný, mobile-first web pre lokálne bežecké preteky nahradzujúci pôvodný WordPress (behzubrohlava.sk).
- **Správa obsahu (CMS):**
  - Web beží na dynamických ročníkoch (`Edition`). Hlavná stránka (`/`) zobrazuje aktuálny ročník (`isCurrent: true`), staršie ročníky sú dostupné v archíve (`/rocnik/[year]`).
  - Organizátor v jednoduchom admine upravuje: texty, dátum podujatia, stav registrácie (odkaz na registračný portál), odkaz na oficiálnu časomieru a link na Google Disk s fotkami.
  - Zobrazenie výsledkov: priamy odkaz na časomieru + prehľadná TOP 10 tabuľka pre jednotlivé kategórie aktuálneho roka.

## 5. Pravidlá pre Code Review a implementáciu

- **Svelte 5 Runes:** Dôsledné používanie `$state`, `$derived`, `$derived.by`, `$effect`, `$props`. Uprednostňuj `$derived` pred manuálnou synchronizáciou dát v `$effect`.
- **TypeScript:** Striktná typová bezpečnosť bez použitia `any`.
- **Komunikácia a kód:**
  - Odpovede v chate píš VÝHRADNE po slovensky! (stručne, vecne, k veci).
  - Kód, názvy premenných, komentáre a Git commity píš VÝHRADNE po anglicky.
  - Pri každej navrhovanej úprave stručne vysvetli jej dôvod a prínos.
