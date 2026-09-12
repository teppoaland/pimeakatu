# 🎯 Aktiivinen konteksti

> **Tarkoitus:** Tämä tiedosto kertoo mitä ollaan juuri nyt tekemässä. Päivitetään jokaisen alataskin päätteeksi ja ennen istunnon sulkemista.

---

## 📍 Tämänhetkinen fokus

**Päivämäärä:** 12.9.2026

**Vaihe:** v1.3 – Overlay-ohjaimet mobiilissa (canvas koko ruutu, ohjaimet läpikuultavana pohjassa)

**Nykyinen alataski:** ✅ Valmis – v1.3: overlay-ohjaimet

## 🔜 Seuraavaksi

- [ ] Testaa GitHub Pagesissa: vaakamoodi + potku-ilmoitukset
- [ ] Blue Max: debugin purku, täydet viholliset / vaikeustasot
- [ ] Commando-pelin kehityksen aloitus
- [ ] Ääniefektit pääportaaliin (Web Audio API)
- [ ] Pääsiäismunat Boulder Dashiin
- [ ] Ennätyspisteet (localStorage)

## 📝 Viimeisimmät muutokset

| Pvm | Mitä tehty |
|-----|-----------|
| 12.9.2026 | v1.3: Overlay-ohjaimet – canvas koko ruutu, ohjaimet `position: absolute` + `opacity: 0.65` |
| 12.9.2026 | v1.3: `resize()` yksinkertaistettu – ohjaimet ei vie tilaa |
| 12.9.2026 | v1.2: Potku-laskuritekstit ("X/5") pois lamppuilmoituksista |
| 12.9.2026 | v1.2: Vaakamoodin tuki mobiilissa – ⚡ vasen, canvas keskellä, D-pad oikea |
| 12.9.2026 | v1.2: HTML-rakenne: `#game-area` + `#touch-row` + `display: contents` |
| 12.9.2026 | v1.2: "POTKU"-teksti → ⚡-ikoni action-nappiin |
| 12.9.2026 | v1.2: Google Fonts `@import` (CSS) → `<link>` (HTML) – ei blokkaa CSS:ää |
| 12.9.2026 | v1.2: JS `'ontouchstart'`-detectio → `.force-show` D-padille |
| 12.9.2026 | v1.2: `.force-show { display: flex !important }` CSS-sääntö |
| 12.9.2026 | Mobiilin D-pad-korjaus: `pointerdown` → `touchstart`+`mousedown` + `touchActive`-suodatus |
| 12.9.2026 | Versionumero v1.0 → v1.1 |
| 12.9.2026 | Blue Max: sama pointerdown→touchstart-korjaus `sTC()`-funktioon |
| 12.9.2026 | Varmistettu: GitHub Pagesissa v1.1 ja D-pad toimii oikein |
| 12.9.2026 | Memory bank päivitetty session loppuun (~93k tokenia) |
| 12.9.2026 | `.clinerules/03-versioning.md` täsmennetty: asetuksiin saa koskea |
| 12.9.2026 | GitHub Pages deploy: `https://teppoaland.github.io/pimeakatu/` |
| 12.9.2026 | `start_server.bat` luotu sisäverkon web-palvelinta varten |
| 10.9.2026 | Pääportaalin rakennus valmis |

## ⚠️ Avoimet asiat / huomiot

- **v1.3 Overlay-ohjaimet:** Canvas täyttää koko ruudun, D-pad ja ⚡ läpikuultavina (`opacity: 0.65`) pohjassa. `#touch-row` = `position: absolute; pointer-events: none`, lapset `pointer-events: auto`
- **CSS:** Yksi mobiili-`@media` `(max-width: 768px), (max-height: 768px)` – sama overlay sekä pysty- että vaakamoodissa
- **Työpöytä:** `@media (min-width: 769px) and (min-height: 769px)` piilottaa ohjaimet
- **Ilmoitukset:** Laskuritekstit poistettu, ovi-ohjetekstit säilytetty
- **Action-nappi:** ⚡-salama, `title="Potku"`
- **Action-nappi:** ⚡-salama, `title="Potku"` hover-tekstinä
- **Blue Max** on pelikunnossa debug-moodissa (viholliset minimoitu) – D-pad-korjaus tehty myös tänne
- **Commando** ei ole vielä aloitettu (tyhjä kansio)
- **Dig Game (BD1)** = täysin valmis, käyttää jo `touchstart`-pohjaisia kontrolleja
- **Boulder Däsh (BD2)** = 4 kenttää, debugissa avain heti, käyttää jo `touchstart`-pohjaisia kontrolleja
- GitHub Pages: `https://teppoaland.github.io/pimeakatu/` (v1.2)