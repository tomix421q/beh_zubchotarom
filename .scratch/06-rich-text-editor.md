# 06-rich-text-editor.md

Status: ready-for-human

## 1. Cieľ (Goal)

Organizátor chce v editore textov (info ročníka, registrácia, kontakt) vkladať **obrázky**, meniť **farbu textu** a pridávať **tabuľky**. Hlavný dôvod: „Štartovné“ a harmonogram sú dnes poskladané z tučného textu a na mobile sa zle čítajú. Všetky rich texty zdieľajú jeden editor (`RichTextEditor.svelte`) a jeden sanitizer (`sanitizeInfoHtml.ts`), takže funkcie dostanú všetky naraz. Schéma DB sa nemení.

## 2. Rozhodnutia

- **Farba textu:** pevná paleta 4 farieb pomenovaných podľa farby: Červená, Žltá, Zelená, Sivá a „Bez farby“. Každá farba je trieda (`textRed`, `textYellow`, `textGreen`, `textGray`) naviazaná na token (`destructive`, nový `warning`, `primary`, `muted-foreground`). Nikdy sa nepoužíva inline `style`, ľubovoľná farba by na tmavom glass pozadí bola nečitateľná. Pôvodné `span.notice` sa v editore otvorí ako Červená a na webe sa zobrazuje ďalej, takže netreba migráciu.
- **Tabuľka:** Tiptap TableKit bez zlučovania buniek a bez ťahania šírky stĺpcov. Vloží sa tabuľka 3×2 s hlavičkou. Kontextové tlačidlá (len s kurzorom v tabuľke): + Riadok, − Riadok, + Stĺpec, − Stĺpec, Hlavička, Zmazať tabuľku. Na mobile sa tabuľka posúva vodorovne.
- **Obrázky:** len nahratie z počítača. Súbor sa nahrá hneď po výbere cez `POST /admin/obrazky` (`saveImage`: JPEG/PNG/WebP/AVIF, 5 MB) až po zadaní **povinného popisu (alt)**. Popis sa pýta pred nahratím, takže pri zrušení sa na server nič nedostane. Sanitizer prepustí iba `img` so `src` v tvare `/uploads/<uuid>.<jpg|png|webp|avif>`, externé obrázky zahodí.
- **Zarovnanie obrázka:** Celá šírka (predvolené), Vľavo, Vpravo. Pri Vľavo a Vpravo text obrázok oblieva a obrázok má 40 % šírky, ale až od `sm:`. Na mobile je obrázok vždy na celú šírku. Kontextové tlačidlá pri označenom obrázku: zarovnanie, Popis, Odstrániť obrázok.
- **Upratovanie súborov:** pri každom uložení textu a pri zmazaní ročníka server prejde `/uploads` a zmaže súbory, na ktoré neodkazuje nič v databáze a ktoré sú staršie ako 24 hodín (`sweepUnusedUploads`). Lehota chráni obrázok nahratý do ešte neuloženého textu. Pokrýva zmazané aj nikdy neuložené obrázky, súbory zmazaného ročníka aj staré zvyšky. Zoznam tabuliek je typovaný cez `Prisma.ModelName`, takže nová tabuľka v schéme neprejde typovou kontrolou, kým ju do upratovania niekto nepridá.
- **Toolbar:** Lucide ikony v skupinách s `title` a `aria-label` a zvýrazneným aktívnym stavom. Farby sú farebné „A“ priamo v toolbare, nie dropdown, lebo projekt nemá shadcn DropdownMenu.

## 3. Implementácia (hotové)

- `src/lib/components/molecules/RichTextEditor.svelte`: mark `textColor`, `AlignedImage` (Image s atribútom `align`), `TableKit`, upload, kontextové riadky.
- `src/routes/admin/obrazky/+server.ts`: upload endpoint, `requireAdmin`.
- `src/lib/server/sanitizeInfoHtml.ts`: nové tagy a triedy, filter `img`, `collectUploadUrls`. `readInfoHtml` berie text len s obrázkom alebo tabuľkou ako neprázdny.
- `src/lib/server/uploadCleanup.ts`: `sweepUnusedUploads()`, volané v save akciách (info, registrácia, kontakt) a pri mazaní ročníka; `listUploads()` v `uploads.ts`.
- `src/lib/components/atoms/SaveButton.svelte` + `src/lib/utils/front/saveStatus.svelte.ts`: tlačidlo Uložiť ukazuje „Ukladám…“ a „Uložené“ na všetkých ukladacích formulároch v admine.
- `src/lib/styles/theme.css`: token `--warning`. `src/lib/styles/layout.css`: farby, `.imgFull/.imgLeft/.imgRight`, tabuľky a clearfix v `.prose`, zvýraznenie výberu v editore.

## 4. Akceptačné kritériá (overiť ručne)

- [ ] V každom z 3 editorov: vložiť obrázok (Vľavo, Vpravo, Celá šírka), tabuľku Štartovné a text v 4 farbách. Po uložení a obnovení stránky je obsah rovnaký.
- [ ] Verejná stránka na desktope: text oblieva obrázok. Na mobile (375 px): obrázok je na celú šírku, tabuľka sa posúva a nič nepretečie z karty.
- [ ] Všetky 4 farby sú čitateľné na glass karte.
- [ ] Starý text so `span.notice` je stále červený a editor ho ukazuje ako Červená.
- [x] Upratovanie (overené skriptom na dev DB): používané súbory ostanú, nepoužitý súbor starší ako 24 h sa zmaže, čerstvý ostane a cudzí súbor ostane.
- [ ] `POST /admin/obrazky` bez prihlásenia vráti 404.
- [ ] Sanitizer zahodí `<img src="https://…">`, `onerror`, `style`, `<script>` (overené skriptom).

## Comments
