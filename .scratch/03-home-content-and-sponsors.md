# 03-home-content-and-sponsors.md

Status: done

## 1. Cieľ (Goal)

Doplniť domovskú stránku o obsah, ktorý dnes chýba: fotky v slideri, informácie o aktuálnom ročníku so štatistikami, a dva rady sponzorov pohybujúce sa proti sebe. Obsah sa ukladá do databázy, aby ho bolo neskôr možné spravovať z jednoduchého admin rozhrania. Súčasťou je aj logo klubu na domovskej stránke.

## 2. Kontrakty & Architektúra (Contracts)

### Dátový model (Prisma)

- **`Photo`** (nový): `id`, `url` (string), `alt` (string), `order` (int, default 0), `isActive` (boolean, default true). Domovská stránka načíta aktívne fotky a pri každom načítaní stránky ich zamieša. Náhodné poradie sa určuje na serveri, aby sa SSR a klient zhodovali.
- **`EditionStat`** (nový): `id`, `editionId` (FK -> Edition.id, onDelete: Cascade), `label` (string), `value` (string), `order` (int, default 0). Štatistiky sú voľný zoznam dvojíc.
- **`Sponsor`** (úprava): väzba na ročník (`editionId`) je zrušená. Sponzori sú globálny zoznam s poľami `id`, `name`, `logoUrl` (`String?`), `webUrl` (`String?`), `order` (int, default 0). Sponzor bez loga sa zobrazí ako overlay s menom.
- **`Edition.infoHtml`** (existujúce pole): text o ročníku. Editácia cez editor je samostatný modul (pozri sekciu 5, bod 8).
- Migrácia `home_content_and_global_sponsors` je aplikovaná.

### Server loader

- `src/routes/+page.server.ts` načíta aktuálny ročník (`isCurrent: true`) s trasami a štatistikami zoradenými podľa `order`.
- Zároveň načíta aktívne fotky (zamiešané na serveri; zatiaľ mockupy v `static/photos/`) a globálny zoznam sponzorov zoradený podľa `order`.
- `infoHtml` sa sanitizuje už na serveri, takže do stránky sa dostane len povolené HTML.
- Ak nie je aktuálny ročník, platí existujúce 404.

### Čisté funkcie a server

- `$lib/utils/front/shuffle.ts`: zamiešanie kópie poľa; generátor náhodných čísel je injektovateľný kvôli testom.
- `$lib/utils/front/sponsorRows.ts`: rozdelenie sponzorov do dvoch radov. Párne indexy idú do prvého radu, nepárne do druhého.
- `$lib/server/sanitizeInfoHtml.ts`: povolené sú odseky, nadpisy, zoznamy, odkazy (`http`, `https`, `mailto`) a formátovanie; skripty a obslužné atribúty sa odstránia.

### Komponenty (Svelte 5 runes, semantické tokeny)

- `Hero.svelte` (existuje): logo klubu, názov ročníka, dátum, odpočet a **jediné** registračné tlačidlo na stránke.
- `atoms/PauseButton.svelte`: tlačidlo pauza/play s popisom podľa stavu. Používa ho slider.
- `organism/PhotoSlider.svelte`: prepína fotky každých 6 sekúnd s prekrývaním. Navigácia šípkami a bodkami. Pohyb sa pozastaví pri hover, fokuse a dotyku a pokračuje po odchode alebo uvoľnení. Tlačidlo pauzy zastaví pohyb natrvalo, kým ho používateľ znova nespustí. Pri `prefers-reduced-motion` sa automatické prepínanie vypne.
- `organism/EditionInfo.svelte`: štatistiky (zoznam dvojíc) a sanitizované `infoHtml`. Registračné tlačidlo tu nie je.
- `organism/SponsorMarquee.svelte`: oba rady sa hýbu stále, bez tlačidla pauzy. Prvý rad ide doľava, druhý doprava (CSS keyframes v `theme.css`). Logo sa zobrazí z `logoUrl`; ak chýba, zobrazí sa overlay s menom. Ak má sponzor `webUrl`, klik otvorí odkaz v novom okne. Duplikát obsahu, ktorý drží slučku plynulou, je `inert` a `aria-hidden`.
- Logo klubu: konštanta `LOGO_URL = '/logo2.png'` v `$lib/constants.ts`, súbor je v `static/`.

## 3. Checklist implementácie (Kroky pre agenta)

- [x] 1. Logo klubu na domovskej stránke: konštanta `LOGO_URL`, obrázok v `Hero.svelte` s alt textom a testom.
- [x] 2. Prisma: modely `Photo` a `EditionStat`, `Sponsor` bez `editionId`; migrácia a seed (štatistiky k aktuálnemu ročníku, dvaja sponzori bez loga, tri mockup fotky).
- [x] 3. `+page.server.ts`: aktuálny ročník, aktívne fotky (zamiešané), štatistiky, globálni sponzori a sanitizované `infoHtml`.
- [x] 4. Čisté funkcie `shuffle` a `splitIntoRows`, sanitizér `sanitizeInfoHtml`. Testy vo vitest (server projekt).
- [x] 5. `PhotoSlider.svelte`: prepínanie každých 6 s, pauza pri hover / fokuse / dotyku, tlačidlo pauzy, navigácia, vypnutie pri `prefers-reduced-motion`. Browser test.
- [x] 6. `EditionInfo.svelte`: štatistiky a sanitizované `infoHtml`, bez registračného tlačidla. Browser test.
- [x] 7. `SponsorMarquee.svelte`: dva rady opačným smerom bez pauzy, overlay pre sponzora bez loga, odkaz na `webUrl`. Browser test.
- [x] 8. `+page.svelte` skladá Hero, slider (len ak sú fotky), info a sponzorov (len ak sú sponzori). Overené cez dev server.
- [x] 9. `bun run check`, `bun run test` (26 testov), `bun run lint` a Prettier bez chýb.

## 4. Čo nerobiť (Non-Goals & Constraints)

- Neriešiť admin rozhranie ani jeho prihlasovanie v tomto module. Rozhodnutie o prístupe je v sekcii 5, bod 6.
- Neriešiť editor Tiptap. Je to samostatný modul (pozri sekciu 5, bod 8).
- Neriešiť nahrávanie súborov cez aplikáciu. Logá sú v `static/`, fotky a odkazy sú textové URL.
- Neinštalovať ťažké CSS ani animačné knižnice. Animácie sú CSS keyframes a JS len tam, kde treba.
- Nevytvárať inline štýly ani priame farby; používať len sémantické tokeny.
- Neriešiť archív ročníkov (`/rocnik/[year]`), mapy ani tabuľky výsledkov.

## 5. Rozhodnuté

1. **Duplicitný obsah**: `Hero` je hlavná sekcia s odpočtom a jediným registračným tlačidlom. `EditionInfo` obsahuje len štatistiky a info text.
2. **Pohyb a dotyk**: slider sa pozastaví pri hover, fokuse a dotyku a má viditeľné tlačidlo pauzy (WCAG 2.2.2). Sponzori sa hýbu stále, bez pauzy.
3. **Sponzori nie sú viazaní na ročník**: globálny zoznam, každý rok sa nezadáva znova. Bez úrovní (hlavný / partner).
4. **Fotky**: pomer 16:9, prepínanie každých 6 sekúnd, `alt` text povinný. Ak nie sú aktívne fotky, slider sa skryje. Súhlas so zverejnením fotografií bežcov zabezpečuje klub mimo kódu.
5. **Význam „1.1“**: zadanie „slider show 1.1“ znamená fotografický slider na domovskej stránke.
6. **Admin (samostatný modul)**: prístup cez jednoduchý tajný token z premennej prostredia `ADMIN_TOKEN` v `.env`, nie z repozitára. Prehliadač nevie pri navigácii poslať vlastnú hlavičku, preto admin stránka vyžiada token raz a uloží ho do `httpOnly` cookie. Logiku overovania implementuje agent a výsledok sa oznámi po dokončení.
7. **Logo**: hlavné logo je `static/logo2.png` (sivý kruh z pôvodnej URL). Zobrazuje sa v `Hero`. Súbor `static/logo1.png` (modrý nápis „BEH ZUBROHLAVSKÝM CHOTÁROM, Memoriál Peťa Stoklasu“) je zatiaľ nepoužitý, pozri otvorenú otázku 1.
8. **Tiptap**: v tomto module sa nerieši. Dovtedy sa `infoHtml` upravuje priamo v seede alebo v databáze. Tiptap je editor s formátovacími tlačidlami, do ktorého admin píše text bez znalosti HTML. Zavedie sa v samostatnom module.
9. **Sanitizácia `infoHtml`**: knižnica `sanitize-html` (plus typy `@types/sanitize-html`) beží len na serveri. Predvolená voľba z otvorenej otázky je potvrdená implementáciou.
10. **Seed**: štatistiky aktuálneho ročníka sa pri každom spustení nahradia (seed ich vlastní). Sponzori a fotky sa seedujú len vtedy, keď je tabuľka prázdna, aby sa neprepísali zmeny z admin rozhrania.
11. **Fotky zatiaľ mockupy**: tri SVG súbory v `static/photos/` s popisom „Ukážková fotka“. Reálne fotky klub doplní cez seed alebo neskôr cez admin.

## 6. Otvorené otázky (plánovanie uzavreté; body sa riešia v ďalších krokoch)

1. **Memoriálne logo (`logo1.png`)**: kde ho použiť? _Predvolene: nepoužité. Navrhujem ho dať pod hlavné logo v `Hero` alebo do päty stránky._
2. **Reálne fotky**: zatiaľ sú mockupy. _Predvolene: nahradiť ich reálnymi fotkami, keď ich klub pošle (URL alebo súbory do `static/photos/`)._
3. **Logá sponzorov**: seed má dvoch sponzorov bez loga, zobrazia sa ako overlay s menom. _Predvolene: dokým nebudú logá, ostáva overlay._
4. **Poradie sekcií a kotvy v menu**: navigácia odkazuje na `#propozicie`, `#trasy`, `#vysledky`, `#kontakt`, ktoré ešte neexistujú. _Predvolene poradie: Hero, slider, info a štatistiky, sponzori; odkazy v menu zostávajú, kým sekcie nevzniknú._
5. **Štatistiky pred pretekmi**: _predvolene sa zobrazujú vždy, ak existujú; pri prázdnom zozname sa sekcia skryje._
6. **Tmavšia verzia loga**: `logo2.png` je svetlosivé na svetlom pozadí a môže byť slabo čitateľné. _Predvolene sa ponecháva._
