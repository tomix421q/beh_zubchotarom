# 03-home-content-and-sponsors.md

Status: ready-for-agent

## 1. Cieľ (Goal)

Doplniť domovskú stránku o obsah, ktorý dnes chýba: fotky v slideri, informácie o aktuálnom ročníku so štatistikami a registračným tlačidlom, a dva rady sponzorov pohybujúce sa proti sebe. Všetok obsah sa ukladá do databázy tak, aby ho bolo neskôr možné spravovať z admin panelu a upravovať cez Tiptap. Súčasťou je aj logo klubu na domovskej stránke.

## 2. Kontrakty & Architektúra (Contracts)

### Dátový model (Prisma)

- **`Photo`** (nový): `id`, `url` (string), `alt` (string), `order` (int, default 0), `isActive` (boolean, default true). Domovská stránka načíta aktívne fotky a pri každom načítaní stránky ich zamieša (náhodné poradie na serveri, aby sa SSR a klient zhodovali).
- **`EditionStat`** (nový): `id`, `editionId` (FK -> Edition.id, onDelete: Cascade), `label` (string), `value` (string), `order` (int, default 0). Štatistiky sú voľný zoznam dvojíc, aby admin mohol pridávať ľubovoľné položky (počet bežcov, počet dobehnutých, ...).
- **`Sponsor`** (úprava): `logoUrl` sa mení na voliteľné (`String?`). Sponzor bez loga sa zobrazí ako overlay s menom.
- **`Edition.infoHtml`** (existujúce pole): text o ročníku. Do Tiptapu sa upraví neskôr; do tej doby sa seeduje ako jednoduché HTML.
- Schéma sa mení cez migráciu; seed doplní ukážkové štatistiky k aktuálnemu ročníku.

### Server loader

- `src/routes/+page.server.ts` okrem ročníka (`isCurrent: true`, s trasami a sponzormi) načíta aktívne fotky (zamiešané), štatistiky ročníka zoradené podľa `order`.
- Sponzori sa rozdelia do dvoch radov podľa poradia (`order`): párne indexy do prvého radu, nepárne do druhého. Rozdelenie je čistá funkcia v `$lib/utils/front/`.
- Ak nie je aktuálny ročník, platí existujúce 404.

### Komponenty (Svelte 5 runes, semantické tokeny)

- `$lib/components/organism/PhotoSlider.svelte`: prepína fotky automaticky, pauza pri hover a pri fokuse, navigácia šípkami a bodkami. Bez externej knižnice. Pri `prefers-reduced-motion` sa automatické prepínanie vypne.
- `$lib/components/organism/EditionInfo.svelte`: názov ročníka, dátum, štatistiky (zoznam dvojíc), `infoHtml` vykreslený cez sanitizáciu, registračné tlačidlo.
- `$lib/components/organism/SponsorMarquee.svelte`: jeden rad sponzorov, ktorý sa pohybuje v zadanom smere (`left` / `right`). Prvý rad ide doľava, druhý doprava. Pri hover sa pohyb zastaví. Logo sa zobrazí z `logoUrl`; ak chýba, zobrazí sa overlay s menom sponzora. Obsah sa duplikuje, aby sa animácia plynule opakovala.
- `$lib/components/atoms/Button.svelte`: existujúci atóm, použije sa pre registračné tlačidlo.
- Logo klubu: konštanta `LOGO_URL` v `$lib/constants.ts`, zobrazuje sa v `Hero.svelte` nad názvom ročníka.

### Obsah HTML

- `infoHtml` sa pred vykreslením musí sanitizovať (povolené sú len bezpečné značky a atribúty). Text prichádza z databázy a neskôr z Tiptapu, takže sa nesmie vykresliť nefiltrovaný.

## 3. Checklist implementácie (Kroky pre agenta)

- [x] 1. Logo klubu na domovskej stránke: konštanta `LOGO_URL` (URL z WordPressu), obrázok v `Hero.svelte` s alt textom a testom.
- [ ] 2. Prisma: modely `Photo` a `EditionStat`, `Sponsor.logoUrl` voliteľné; migrácia a seed (štatistiky k aktuálnemu ročníku, sponzori s aj bez loga).
- [ ] 3. `+page.server.ts`: načítať aktívne fotky (zamiešané), štatistiky a sponzorov; vrátiť ich spolu s ročníkom.
- [ ] 4. Čisté funkcie v `$lib/utils/front/`: zamiešanie poľa s injektovateľným generátorom náhodných čísel a rozdelenie sponzorov do dvoch radov. Testy vo vitest (server projekt).
- [ ] 5. `PhotoSlider.svelte`: automatické prepínanie, pauza, navigácia, vypnutie animácie pri `prefers-reduced-motion`. Browser test.
- [ ] 6. `EditionInfo.svelte`: sanitizované `infoHtml`, zoznam štatistík, registračné tlačidlo (len ak je `registrationUrl` a ročník ešte neprebehol).
- [ ] 7. `SponsorMarquee.svelte`: dva rady opačným smerom, overlay s menom pre sponzora bez loga, pauza pri hover. Browser test.
- [ ] 8. Zložiť `+page.svelte` (slider, info, sponzori), overiť dáta zo servera cez dev server.
- [ ] 9. Spustiť `bun run check`, `bun run test`, `bun run lint` a overiť nulové chyby.

## 4. Čo nerobiť (Non-Goals & Constraints)

- Neriešiť admin panel (`/admin`) ani Tiptap editor. Obsah sa v tejto fáze upravuje priamo v databáze a seede. Admin a Tiptap sú samostatné moduly.
- Neriešiť nahrávanie súborov na disk. Fotky, logá a odkazy sú textové URL (konvencia z fázy 01).
- Neinštalovať ťažké CSS ani animačné knižnice. Animácie robiť CSS keyframes.
- Nevytvárať inline štýly ani priame farby; používať len sémantické tokeny.
- Neriešiť archív ročníkov (`/rocnik/[year]`), mapy ani tabuľky výsledkov.

## 5. Otvorené otázky (predvolená voľba je zvolená, potvrďte alebo zmeňte)

1. **Registrácia na ďalší ročník**: predvolene používa `registrationUrl` ročníka, ktorý sa zobrazuje ako aktuálny, a tlačidlo sa ukáže, kým je termín v budúcnosti. Ak má ísť o ročník nasledujúci po aktuálnom, treba to rozhodnúť.
2. **Fotky**: zdroj fotiek zatiaľ nie je známy. Predvolene sa zobrazí slider len vtedy, keď existuje aspoň jedna aktívna fotka, takže sa pridajú cez seed alebo neskôr cez admin. Ak mám URL fotiek vložiť do seedu, dajte mi ich.
3. **Sponzori** patria k ročníku, ako to už určuje schéma. Ak majú byť globálni, treba upraviť model.
4. **Logo cez hotlink**: obrázok sa načíta priamo z WordPressu. Ak sa tam zmení cesta, logo zmizne. Alternatíva je stiahnuť ho do `static/`, čo však porušuje konvenciu z fázy 01.
