# 📋 Versionhallinnan säännöt

> **Tarkoitus:** Ohjeet versionumeron päivittämiseen. Cline noudattaa näitä automaattisesti.

---

## 🔢 Versionumero

Versionumero näkyy pääsivun (`index.html`) oikeassa alakulmassa elementissä `#version-tag`.

**Nykyinen versio:** `v1.0`

---

## ⬆️ Milloin päivitetään (+0.1)

Versionumeroa nostetaan **aina +0.1** kun:

- Pääportaalin koodia muutetaan (`index.html`, `street.js`, `gameState.js`, `style.css`)
- Alapelin koodia muutetaan (uusi ominaisuus, bugikorjaus, taso lisätty/poistettu)
- Uusi peli lisätään portaaliin
- Muistipankkia tai sääntöjä päivitetään (infrastruktuuri)

## �vä Milloin EI päivitetä

Versionumeroa **ei** nosteta kun:

- Pelkkiä asetusarvoja säädetään (esim. vihollisten määrä, nopeudet, debug-tilan kytkimet)
- Vain `README.md`, `PROJECT.md`, `CHANGELOG.md`, `start_server.bat` muuttuu
- Buildattuja tiedostoja (`dig_game.html`, `boulder_dash.html`) regeneroidaan

**Nyrkkisääntö:** Jos muutos vaikuttaa pelattavuuteen tai ulkoasuun → +0.1. Jos pelkkä asetusarvo → ei.

---

## 📝 Työnkulku

1. Tee muutokset normaalisti
2. Ennen committia: jos muutos täyttä versionnostokriteerit, päivitä `#version-tag` `index.html`:ssa
3. Committaa normaalisti

**Esimerkki:**
```html
<!-- Ennen: --> <div id="version-tag">v1.0</div>
<!-- Jälkeen: --> <div id="version-tag">v1.1</div>
```