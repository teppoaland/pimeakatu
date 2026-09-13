# 📋 Versionhallinnan säännöt

> **Tarkoitus:** Ohjeet versionumeron päivittämiseen. Cline noudattaa näitä automaattisesti.

---

## 🔢 Versionumero

Versionumero näkyy pääsivun (`index.html`) oikeassa alakulmassa elementissä `#version-tag`.

**Nykyinen versio:** `v1.0`

> **Commando-poikkeus:** `commando_c64/` pelillä on **oma versionumero** (`#commando-version`, oikeassa alanurkassa harmaalla). Commando-muutokset **eivät nosta** pääportaalin `#version-tag`:ia – sen versionumeroa kasvatetaan vain kun Commandon omaa versiota (`game_main.html` → `#commando-version`) päivitetään.

---

## ⬆️ Milloin päivitetään (+0.1)

Versionumeroa nostetaan **aina +0.1** kun:

- Pääportaalin koodia muutetaan (`index.html`, `street.js`, `gameState.js`, `style.css`)
- Alapelin koodia muutetaan (uusi ominaisuus, bugikorjaus, taso lisätty/poistettu)
- Uusi peli lisätään portaaliin
- Muistipankkia tai sääntöjä päivitetään (infrastruktuuri)

## �vä Milloin EI päivitetä

Versionumeroa **ei** nosteta kun:

- Pelkkiä asetusarvoja säädetään (esim. vihollisten aggressiivisuus, määrä, nopeudet, debug-kytkimet)
- Vain `README.md`, `PROJECT.md`, `CHANGELOG.md`, `start_server.bat` muuttuu
- Buildattuja tiedostoja (`dig_game.html`) regeneroidaan

**Nyrkkisääntö:** Jos muutos vaikuttaa pelilogiikkaan, rakenteeseen tai ulkoasuun → +0.1. Jos pelkkä parametrin/arvon säätö → ei. Asetuksiin saa ja pitää koskea tarvittaessa, ne eivät vaan nosta versionumeroa.

---

## 📝 Työnkulku

1. Tee muutokset normaalisti
2. Ennen committia: jos muutos täyttä versionnostokriteerit, päivitä `#version-tag` `index.html`:ssa
3. Committaa normaalisti
4. **AJAINA** muutosten jälkeen GitHub-päivitys (`git add -A && git commit -m "..." && git push`), ellei käyttäjä erikseen kiellä

**Esimerkki:**
```html
<!-- Ennen: --> <div id="version-tag">v1.0</div>
<!-- Jälkeen: --> <div id="version-tag">v1.1</div>
```