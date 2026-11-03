# 05-animated-background.md

Status: ready-for-agent

## 1. Cieľ (Goal)

Pozadie celého webu, dnes statický `static/bg.jpg` v `+layout.svelte`, sa „oživí": po načítaní stránky sa raz prehrá krátke video bežca a zostane na poslednom zábere. Admin vie pozadie sám nahrať a zmeniť v `/admin`: video (mp4) a obrázok. Ak video nie je, nestihne sa načítať alebo sa nemá prehrať, ukáže sa obrázok. Bez nahraného obsahu sa web správa ako dnes.

Video je len pozadie. Hero karta, slider a ostatné karty sa nemenia a netreba na ne žiadny prekryv, karty už majú vlastné pozadie a layout už má tmavý filter `bg-background/60`.

## 2. Kontrakty & Architektúra (Contracts)

### Dáta

- `SiteSetting` dostane `backgroundVideoUrl String?` a `backgroundImageUrl String?` (migrácia). Jeden riadok `id = 1`, ako logo. Pozadie je globálne, nie per ročník.
- `+layout.server.ts` vráti `backgroundVideoUrl` a `backgroundImageUrl: settings?.backgroundImageUrl ?? '/bg.jpg'`.

### Nahrávanie a servírovanie (`src/lib/server/uploads.ts`, `src/routes/uploads/[name]/+server.ts`)

- Nový `UploadType` `video/mp4`, prípona `mp4`. `matches`: bajty 4 – 8 sú `ftyp` a značka (bajty 8 – 12) je mp4 značka (`isom`, `iso2`, `mp41`, `mp42`, `avc1`, `M4V `). AVIF má tiež `ftyp`, ale značky `avif`/`avis`, takže sa nepomýli.
- Nový `saveVideo(file)` s limitom 5 MB a slovenskými hláseniami ako `saveImage`. `UPLOAD_NAME` sa skladá z `UPLOAD_TYPES`, takže `mp4` prejde automaticky.
- `BODY_SIZE_LIMIT=6M` sa nemení. Video aj obrázok majú limit 5 MB.
- Servírovanie musí podporovať HTTP Range: `Accept-Ranges: bytes`, `Content-Length`, odpoveď `206` s `Content-Range` pre `Range: bytes=a-b`, `416` pri neplatnom rozsahu. Čítať cez `createReadStream` so `start`/`end`, nie celý súbor do pamäte. Bez toho Safari/iOS video neprehrá. Platí pre všetky uploady, hlavičky `Cache-Control` a `X-Content-Type-Options` ostávajú.

### Admin (`/admin`, `src/routes/admin/+page.server.ts`)

- Nová sekcia „Pozadie" vedľa loga: dva formuláre, video a obrázok, každý s akciou nahrať a zmazať (`?/uploadBackgroundVideo`, `?/deleteBackgroundVideo`, `?/uploadBackgroundImage`, `?/deleteBackgroundImage`).
- Nový súbor sa uloží pred zmazaním starého (vzor `saveLogo`). Každá akcia začína `requireAdmin(locals)`.
- Pod poľom na video pokyn: „mp4 (H.264), bez zvuku, do 5 MB, zakódované s `-movflags +faststart`."

### Frontend

- Nový `organism/BackgroundMedia.svelte` v `+layout.svelte`: `fixed inset-0 -z-10` (pevné na okno, nescrolluje sa), pod existujúcim tmavým filtrom. Obsahuje obrázok (vždy ako spodná vrstva) a nad ním `<video muted playsinline preload="auto">` bez `autoplay` a bez `loop`, obe s `object-cover`.
- Stavy: `loading` (overlay cez stránku) → `playing` | `image`. Video sa spustí cez `play()` až po `canplaythrough`. Ak nie je pripravené do **3 s**, overlay zmizne, ukáže sa obrázok, načítanie sa preruší a video sa už nespustí.
- Overlay sa nezobrazí, keď nie je video, nie je JS (`<noscript>` ho skryje) alebo sa video nemá sťahovať.
- Pri `prefers-reduced-motion` a `navigator.connection.saveData` sa video nesťahuje a obrázok je hneď. Zlyhanie `play()` (napr. Low Power Mode na iOS) → obrázok.
- Layout už nepoužíva `bg-[url(/bg.jpg)]`. Admin dostane to isté pozadie.
- Prehráva sa po každom plnom načítaní stránky (reload spustí znova); navigácia medzi stránkami nič nespúšťa, lebo layout zostáva.

## 3. Checklist implementácie (Kroky pre agenta)

- [x] 1. Uploady: `UploadType` pre `video/mp4` (kontrola `ftyp` a mp4 značky, AVIF sa nezamení), `saveVideo` s limitom 5 MB a slovenskými hláseniami.
- [x] 2. Servírovanie `/uploads/[name]` s HTTP Range (`206`, `416`, `Accept-Ranges`, `Content-Length`, `createReadStream`); `Cache-Control` a `X-Content-Type-Options` ostávajú.
- [x] 3. Migrácia `SiteSetting.backgroundVideoUrl` a `backgroundImageUrl`; `+layout.server.ts` ich vracia (obrázok predvolene `/bg.jpg`).
- [x] 4. Admin akcie `uploadBackgroundVideo`, `deleteBackgroundVideo`, `uploadBackgroundImage`, `deleteBackgroundImage`: nový súbor pred zmazaním starého, `requireAdmin` v každej, súbor sa zmaže aj z disku.
- [x] 5. Sekcia „Pozadie" v `/admin` vedľa loga s pokynom ku kódovaniu (mp4 H.264, bez zvuku, do 5 MB, `-movflags +faststart`).
- [x] 6. `BackgroundMedia.svelte`: `fixed` obrázok a video (`muted`, `playsinline`, `preload="auto"`, bez `loop`), `play()` po `canplaythrough`, posledný záber ostane.
- [x] 7. Načítavací overlay a 3 s limit: po 3 s sa ukáže obrázok, načítanie sa preruší a video sa už nespustí; bez videa, bez JS, pri `prefers-reduced-motion` a `saveData` overlay nie je; zlyhanie `play()` → obrázok.
- [x] 8. `+layout.svelte`: odstrániť `bg-[url(/bg.jpg)]`, vložiť `BackgroundMedia` pod tmavý filter; admin vidí to isté pozadie.
- [x] 9. `bun run check`, `bun run lint`, Prettier. Overenie na dev serveri: `curl -r 0-99 -i` vráti `206`; rýchle pripojenie (video sa prehrá raz a zostane); spomalené pripojenie v devtools (po 3 s obrázok, video sa nespustí neskôr); bez nahraného videa web vyzerá ako dnes; reload prehrá video znova.
- [x] 10. Skúška na reálnom iPhone (Safari): či sa video načíta do 3 s a či sa spustí. _(Overené na mobile.)_

## 4. Čo nerobiť (Non-Goals & Constraints)

- Per-ročníkové pozadie, viac videí, zvuk, slučka, výber medzi mobilným a desktopovým videom.
- Prekódovanie videa na serveri. Admin nahráva hotový, správne zakódovaný mp4.
- Nemeniť Hero, `PhotoSlider` ani tmavý filter `bg-background/60`.
- Nezvyšovať `BODY_SIZE_LIMIT` ani limit 5 MB.

## 5. Rozhodnuté

- **Rozsah:** jedno globálne pozadie pre celý web, mení sa v admin paneli.
- **Formát:** video len mp4, do 5 MB (musí sa načítať rýchlo); obrázok do 5 MB ako dnes.
- **Prehrávanie:** raz, bez slučky, bez zvuku; po každom reloade znova.
- **Obrázok:** nahrádza video pri vypnutých animáciách, úspore dát, zlyhaní autoplay a pri neskorom načítaní; je aj voľba „zmeniť video za obrázok".
- **Načítavanie:** overlay, po 3 s bez videa sa ukáže obrázok.
- **Slider:** je na konci domovskej stránky, za štatistikami a textom ročníka; nezávisí na videu, ukáže sa pri scrolle, keď je vidieť polovica.
- **Tmavý prekryv na video:** netreba, karty majú vlastné pozadie.

## 6. Otvorené otázky

- Má server odmietnuť mp4, kde je atóm `moov` až za `mdat` (bez `faststart`)? Súbor je už v pamäti, kontrola je lacná. Bez nej by zle zakódované video vždy dobehlo do 3 s limitu a ukázal by sa obrázok.
- Či iOS Safari načíta `preload="auto"` dosť rýchlo na `canplaythrough` do 3 s, ukáže iba reálne zariadenie (krok 10).
