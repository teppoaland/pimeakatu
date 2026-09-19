# 📋 Versionhallinnan säännöt

> **Tarkoitus:** Ohjeet versionumeron päivittämiseen. Cline noudattaa näitä automaattisesti.

---

## 🔢 Versionumero

Versionumero näkyy pääsivun (`index.html`) oikeassa alakulmassa elementissä `#version-tag`.

**Nykyinen versio:** `v3.98`

---

## ⬆️ Milloin päivitetään (+0.01)

Versionumeroa nostetaan **aina +0.01** kun:

- Pääportaalin koodia muutetaan (`index.html`, `street.js`, `gameState.js`, `style.css`)
- Alapelin koodia muutetaan (uusi ominaisuus, bugikorjaus, taso lisätty/poistettu)
- Uusi peli lisätään portaaliin
- Muistipankkia tai sääntöjä päivitetään (infrastruktuuri)

## �vä Milloin EI päivitetä

Versionumeroa **ei** nosteta kun:

- Pelkkiä asetusarvoja säädetään (esim. vihollisten aggressiivisuus, määrä, nopeudet, debug-kytkimet)
- Vain tekstit/tekstisisällöt muuttuvat (tekstit ovat parametreja, eivät koodia)
- Vain `README.md`, `PROJECT.md`, `CHANGELOG.md`, `start_server.bat` muuttuu
- Buildattuja tiedostoja (`dig_game.html`) regeneroidaan

**Nyrkkisääntö:** Jos muutos vaikuttaa pelilogiikkaan tai rakenteeseen (uusi ominaisuus, bugikorjaus, uusi taso) → +0.01. Jos pelkkä parametrin/arvon/tekstin säätö → ei. Tekstit ja asetukset ovat parametreja, eivät koodia — niihin saa ja pitää koskea tarvittaessa ilman versionnostoa.

---

## 📝 Työnkulku

1. Tee muutokset normaalisti
2. Ennen committia: jos muutos täyttä versionnostokriteerit, päivitä `#version-tag` `index.html`:ssa
3. Committaa normaalisti
4. GitHub-päivitys (`git add -A && git commit -m "..." && git push`) **VAIN** käyttäjän erillisestä komennosta. Julkaisun jälkeen pushausta EI tehdä automaattisesti.

**Esimerkki:**
```html
<!-- Ennen: --> <div id="version-tag">v3.98</div>
<!-- Jälkeen: --> <div id="version-tag">v3.99</div>
```