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

**Salaiset cheatit kadulla (testityökalut, ei tallennu localStorageen):** vitoslamppu (x 720) 5 potkua putkeen → **kaikki avaimet + koko valorivi syttyy**; jatkona **20 potkua putkeen** → **+20 kolikkoa** (hiljainen: ei popuppia/ääntö/kutsuja, vain `coinCount` + HUD; putki nollautuu toisesta lampusta, tauosta > 2 s (`COIN_CHEAT_GAP`) tai cooldownista `COIN_CHEAT_COOLDOWN` 60 s; nupit `COIN_CHEAT_*` `street.js`:ssä). Avain-cheatin polku (`kickCount >= 5`) säilyy ennallaan – raha-cheat on erillinen putkilaskuri (`coinCheatStreak`) ennen tuota haaraa.

**Huoneiden piirto (mobiili):** huoneet piirretään maailmakoordinaatteihin 0–800, mutta **mobiilissa canvas on vain `viewW` leveä** (260–800) ja kamera keskittää huoneen (`camX = (800 − viewW)/2`). Kiinteä 800 px:n asettelu jää siksi kankaan ulkopuolelle → huoneen sisältö on sovitettava näkyvään ikkunaan keskitettynä x = 400 (jukebox v4.22: paneeli ≤ `winW − 24`, fonttikoko `needPx()`-skaalauksella näytön mukaan, `shadowBlur = 0`, ei `rgba`-tekstivärejä, `ctx.save()/restore()`-pari ettei tila vuoda kadulle; BAR-huone v4.25: sama `winW`/`vs`/`needPx`-periaate + `fitFs()`, asettelu lasketaan alhaalta ylös → taulu → äidin lappu → ostorivi → 2/3-hampurilainen, ks. `docs/bar-memo.md`).

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
**Portaalin juuressa:** `index.html`, `style.css`, `street.js`, `gameState.js` ja `audio.js` (taustamusiikki = proseduraalinen syntikkalooppi `MUSIC_SOURCE 'synth'` + SFX; aito äänite `knived_unafraid.mp3` vain `'mp3'`-varatiekytkimellä) – ei `js/`-kansiota.
**`jukebox/`** (juuressa): 3 koko kappaletta 128 kbps mp3 (`our_song`, `unafraid`, `unafraid_instrumental`) – soitetaan kadun jukebox-huoneesta (talo 5); masterit `*.mpeg` ovat repon ulkopuolella (`D:\AI\Knived`, `.gitignore`).
**`assets/`** (juuressa): `justiina.png` (315×261) – BAR-huoneen seinätaulun kuva, ladattu `street.js`:ssä `new Image()`:llä (`BAR_PIC_SRC`, `barPicReady`); jos kuva ei ole valmis, piirretään varapinta. Muu grafiikka on proseduraalista.

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
- **Uuden pelin oletukset (`defaultState.inventory`):** 2 kolikkoa + **5** hampurilaista (kolikot v4.22) → sama "syntymäpaketti" kuin elämät. Vain tuore tila tai reset antaa nämä; `GameState.load()` mergaa tallennetun tilan päälle (`deepMerge`), joten **tallennettu saldo voittaa aina** (0 kolikkoa pysyy 0:na – ei ilmaista rahaa reloadilla). `street.js` lukee `coinCount || 0` ja `hamburgerCount || 5`
- **Äänitiedostot:** kadun taustamusiikki on **proseduraalinen syntikka** (Web Audio, ei tiedostoa; `MUSIC_SOURCE 'synth'`), `knived_unafraid.mp3` (juuressa) on `'mp3'`-varatien äänite ja `jukebox/` sisältää 3 aitoa kappaletta (tekijän omia teoksia); biisien masterit ovat repon ulkopuolella `D:\AI\Knived` (`.gitignore` estää `*.mpeg`/`*.mp4`)

---

## 🔒 Talousbalanssi (LUKITTU 20.9.2026)

> **⚠️ ISO VAROITUS:** älä muuta kolikko-/🍔-/RTP-arvoja ilman käyttäjän eksplisiittistä pyyntöä.
> Sitova sääntö: **`.clinerules/04-economy-balance.md`**, taustat: **`docs/economy-balance-memo.md`**,
> ja sääntö 02:n suojatut pelimekaniikat (kohta "Talous ja palkkiotase").

**Lukitut arvot (pelitestattu hyväksi):**
- **Hedelmäpeli:** panos 1 kolikko, painot 🍒7 🍋5 🔔4 🍔2 💎2, maksut 💎35 🍔20 🔔12 🍋7 🍒4 + pari = panos takaisin → **RTP ≈ 78,5 %** (kolmikko 6,85 %, pari 35,3 %); ilmainen pyöräytys 1 / 120 s (`pimeakatu_fruit_free`, max +0,785 kolikkoa / 2 min).
- **Katu:** katu-kolikko 1 kpl / 120 s respawn; kolikko potkusta 1/5 + 30 s cooldown; 🍔 5 alussa, +1 / 40 s, BAR 1 kolikko = 1 🍔 (katto 10); jukebox 1 kolikko / kappale; palkintohuone = kaikki avaimet tai 3 kolikkoa; osuma (oviukko/ruukku/sähkökaappi) = −1 🍔; syntymäpaketti 2 kolikkoa + 5 🍔.

**Hyväksytty mittapuu (käyttäjän pelitestit 20.9.2026):** pelaajan on *pakko* jättää 1 kolikko ja käydä katsomassa, onko pakko syödä; hedelmäpeli palauttaa yleensä 1–2 kolikkoa ("pyörii omillaan hetken"); iso voitto (20 kolikkoa) ~kerran 30 pelikerrasta. **Tasapaino on empiirisesti löydetty – ei laskettu etukäteen → siksi lukossa.**

**Testityökalut eivät ole balanssia:** `COIN_CHEAT_*` (v4.23), `fruitgame?coins=N`/`?debug`, `bm`-debug, `MUSIC_SOURCE` – näitä saa säätää vapaasti (ei lupaa, ei versionostoa).

---

## 🏷️ Nimeämiskäytännöt

- **Tiedostot:** camelCase (JavaScript), kebab-case (HTML/CSS)
- **Vakiot:** UPPER_SNAKE_CASE
- **Funktiot:** camelCase
- **Luokat (jos käytössä):** PascalCase
- **Kommentit:** Suomi, koodi: englanti