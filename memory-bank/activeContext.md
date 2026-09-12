# 🎯 Aktiivinen konteksti

> **Tarkoitus:** Tämä tiedosto kertoo mitä ollaan juuri nyt tekemässä. Päivitetään jokaisen alataskin päätteeksi ja ennen istunnon sulkemista.

---

## 📍 Tämänhetkinen fokus

**Päivämäärä:** 12.9.2026

**Vaihe:** Mobiilin kosketusohjainten korjaus valmis ja varmistettu

**Nykyinen alataski:** ✅ Valmis – `pointerdown` → `touchstart`/`mousedown`, v1.1 GitHub Pagesissa

## 🔜 Seuraavaksi

- [ ] Blue Max: debugin purku, täydet viholliset / vaikeustasot
- [ ] Commando-pelin kehityksen aloitus
- [ ] Ääniefektit pääportaaliin (Web Audio API)
- [ ] Pääsiäismunat Boulder Dashiin
- [ ] Ennätyspisteet (localStorage)

## 📝 Viimeisimmät muutokset

| Pvm | Mitä tehty |
|-----|-----------|
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

- **Mobiili-D-pad korjattu:** `pointerdown`-tapahtumat korvattu `touchstart`/`mousedown`-yhdistelmällä, joka toimii luotettavasti sekä HTTP- että HTTPS-ympäristössä
- **Blue Max** on pelikunnossa debug-moodissa (viholliset minimoitu) – D-pad-korjaus tehty myös tänne
- **Commando** ei ole vielä aloitettu (tyhjä kansio)
- **Dig Game (BD1)** = täysin valmis, käyttää jo `touchstart`-pohjaisia kontrolleja
- **Boulder Däsh (BD2)** = 4 kenttää, debugissa avain heti, käyttää jo `touchstart`-pohjaisia kontrolleja
- GitHub Pages: `https://teppoaland.github.io/pimeakatu/` (v1.1)
- Sisäverkon serveri: `start_server.bat` → `http://192.168.1.44:8080`