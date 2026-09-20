# 🎯 Aktiivinen konteksti

> **Kevyt:** Vain tämä tiedosto luetaan session alussa.
> **Kompaktoitu 20.9.2026 (v4.26):** vanha versiokohtainen yksityiskohtaselostus (v3.9x–v4.25) poistettu –
> täysi sisältö on git-historiassa (viimeisin täysi versio commitissa `ffb1dd9`).

---

## 📌 Kommunikaatiosääntö (KÄYTTÄJÄN PYYNTÖ)

> **"Lue membank"** → lue muistipankki hiljaa itseäsi varten. **ÄLÄ anna yhteenvetoa.**
> **🚫 Älä committaa automaattisesti** (20.9.2026) → muutokset jäävät työpuuhun, jotta käyttäjä näkee ne
> VS Coden GIT-ikkunassa ja voi katsoa diffin. Commit vain pyynnöstä (esim. "commit"), push vain erikseen.
> **✂️ Ei pitkiä yhteenvetoja** → raportti 2–5 riviä: mitä muuttui + lopputulos.

---

## 📍 Nyt

- **Versio:** `v4.26` (`index.html` → `#version-tag`) · **Git:** `HEAD = origin/main = ffb1dd9`, työpuu puhdas.
- **Tila:** pääportaali + 4 alipeliä (`digGame1` ⛏️, `digGame2` 💎, `bm` ✈️, `fruitgame` 🍒) valmiit ja pelattavat.
- **Kadun canvas-huoneet (ei iframe):** palkintohuone `buildings[7]` · BAR (talo 9) · jukebox
  (`buildings[4]`, ovi x 410) · hedelmäpelitalo `buildings[6]` (iframe, aina auki).
- **Lukossa:** talous (sääntö 04) ja inventaario · **vapaasti säädettävissä:** testityökalut
  (`COIN_CHEAT_*`, `?coins`, `?debug`, `MUSIC_SOURCE`, `bm`-debug).
- **Avoinna:** ks. "🔜 Seuraavaksi" – työpuussa ei ole keskeneräistä koodia.

---

## 🆕 Tuoreimmat versiot (20.9.2026)

**v4.27 – Jukebox: tiedostonimet korjattu vastaamaan sisältöä.** Tiedostot nimettiin uudelleen
`jukebox/Knived_Our_song.mp3`, `Knived_Unafraid.mp3`, `Knived_Unafraid_instrumental.mp3` – aiemmin raita 1
ja 2 soivat valitun nimen vastaisesti (nimet olivat ristissä: `unafraid.mp3` sisälsi ID3-otsikon mukaan
"Our Song with bass"). `street.js` `JUKEBOX_TRACKS`-urlit päivitetty uusiin nimiin; näkyvät `title`-nimet
(`Knived - Our Song` / `Knived - Unafraid` / `Knived - Unafraid (inst.)`) ja järjestys ennallaan.
`docs/jukebox-memo.md` päivitetty. Pelilogiikkaan ei muita muutoksia.

**v4.26 – BAR-taulun lopullinen koko.** Kuva 57,9 × 48, kehys 61,9 × 52 kaikilla laitteilla
(`PIC_TOP 60`, `PIC_PAD 2`, `PIC_MAX_IMG_H 48`, taulu keskitetään vapaaseen kaistaan); aiempi
"täytä koko seinä" -logiikka (v4.25: kehys 83–99 × 71–84) poistui käyttäjän pyynnöstä (*"kuva ei tarvitse
olla iso ja kehyksetkin 1–2 px"*). Memo `docs/bar-memo.md`.

**v4.25 – BAR-huoneen seinätaulu + hampurilainen 2/3 + mobiilisovitus.** Uusi kuva-aineisto
`assets/justiina.png` (315 × 261, 127 kt – repon ainoa rasterikuva): `BAR_PIC_SRC` + `new Image()`
moduulitasolla, `barPicReady`-lippu, `typeof Image` -tarkistus (headless-testit), varapinta jos kuva ei
lataudu; **ei uusia localStorage-avaimia**. `drawBarRoom()`: `BURGER_SCALE = 2/3` skaalataan pöydän pinnan
keskipisteestä → alaosa pysyy tarkalleen `y = 260` (80 × 68 → 53,3 × 45,3). Järjestys ylhäältä alas:
**taulu (mustat kehykset) → äidin lappu → ostorivi → hampurilainen**, asettelu lasketaan **alhaalta ylös**
(`infoBaseline`, `infoTop`, `noteY`, `picBand`). Mobiili/vaaka kuten jukebox v4.22: `winW`, `vs`, `needPx()`,
uusi `fitFs()` rajaa fontin pisimmän rivin mukaan.

**v4.24 – Talous- ja tasapainolukko.** Uusi sitova sääntö `.clinerules/04-economy-balance.md`
(ISO VAROITUS + lukitut arvot + pakollinen muutosprosessi) ja tausta `docs/economy-balance-memo.md`
(talouslooppi + käyttäjän pelitestihavainnot mittapuuna). Ristiviittaukset sääntöön 02 ja
`systemPatterns.md`:hen. **Ei koodimuutoksia.**

**v4.23 – Salainen kolikkopalkkio (testityökalu).** Vitoslamppu (x 720, `lamps[4]`) **20 potkua putkeen
→ +20 kolikkoa**, hiljainen (ei popuppia, ei ääntä, ei hiukkasia – vain `coinCount` + tallennus + HUD).
Nupit r. ~170–184: `COIN_CHEAT_LAMP 4`, `COIN_CHEAT_KICKS 20`, `COIN_CHEAT_REWARD 20`,
`COIN_CHEAT_GAP 120` (2 s), `COIN_CHEAT_COOLDOWN 3600` (60 s). Putki nollautuu toisesta lampusta /
tauosta > 2 s / palkkiosta / `closeGame()`-resetistä; cooldownin aikana potkut eivät kerrytä putkea.
Putkilaskuri on **ennen** `kickCount >= 5` -haaraa, joten avain-cheat (5 potkusta → kaikki avaimet +
koko valorivi) säilyy ennallaan. Ei uusia localStorage-avaimia.

**v4.22 – Jukebox-huoneen tekstit selkeiksi + syntymäpaketti 2 kolikkoa.** Juurisyy oli kiinteä 800 px
asettelu: sisältö sovitetaan nyt `winW = clamp(viewW, VIEWW_MIN, WORLD_W)` -ikkunaan keskitettynä x = 400
(paneeli ≤ `winW − 24`), yksi tumma paneeli, `shadowBlur = 0`, ei `rgba`-tekstivärejä, fonttikoko
`needPx()`-skaalauksella, kaappi vain kun `winW >= 620`, `♪JUKEBOX` 9 px + ääriviiva, tilateksti
"Soi loppuun asti – valinta lukossa". `gameState.js`: `defaultState.inventory.coinCount 0 → 2`
(5 🍔 ohella) – tallennettu saldo voittaa aina, ei ilmaista rahaa reloadilla.

**v4.21 – Jukebox-nuolet oikeinpäin + taustamusiikiksi syntikkalooppi.** `▲/W = jukeSel − 1`,
`▼/S = jukeSel + 1` (rivi 0 = "ei valintaa" on listan ylimmänä). `audio.js` kytkin
**`MUSIC_SOURCE 'synth'`** (oletus): rummut + basso + särökitara + melodia, satunnainen BPM 110–142,
30 s soittoa (`SYNTH_PLAY_DURATION`) + 0,6 s häivytys + 30–90 s tauko → sykli 60–120 s; `running.mp3`
ei palaa (tekijänoikeudet).

**v4.20 – Jukebox-talo (talo 5 / `buildings[4]`, ovi x 410).** 1. potku sytyttää ikkunat
(`smallHouseLights[4].lit`, 20 s) → 2. potku avaa huoneen, 1 kolikko = **koko kappale**. `JUKEBOX_TRACKS`:
`Knived - Our Song`, `Knived - Unafraid`, `Knived - Unafraid (inst.)`; valinta 0–3 (0 = ei valintaa eikä
maksua), soidessa valinta lukossa, kappale soi loppuun. Kappale peruuttaa taustasyklin (`cancelCycle()`),
tausta palaa `JUKEBOX_GAP` 2,5 s jälkeen; `killPlayer`/`stop()` pysäyttää jukeboxin. Äänet `jukebox/`
3 × 128 kbps mp3 (≈ −13,5 LUFS, masterit `D:\AI\Knived`). Neonkyltti kiinni yläkarmissa (ulkolaatta
dy −19…−3). 1/5 arpa ei enää tavoitettavissa talossa 5. Memo `docs/jukebox-memo.md`.

**v4.18 – Taustamusiikista vain 30 s + häivytys.** `SONG_PLAY_LIMIT 30000`, `SONG_FADE_OUT 600`,
`MUSIC_VOLUME 0.05`, `songPlayLength()`, `fadeOutSong()` (12 × 50 ms ramppi → 0); ajastin 29 400 ms,
`ended` vain turvaverkkona; `PLAY_DURATION`/`loadedmetadata` poistettu. Koko biisi (2:08) jää jukeboxiin.

## 📦 Vanhempi historia (tiivistetty, v4.17 → v3.28)

**v4.17 – siivous + nimet.** `commando_c64` pois git-historiasta (`git filter-branch`, `main`),
`bluemax_c64/` → `bm/`, `docs/bluemax.md` → `docs/bm.md`. Nimet: `Boulder Däsh` → **Dig Däsh**
(23 näkyvää tekstiä; sisäiset tunnisteet `boulderKeyCollected`, `BOULDER_KEY_COLLECTED`, `TILE.BOULDER`,
`SCORE_BOULDER_FALL` ja kansionimi `digGame2/` jäivät – *boulder*-sana tunnisteissa ei ole tavaramerkkiasia);
`Blue Max` → **Blue Mäx** (8 tiedostoa); `C64` → `dev`; `BOULDER DASH` → `Boulder Däsh`; bändi- ja
tuotemerkkiviittaukset pois kommenteista (melodia ennallaan). Git-commit-metatiedot jätettiin ennalleen
(käyttäjän päätös 20.9.2026).

**v4.16 – taustamusiikiksi `knived_unafraid.mp3`** (2:08, tekijän oma teos), kertasoitto, x2-toisto pois.

**v4.15 – oviukon isku dramaattisemmaksi:** kontaktista koko maailma jäihin 3 s (vinjetti + välähdys +
tärinä + tähdet), sitten pelaaja kosahtaa kasaan.

**v4.14 – oviukko (Avenger):** potkun pudotukseen 3. arvonta **1/8 + 30 s cooldown** → pelaajan kaksonen
astuu ovesta kynnykseltä (`doorCenter − 10`, jalat `GROUND_Y`), `AVENGER_SPEED 2.0` (> pelaaja 1.225 →
ei väistettävissä); osuma = tainnutus + **−1 🍔** (0 → kuolema), paluu ovelle. Uusi ääni `playKnock()`.

**v4.13 – ovikynnykset:** kynnyslinja + kynnyslaatta + yksi kivirivi + laskettu reunakivi; kiveys vain
`GROUND_Y+7…+14` (y 317–324), puolileveys = ovi + 5 px → autokaistat vapaat (suunnittelusääntö).

**v4.12 – BAR-ostot:** `▲/W` osta 1 (1 kolikko, katto 10) · `▼/S` peru viimeisin osto (vain vierailun
ostot, ei rahareikää) · `(o)/Space` poistu; reunanilmaisu estää toiston, tilateksti
`Ostit Xx🍔 hampurilaista!`.

**v4.11 – Hedelmäpeli kytketty katuun:** `handleAction()`issa oma oviblokki `buildings[6]`:lle **ennen**
potkusilmukkaa → `enterGame('fruitgame/game_main.html')`, aina auki; `enterGame()`in `iframe.onload`
lähettää `fruitSync`; `window._streetReturn` sai `fruitBet` (−1) ja `fruitWin` (+n, clamp) + saldo-echo.
Talon ilmainen pyöräytys 1 / 120 s pelin omassa avaimessa `pimeakatu_fruit_free`. Talon 6 potkuvalot ja
1/5-pudotus pois käytöstä.

**v4.10–v4.00 (lyhyesti):** v4.10 pimeiden ikkunoiden syvennys 3 rivin taloihin (tumma täyttö + 1 px
ylävarjo + vaalea alaparre) · v4.09 ikkunakehykset pois taaimmaisista taloista (`flatWindows`) ·
v4.08 mopo uusiksi (punainen runko + kuski pelaajan väreillä, tuulitärinä pois) · v4.07 syvyysskaalaus
`buildingScale()` 100/95/90 % (`buildingWindowRows()`), ovet skaalautuvat samalla · v4.06 kaukaisen
kaupungin siluetti (`BACKDROP_PARALLAX 0.4`, `BACKDROP_SCALE 0.5`) · v4.05 potkun viuhka-VFX ja käsien
heilunta pois liioiteltuina · v4.04 animaatio-juice (hengitys, potkun ennakointi `ANTICIP 0.2` + nojaus,
hit pause `HIT_PAUSE 2`, dynaaminen lampunvalo) · v4.03 hahmon pikseliviilaus (silmä + `lookY`, lipan/
kasvojen/leuan varjot, housut `#16265c`, maakosketusvarjo, `imageSmoothingEnabled = false`) ·
v4.02 puut huojuvat tuulessa (`drawBareTree(cx, baseY, h, swayX)`) · v4.01 toinen sähkökaappi talon 7
seinälle (`electricCabinets`) · v4.00 aloituspopup 4500 ms (`showNotification(text, durationMs = 2500)`) ·
v3.99 peliohjeet pois HUD:sta → popup vain oletustilassa (`showSpawnHint`).

**Vanhempi (v3.28–v3.98):** SFX-täysbändisoundi (v3.28) · hampurilaiset + BAR (v3.73) · mopoäänet (v3.81) ·
mustat puut (v3.82) + ruohotupsut (v3.83) · katu-kolikko 120 s respawn (v3.86) · sähkökaappi (v3.90) ·
mobiilikamera (v3.91) · potkukolikko 1/5 + 30 s cooldown (v3.93) · lampun viimeistely (v3.96) ·
BAR-kyltti (v3.97–v3.98).

**🍒 Hedelmäpeli (19.9.2026):** Vaihe 1 + debug-kierros 1 – debugissa korjattiin **`new FruitGame()`
puuttuminen** `DOMContentLoaded`ista (peli ei käynnistynyt lainkaan) ja canvasin 1:1-skaalaus
(`box-sizing: content-box`); protokolla validoitu headless (standalone + iframe-tila). Vaihe 2 = kytkentä
katuun (v4.11 ✅).

## 🔑 Säännöt (ladataan automaattisesti joka istunnossa)

- `01-general-architecture.md` – suojatut päätiedostot (`index.html`, `gameState.js`, `street.js`, `style.css`),
  alipelien itsenäisyys, ei npm-riippuvuuksia (vanilla JS/CSS/HTML).
- `02-game-core.md` – suojatut pelitiedostot (`physics/constants/game/levels/enemies/input`) + suojatut
  mekaniikat; **talous ja palkkiotase 🔒 LUKITTU**.
- `03-versioning.md` – +0.01 koodimuutoksesta; ei automaattista committia eikä pushia; raportti lyhyesti.
- `04-economy-balance.md` – 🔒 talous- ja tasapainolukko + ISO varoitus (ei säätöjä ilman erillistä pyyntöä).
- `05-kevyt-polku.md` – yhden näkymän/staattinen muutos: ei testejä, ei muistipankkia, raportti 1–3 riviä.
- `docs/`-memot: `bar-memo.md`, `jukebox-memo.md`, `fruit-game-memo.md`, `economy-balance-memo.md`,
  `dig-game-memo.md`, `bd-memo.md`, `bd-cleanup.md`, `bm.md`, `plan.md`.

## ⚙️ Nupit (säädettävät parametrit)

- **Oviukko:** `AVENGER_CHANCE 0.12` (1/8) · `AVENGER_COOLDOWN 1800` (30 s) · `AVENGER_SPEED 2.0` ·
  `AVENGER_STUN 600` (360 = 6 s) · `AVENGER_FREEZE 180` (3 s) · `AVENGER_TELEGRAPH 21` · `AVENGER_HIT_R 18` ·
  `AVENGER_KIND 'twin'`.
- **Musiikki:** `MUSIC_SOURCE 'synth' | 'mp3'` · `MUSIC_FILE 'knived_unafraid.mp3'` ·
  `SYNTH_PLAY_DURATION 30000` · `SONG_PLAY_LIMIT 30000` · `SONG_FADE_OUT 600` · `MUSIC_VOLUME 0.05` ·
  tauko `getSilenceDuration()` 30–90 s · `JUKEBOX_GAP 2500` · `JUKEBOX_VOLUME = MUSIC_VOLUME`.
- **Testicheatit:** `COIN_CHEAT_LAMP/KICKS/REWARD/GAP/COOLDOWN` = 4/20/20/120/3600 · avain-cheat 5 potkua
  (`lamps[4]`).
- **Ovikynnykset:** `THRESH_RINGS`, `THRESH_TOP_Y`, `THRESH_DIP`, `THRESH_DETAILS`, `THRESH_LIGHT`,
  `KERB_GAP_EXTRA`, laatan korko (`slab.h`).
- **Notifikaatiot:** `showNotification(text, durationMs = 2500)` + 0,5 s fade; `showSpawnHint` 4500 ms.

## 🔒 Lukitut osa-alueet

- **Tekstit:** dialogit, overlayt, HUD-bar, notifikaatiot, lamppujen labelit, ovet – ei muutoksia ilman
  erillistä pyyntöä.
- **Pelien välinen logiikka:** DG1 → DG2 → Blue Mäx, avaimet, `postMessage`-viestit, paluu kadulle – LUKITTU.
- **`inventory`-objekti** (`coin`, `coinCount`, `hamburgerCount`) – ei muokata ilman pyyntöä.
- **Talousarvot** (kolikot, 🍔, RTP, hinnat) – sääntö 04.
- **Sisäiset tunnisteet ja avaimet:** `digKeyCollected`, `boulderKeyCollected`, `bmKeyCollected`,
  `TILE.BOULDER`, `pimeakatu_gamestate`, `pimeakatu_fruit_free` – rajapintaa, ei uudelleennimeämistä.

## 🔜 Seuraavaksi (odottaa käyttäjän päätöstä)

- **Blue Mäx:** TESTIMODE pois → vihollisten ammunta takaisin 60 % aggressiolle.
- **Pääsiäismunat Dig Däshiin.**
- **Nälkäajastin jäihin iframen ajaksi** (`street.js` suojattu → vaatii luvan): `hamburgerTimer` ei tikitä,
  kun `#game-iframe-overlay` on `active` → estää näkymättömän kuoleman ja kesken pyöräytyksen hukkuvan panoksen.
- **Hedelmäpelin avoimet säädöt:** RTP-presetit (A 74 % / **B 78,5 % oletus** / C 85 %), panosvalitsin
  1/2/5, symboligrafiikan hienosäätö. Testaus: `fruitgame/game_main.html?coins=100` / `?debug`.
- **Jukebox:** `jukebox/Knived_Unafraid_instrumental.mp3` on sama äänite kuin `knived_unafraid.mp3` (128,05 vs 128,02 s)
  → raita 3 voisi osoittaa juuritiedostoon (~2 MB säästö).
- **Jatkoideat (ei tehty):** potkun 1 px screen shake · pää ja nyrkit recteinä `arc()`:n sijaan ·
  hengityksen syvyys 2 px / hitaampi sykli.

## ⚠️ Huomiot

- **Kadun talous – mekaniikat, eivät paperilukuja:** katukolikko näkyvissä 10 s (`despawnTimer 600`) →
  30 s tauko (`despawnCooldown 1800`) → uusi satunnaispaikka (x 0–780, y 310–380); kadun ylitys ~10,6 s →
  kolikko ehtii kadota nenän edestä. Keräysalue osuu autokaistoille (kaistat y 328 ja 340; turvassa
  `player.y ≥ 347`). Menot: nälkä 1 🍔 / 40 s + auto-osuma −1 🍔 + sähköisku −1 🍔 (10 s tainnutus) +
  kukkaruukku −1 🍔. **Tasapainoa ei todisteta laskemalla – se testataan pelaamalla.**
- **Huoneet mobiilissa:** canvas on vain `viewW` (260–800) leveä ja kamera keskittää huoneen
  (`camX = (800 − viewW)/2`) → sisältö sovitetaan näkyvään ikkunaan (ks. `systemPatterns.md`).
- Pään ympyrä (arc r = 7, `py+6`) peittää paidan ylimmät rivit → pään/kaulan varjostus vasta `py+13`.
- `handleAction()` palaa heti osumasta → hit pause asetetaan haaroissa, `actionJustPressed` nollataan
  framen lopussa (ei tuplapotkua). `KICK_DURATION` ja törmäyslogiikka ennallaan.
- `street.js` `lamps[].label` on **kuollutta dataa** – kadun kyltit eivät näytä pelien nimiä (vain BAR
  piirretään erikseen).
- **Headless-validointi** onnistuu Node `vm` + Proxy-canvas-stub -tekniikalla (rAF ohjattavissa);
  testiskriptit `%TEMP%\*.cjs` – ei repossa (luettelo `progress.md`:ssä).
- Pääportaalin mobiiliohjain: `position: absolute`, `opacity: 0.65`, landscape overlay, D-pad + ⚡.
- Julkaisu: GitHub Pages `https://teppoaland.github.io/pimeakatu/`.


