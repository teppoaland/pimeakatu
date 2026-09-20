# 🧩 Järjestelmän arkkitehtuuri

> **Tarkoitus:** Cline:n referenssi projektin rakenteesta ja siitä, mitä ei saa rikkoa. Kompaktoitu 20.9.2026.

## ⭐ Yleisarkkitehtuuri

- **Pääportaali (juuri):** `index.html`, `style.css`, `street.js`, `gameState.js`, `audio.js` – ei `js/`-kansiota.
- **Iframet (4 alipeliä):** `digGame1/` ⛏️ Dig Game · `digGame2/` 💎 Dig Däsh · `bm/` ✈️ Blue Mäx ·
  `fruitgame/` 🍒 Hedelmäpeli (talo 7, aina auki).
- **Kadun canvas-huoneet (ei iframe):** **makuuhuone** (ex-palkintohuone, `buildings[7]`, lukko = 3 avainta,
  valinnat Nuku/Poistu) · BAR (talo 9, 🍔) · jukebox (talo 5, `buildings[4]`, ovi x 410, 1 kolikko = koko kappale).
- **Kommunikaatio:** `window.parent.postMessage()` molempiin suuntiin.
- **LocalStorage-avaimet:** `pimeakatu_gamestate` (portaali; sisältää myös **`isDay`** = päivä/yö-tila),
  `digKeyCollected`, `boulderKeyCollected`,
  `bmKeyCollected`, `pimeakatu_fruit_free` (hedelmäpelin oma).

**Salaiset cheatit kadulla (testityökalut, eivät tallennu):** vitoslamppu (x 720) 5 potkua putkeen →
kaikki avaimet + koko valorivi; jatkona 20 potkua → **+20 kolikkoa** (hiljainen: ei popuppia/ääntä).
Nupit `COIN_CHEAT_*` = `LAMP 4`, `KICKS 20`, `REWARD 20`, `GAP 120`, `COOLDOWN 3600`; putki katkeaa
toiseen lamppuun / 2 s taukoon / palkkioon, cooldown 60 s.

**Huoneiden piirto (mobiili):** huoneet piirretään maailmakoordinaatteihin 0–800, mutta mobiilissa canvas
on vain `viewW` (260–800) leveä ja kamera keskittää huoneen (`camX = (800 − viewW)/2`) → sisältö
sovitetaan näkyvään ikkunaan keskitettynä x = 400 (jukebox v4.22, BAR v4.25: `winW`, `vs`, `needPx()`,
`fitFs()`, paneeli ≤ `winW − 24`, `ctx.save()/restore()`-pari ettei tila vuoda kadulle).

**Äänet:** taustamusiikki = proseduraalinen syntikka (`MUSIC_SOURCE 'synth'`, ei tiedostoa) tai `'mp3'`-varatie
`knived_unafraid.mp3`; `jukebox/` (3 × 128 kbps mp3) soi vain jukebox-huoneesta; masterit repon ulkopuolella
`D:\AI\Knived` (`.gitignore` estää `*.mpeg`/`*.mp4`).

**Kuvat:** `assets/justiina.png` (315×261) = BAR-huoneen seinätaulu (`BAR_PIC_SRC`, `barPicReady`,
varapinta jos ei lataudu) · `fruitgame/assets/dude_mv.jpg` (672×400, MV) = hedelmäpelin huoneen seinäkuva
HTML-elementtinä `#wall-pic` (ei canvasin piirrossa; koko/asemointi `renderer.wallPicSize()`, piiloon
mobiilin vaakatasossa). Muu grafiikka on proseduraalista.

**Syvyysskaalaus (syvyysvaikutelma):** talot `buildingScale()` 100 / 95 / 90 % ankkuroituna `GROUND_Y`:hin ·
pelaaja `playerDepthScale()` ±10 % (0,90 kauas … 1,10 lähelle, 1,00 keskikohdalla `player.y = 315`)
ankkuroituna jalkojen kosketuspisteeseen (`px + pw/2, py + ph − 1`). **Skaalaus on visuaalinen** –
hitboxit (`player.w/h`, törmäykset, keräyssäteet) eivät skaalaudu, joten pelimekaniikat pysyvät ennallaan.

**Päivä/yö (v4.33):** tila on **tallennettu** (`state.isDay`, `pimeakatu_gamestate`issa): `null` =
ratkaisematon, `true` = päivä, `false` = yö. Kun kaikki 3 avainta on kerätty (`allKeysCollected()`),
kadulle nousee päivä **kerran** (v4.32-käytös) ja tila tallennetaan → sen jälkeen **makuuhuoneen
Nuku-valinta** vaihtaa tilaa (päivä → yö TAI yö → päivä), Poistu ei muuta mitään. `dayT` liukuu
molempiin suuntiin (`DAY_FADE_FRAMES` nousu, `NIGHT_FADE_FRAMES` lasku) ja on pysähdyksissä kun
alapeli on auki (`iframeOpen`) tai ollaan canvas-huoneessa → muutos näkyy kadulle palatessa.
Testityökalut `?day=1` / `?day=0` pakottavat tilan eivätkä tallenna.
**Visuaalinen vain:** ei muutoksia hitboxeihin, törmäyksiin eikä talouteen; yö piirtyy täsmälleen kuten
ennen, koska kaikki päivähaarat ovat ehtoja `dayT > 0`.

## 🎮 Pelien yhteinen arkkitehtuurimalli

```
peli/
├── game_main.html       ← ainoa versio (lataa css/ + js/), ei buildattua html:ää (buildaus poistettu v3.19)
├── css/style.css
└── js/  constants.js · levels.js · physics.js · enemies.js · renderer.js · input.js · audio.js · game.js
```

**bm/** on kevyempi: `game_main.html` + `css/style.css` + `js/game.js` + `js/audio.js`.
**fruitgame/:** `game_main.html` + `css/style.css` + `js/{constants,renderer,input,audio,game}.js`.

## 🔧 Komponenttien vastuut

- **`constants.js` – ÄLÄ riko:** TILE-tyypit, DIR-suunnat, nopeudet (`FRAME_DELAY`, `ENEMY_DELAY`),
  pistemäärät, maailman mitat.
- **`physics.js` – ÄLÄ riko:** painovoima, keikahdusviive, liukuminen, työntö/veto, ketjureaktiot.
- **`enemies.js` – ÄLÄ riko:** vihollisten liike ja käännökset, törmäykset pelaajaan/putoviin objekteihin.
- **`game.js`:** pääsilmukka (rAF), tilat (intro → peli → kuolema → game over → onnistuminen), HUD,
  iframe-`postMessage`.
- **`renderer.js`:** canvas-piirto, kamera, animaatiot ja hiukkaset.
- **`input.js`:** näppäimistö ja kosketus.
- **`audio.js`:** Web Audio -efektit.

## 🚫 Mitä EI saa rikkoa

| Alue | Suojaustaso | Selitys |
|------|------------|---------|
| Pääportaalin rakenne | 🔴 KRIITTINEN | `index.html`, `gameState.js`, `street.js` – vain erikseen pyydettäessä |
| Pelien välinen API | 🔴 KRIITTINEN | `postMessage`-kommunikaatio, localStorage-avaimet |
| Fysiikkamoottori | 🟠 KORKEA | `physics.js` – putoamis-/törmäyslogiikka |
| Vihollis-AI | 🟠 KORKEA | `enemies.js` – liikkumislogiikka |
| Kenttäformaatit | 🟠 KORKEA | `levels.js` – parseri |
| Pisteytys/vakiot | 🟡 NORMAALI | `constants.js` – arvoja voi säätää, avaimia ei poistaa |
| Renderöinti | 🟡 NORMAALI | `renderer.js` – visuaaliset muutokset ok |
| Äänet | 🟢 MATALA | `audio.js` – turvallinen muokata |
| Ohjaus | 🟢 MATALA | `input.js` – voi lisätä näppäimiä, ei poistaa |

## 💾 Tiedon tallennus

- **`pimeakatu_gamestate`:** portaalin pelitila (`GameState`); `GameState.load()` mergaa tallennetun tilan
  `defaultState`in päälle (`deepMerge`) → **tallennettu saldo voittaa aina** (0 kolikkoa pysyy 0:na).
- **`defaultState.inventory`:** 2 kolikkoa + 5 🍔 (kolikot v4.22). `street.js` lukee `coinCount || 0`,
  `hamburgerCount || 5`.
- **Alipelien sisäinen tila:** ei tallenneta (jokainen pelikerta alusta); hedelmäpelin ilmaispyöräytyksen
  jäädytys on pelin omassa avaimessa `pimeakatu_fruit_free`.
- **Avaimet:** `digKeyCollected` → `boulderKeyCollected` → `bmKeyCollected`; kaikki avaimet (tai 3 kolikkoa)
  avaavat palkintohuoneen.

## 🔒 Talousbalanssi (LUKITTU 20.9.2026)

> **⚠️ ISO VAROITUS:** älä muuta kolikko-/🍔-/RTP-arvoja ilman käyttäjän eksplisiittistä pyyntöä.
> Sitova sääntö **`.clinerules/04-economy-balance.md`**, tausta **`docs/economy-balance-memo.md`**
> sekä säännön 02 kohta "Talous ja palkkiotase".

- **Hedelmäpeli:** panos 1, painot 🍒7 🍋5 🔔4 🍔2 💎2, maksut 💎35 🍔20 🔔12 🍋7 🍒4 + pari = panos takaisin
  → **RTP ≈ 78,5 %** (kolmikko 6,85 %, pari 35,3 %); ilmainen pyöräytys 1 / 120 s (max +0,785 kolikkoa / 2 min).
- **Katu:** kolikko 1 kpl / 120 s · potkukolikko 1/5 + 30 s · 🍔 5 alussa, +1 / 40 s · BAR 1 kolikko = 1 🍔
  (katto 10) · jukebox 1 kolikko / kappale · palkintohuone avaimet tai 3 kolikkoa · osuma = −1 🍔 ·
  syntymäpaketti 2 kolikkoa + 5 🍔.
- **Hyväksytty mittapuu (käyttäjän pelitestit):** 1 kolikko on pakko jättää ja käydä katsomassa, onko pakko
  syödä; hedelmäpeli palauttaa yleensä 1–2 kolikkoa; iso voitto (20 kolikkoa) ~kerran 30 pelikerrasta.
  **Tasapaino on empiirisesti löydetty → siksi lukossa.**
- **Testityökalut eivät ole balanssia:** `COIN_CHEAT_*`, `?coins=N` / `?debug`, `?day=1` (päivä heti),
  `bm`-debug, `MUSIC_SOURCE` – vapaasti säädettävissä (ei lupaa, ei versionostoa).

## 🏷️ Nimeämiskäytännöt

- Tiedostot: camelCase (JS), kebab-case (HTML/CSS) · Vakiot: UPPER_SNAKE_CASE · Funktiot: camelCase ·
  Luokat: PascalCase · **kommentit: suomi, koodi: englanti**.
- Näkyvät pelinimet: **Dig Däsh**, **Blue Mäx**. Sisäiset tunnisteet (`boulder*`, `const BlueMax`, `bm/`)
  säilyvät ennallaan – ne ovat rajapintaa (sääntö 02).

