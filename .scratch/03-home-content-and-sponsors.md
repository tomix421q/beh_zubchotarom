# 03-home-content-and-sponsors.md

Status: ready-for-agent

## 1. Cieľ (Goal)

Doplniť domovskú stránku o obsah, ktorý dnes chýba: fotky v slideri, informácie o aktuálnom ročníku so štatistikami, a dva rady sponzorov pohybujúce sa proti sebe. Obsah sa ukladá do databázy, aby ho bolo neskôr možné spravovať z jednoduchého admin rozhrania. Súčasťou je aj logo klubu na domovskej stránke.

## 2. Kontrakty & Architektúra (Contracts)

### Dátový model (Prisma)

- **`Photo`** (nový): `id`, `url` (string), `alt` (string), `order` (int, default 0), `isActive` (boolean, default true). Domovská stránka načíta aktívne fotky a pri každom načítaní stránky ich zamieša. Náhodné poradie sa určuje na serveri, aby sa SSR a klient zhodovali.
- **`EditionStat`** (nový): `id`, `editionId` (FK -> Edition.id, onDelete: Cascade), `label` (string), `value` (string), `order` (int, default 0). Štatistiky sú voľný zoznam dvojíc (napr. počet bežcov, počet dobehnutých).
- **`Sponsor`** (úprava): zruší sa väzba na ročník (`editionId` a jej FK). Sponzori sú globálny zoznam s poľami `id`, `name`, `logoUrl` (`String?`), `webUrl` (`String?`), `order` (int, default 0). Sponzor bez loga sa zobrazí ako overlay s menom. Migrácia zruší stĺpec `editionId`; seed zatiaľ nemá sponzorov, takže sa nič nestratí.
- **`Edition.infoHtml`** (existujúce pole): text o ročníku, zatiaľ ako jednoduché HTML zo seedu. Editácia cez editor je samostatný modul (pozri sekciu 5, bod 7).
- Schéma sa mení cez migráciu; seed doplní štatistiky k aktuálnemu ročníku a dvoch sponzorov, z toho jedného bez loga.

### Server loader

- `src/routes/+page.server.ts` načíta aktuálny ročník (`isCurrent: true`) s trasami. Sponzorov už nenačítava cez ročník, ale ako globálny zoznam zoradený podľa `order`. Ďalej načíta aktívne fotky (zamiešané) a štatistiky ročníka zoradené podľa `order`.
- Sponzori sa rozdelia do dvoch radov podľa poradia: párne indexy do prvého radu, nepárne do druhého. Rozdelenie je čistá funkcia v `$lib/utils/front/`.
- Ak nie je aktuálny ročník, platí existujúce 404.

### Komponenty (Svelte 5 runes, semantické tokeny)

- `$lib/components/organism/Hero.svelte` (existuje): logo klubu, názov ročníka, dátum, odpočet a **jediné** registračné tlačidlo na stránke.
- `$lib/components/organism/PhotoSlider.svelte`: prepína fotky každých 6 sekúnd. Pohyb sa zastaví pri hover, fokuse a dotyku a pokračuje, keď sa kurzor alebo prst uvoľní. Navigácia šípkami a bodkami. Pri `prefers-reduced-motion` sa automatické prepínanie vypne. Bez externej knižnice.
- `$lib/components/organism/EditionInfo.svelte`: štatistiky (zoznam dvojíc) a `infoHtml` vykreslený cez sanitizáciu. Registračné tlačidlo tu nie je.
- `$lib/components/organism/SponsorMarquee.svelte`: jeden rad sponzorov, pohyb v zadanom smere (`left` / `right`). Prvý rad ide doľava, druhý doprava. Pohyb sa zastaví pri hover, fokuse a dotyku. Logo sa zobrazí z `logoUrl`; ak chýba, zobrazí sa overlay s menom. Ak má sponzor `webUrl`, klik otvorí odkaz v novom okne. Obsah sa duplikuje, aby animácia plynule pokračovala; duplikát má `aria-hidden`.
- `$lib/components/atoms/Button.svelte` (existuje): používa ho `Hero` pre registračné tlačidlo.
- Logo klubu: konštanta `LOGO_URL` v `$lib/constants.ts` (existuje).

### Obsah HTML

- `infoHtml` sa pred vykreslením musí sanitizovať. Povolené sú len bezpečné značky a atribúty. Text prichádza z databázy a neskôr z editora, takže sa nesmie vykresliť nefiltrovaný. Výber sanitizačného riešenia je v sekcii 6, bod 4.

## 3. Checklist implementácie (Kroky pre agenta)

- [x] 1. Logo klubu na domovskej stránke: konštanta `LOGO_URL`, obrázok v `Hero.svelte` s alt textom a testom.
- [ ] 2. Prisma: modely `Photo` a `EditionStat`, `Sponsor` bez `editionId` s voliteľným `logoUrl` a `webUrl`; migrácia a seed (štatistiky k aktuálnemu ročníku, dvaja sponzori, z toho jeden bez loga; bez fotiek, kým nebudú URL).
- [ ] 3. `+page.server.ts`: aktuálny ročník s trasami, aktívne fotky (zamiešané), štatistiky a globálni sponzori.
- [ ] 4. Čisté funkcie v `$lib/utils/front/`: zamiešanie poľa s injektovateľným generátorom náhodných čísel a rozdelenie sponzorov do dvoch radov. Testy vo vitest (server projekt).
- [ ] 5. `PhotoSlider.svelte`: prepínanie každých 6 s, pauza pri hover / fokuse / dotyku, navigácia, vypnutie pri `prefers-reduced-motion`. Browser test.
- [ ] 6. `EditionInfo.svelte`: štatistiky a sanitizované `infoHtml`, bez registračného tlačidla. Test sanitizácie.
- [ ] 7. `SponsorMarquee.svelte`: dva rady opačným smerom, pauza pri hover / fokuse / dotyku, overlay pre sponzora bez loga, odkaz na `webUrl`. Browser test.
- [ ] 8. Zložiť `+page.svelte` (Hero, slider, info, sponzori), overiť dáta zo servera cez dev server.
- [ ] 9. Spustiť `bun run check`, `bun run test`, `bun run lint` a overiť nulové chyby.

## 4. Čo nerobiť (Non-Goals & Constraints)

- Neriešiť admin rozhranie ani jeho prihlasovanie v tomto module. Rozhodnutie o prístupe je v sekcii 5, bod 6.
- Neriešiť editor Tiptap. Je to samostatný modul (pozri sekciu 5, bod 7).
- Neriešiť nahrávanie súborov na disk. Fotky, logá a odkazy sú textové URL (konvencia z fázy 01).
- Neinštalovať ťažké CSS ani animačné knižnice. Animácie robiť CSS keyframes.
- Nevytvárať inline štýly ani priame farby; používať len sémantické tokeny.
- Neriešiť archív ročníkov (`/rocnik/[year]`), mapy ani tabuľky výsledkov.

## 5. Rozhodnuté

1. **Duplicitný obsah**: `Hero` je hlavná sekcia s odpočtom a jediným registračným tlačidlom. `EditionInfo` obsahuje len štatistiky a info text.
2. **Pohyb a prístupnosť**: slider a sponzori sa zastavia pri hover, fokuse a dotyku. Viditeľné tlačidlo pauzy sa nepridáva. _Poznámka:_ WCAG 2.2.2 vyžaduje, aby bola pauza ovládateľná používateľom. Automatické pokračovanie po uvoľnení prsta nemusí túto požiadavku spĺňať. Pri ďalšom prístupnostnom audite to treba prehodnotiť.
3. **Sponzori nie sú viazaní na ročník**: globálny zoznam, každý rok sa nezadáva znova. Bez úrovní (hlavný / partner).
4. **Fotky**: pomer 16:9, prepínanie každých 6 sekúnd, `alt` text povinný. Ak nie sú aktívne fotky, slider sa skryje. Súhlas so zverejnením fotografií bežcov zabezpečuje klub mimo kódu.
5. **Význam „1.1“**: zadanie „slider show 1.1“ znamená fotografický slider na domovskej stránke.
6. **Admin (samostatný modul, rozhodnutie teraz)**: prístup nebude cez používateľské účty, ale cez jednoduchý tajný token.
   - Token sa načíta z premennej prostredia (napr. `ADMIN_TOKEN`), nie z repozitára.
   - Prehliadač pri navigácii nevie poslať vlastnú HTTP hlavičku. Admin stránka preto vyžiada token raz a uloží ho do `httpOnly` cookie.
   - Krátky token ako `admin1224` odporúčam nahradiť dlhšou náhodnou hodnotou, lebo je to jediná ochrana.
7. **Tiptap**: v tomto module sa nerieši. Dovtedy sa `infoHtml` upravuje priamo v seede alebo v databáze. Tiptap je editor s formátovacími tlačidlami, do ktorého admin píše text bez znalosti HTML. Zavedie sa v samostatnom module.

## 6. Otvorené otázky (predvolená voľba je zvolená, potvrďte alebo zmeňte)

1. **Logo cez hotlink**: obrázok sa načíta priamo z WordPressu. Ak sa tam zmení cesta, logo zmizne. Alternatíva je stiahnuť ho do `static/`, čo porušuje konvenciu z fázy 01. _Predvolene: hotlink._
2. **Poradie sekcií a kotvy v menu**: navigácia odkazuje na `#propozicie`, `#trasy`, `#vysledky`, `#kontakt`, ktoré ešte neexistujú. _Predvolene poradie: Hero, slider, info a štatistiky, sponzori; odkazy v menu zostávajú, kým sekcie nevzniknú._
3. **Štatistiky pred pretekmi**: _predvolene sa zobrazujú vždy, ak existujú; pri prázdnom zozname sa sekcia skryje._
4. **Sanitizácia `infoHtml`**: odporúčam malú knižnicu `sanitize-html` (bez prehliadača, vhodná na server). Ak nechcete novú závislosť, napíšem vlastný allowlist, ale ten je bezpečnostne citlivejší. _Predvolene: `sanitize-html`, potvrďte._
5. **Logo a navigácia**: logo je svetlosivé na svetlom pozadí, takže môže byť slabo čitateľné. Potrebujete tmavšiu verziu? _Predvolene sa logo zobrazuje len v `Hero`, navigácia ostáva s favikonou._
