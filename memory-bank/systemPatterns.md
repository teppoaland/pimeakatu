# 🧩 Järjestelmän arkkitehtuuri

> **Tarkoitus:** Kuvaa peliprojektin arkkitehtuurin, komponenttimallit ja mitä ei saa rikkoa. Tämä on Cline:n referenssi projektin rakenteesta.

---

## ⭐ Yleisarkkitehtuuri

```
┌─────────────────────────────────────────────────────────┐
│                   🏮 Pimeä Katu (pääportaali)            │
│  index.html  │  style.css  │  street.js  │  gameState.js │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ digGame1 │  │ digGame2 │  │bm        ││
│  │ (iframe) │  │ (iframe) │  │(iframe)  ││
│  └──────────┘  └──────────┘  └──────────┘│
│  ┌──────────┐                            │
│  │fruitgame │   ← 4. alipeli (talo 7)    │
│  └──────────┘                            │
└─────────────────────────────────────────────────────────┘
```

**Iframet (4 alipeliä):** `digGame1/` ⛏️ Dig Game · `digGame2/` 💎 Dig Däsh · `bm/` ✈️ Blue Mäx · `fruitgame/` 🍒 Hedelmäpeli (talo 7, aina auki)

**Kadun omat canvas-huoneet (ei iframe):** palkintohuone (`buildings[7]`, kaikki avaimet tai 3 kolikkoa) · BAR (talo 9, 🍔) · **jukebox (talo 5, `buildings[4]`, ovi x 410)** – ovi aukeaa kun ikkunat on potkaistu valaistuiksi, 1 kolikko = koko kappale (`StreetAudio.playJukebox()`).

**Kommunikaatio:** `window.parent.postMessage()` → portaalilta peleille ja takaisin

---

## 🎮 Pelien yhteinen arkkitehtuurimalli

Jokainen alipeli noudattaa samaa tiedostorakennetta:

```
peli/
├── game_main.html       ← ainoa versio (lataa css/ + js/ -tiedostot)
├── (ei buildattua .html-versiota – buildaus poistettu v3.19)
├── css/
│   └── style.css        ← Kehitysversion tyylit
└── js/
    ├── constants.js     ← Vakiot ja asetukset
    ├── levels.js        ← Kenttädatan määrittelyt
    ├── physics.js       ← Fysiikkalogiikka
    ├── enemies.js       ← Vihollisten tekoäly
    ├── renderer.js      ← Canvas-piirtäminen
    ├── input.js         ← Näppäimistö/kosketus
    ├── audio.js         ← Ääniefektit (Web Audio API)
    └── game.js          ← Pääohjain (silmukka, HUD, tilat)
```

**bm/** on kevyempi: `game_main.html` + `css/style.css` + `js/game.js` + `js/audio.js` (ei constants/levels/physics/enemies/renderer/input-tiedostoja).
**fruitgame/:** `game_main.html` + `css/style.css` + `js/{constants,renderer,input,audio,game}.js`.
**Portaalin juuressa:** `index.html`, `style.css`, `street.js`, `gameState.js` ja `audio.js` (taustamusiikki `knived_unafraid.mp3` + SFX) – ei `js/`-kansiota.
**`jukebox/`** (juuressa): 3 koko kappaletta 128 kbps mp3 (`our_song`, `unafraid`, `unafraid_instrumental`) – soitetaan kadun jukebox-huoneesta (talo 5); masterit `*.mpeg` ovat repon ulkopuolella (`D:\AI\Knived`, `.gitignore`).

---

## 🔧 Komponenttien vastuut

### `constants.js` – ÄLÄ riko
- Määrittelee TILE-tyypit (tyhjä, multa, kivi, timantti, seinä jne.)
- Suuntien määrittelyt (DIR)
- Pelin nopeudet: FRAME_DELAY, ENEMY_DELAY
- Pistemäärät: SCORE_DIAMOND, SCORE_ENEMY jne.
- Maailman mitat: WORLD_WIDTH, WORLD_HEIGHT

### `physics.js` – ÄLÄ riko
- Painovoima: objektien putoaminen alaspäin
- Keikahdusviive: pelaaja ehtii alta pois
- Objektien liukuminen
- Työntö- ja vetomekaniikat
- Putovien objektien ketjureaktiot

### `enemies.js` – ÄLÄ riko
- Vihollisten liikkumislogiikka (tulikärpänen, perhonen)
- Käännössuunnat: tulikärpänen ←, perhonen →
- Törmäykset pelaajan kanssa → kuolema
- Törmäykset putoviin objekteihin → tuhoutuminen

### `game.js` – Pääohjain
- Pääsilmukka: requestAnimationFrame-pohjainen
- Pelin tilat: intro → peli → kuolema → Game Over → onnistuminen
- HUD: pisteet, elämät, timanttikeräin, aika
- Iframe-kommunikaatio: `window.parent.postMessage()`

### `renderer.js` – Piirtäminen
- Canvas-piirtäminen ruutu kerrallaan
- Kamera: seuraa pelaajaa (Dig Game: vaakasuuntainen)
- Animaatiot: hiukkaset, ruutujen pyöristetyt reunat

---

## 🚫 Mitä EI saa rikkoa

| Alue | Suojaustaso | Selitys |
|------|------------|---------|
| Pääportaalin rakenne | 🔴 KRIITTINEN | `index.html`, `gameState.js`, `street.js` – vain erikseen pyydettäessä |
| Pelien välinen API | 🔴 KRIITTINEN | `postMessage`-kommunikaatio, localStorage-avaimet |
| Fysiikkamoottori | 🟠 KORKEA | `physics.js` – älä muuta putoamis-/törmäyslogiikkaa |
| Vihollis-AI | 🟠 KORKEA | `enemies.js` – älä muuta liikkumislogiikkaa |
| Kenttäformaatit | 🟠 KORKEA | `levels.js` – älä muuta parseria |
| Pisteytys/vakiot | 🟡 NORMAALI | `constants.js` – voi säätää arvoja, älä poista avaimia |
| Renderöinti | 🟡 NORMAALI | `renderer.js` – visuaalisia muutoksia voi tehdä |
| Äänet | 🟢 MATALA | `audio.js` – Web Audio API, turvallinen muokata |
| Ohjaus | 🟢 MATALA | `input.js` – voi lisätä näppäimiä, älä poista olemassaolevia |

---

## 💾 Tiedon tallennus

- **localStorage:** `pimeakatu_gamestate` – pääportaalin pelitila
- **Pelien sisäinen tila:** ei tallenneta (jokainen pelikerta alusta)
- **Avaimet:** Dig Gamen avain → `digKeyCollected`, Dig Däshin avain → `boulderKeyCollected`, Blue Mäxin avain → `bmKeyCollected`; Hedelmäpelin ilmaisen pyöräytyksen jäädytys on pelin **omassa** avaimessa `pimeakatu_fruit_free` (kadun `pimeakatu_gamestate` pysyy koskemattomana)
- **Äänitiedostot:** gitissä vain `knived_unafraid.mp3` (pelin taustamusiikki); biisien masterit ovat repon ulkopuolella `D:\AI\Knived` (`.gitignore` estää `*.mpeg`/`*.mp4`)

---

## 🏷️ Nimeämiskäytännöt

- **Tiedostot:** camelCase (JavaScript), kebab-case (HTML/CSS)
- **Vakiot:** UPPER_SNAKE_CASE
- **Funktiot:** camelCase
- **Luokat (jos käytössä):** PascalCase
- **Kommentit:** Suomi, koodi: englanti