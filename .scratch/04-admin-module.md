# 04-admin-module.md

Status: ready-for-agent

## 1. Cieľ (Goal)

Pridať admin modul, cez ktorý klub sám upravuje obsah webu bez zásahu do kódu alebo databázy. Prístup je cez neviditeľné tlačidlo v ľavom hornom rohu, ktoré po zadaní hesla (z `.env`) otvorí samostatnú stránku `/admin`. Admin vie:

1. zapnúť/vypnúť registračné tlačidlo v Hero,
2. 1.1 napísať obsah samostatnej stránky `/registracia` v editore Tiptap,
3. zmeniť údaje v Hero: logo, ročník, hlavný nadpis (h1), dátum,
4. spravovať štatistiky ako zoznam `kľúč: hodnota`,
5. nahrávať fotky do slidera,
6. spravovať sponzorov: logo alebo len názov, a výber horného alebo dolného radu,
7. vytvárať, upravovať a mazať ročníky vrátane starých (prvý bol v roku 2015), aktuálny je vždy najnovší,
8. mať pre každý ročník verejnú stránku (archív) s jeho údajmi a odkazom na fotogalériu na Google Disku (`galleryUrl`).

## 2. Kontrakty & Architektúra (Contracts)

### Prístup a prihlásenie

- Heslo je v `.env` ako `ADMIN_PASSWORD` (nie v repozitári). Pre podpis cookie slúži `ADMIN_SESSION_SECRET`. Obe premenné sa pridajú do `.env.example`.
- `src/hooks.server.ts` (nový) číta cookie `admin_session` a nastavuje `event.locals.isAdmin`. `app.d.ts` dostane typ `Locals { isAdmin: boolean }`.
- Cookie: `httpOnly`, `sameSite: 'lax'`, `secure` v produkcii, platnosť 8 hodín, hodnota je podpísaná (HMAC) čas expirácie. Heslo sa porovnáva cez `crypto.timingSafeEqual`.
- Neúspešné pokusy sa obmedzia v pamäti (napr. 5 pokusov za 10 minút na IP), aby sa heslo nedalo hádať.
- **Každá** admin akcia a každý admin `load` znova kontroluje `locals.isAdmin`, nielen UI. Neprihlásený dostane 404 na `/admin/*`, nie presmerovanie, aby sa existencia admina neprezrádzala.
- Neviditeľné tlačidlo: `organism/AdminCorner.svelte` v `+layout.svelte`, `fixed`, samý ľavý horný roh okna nad Navbarom, veľmi malé, priehľadné, s `sr-only` popisom „Administrácia“. Klik otvorí `<dialog>` s poľom pre heslo (form action `/admin?/login`). Ak je používateľ už prihlásený, klik vedie rovno na `/admin`.
- Odhlásenie: tlačidlo na `/admin` (form action `?/logout`).

### Dátový model (Prisma)

- **`Edition`** (úprava): nové polia `registrationOpen Boolean @default(false)`, `registrationHtml String?`, `heroTitle String?` (h1; ak je `null`, použije sa `SITE_NAME + year` ako dnes). Existujúce `registrationUrl` ostáva v schéme, ale `/registracia` ho zatiaľ nepoužíva. Štatistiky (`EditionStat`), `infoHtml`, `registrationOpen` a `registrationHtml` sú **per ročník**.
- **`SiteSetting`** (nový, jeden riadok `id = 1`): `logoUrl String?`. Logo je pre celý web. Ak je `null`, použije sa `LOGO_URL` z `constants.ts`.
- **`Sponsor`** (úprava): nové pole `row String @default("top")` (`"top"` | `"bottom"`). Migrácia nastaví existujúcim sponzorom `row` podľa parity (párne `top`, nepárne `bottom`), aby sa vzhľad nezmenil. `splitIntoRows` sa nahradí filtrom podľa `row`. Sponzori ostávajú globálni.
- **`Photo`**: bez zmeny schémy. Fotky sú **globálne** (jeden slider na domovskej stránke), nie viazané na ročník. `Photo.url` bude po nahraní `/uploads/<meno>`.
- **`Edition.galleryUrl`** (existujúce pole): odkaz na fotogalériu ročníka na Google Disku. Fotky ročníkov sa v aplikácii nenahrávajú. Admin ho zadáva ako obyčajný odkaz; server prijme len `https://` URL.
- **`EditionStat`**: bez zmeny schémy.

### Ročníky

- Admin vie ročník **vytvoriť** (rok, poradové číslo, dátum), **upraviť** a **zmazať** (kaskádovo sa zmažú trasy a štatistiky). Rok je unikátny a najskôr `FIRST_EDITION_YEAR = 2015` (konštanta v `constants.ts`). Poradové číslo sa predvyplní ako `rok - 2014`, ale dá sa zmeniť (ak sa nejaký rok nebežalo).
- Aktuálny ročník (`isCurrent`) je vždy ten s najvyšším rokom; admin ho nevyberá ani nenastavuje starší. Po každej zmene ročníkov (vytvoriť, upraviť, zmazať) sa príznak prepočíta v jednej transakcii. Zmazanie najnovšieho ročníka posunie aktuálny na predchádzajúci.
- Prvý ročník na čistej databáze vytvorí admin; **produkčná databáza sa nesejduje**. Preto `+layout.server.ts` už pri chýbajúcom aktuálnom ročníku nevyhadzuje 404, ale vráti `edition: null`, inak by neboli dostupné ani `/admin` a neviditeľné tlačidlo. 404 pre domovskú stránku zostáva v `+page.server.ts`.
- Verejný archív je súčasťou modulu, pozri „Verejný archív ročníkov“.

### Verejný archív ročníkov

- `/rocniky`: zoznam všetkých ročníkov od najnovšieho (rok, poradové číslo, dátum, odkaz). Navbar dostane odkaz „Ročníky“.
- `/rocnik/[year]`: stránka ročníka zložená z existujúcich komponentov: `Hero` (ročník, h1, dátum; pri minulom ročníku bez odpočtu a s odkazom na výsledky podľa `resultsUrl`) a `EditionInfo` (štatistiky a `infoHtml`). Ak je vyplnené `galleryUrl`, zobrazí sa tlačidlo „Fotogaléria“ (otvorí Google Disk v novom okne, `rel="noopener noreferrer"`). Slider tu nie je. Neexistujúci rok vráti 404.
- Slider patrí len na domovskú stránku. Sponzori sú globálne a zobrazujú sa v pätičke na všetkých stránkach.
- Domovská stránka ostáva aktuálnym ročníkom so slidrom globálnych fotiek.
- Stránka ročníka je verejná hneď po vytvorení v admine.

### Nahrávanie súborov

- Súbory idú do adresára z `UPLOADS_DIR` (lokálne `./uploads`, v `.gitignore`; na Coolify `/data/uploads` na trvalom úložisku, pozri „Coolify a trvalé dáta“).
- `src/routes/uploads/[name]/+server.ts` ich servíruje. Meno musí zodpovedať `^[0-9a-f-]{36}\.(jpg|png|webp|avif)$` (ochrana pred path traversal), odpoveď má `Cache-Control: public, max-age=31536000, immutable` a `X-Content-Type-Options: nosniff`.
- `$lib/server/uploads.ts`: `saveImage(file)` overí veľkosť (max 5 MB), MIME a magic bytes, vygeneruje meno cez `crypto.randomUUID()` a vráti URL. `deleteUpload(url)` maže súbor len ak URL začína `/uploads/`.
- SVG sa nenahráva (riziko XSS). Povolené sú JPEG, PNG, WebP, AVIF.
- `adapter-node` má predvolený limit tela požiadavky 512 kB, preto sa v produkcii nastaví `BODY_SIZE_LIMIT` (napr. `6M`) a zdokumentuje sa v README.

### Coolify a trvalé dáta

Nasadenie ide cez Coolify z `Dockerfile`. Kontajner sa pri každom nasadení vytvorí nanovo, preto všetko, čo vzniká za behu, leží na trvalom úložisku (Persistent Storage v Coolify) pripojenom na `/data`:

- **Nahrané súbory**: `UPLOADS_DIR=/data/uploads`.
- **Databáza SQLite**: dnes je cesta natvrdo `file:./dev.db` v `src/lib/server/db.ts` aj v `prisma.config.ts`. Prepne sa na `DATABASE_URL` (lokálne `file:./dev.db`, na Coolify `file:/data/app.db`). Bez toho by sa pri každom nasadení stratili aj ročníky, štatistiky, sponzori a texty z adminu, nielen obrázky.
- `Dockerfile` je multi-stage s `adapter-node`, beží pod nie-root používateľom, ktorý má právo zapisovať do `/data`. Samostatný `docker-compose.yml` netreba, Coolify spravuje volume a premenné prostredia v UI. Do imidžu sa tajomstvá nedostanú (`.dockerignore` vynechá `.env`, `dev.db`, `uploads`).
- Premenné nastavené v Coolify: `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `DATABASE_URL`, `UPLOADS_DIR`, `BODY_SIZE_LIMIT`, `ORIGIN` (adapter-node ho potrebuje za reverzným proxy kvôli ochrane formulárov proti CSRF).
- Migrácie bežia pri štarte kontajnera (`prisma migrate deploy`). `prisma` je dnes devDependency, preto musí byť dostupné v runtime imidži.
- Seed sa v produkcii nespúšťa. Prvý ročník vytvorí admin cez `/admin`.
- Zálohovanie: stačí zálohovať trvalé úložisko `/data` (Coolify vie aj naplánované zálohy).

### Routy

| Routa | Účel |
| --- | --- |
| `/admin` | prehľad: zoznam ročníkov (vytvoriť, zmazať) a globálne sekcie: logo, fotky slidera, sponzori |
| `/admin/rocniky/[year]` | úprava ročníka: Hero (ročník, h1, dátum), prepínač registrácie, štatistiky, `infoHtml`, `galleryUrl` |
| `/admin/rocniky/[year]/registracia` | editor Tiptap pre `registrationHtml` tohto ročníka |
| `/rocniky`, `/rocnik/[year]` | verejný archív ročníkov (pozri vyššie) |
| `/registracia` | verejná informačná stránka aktuálneho ročníka: len sanitizovaný `registrationHtml` (propozície, štartovné, prezentácia, štart). Bez formulára a bez tlačidla. Dostupná aj pri vypnutom tlačidle v Hero |
| `/uploads/[name]` | servírovanie nahraných súborov |

Každá sekcia má vlastné form actions (`?/saveHero`, `?/addStat`, `?/uploadPhoto`, `?/saveSponsor`, ...). Formuláre používajú `use:enhance`, validácia je na serveri (typy, rozsahy, povinný `alt`).

### Registračné tlačidlo

- `getHeroCta` sa upraví: pred koncom dňa pretekov ide tlačidlo „Registrovať sa“ na `/registracia`, ale len ak `edition.registrationOpen`. Po dni pretekov ostáva „Výsledky“ podľa `resultsUrl`.
- Vstupom je `registrationOpen` namiesto `registrationUrl`.

### Tiptap

- `molecules/RichTextEditor.svelte`: obalí `@tiptap/core` s `@tiptap/starter-kit` (nadpisy, tučné, zoznamy, odkazy) a lištou tlačidiel. Nepoužíva sa neoficiálny Svelte wrapper; editor sa vytvára v `$effect`/`onMount` a ničí pri odchode. Výstup (HTML) ide cez skrytý `<input>` do form action.
- Jediný vlastný štýl je „upozornenie“ (červený text ako v pôvodnej stránke): vlastné inline označenie v Tiptape, ktoré sa uloží ako `<span class="notice">`. Sanitizér povolí `span` len s triedou `notice`, farba je sémantický token (napr. `text-destructive`) v `theme.css`. Žiadne voľné farby ani `style`.
- HTML sa sanitizuje cez `sanitizeInfoHtml` **pri ukladaní aj pri zobrazení**. Komponent je znovupoužiteľný pre `infoHtml` aj neskôr `propositionsHtml`.

## 3. Checklist implementácie (Kroky pre agenta)

- [x] 1. Prihlásenie: `hooks.server.ts`, `locals.isAdmin`, `ADMIN_PASSWORD` / `ADMIN_SESSION_SECRET`, limit pokusov, `AdminCorner.svelte` s dialógom, prázdna stránka `/admin` s odhlásením, 404 pre neprihlásených. `.env.example`.
- [x] 2. Ročníky: `+layout.server.ts` bez 404 pri chýbajúcom ročníku (`edition: null`, Navbar a Hero to zvládnu), zoznam ročníkov v `/admin`, vytvoriť / upraviť / zmazať, `FIRST_EDITION_YEAR`, `isCurrent` vždy na najnovšom ročníku (prepočet v transakcii).
- [x] 3. Registrácia: migrácia `registrationOpen`, `registrationHtml`, úprava `getHeroCta`, verejná stránka `/registracia`, prepínač v `/admin/rocniky/[year]`.
- [x] 4. Tiptap: `RichTextEditor.svelte` (nadpisy, tučné, zoznamy, odkaz, štýl „upozornenie“), `/admin/rocniky/[year]/registracia`, rozšírenie sanitizéra o `span.notice`, ukladanie so sanitizáciou, rovnaký editor pre `infoHtml`.
- [x] 5. Štatistiky ročníka: pridať, upraviť, zmazať, zmeniť poradie (`order`); prázdny zoznam skryje sekciu (existujúce správanie).
- [x] 6. Nahrávanie a trvalé dáta: `DATABASE_URL` namiesto natvrdo `file:./dev.db` (`db.ts`, `prisma.config.ts`), `uploads.ts`, route `/uploads/[name]`, `UPLOADS_DIR`, `BODY_SIZE_LIMIT`, `.gitignore`.
- [x] 7. Hero: migrácia `SiteSetting` a `heroTitle`, formulár (logo, ročník, h1, dátum), Hero a Navbar čítajú logo a h1 z DB s fallbackom na konštanty.
- [x] 8. Fotky slidera (globálne): nahrať (s povinným `alt`), zapnúť/vypnúť `isActive`, zmeniť poradie, zmazať (aj súbor). Jedna sekcia v `/admin`.
- [x] 9. Verejný archív: `/rocniky`, `/rocnik/[year]` (Hero bez odpočtu, `EditionInfo`, tlačidlo „Fotogaléria“ z `galleryUrl`), odkaz „Ročníky“ v Navbare, pole `galleryUrl` v admine s validáciou `https://`, 404 pre neexistujúci rok.
- [x] 10. Sponzori: pridať s logom alebo len názvom, `webUrl`, výber radu (`top` / `bottom`), zmazať, zmeniť poradie. Migrácia `row`, `SponsorMarquee` číta rad z `row`.
- [ ] 11. Coolify: `Dockerfile` (multi-stage, nie-root, migrácie pri štarte), `.dockerignore`, popis premenných a trvalého úložiska v README. Overiť lokálne cez `docker build` a `docker run -v`: nahrať fotku, vytvoriť ročník, kontajner zahodiť a znova spustiť; dáta ostanú.
- [ ] 12. `bun run check`, `bun run lint`, Prettier a prechod celým adminom na dev serveri (prihlásenie, každá sekcia, zlé heslo, neprihlásený na `/admin`, čistá databáza bez ročníka, archív: starý ročník s odkazom na galériu aj bez neho).

## 4. Čo nerobiť (Non-Goals & Constraints)

- Žiadne používateľské účty, roly ani registrácia adminov. Je jedno spoločné heslo.
- Neriešiť registračný formulár, tlačidlo na externý formulár ani ukladanie prihlášok bežcov. `/registracia` je zatiaľ len informačná stránka.
- Neriešiť správu trás, `propositionsHtml` ani samotné výsledky (len odkaz `resultsUrl`).
- Neriešiť fotky ani sponzorov per ročník. Slider je globálny a len na domovskej stránke; sponzori sú globálni a v pätičke na všetkých stránkach. Fotky ročníkov ostávajú na Google Disku, aplikácia ich nenahráva.
- Neriešiť CI/CD ani konfiguráciu samotného Coolify; modul pripraví `Dockerfile` a opíše, čo treba v Coolify nastaviť.
- Neriešiť orezávanie ani zmenu veľkosti obrázkov (prípadne neskôr cez `sharp`).
- Neposielať heslo ani token v URL alebo `localStorage`. Len `httpOnly` cookie.
- Žiadne inline štýly ani priame farby; len sémantické tokeny.
- Vitest bol odstránený (2d5403e), takže tento modul nepridáva testy.

## 5. Rozhodnuté

1. **Význam „registrácia zapína admin“**: admin prepína registračné tlačidlo v Hero; tlačidlo vedie na `/registracia`.
2. **UX adminu**: samostatná stránka `/admin`, nie edit mód na domovskej stránke.
3. **Nahrávanie**: súbory na disk servera (`UPLOADS_DIR`), nie URL a nie databáza.
4. **Heslo**: `ADMIN_PASSWORD` z `.env` (nahrádza `ADMIN_TOKEN` zo 03, sekcia 5 bod 6).
5. **Registračná stránka**: len informácie (ako na pôvodnej stránke), bez formulára a bez tlačidla; do budúcna pravdepodobne ostane iba informačná.
6. **Farby v Tiptape**: jeden štýl „upozornenie“ (`span.notice`), nie voľné farby.
7. **Neviditeľné tlačidlo**: veľmi malé, v samom rohu okna nad Navbarom.
8. **Nasadenie**: Coolify z `Dockerfile`; databáza aj obrázky na trvalom úložisku `/data`, aby prežili nové nasadenie.
9. **Sponzori**: výber radu sa ukladá do `Sponsor.row` a nahrádza delenie podľa parity indexu. Logo sponzora je buď nahraný súbor, alebo https odkaz na obrázok (oboje ukladá `Sponsor.logoUrl`); bez oboch sa zobrazí názov.
10. **Ročníky**: admin vytvára aj staré ročníky (od 2015). Produkčná databáza sa nesejduje, prvý ročník vznikne v admine. Aktuálny je vždy najnovší (rozhodnuté pri kroku 2, nie výber admina).
11. **H1 a dátum**: `heroTitle` prepisuje celý nadpis (prázdny = `SITE_NAME + year`); dátum sa zadáva v čase `Europe/Bratislava` (`datetime-local`, uloží sa ako UTC).
12. **Verejný archív** je súčasťou tohto modulu (`/rocniky`, `/rocnik/[year]`).
13. **Fotky**: jeden globálny slider, fotky sa nahrávajú na disk servera. Minulé ročníky nemajú vlastné fotky v aplikácii, len odkaz `galleryUrl` na Google Disk. **Sponzori** sú globálni mimo ročníkov.
14. **Staré súbory**: pri nahradení loga alebo zmazaní fotky sa starý súbor zmaže hneď.

## 6. Otvorené otázky

Žiadne; plánovanie je uzavreté.
