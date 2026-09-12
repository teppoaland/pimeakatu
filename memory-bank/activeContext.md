# 🎯 Aktiivinen konteksti

> **Tarkoitus:** Tämä tiedosto kertoo mitä ollaan juuri nyt tekemässä. Päivitetään jokaisen alataskin päätteeksi ja ennen istunnon sulkemista.

---

## 📍 Tämänhetkinen fokus

**Päivämäärä:** 12.9.2026

**Vaihe:** Mobiilin D-pad-korjauksen v2 – JS-pohjainen touch-detection + Google Fonts -blokkauksen korjaus

**Nykyinen alataski:** ✅ Valmis – v1.2: "POTKU"-teksti pois, `@import` → `<link>`, JS `force-show` touch-laitteille

## 🔜 Seuraavaksi

- [ ] Testaa GitHub Pagesissa Androidilla: näkyykö D-pad nyt?
- [ ] Blue Max: debugin purku, täydet viholliset / vaikeustasot
- [ ] Commando-pelin kehityksen aloitus
- [ ] Ääniefektit pääportaaliin (Web Audio API)
- [ ] Pääsiäismunat Boulder Dashiin
- [ ] Ennätyspisteet (localStorage)

## 📝 Viimeisimmät muutokset

| Pvm | Mitä tehty |
|-----|-----------|
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

- **v1.2 D-pad-korjaus:** Nyt kolme kerrosta:
  1. CSS `@media (max-width: 768px)` – perustason responsiivisuus
  2. JS `'ontouchstart' in window` – `.force-show`-luokka pakottaa D-padin näkyviin **kaikilla** kosketuslaitteilla
  3. Google Fonts siirretty `<link>`-tagiksi – ei enää blokkaa CSS:n latautumista hitailla mobiiliverkoilla
- **Action-nappi:** "POTKU"-teksti korvattu ⚡-salamalla, `title="Potku"` hover-tekstinä
- **Blue Max** on pelikunnossa debug-moodissa (viholliset minimoitu) – D-pad-korjaus tehty myös tänne
- **Commando** ei ole vielä aloitettu (tyhjä kansio)
- **Dig Game (BD1)** = täysin valmis, käyttää jo `touchstart`-pohjaisia kontrolleja
- **Boulder Däsh (BD2)** = 4 kenttää, debugissa avain heti, käyttää jo `touchstart`-pohjaisia kontrolleja
- GitHub Pages: `https://teppoaland.github.io/pimeakatu/` (v1.2)