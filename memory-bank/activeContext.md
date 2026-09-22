# 🎯 Aktiivinen konteksti

> **Kevyt:** Vain tämä tiedosto luetaan session alussa.
> **Kompaktoitu 20.9.2026 (v4.26):** vanha versiokohtainen yksityiskohtaselostus (v3.9x–v4.25) poistettu –
> täysi sisältö on git-historiassa (viimeisin täysi versio commitissa `ffb1dd9`; sitä uudemmat v4.27+ alla).

---

## 📌 Kommunikaatiosääntö (KÄYTTÄJÄN PYYNTÖ)

> **"Lue membank"** → lue muistipankki hiljaa itseäsi varten. **ÄLÄ anna yhteenvetoa.**
> **🚫 Älä committaa automaattisesti** (20.9.2026) → muutokset jäävät työpuuhun, jotta käyttäjä näkee ne
> VS Coden GIT-ikkunassa ja voi katsoa diffin. Commit vain pyynnöstä (esim. "commit"), push vain erikseen.
> **✂️ Ei pitkiä yhteenvetoja** → raportti 2–5 riviä: mitä muuttui + lopputulos.

---

## 📍 Nyt

- **Versio:** `v4.70` (`index.html` → `#version-tag`) · **Git:** v4.47–v4.49 committattu ja
  pushattu 21.9.2026 (`db52af6`, origin/main) · **työpuu:** v4.70 (🍔-määrä vaikuttaa vauhtiin) +
  v4.69 (kaivo: 1/3 → **1/6** putoamisista
  +3 🪙 – pelkkä parametrin säätö, **ei versionnostoa**) +
  v4.68 (rosvo: vie kaikki rahat) +
  v4.67 (rosvo: yllätys + katoaminen) + v4.66 (rosvo) + v4.65 (kuun rata) + v4.64 +
  v4.55 (manuaalisivu) + v4.54 + v4.53 + v4.52 + v4.51 + v4.50 + samat aiemmat työpuun muutokset.
  (Huom: membank oli jäljessä – `activeContext` sanoi v4.55, mutta koodi oli jo v4.64.)
- **🍔-määrä vaikuttaa kävelyvauhtiin (v4.70, käyttäjän pyyntö 23.9.2026):** *"3 =< nykyisestä 2/3
  nopeus · 3 > nykyinen nopeus · 8–10 tuplanopeus"*. Uusi `hungerSpeedMult()` (`street.js`, nupit
  `HUNGER_SPEED_SLOW_MAX 3` / `FAST_MIN 8` / `SLOW_MULT 2/3` / `FAST_MULT 2`):
  **≤3 🍔 → 2/3** · **4–7 🍔 → 1,00** (nykyinen) · **8–10 🍔 → 2,00**. Koskee vain pelaajan liikettä:
  `moveSpeed = PLAYER_SPEED * hungerSpeedMult()` (vaaka `player.vx`, pysty `player.y`) sekä
  kävelyanimaation ja askeläänen tahtia (`walkTimer`) → jalat eivät liu'u. **Vihollisten nopeudet
  ennallaan** (oviukko `AVENGER_SPEED 2.0`, rosvo 1.05) → 8–10 🍔:llä oviukon voi karistaa karkuun –
  käyttäjän hyväksymä palkinto täydestä vatsasta. **Talouslukko ennallaan** (2400 framet, katto 10,
  BAR, jukebox, RTP, syntymäpaketti); ei uutta localStorage-avainta eikä `gameState.js`-muutosta.
  Testityökalu `?burgers=N` pakottaa vain vauhtilaskennan (ei tallenna). Sääntö 04 + memo päivitetty.
  **Ei committia.**
- **🔪 Oviukko hidastettu ½:een (parametrin säätö 23.9.2026, ei versionnostoa):** `AVENGER_SPEED
  2.0 → 1.0`. Pelaaja luulee pääsevänsä karkuun, mutta katu on rajattu (800 px) → laidalla oviukko
  nappaa ("jahtaa kuvaruudun laitaan asti ja antaa turpaan"). Nälkäisenä (≤3 🍔 = 0,82) se tavoittaa
  jo avoimella kadulla. Huoneet ja sanomalehti jäädyttävät sen edelleen – käyttäjän linjaus:
  *"Vain ½-nopeus – ei muita muutoksia"*. Korvaa v4.70-bulletin maininnan "oviukko 2.0"; rosvo 1.05
  ja talouslukko ennallaan. **Ei versionnostoa** (sääntö 03: vihollisen nopeus = asetusarvo),
  **ei committia.**
- **🕳️ Kaivoon putoaminen voi tuottaa rahaa, mutta harvemmin (parametrin säätö 23.9.2026):** *"vain joka 1/6
  kun kaivoon putoaa voi saada rahaa."* Plussakerroin pienennettiin `MH_BONUS_CHANCE 1/6`:
  osuessa **+3 🪙** (`MH_BONUS_COINS`) + kolikon pling (`playCoin()`) + kultahiukkaset reiästä;
  muuten menetys kuten v4.52 (enintään −2 🪙: 3 → 1, 2 → 0, 1 → 0, 0 → ei mitään). Yksi arpa per
  putoaminen, ei uutta tekstiä/ilmoitusta eikä uutta localStorage-avainta. Odotusarvo putoamista
  kohden: 0 🪙 → **+0,50** · 1 🪙 → **−0,33** · 2+ 🪙 → **−1,17** (menetys = `min(rahat, 2)`) →
  selvä menetys, kun rahaa on vähintään 1 🪙. **Muut lukitut arvot ennallaan**
  (2400 framet, katto 10, BAR, jukebox, RTP, syntymäpaketti, rosvo v4.68, MH_COIN_COST 2). Sääntö 04 + memo
  päivitetty. **Ei versionnostoa (parametri), ei committia.**
- **🔪 Rosvo yllätysesiintymisenä (v4.67, käyttäjän pyyntö):** rosvo **ei ole kadulla koko ajan** –
  se ilmestyy **yllätyksenä satunnaiseen kohtaan** vasta kun pelaaja **palaa kadulle
  pelistä/jukeboxista/BARista** (`trackHiddenStreet()` → `maybeSpawnRobber()`; nupit
  `ROBBER_APPEAR_CHANCE 0.4` · `ROBBER_COOLDOWN 1500` (~25 s) · `ROBBER_MIN_DIST 130 px` ·
  `ROBBER_TTL 900` (~15 s elinikä)). Kävelee kohti pelaajaa jalkakäytäväkaistalla (jalat
  `GROUND_Y..GROUND_Y+16`, ei tielle). **Kiinniotto vain kun pelaajan jalat samalla kaistalla ja
  rosvo lähellä** → `knockPlayerDown()` (tainnutus + **−1 🍔**, 0 → kuolema). **Rosvo katoaa
  nappauksen jälkeen** (ja ttl:n loputtua) → **väistö/välttely onnistuu**: loiki kadun toiselle
  puolelle (↓) tai juokse karkuun (rosvo 1.05 < pelaaja 1.225) eikä se jää jahtaamaan toistuvasti.
  Spawn ei enää initissä. **Talous (sääntö 04, käyttäjän pyyntö v4.68):** rosvo vie **−1 🍔 +
  kaikki kolikot** (`coinCount → 0`, **ei ilmoitusta** – sääntö 06: pelaaja huomaa itse) – muilla kadun vaaroilla
  vain −1 🍔. Muut lukitut arvot (2400 framet, katto 10, BAR, jukebox, RTP, syntymäpaketti)
  ennallaan. Ei uutta localStorage-avainta. **Versio `v4.68`, ei committia.**
- **🌙 Kuu liukuu vasemmalta oikealle yön aikana (v4.65, käyttäjän pyyntö):** satunnainen
  `rollMoonX()`/`state.moonX` poistettiin – kuu alkaa aina vasemmasta laidasta
  (`MOON_X_MIN` 400) ja etenee ajan mukaan oikealle **myös huoneissa ja alapeleissä** (aika kuluu),
  kunnes laskeutuu kokonaan pois oikean reunan yli (`MOON_SET_X ≈ 884`). Laskeutuessaan se
  pimentää maisemaa hiukan (`moonDark` 0 → `MOON_SET_DARK_ALPHA 0.15`, alkaa `MOON_SET_START 0.60`).
  Uusi yö (Nuku) ja spawn/init nollaavat kuun (`resetMoon()`: `moonNightClock 0`,
  `moonX = MOON_X_MIN`, `moonDark 0`). Ei talousmuutoksia (sääntö 04), ei uutta localStorage-avainta,
  `state.moonX` poistui käytöstä. Nopeus `MOON_NIGHT_FRAMES 14400`. **Versio `v4.65`, ei committia.**
- **📐 Sanomalehden manuaalisivu (v4.55, 21.9.2026, käyttäjän pyyntö):** lehden **5. sivu
  `MANUAALI`** näyttää rahavirran ASCII-piirroksena (kadun tulot → käytön kohteet → paine).
  Kaksi piirrosversiota: `NEWS_MANUAL_WIDE` (64 merkkiä, PC/vaaka) ja `NEWS_MANUAL_NARROW`
  (40 merkkiä, pystykännykkä); `newsLayout()` valitsee sen, jolla teksti on ruudulla isompi
  (fsW = `rowW / 0.6·cols`, fsH = tekstialan korkeus / rivit) ja piirtää sen **merkki kerrallaan
  kiinteälle ruudukolle** (cellW = `measureText('M')`) → reunat pysyvät kohdakkain myös emojien
  kanssa (`Array.from` = emoji on yksi solu). Piirros piirretään omalla fonttikoolla
  (`scr.art = { fs, cellW, lineH, cols, top, lines }`) ja keskitetään sekä vaaka- että
  pystysuunnassa. Rivit validoitu 64/46 merkkiin (`%TEMP%\np-verify.cjs`), px-generaattori
  `%TEMP%\newspaper-art.cjs` (rakentaa laatikot tarkalleen kohdakkain – käytä tätä, jos
  piirrosta muokataan). Sivumäärä 5 → lehden alatunniste näyttää `SIVU 5/5`. Ei talousmuutoksia
  (sääntö 04), ei uutta localStorage-avainta. Versio `v4.55`, ei committia.
- **🚗 Liikenne jatkuu sanomalehteä lukiessa (v4.54, 21.9.2026, käyttäjän pyyntö):** lukutila ei
  enää jäädytä liikennettä – ajoneuvolohko (liike, spawnit, törmäys) eristettiin omaksi
  funktioksi **`updateTraffic(dt)`** (r. ~1162) ja sitä kutsutaan sekä kadulla (r. ~1890) että
  `newsRoom`-haarassa (r. ~1542). Osuma lukiessa = **lehti putoaa kädestä**
  (`closeNewspaper()`) ja pelaaja kaatuu kadulle: tainnutus + **−1 🍔** (0 🍔 = kuolema)
  täsmälleen kuten ennenkin → **talouteen ei uusia arvoja (sääntö 04 ennallaan)**.
  **Fair-play-varoitus:** lehden ylätunnisteen vasen teksti vaihtuu vilkkuvaksi
  `⚠ VARO AUTOA – liikenne ei pysähdy!`, kun kadulla on ajoneuvo (`vehicles[0] || vehicles[1]`),
  joten lukija ehtii sulkea lehden. Turvassa ovat kaistojen välinen rako ja aidan juuri
  (samat rajat kuin ennen); lehteä ei voi poimia tainnutettuna. Muu maailma on yhä jäissä
  lukiessa (kolikot, kaivot, sää, eläimet). Versio `v4.54`, ei committia.
- **📰 Sanomalehti kadulla (v4.53, 21.9.2026, käyttäjän pyyntö):** kadulla lojuva lehti
  (`foreground.newspaper`, siirretty rauta-aidan aukkoon `x 338–352` – kauas ovista eikä enää
  aidan takana) **poimitaan toimintonapilla** (`nearNewspaper()`, säde 26 px; `handleAction()`in
  ensimmäinen haara) → **`newsRoom`**: vaalea paperiarkki + tumma teksti, jossa pelin peliohjeet
  **4 sivuna** (`NEWSPAPER_PAGES`; katu, uni/valo, talojen pelit, rahapeli).
  Ohjaus (käyttäjän valinta): **▲/▼ = edellinen/seuraava sivu** (ei kierrä yli) ·
  **Space (⚡) = seuraava sivu, viimeisellä sivulla poistuu kadulle** · **(o)/Enter = poistu heti** ·
  **✕ = sulje** (`closeRoom`). Kadulla pieni vihje `⚡ = lue` (`drawNewspaperHint()` pelaajan päälle).
  Teksti **sanakääritetään ja sivutetaan** näkyvään ikkunaan (`newsLayout()`, `winW`/`vs`/`needPx`,
  tulos välimuistissa) → luettavissa myös kännykällä, ei leikkaudu millään näytöllä.
  **Lukeminen on ilmaista eikä muuta taloutta (sääntö 04)**; nälkä kuluu myös lukiessa
  (v4.49/v4.50) ja 🍔 0 sulkee lehden kuolemaa varten (`insideHiddenState()` / `closeRoom()`).
  Päivä/yö-liuku pysähtyy lukemisen ajaksi; `trackHiddenStreet()` **ei** muutu (ei viemärin
  uudelleenarpoa). Ei uutta localStorage-avainta, `gameState.js` ennallaan. Versio `v4.53`
  (liikenne lukiessa: v4.54), ei committia.
- **🕳️ Avoin viemärinkansi / kaivo (v4.51/v4.52, 21.9.2026):** kadun 2 viemäristä (`foreground.manholes`,
  x ≈ 215 ja ≈ 585) toisesta voi puuttua kansi → kohta on **musta reikä** (`drawManholeHole()`).
  Siihen astuva pelaaja **putoaa alas (katoaa)** ja **köpii takaisin ylös** reiän keskeltä
  (pudotus ~0,6 s, nousu ~3,5 s). **Menetys (v4.52): enintään −2 🪙** (`MH_COIN_COST`:
  **3 → 1, 2 → 0, 1 → 0, 0 → ei mitään**); ei 🍔-menetystä, ei kuolemaa eikä tainnutusta. Arvonta **1/6** pelin
  alussa ja **1/10** joka kerta kun huone tai alapeli sulkeutuu (`trackHiddenStreet()`; kansi voi
  myös palata paikalleen). Putoaminen on **reunaehtoinen** (jalkapiste siirtyy ellipsiin
  `MH_HIT_RX 11` / `MH_HIT_RY 5`), joten kansi saa kadota jalkojen altakin ilman pakkoputousta – ja
  reiän voi kiertää. Tila vain muistissa (ei uutta localStorage-avainta). Testityökalut `?hole=1` /
  `?hole=2` / `?hole=0`. Koodi: `street.js` (`MH_*`, `rollManholeState`, `maybeRerollManholeState`,
  `startManholeFall`, `updateManholeAction`, `drawManholeHole`, `drawManholeSteam`,
  `drawManholeOverlay`, `drawPlayerManhole`). Sääntö 04 + `docs/economy-balance-memo.md` päivitetty,
  versio `v4.52`, ei committia.
- **🍔 Nälkä kulkee kaikkialla + kuolema myös sisällä (v4.49/v4.50, 21.9.2026):** nälkäblokki
  siirrettiin `update()`in alkuun (kuolemasekvenssin jälkeen) → 🍔 kuluu myös **BAR:ssa,
  jukeboxissa ja iframe-peleissä** kuten kadulla. **Syy (v4.49):** blokki oli huoneiden `return`ien
  jälkeen, ja `closeGame()` teki `hamburgerTimer = 2400` → jokainen alapelistä poistuminen täytti
  40 s. Jäissä **vain** nukkuessa (`hungerOnHold`) ja kuolleena.
  **v4.50-korjaus:** v4.49:n "siirretty kuolema + 10 s armoaika" osoittautui vääräksi (0 🍔:lla
  saattoi olla huoneessa/pelissä loputtomiin) → `starvingOnExit`/`checkStarvingOnExit` **poistettu**.
  Kun 🍔 = 0, kuolema laukeaa **heti paikasta riippumatta**; `leaveHiddenStateForDeath()` sulkee
  ensin alapelin (`closeGame()`) tai canvas-huoneen (`closeRoom()`), joten pelaaja romahtaa
  **näkyvästi kadulle** → tuttu 3 s kuolinanimaatio + resetti. `closeGame()` ei enää muuta
  tallennettua 0 🍔:ää 5:ksi. **Käyttäjän linjaus:** *"pelaajan tulee aina huolehtia, että
  hampurilaisaldoa riittää paitsi nukkuessa."* **Lukitut arvot ennallaan:** 2400 framet (1/40 s),
  katto 10, hinnat, RTP (sääntö 04 + memo päivitetty). Validoitu
  `%TEMP%\street-hunger-scope-test.cjs` (25 tarkistusta, 0 löydöstä). Versio `v4.50`, ei committia.
- **✕-nappi korjattu (v4.48, 21.9.2026):** sama `handleCloseButton()` (`index.html`) palvelee **molempia**
  ✕-nappeja (`#reset-btn` kadulla/huoneissa, `#iframe-close-btn` iframe-overlayn päällä). Järjestys:
  (1) iframe auki (`#game-iframe-overlay.active`) → `Street.closeGame()` = takaisin kadulle,
  (2) canvas-huone auki → `Street.closeRoom()` (BAR / makuuhuone / jukebox),
  (3) vasta kadulla → `confirm()` + localStorage-tyhjennys + reload. **Syy mobiiliongelmaan:** napautus
  (touchend + synteettinen click) ehti laueta kahdesti ja/tai ghost-click osui samaan kohtaan jäävään
  reset-✕:ään heti kun huone/overlay sulkeutui → toinen laukaisu näki "ei mitään auki" → reset.
  Nyt: **600 ms dedupe-suoja** (`CLOSE_DEDUPE_MS`), napautus hoidetaan `touchend`illa
  (`preventDefault`, `passive:false`) eikä synteettistä clickiä enää synny, ✕-napeille
  `touch-action: manipulation` ja mobiilissa isommat kohteet (reset 46×46, iframe-✕ 52×52).
  `closeGame()` palauttaa nyt `true/false` ja lukee tallennetun tilan vain jos tallennus on olemassa
  (estää "nollautuminen" jos localStorage ei ole käytettävissä). Versio `v4.48`, ei committia.
- **Testaus:** v4.39–v4.42 käyttäjän testaus OK ("Tuli hieno" – led-valot syttyvät naksahdellen,
  vanhat lamput olivat dramaattisempia). **v4.43 odottaa käyttäjän testausta** (sääntö 05):
  makuuhuoneen oven pitää aueta ilman avaimia ja lamppua sekä yöllä (`?day=0`) että päivällä (`?day=1`).
- **Katuvalot (v4.42):** kun yö on laskeutunut **täyteen** (`dayT === 0`) ja pelaaja on jo edennyt
  (`state.isDay === false` = päivä/yö on ratkaistu ja Nuku vei yöhön – avaimet tai v4.43:n vapaa
  makuuhuone), katuvalot **syttyvät itsestään
  yksi kerrallaan** vasemmalta oikealle (~0,3 s väli; `NIGHT_LAMP_FIRST 30`, `NIGHT_LAMP_INTERVAL 18`,
  `NIGHT_LAMP_ORDER 'wave'`) + pehmeä syttymisnaksahdus (`playLampOn()`) ja kipinähiukkaset lampussa.
  Uudessa pelissä (`isDay === null`) ja sivunlatauksessa yöllä valot pitää yhä **potkia itse**
  (`nightShowArmed` herää vain aidosta päivä→yö-siirtymästä). `kickCount` **ei kasva** → avain-cheat
  (5 potkua), 20 potkun kolikkopalkkio ja ylikuumeneminen ennallaan; talous ennallaan (sääntö 04).
  Näytös pysähtyy huoneissa/iframeissa ja tallentaa tilan per lamppu. Seuraus: yöllä ovet aukeavat
  ilman potkua **vasta kun päivä/yö on ratkaistu**. Testityökalu `?day=0` näyttää efektin heti.
  **Käyttäjän testaus 20.9.2026: "Tuli hieno" – sopivasti pikkuisen liioiteltu; syttymisnaksahdus on
  terävämpi kuin vanhojen dramaattisten lamppujen (led-ajan valot) → hyväksytty.**
- **Makuuhuoneen ovi auki (v4.43) + 🍔-palkkio (v4.44):** talo 7:n makuuhuoneeseen pääsee **aina** – ei 3 avainta eikä
  lamppua, päivällä ja yöllä (kuten BAR). `handleAction()` avaa huoneen oven edestä; sama tila ohjaa
  oven ulkoasua (`drawDoor()`) ja kynnysvaloa (`drawThresholdPaving()`), ja avainpopup ("Ei tänne
  pääse ilman avainta") poistui tästä ovesta. Käyttäjän pyyntö 20.9.2026: *"Vapauta ovi, että ei
  tarvi 3 avainta että pääsee nukkumaan. Pitähän sen pelaajan itse voida päättää milloin haluaa
  nukkua."* Talous ennallaan (sääntö 04). **Seuraus:** nukkua voi heti ensimmäisenä yönä →
  `state.isDay` voi ratketa ennen avaimia (v4.32:n auringonnousu ei enää laukea sen jälkeen);
  huone on nyt myös vapaa paikka pitää nälkä jäissä (v4.41).
**Nuku → +1 🍔** (katto 10, v4.44, käyttäjän pyyntö 21.9.2026).
- **Nukkuminen (v4.41):** nälkä on **jäissä** makuuhuoneessa ja Zzz-pimennyksen ajan
  (`hungerOnHold()`) → pelaaja ei voi kuolla nukkuessaan; herätessä ajastimelle jää vähintään
  `HUNGER_WAKE_GRACE 600` (10 s). Rajaus: **vain nukkuminen** – muualla (BAR, jukebox,
  iframe-pelit) nälkä tikittää ennallaan.
- **Jukeboxin monivalinta (v4.46, 21.9.2026):** jukebox-huoneessa (talo 5) voi nyt valita **useamman
  kappaleen** ja valitut soitetaan poistuttaessa **yksi kerrallaan (1 → 3)**. Ohjaus: **▲/▼ = kursori**
  (rivi 0 = **Poistu**, rivit 1–3 = kappaleet) · **(o) / Space / ⚡ = ota kappale listalle tai poista se** ·
  **Enter = soita valitut & poistu** mistä tahansa riviltä · rivillä 0 sama nappi kuin Enter ·
  **kun jono soi jo** (valinta lukossa), Space/(o)/⚡ ja Enter vain poistuvat huoneesta ·
  **✕-nappi = peruuta** ilman veloitusta. Valittu rivi näkyy violetilla + `✓ 1 🪙`, Poistu-rivillä `▶ n kpl`.
  **Talous ennallaan (sääntö 04):** 1 🪙 / kappale, veloitus vasta poistuttaessa, niin moneen kuin kolikoita
  riittää (`💰 Ei kolikoita kaikkiin – soitetaan 2/3`); äänen puuttuessa kaikki veloitetut palautetaan.
  `audio.js`: uusi `playJukeboxQueue(urls)` + `getJukeboxQueuePos()` (jono, `jukePos`); `ended` → seuraava
  heti, ja vasta viimeisen jälkeen `JUKEBOX_GAP` → taustamusiikki. `(o)`-näppäin luetaan **vain** jukebox-
  huoneessa (globaali action-mäppäys on ennallaan Space/Enter). Memo: `docs/jukebox-memo.md`.
  **Huom:** `%TEMP%`-testit (`street-jukebox-*`) odottavat vanhaa yhden valinnan mallia → päivitettävä.
- **Taivas (v4.41):** kuu ja aurinko **eivät liu'u** – kumpikin seisoo paikallaan omalla
  puolellaan ja vain häivytetään ristikkäin: yöllä kuu oikealla (`MOON_X 680`), päivällä aurinko
  vasemmalla (`SUN_X 140`); `dayT` ohjaa pelkkää alphaa. Yö → päivä häivyttää kuun pois ja tuo
  auringon näkyviin, päivä → yö täsmälleen toisinpäin.
- **Päivä (v4.40):** pilvet tummenevat päivällä – muoto ja määrä ovat yön ennallaan, väri liukuu
  `CLOUD_NIGHT_*` → `CLOUD_DAY_*` ja peittävyys `CLOUD_DAY_ALPHA 5×` (`dayT = 0` = entinen yökuva).
- **HUD (v4.39):** 🍔-ilmaisin vilkkuu punaisena heti kun `hamburgerCount <= HUNGER_WARN (3)` –
  3 on oikea syömisraja. **Käyttäjän testaus 20.9.2026: päivä ⇄ yö -vaihdos "toimii HELVETIN
  hienosti", "kylmät väreet" – hyväksytty (yön vaihtumisen testaus vielä kesken).**
- **Päivä (v4.38):** ovet aukeavat **ilman lampun potkaisua** kun `dayT >= 0.5` (`lampFreeOpen()`,
  `DOOR_NO_LAMP_AT_DAY`), moskiitot **häipyvät päivällä kokonaan** (`MOSQUITO_DAY_DIM 1`) ja
  **täydellä päivällä (`dayT === 1`) kaikki katuvalot sammutetaan kerran** (`dayLampsOff`) –
  ne voi silti potkaista päälle myös päivällä. Yöllä kaikki käytös on täsmälleen ennallaan.
  **Käyttäjän testaus 20.9.2026: "Tuli hienosti" – valot napsahtavat pimeäksi vasta kun pimeä on
  poistunut, "aivan kuin tosielämässä valoisuustunnistimet toimivat".**
- **Päivä (v4.37):** kadun ajoneuvovirta **tuplataan päivällä** (`TRAFFIC_DAY_MULT 2`, kerroin
  liukuu `dayT`:n mukana) – yöllä liikenne täsmälleen ennallaan.
- **Tila:** pääportaali + 4 alipeliä (`digGame1` ⛏️, `digGame2` 💎, `bm` ✈️, `fruitgame` 🍒) valmiit ja pelattavat.
- **Kadun canvas-huoneet (ei iframe):** **makuuhuone** (ex-palkintohuone, `buildings[7]`, Nuku/Poistu) · BAR (talo 9) ·
  jukebox (`buildings[4]`, ovi x 410) · hedelmäpelitalo `buildings[6]` (iframe).
- **Aukiolo (v4.34):** jukebox ja hedelmäpeli ovat auki **vain öisin** – päivällä (`dayT >= 0.5`)
  ovesta tulee sama teksti-popup kuin lukitusta ovesta: `Avoinna` / `Klo 20 - 06` (`CLOSED_SIGN`).
- **Päivä/yö (v4.33):** 3 avainta nostaa päivän kerran (`state.isDay` null → true, v4.32-käytös) →
  sen jälkeen **makuuhuoneen Nuku vaihtaa päivä ⇄ yö** ja tila on tallennettu; Poistu ei muuta mitään.
  Makuuhuoneen ovi on **aina auki** (v4.43: ei avaimia eikä lamppua; kolikkoreitti poistettu v4.33).
- **Aurinko:** valkoinen sisäkiekko poistettu; tasainen keltainen kiekko + lämmin hehku. Päivällä
  aurinko seisoo **vasemmalla** (`SUN_X 140`) ja yöllä kuu oikealla (`MOON_X 680`) – vain
  alpha-ristihäivytys, **ei liukua** (v4.41).
- **Lukossa:** talous (sääntö 04) ja inventaario · **vapaasti säädettävissä:** testityökalut
  (`COIN_CHEAT_*`, `?coins`, `?debug`, `?day=0` / `?day=1`, `MUSIC_SOURCE`, `bm`-debug).
- **Avoinna:** työpuu puhdas – v4.43 committattu ja pushattu (`e941778`) · muuten ks. "🔜 Seuraavaksi".

---

## 🆕 Tuoreimmat versiot (20.9.2026)

**v4.43 – Makuuhuoneen ovi auki ilman avaimia (ei lukkoa).** Talo 7:n makuuhuoneeseen pääsee nyt
**aina**: ei 3 avainta eikä lamppua, päivällä ja yöllä – täsmälleen kuten BAR. `handleAction()`in ehto
`lamp.bldgIdx === SLEEP_BLDG_IDX && allKeysCollected()` → `lamp.bldgIdx === SLEEP_BLDG_IDX`, joten
huone avautuu ennen `lamp.lit || lampFreeOpen()` -tarkistusta; kuollut avainpopup ("🚧 Ei tänne pääse
ilman avainta! Hanki kaikki kolme avainta.") poistui. Sama avoin tila ohjaa nyt oven ulkoasua
(`drawDoor()`in `sleepOpen`) ja kynnysvaloa (`drawThresholdPaving()`) → ovi näyttää aukeavalta ja
kynnys hehkuu myös yöllä ilman potkittua lamppua. Avainportit (Dig Däsh `digKey`, Blue Mäx
`boulderKey`), ensiauringonnousu ja koko muu katu ennallaan; **talous ei muutu** (Nuku/Poistu
ilmaisia, 2400 / katto 10 / hinnat / RTP). Käyttäjän pyyntö 20.9.2026: *"Vapauta ovi, että ei tarvi
3 avainta että pääsee nukkumaan. Pitähän sen pelaajan itse voida päättää milloin haluaa nukkua."*
Versio `v4.43`, ei committia.

**v4.41 – Nälkä jäihin nukkuessa + kuu ⇄ aurinko -ristihäivytys.** Kaksi pientä parannusta:
(1) `hungerOnHold()` (`sleepRoom || sleepPhase > 0`) pitää nälkäajastimen jäissä makuuhuoneessa ja
Zzz-pimennyksen aikana → **pelaaja ei voi kuolla nukkuessaan**; herätessä
`hamburgerTimer = Math.max(hamburgerTimer, HUNGER_WAKE_GRACE 600)` antaa vähintään 10 s aikaa
reagoida (ajastin ei nollaudu täyteen → ei ilmaista 40 s:ää eikä sängyssä käynnin hyväksikäyttöä).
Rajaus käyttäjän linjauksen mukaan: **vain nukkuminen** – BAR, jukebox ja iframe-pelit tikittävät
ennallaan. (2) Taivas: kuu seisoo yöllä oikealla (`MOON_X 680`) ja aurinko päivällä vasemmalla
(`SUN_X 140`) – **liukua ei ole**, vain alpha-ristihäivytys (`1 − dayT` / `dayT`), joten yö → päivä
häivyttää kuun pois ja tuo auringon näkyviin (ja päivä → yö toisinpäin). Y-koordinaatit ennallaan →
`dayT = 0` antaa bitilleen entisen yökuvan. Talouslukko: **ei lukittujen arvojen muutoksia** (kirjattu
sääntöön 04 + `docs/economy-balance-memo.md`:hen).

**v4.40 – Päivällä pilvet tummenevat.** Pilvijärjestelmä sai kaksi väriparia: yön
`CLOUD_NIGHT_CIRRUS [190,200,225]` / `CLOUD_NIGHT_HAZY [180,195,215]` (ennallaan) ja päivän
`CLOUD_DAY_CIRRUS [96,104,124]` / `CLOUD_DAY_HAZY [62,68,84]` (selvästi tummempi) sekä
peittävyyskertoimen `CLOUD_DAY_ALPHA 5`. `drawClouds()` liu'uttaa värin ja alphan `dayT`:n mukana,
joten pilvet tummenevat ja vahvistuvat saumattomasti kesken auringonnousun/-laskun; `dayT = 0`
antaa täsmälleen entisen yökuvan (ei regressiota). **Muoto, määrä, kaistale (y 40–80), tuuli ja
piirtojärjestys ovat ennallaan** → aurinko kuultaa pilvien läpi (alpha ≤ 0,25). Versio `v4.40`.

**v4.39 – HUD:n 🍔-varoitus kolmesta hampurilaisesta.** Uusi nuppi `HUNGER_WARN 3`:
`updateHUD()` käärii hampurilaiset `burger-warning`-luokkaan heti kun `hamburgerCount <= HUNGER_WARN`
(aiemmin raja oli 2) → olemassa oleva `burgerBlink`-animaatio (0,8 s, punainen) alkaa, kun jäljellä
on kolme – eli juuri siinä raja, jossa kannattaa käydä syömässä. `style.css` ennallaan. Versio `v4.39`.

**v4.38 – Päivällä ovet auki ilman lamppua + moskiitot pois päivältä.** Uusi `lampFreeOpen()`
(`DOOR_NO_LAMP_AT_DAY true`, raja `CLOSED_AT_DAYT 0.5`): päivällä `handleAction()` päästää sisään
ilman potkaistua katuvaloa (`if (lamp.lit || lampFreeOpen())`), ja sama ehto ohjaa oven ulkoasua
(`drawDoor()`in `isActive` ja kynnyksen valo), ettei ovi näytä lukitulta mutta aukea. Avainportit
(Dig Däsh `digKeyCollected`, Blue Mäx `boulderKeyCollected`), makuuhuoneen 3 avainta, BAR,
jukebox/hedelmäpelin yöaukiolo ja koko potkumekaniikka (ylikuumeneminen, 5/20 potkun cheatit)
ennallaan – öinen "💡 Sytytä lamppu ensin!" säilyy. Moskiitot (`drawLampPost()`) piirretään vain kun
`mosquitoDim = 1 - MOSQUITO_DAY_DIM * dayT > 0.01`: yöllä kerroin 1 (piirto bitilleen ennallaan),
täydellä päivällä 0. Lisäksi **täysi päivä sammuttaa katuvalot kerran**: kun `dayT === 1`,
`update()` nollaa kaikkien lamppujen `lit`-tilan ja tallentaa `state.litLamps`in (`dayLampsOff`-lippu,
joka nollautuu vasta `dayT === 0`) – lamppuun voi silti potkaista valot päälle myös päivällä.
Versio `v4.38`.

**v4.37 – Päivällä kaksinkertainen liikenne.** Kaistan spawn-laskuri kuluu nyt
`dt * (1 + (TRAFFIC_DAY_MULT - 1) * dayT)` (r. 1375): spawn-väli on yöllä 20–40 s/kaista
(ennallaan) ja täydellä päivällä **10–20 s/kaista** – kerroin liukuu auringonnousun mukana.
Kaistat, ajoneuvotyypit, nopeudet ja törmäykset ovat ennallaan (edelleen 1 ajoneuvo/kaista),
joten muutos on vain liikenteen tiheys. Nuppi `TRAFFIC_DAY_MULT 2` (3 = kolminkertainen).
Versio `v4.37`.

**v4.36 – Nukkumisen Zzz-efekti 3 s.** Nukkuminen jaettiin kolmeen nuppiin:
`SLEEP_DARK_FRAMES 45` (~0,75 s pimennys), `SLEEP_ZZZ_FRAMES 180` (itse Zzz ~3 s) ja
`SLEEP_FADE_FRAMES = 45 + 180` (~3,75 s yhteensä). Pimennys lasketaan **kuluneesta** ajasta
(`elapsed = SLEEP_FADE_FRAMES - sleepPhase`): aiempi kaava `1 - sleepPhase / SLEEP_FADE_FRAMES`
toi mustan kerroksen ja Zzzin mukaan vasta viimeisellä 0,75 sekunnilla – siksi Zzz "vilahti".
Zzz himmenee sisään pimennyksen tahdissa ja on täydellä kirkkaudella 0,75 s → 3,75 s.
Versio `v4.36`.

**v4.35 – Ajoneuvojen ajovalot sammuvat päivällä.** `drawVehicle()` sai nupin
`VEHICLE_HEADLIGHT_DIM 1` → `headlightDim = 1 - VEHICLE_HEADLIGHT_DIM * dayT` (sama liuku kuin
katuvaloissa). Auton ja mopon etuvalo + hehku sekä valokeila piirretään vain kun
`headlightDim > 0.01` (alpha = `headlightDim`); valokeila jää kokonaan pois kun `headlightOn`
on epätosi. **Takavalot, ambulanssin kattovilkku ja `hasHeadlight`-arpa ennallaan** –
pelimekaniikka ei muutu. Samalla siistittiin valokeilan turha sisäkkäinen `{`-lohko.

**v4.34 – Jukebox ja Hedelmäpeli auki vain öisin (klo 20–06).** Päivällä kummankin oven
action-painallus näyttää saman teksti-popupin kuin lukitusta ovesta (`CLOSED_SIGN =
'Avoinna\nKlo 20 - 06'`, `#notification`, 2,5 s) eikä huoneeseen/peliin pääse
(`handleAction` 1502–1526) – jukeboxin ovea ei päivällä myöskään potkita eikä valoja
sytytetä. Yöllä kaikki on ennallaan: potku → valot 20 s → huone, 1 kolikko = koko kappale.
Raja `dayT >= 0.5` (`CLOSED_AT_DAYT`) = sama kuin makuuhuoneen tilanvaihto, joten kyltti
ilmestyy/poistuu hämärtymisen keskellä. `style.css`: `#notification` sai
`white-space: pre-line` → `\n` on nyt rivinvaihto (myös "💡 Ovi on lukossa.\nSytytä lamppu
ensin!" rivittyy oikein). **Talousarvot ennallaan** – vain aukioloaika muuttui; kirjattu
sääntöön 04 ja memoihin (`economy-balance-memo`, `jukebox-memo`, `fruit-game-memo`).
Versio `v4.34`, ei committia.

**v4.33 – Talo 7: palkintohuone → makuuhuone (Nuku / Poistu) + päivä/yö vaihdettavaksi + aurinko siistitty.**
Pääsy: **vain 3 avainta** (kolikkoreitti poistettu käyttäjän pyynnöstä: *"3 avainta on se lukko tässä"*),
ja kun avaimet ovat koossa **ovi on aina auki ilman lampun sytytystä** (myös oven/kynnyksen valo-ulkoasu:
`drawDoor` 4452–4454, kynnysvalo 3275–3277). Vanha pokaali + "To be continued…" poistuivat: tilalla
`drawSleepRoom()` (ex-`drawDarkRoom`): **paksu sänky sivusta** (pääty, patja, tyyny, peitto, jalat),
tumma huone + ikkuna jossa kuu/aurinko tilan mukaan, paneelissa otsikko `MAKUUHUONE`, tila `Nyt: ☀️ Päivä`
/ `Nyt: 🌙 Yö` ja rivit **Nuku** / **Poistu** (▲/▼ valinta, `(o)`/Space/Enter/⚡ vahvistus) – sama
mobiilisovitus kuin jukeboxissa (`winW`, `vs`, `needPx`, paneeli ≤ `winW − 24`).
**Poistu ei muuta mitään.** **Nuku** = pimennys ~1,5 s (`SLEEP_FADE_FRAMES 90`) + "Zzz…" → tila vaihtuu
(`isDay = !(dayT >= 0.5)` → päivä → yö TAI yö → päivä) → tallennus → huone kiinni → liuku näkyy kadulla.
**Päivä/yö on nyt tallennettu:** `gameState.js` `defaultState` sai **`isDay: null`** (`null` = ratkaisematon,
`true` = päivä, `false` = yö). 3 avainta nostaa päivän **kerran** (v4.32-käytös säilyy, myös avain-cheatilla)
ja tallentaa `true`; sen jälkeen vain Nuku vaihtaa tilaa. `update()` liukuu **molempiin suuntiin**
(`DAY_FADE_FRAMES` nousuun, uusi `NIGHT_FADE_FRAMES` laskuun) ja odottaa kadulle paluuta kuten ennen
(`iframeOpen` / huoneet). Testityökalut: `?day=1` ja uusi **`?day=0`** (pakotettu tila, ei tallenna).
**Aurinko:** valkoinen `#fff6c4`-sisäkiekko poistettu ja hehku lämmitetty keltaiseksi
(`rgba(255,224,120,.55)`) – ei enää valkoista palloa.
**Talous:** vain yksi kolikoiden käyttökohde poistui (3 kolikkoa taloon 7); nukkuminen on ilmaista →
kirjattu sääntöön 04 + `docs/economy-balance-memo.md`:hen. Versio `v4.33`, ei committia.

**v4.32 – Päivä (lopputila): kaikki 3 avainta → kuu vaihtuu auringoksi ja valoisuus nousee.**
Uusi liukuva arvo `dayT` (0 = yö … 1 = päivä) ohjaa kaikki muutokset; auringonnousu ~20 s
(`DAY_FADE_FRAMES 1200`). Päivä on **johdettu avaimista** (`allKeysCollected()`, sama ehto kuin
palkintohuoneessa ja HUD:issa) → **ei uusia localStorage-kenttiä**, valmiiksi läpäisty peli avautuu
suoraan päivänä. Muutokset `street.js`:ssä: päivätaivas liukuu yötaivaan päälle (`DAY_SKY_*`),
sirppikuu häipyy ja **aurinko** (`SUN_X 660 / SUN_Y 62 / SUN_R 26`, hehku + hitaasti pyörivä
sädekehä) nousee kuun tilalle, tähdet himmenevät (`* (1 - dayT)`), tähdenlento ja satelliitti
poistuvat käytöstä (`dayT <= 0` -portti + nollaus päivän alkaessa), lamppujen valokeila/valopilkku/
moskiitot himmenevät (`LAMP_DAY_DIM 0.15`; **`lamp.lit` ei muutu** → ovet ja pelit ennallaan) ja
**päivänvalo-wash** (`globalCompositeOperation 'lighter'`, `DAY_LIGHT_RGB`, `DAY_LIGHT_ALPHA 0.30`)
kirkastaa koko kadun yhdellä kerroksella ilman palettimuutoksia. Wash piirretään ennen oviukon
vinjettiä ja kuoleman pimennystä. **Visuaalinen vain:** hitboxit, törmäykset, keräyssäteet, kamera,
avaimet, ovet ja talous eivät muutu (kaikki lisäykset ovat ehtoja `dayT > 0` → yö piirtyy kuten ennen).
Sisätilat (`darkRoom`/`barRoom`/`jukeboxRoom`) palaavat `render()`ista ennen washiä → ennallaan.
Auringonnousu **odottaa kadulle paluuta**: liuku on pysähdyksissä kun alapeli on auki (`iframeOpen`)
tai ollaan canvas-huoneessa → avain saadaan alapelistä, joten päivä ei "valmistu" näkymättömissä.
Testityökalu `?day=1` näyttää päivän heti ilman avainten keräämistä.
**Keston säätö (käyttäjän pyynnöt 20.9.2026):** 4 s → 8 s → **20 s** (`DAY_FADE_FRAMES 240 → 480 → 1200`,
pelkkä parametri, ei versionostoa). **Käyttäjän testaus:** avain-cheat (vitoslamppu 5 potkua) sytytti
päivän oikein → efekti todettu toimivaksi ja "niin hienoksi", että kesto pidennettiin 20 sekuntiin.

**v4.31 – Pelaajan syvyysskaalaus Y-akselilla.** Uusi `playerDepthScale()` (street.js r. ~4742): hahmo
kasvaa liikkuessa alaspäin (lähemmäs) ja pienenee ylöspäin. **±10 %**: `PLAYER_DEPTH_MID 315` (liikeradan
keskikohta 280…350) = nykyinen koko **1,00** → **0,90 kauas / 1,10 lähelle** (aloituspaikka y = 290 ≈ 0,93).
Skaalaus on **ankkuroitu jalkojen kosketuspisteeseen** (`ax, ay = px + pw/2, py + ph − 1`) sekä
normaalissa että tainnutusasennossa → jalat pysyvät maassa ja myös maakosketusvarjo skaalautuu.
**Visuaalinen muutos vain:** hitboxit, törmäykset, keräyssäteet, kamera ja talousarvot ennallaan.
Nupit `PLAYER_DEPTH_AMOUNT` (voimakkuus) ja `PLAYER_DEPTH_MID` (minkä Y:n kohdalla koko = 1,00).

**v4.30 – Hedelmäpelin huoneen seinäkuva mustavalkoiseksi.** Uusi `fruitgame/assets/dude_mv.jpg`
(672 × 400, 49 kt, puhdas luminanssi-MV, kanavaero 0; lähde `D:\AI\tmp\dude.jpeg` 1024 × 609).
`lemmy_mv.jpg` poistettu ja `game_main.html`:n `src` → `assets/dude_mv.jpg` → **ei yhtään
lemmy-viittausta repossa**. Koko ja asemointi ennallaan (`WALL_PIC_H_RATIO 0.28`), ei testiajoja.

**v4.29 – Seinäkuva 4× isommaksi ja kiinni pelikentän yläreunassa.** `renderer.js`: kuvan koko vapaasta
seinätilasta (`WALL_PIC_H_RATIO 0.28`, minimi `WALL_PIC_MIN_H 90`, leveyskatto = ikkuna − `WALL_PIC_SIDE 24`,
kehys `WALL_PIC_FRAME 3`, rako `WALL_PIC_GAP 0`) funktiossa `wallPicSize()`; canvasin
`marginTop = kuvan korkeus` → ryhmä (kuva + kone) keskittyy ja kone jää ryhmän alaosaan. Pystynäytössä
canvas on leveysrajainen → **kone ei pienene** (390 × 844: kone 372 × 232 ennallaan, kuva 84 × 50 →
351 × 211); PC:llä kone 1566 × 978 → 1096 × 685 (−29 %), kuva 112 × 66 → 471 × 282. `style.css`:
kiinteä 112 px pois (koko tulee JS:stä), kehys 3 px + varjo `4px 5px`, vaakatasopiilotus ennallaan.

**v4.28 – Hedelmäpelin huoneen seinäkuva.** Uusi `fruitgame/assets/lemmy_mv.jpg` (672 × 399, 72 kt; sittemmin
korvattu v4.30:ssä) ja `<img id="wall-pic">` `#canvas-wrapper`in sisään – **HTML-elementti, ei canvasin
piirrossa** → koneen kokoon, canvasin skaalaukseen eikä dialogeihin kosketa. `style.css`:
`#canvas-wrapper position: relative`, `#wall-pic` (mobiili 84 px / PC 112 px, 2 px musta kehys, varjo,
`pointer-events: none`) ja piilotus `landscape + max-height 500px + pointer: coarse`. `renderer.js`
`placeWallPicture()` sijoittaa kuvan koneen viereen (PC) tai yläpuolelle (pystymobiili) vapaaseen
seinätilaan – ei koskaan koneen päälle; `load`/`error` → uudelleenlaskenta. Kone, canvas ja skaalaus ennallaan.

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

- **Oviukko:** `AVENGER_CHANCE 0.12` (1/8) · `AVENGER_COOLDOWN 1800` (30 s) · **`AVENGER_SPEED 1.0`**
  (½: pelaaja luulee pääsevänsä karkuun, mutta katu on rajattu → laidalla se nappaa; nälkäisenä
  ≤3 🍔 = 0,82 → tavoittaa heti) ·
  `AVENGER_STUN 600` (360 = 6 s) · `AVENGER_FREEZE 180` (3 s) · `AVENGER_TELEGRAPH 21` · `AVENGER_HIT_R 18` ·
  `AVENGER_KIND 'twin'`.
- **Musiikki:** `MUSIC_SOURCE 'synth' | 'mp3'` · `MUSIC_FILE 'knived_unafraid.mp3'` ·
  `SYNTH_PLAY_DURATION 30000` · `SONG_PLAY_LIMIT 30000` · `SONG_FADE_OUT 600` · `MUSIC_VOLUME 0.05` ·
  tauko `getSilenceDuration()` 30–90 s · `JUKEBOX_GAP 2500` · `JUKEBOX_VOLUME = MUSIC_VOLUME`.
- **Testicheatit:** `COIN_CHEAT_LAMP/KICKS/REWARD/GAP/COOLDOWN` = 4/20/20/120/3600 · avain-cheat 5 potkua
  (`lamps[4]`).
- **Kaivo (avoin viemärinkansi):** `MANHOLE_START_CHANCE 1/6` (uusi peli) · `MANHOLE_RETURN_CHANCE 1/10`
  (paluu huoneesta/alapelistä) · `MH_COIN_COST 2` (menetys: 3 → 1, 2 → 0, 1 → 0, 0 → ei mitään) ·
  **`MH_BONUS_CHANCE 1/6` · `MH_BONUS_COINS 3`** (parametri: 1/6 putoamisista → +3 🪙) ·
  `MH_FALL_FRAMES 36` / `MH_CLIMB_FRAMES 210` / `MH_RISE_PART 0.65` / `MH_STEP_PX 9` ·
  törmäysellipsi `MH_HIT_RX 11` / `MH_HIT_RY 5` · testityökalut `?hole=0` / `?hole=1` / `?hole=2`.
- **Ovikynnykset:** `THRESH_RINGS`, `THRESH_TOP_Y`, `THRESH_DIP`, `THRESH_DETAILS`, `THRESH_LIGHT`,
  `KERB_GAP_EXTRA`, laatan korko (`slab.h`).
- **Pelaajan syvyys:** `PLAYER_DEPTH_AMOUNT 0.10` (±10 %) · `PLAYER_DEPTH_MID 315` (koko 1,00 tässä Y:ssä) ·
  `PLAYER_DEPTH_MAX_Y = WORLD_H - 50` (350, sama kuin `update()`in `PLAYER_Y_MAX`).
- **Päivä/yö:** `DAY_FADE_FRAMES 1200` (nousu ~20 s) · `NIGHT_FADE_FRAMES 1200` (lasku) · `DAY_SKY_TOP '#3f7fc0'` ·
  `DAY_SKY_MID '#78b4e0'` · `DAY_SKY_HORIZON '#ffd9a0'` · **kuu/aurinko (v4.41):** `SUN_X 140` (päiväpaikka,
  vasen) / `SUN_Y 62` / `SUN_R 26` · `MOON_X 680` / `MOON_Y 60` / `MOON_R 28` (yöpaikka, oikea) ·
  **ei liukua** – pelkkä alpha-ristihäivytys (`dayT` / `1 − dayT`) ·
  `DAY_LIGHT_RGB [70,58,40]` · `DAY_LIGHT_ALPHA 0.30` (washin voimakkuus) · `LAMP_DAY_DIM 0.15` (jäljelle
  jäävä lampun hehku) · testityökalut `DAY_PARAM`/`DAY_FORCE` = `?day=1` (päivä heti) ja `?day=0`
  (pakota yö) – eivät tallenna mitään.
- **Aukiolo (v4.34):** `CLOSED_SIGN 'Avoinna\nKlo 20 - 06'` · `CLOSED_AT_DAYT 0.5` (dayT-raja,
  sama kuin makuuhuoneen tilanvaihdossa) · `nightOnlyClosed()` – jukebox (talo 5) ja
  hedelmäpeli (talo 7) auki vain öisin, päivällä popup eikä sisään.
- **Liikenne (v4.37):** `TRAFFIC_DAY_MULT 2` (päivän spawn-kerroin: spawn-pohja
  `1200 + random·1200` framet = 20–40 s jaetaan kertoimella) · `LANE_DEFS` y 340 / 328 ·
  nopeudet auto 1,0–1,5 · mopo 1,5–2,5 · ambulanssi 1,8–3,0 · 1 ajoneuvo / kaista.
- **Ajovalot (v4.35):** `VEHICLE_HEADLIGHT_DIM 1` (1 = kokonaan pois päivällä, 0 = ei muutosta) ·
  `headlightDim` / `headlightOn` `drawVehicle()`issa (r. ~4922) – auton ja mopon etuvalo + valokeila
  himmenevät `dayT`:n myötä; takavalot ja ambulanssin kattovilkku ennallaan.
- **Päivä-ovet + moskiitot (v4.38):** `DOOR_NO_LAMP_AT_DAY true` + `lampFreeOpen()`
  (raja `CLOSED_AT_DAYT 0.5`; `false` = vanha käytös, lamppu potkaistava aina) ·
  `MOSQUITO_DAY_DIM 1` (1 = moskiitot häviävät päivällä, 0 = ei muutosta) –
  `drawLampPost()`in moskiittolohko (r. ~4625) · `dayLampsOff`-lippu: `dayT === 1` sammuttaa
  kaikki lamput kerran (`state.litLamps` tallennetaan), nollautuu `dayT === 0`.
- **Pilvien päivätummuus (v4.40):** `CLOUD_NIGHT_CIRRUS [190,200,225]` · `CLOUD_NIGHT_HAZY [180,195,215]`
  (yön arvot) · `CLOUD_DAY_CIRRUS [96,104,124]` · `CLOUD_DAY_HAZY [62,68,84]` ·
  `CLOUD_DAY_ALPHA 5` (peittävyyskerroin päivällä, 1 = ei muutosta) – `drawClouds()` (r. ~2001).
- **HUD 🍔-varoitus (v4.39):** `HUNGER_WARN 3` (r. ~189) – `updateHUD()` lisää `burger-warning`-luokan
  (`style.css`: `burgerBlink` 0,8 s, punainen), kun hampurilaisia on tämä määrä tai vähemmän.
- **Makuuhuone (talo 7):** `SLEEP_BLDG_IDX 7` · **ovi aina auki** (v4.43: ei avaimia eikä lamppua;
  sama `sleepOpen`-ehto (`bldgIdx === SLEEP_BLDG_IDX`) ohjaa `handleAction`ia, `drawDoor`ia ja
  kynnysvaloa) · `SLEEP_DARK_FRAMES 45` (~0,75 s pimennys) ·
  `SLEEP_ZZZ_FRAMES 180` (Zzz ~3 s) · `SLEEP_FADE_FRAMES = DARK + ZZZ` (~3,75 s yhteensä) ·
  `hungerOnHold()` (`sleepRoom || sleepPhase > 0`) · `HUNGER_WAKE_GRACE 600` (10 s herätysrauha, v4.41) ·
  `sleepSel` (0 = Nuku, 1 = Poistu) · sängyn koko paneelista (`bedW = min(340, panelW − 16)`),
  paneeli ≤ `winW − 24`, sivuikkuna vasta kun `winW ≥ 560`.
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
- **Päivä (v4.32) – lisäsäädöt jos silmä vaatii:** ikkunavalot eivät vielä sammu päivällä (3 kutsukohtaa:
  pienet talot, satunnaiset ikkunat, taustasiluetin ikkuna) · lämmin maagradientti kadulle · pilvien
  kirkastus · `style.css`:n tumma canvas-kehys + scanline päiväversiona · auringonnousun jingle.
  Washin voimakkuus ja päivätaivaan sävyt = nupit (`DAY_LIGHT_ALPHA`, `DAY_SKY_*`).
- **Makuuhuone (v4.33) – lisäsäädöt jos silmä vaatii:** peiton väri ja sängyn koko (`bedW`), yöpöytä/lamppu
  sängyn viereen, nukkumisen pimennys (`SLEEP_FADE_FRAMES`) ja auringonlaskun kesto (`NIGHT_FADE_FRAMES`),
  heräämisteksti ("Uusi päivä" / "Hyvää yötä") tai pimennys myös kadulle palatessa.
  Huoneen värit (`isDay ? … : …` -sävyt) ja rivien valintaväri (`#ffd070`) ovat vapaita nuppeja.
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
- **Pelaajan syvyysskaalaus (v4.31):** `s ≠ 1` tekee hahmon pikselikoordinaateista murto-osaisia → 1 px
  reunat voivat pehmentyä ja skaalautuessa hitaasti ohuet yksityiskohdat väristä. Jos silmä havaitsee:
  kvantisoi skaala portaisiin (esim. 0,025 välein) tai vaihda offscreen-blittiin (lähin naapuri).
- **Päivä/yö (v4.33):** tila on **tallennettu** (`state.isDay`: `null` = ratkaisematon, `true` = päivä,
  `false` = yö). 3 avainta nostaa päivän kerran (v4.32-käytös) ja tallentaa `true`; sen jälkeen vain
  makuuhuoneen **Nuku** vaihtaa tilaa – v4.43:ssa huone on aina auki, joten **Nuku voi ratkaista tilan
  jo ennen avaimia** (silloin v4.32:n "3 avainta → päivä" -auringonnousu ei enää laukea). Sivuvaikutus: **avain-cheat** (vitoslamppu 5 potkua → kaikki avaimet)
  sytyttää myös päivän – sama "läpäisty"-tila, joten käytös on johdonmukainen. Vanha tallennus ilman
  `isDay`-kenttää → `deepMerge` tuo `null`in → päivä nousee kuten ennen. Päivänvalo on additive-kerros
  (`'lighter'`), eli se ei muuta yhtään väripalettia: jos kadun pitää näyttää vielä valoisammalta,
  nosta `DAY_LIGHT_ALPHA` (0.30) tai vaalenna `DAY_SKY_*`-sävyjä.
- **Makuuhuone (v4.33, ovi auki v4.43, 🍔-palkkio v4.44):** liuku on pysähdyksissä huoneessa (`!sleepRoom`), joten
  nukahduksen jälkeen auringonnousu/-lasku näkyy vasta kadulle palatessa – sama portti kuin
  iframe-peleillä. Huone piirretään `render()`issa ennen päivänvalo-washiä → sisätila ei kirkastu.
  Nukkuminen antaa **+1 🍔** (katto 10, v4.44), mutta **ei** kosketa lamppuja, ovia eikä avaimia. Ovi on aina auki
  ilman avaimia ja lamppua (v4.43), joten myös nälkäpysäytys (`hungerOnHold()`) on käytettävissä
  heti pelin alusta – **Nuku → +1 🍔** (katto 10, v4.44).
- `handleAction()` palaa heti osumasta → hit pause asetetaan haaroissa, `actionJustPressed` nollataan
  framen lopussa (ei tuplapotkua). `KICK_DURATION` ja törmäyslogiikka ennallaan.
- `street.js` `lamps[].label` on **kuollutta dataa** – kadun kyltit eivät näytä pelien nimiä (vain BAR
  piirretään erikseen).
- **Headless-validointi** onnistuu Node `vm` + Proxy-canvas-stub -tekniikalla (rAF ohjattavissa);
  testiskriptit `%TEMP%\*.cjs` – ei repossa (luettelo `progress.md`:ssä).
- Pääportaalin mobiiliohjain: `position: absolute`, `opacity: 0.65`, landscape overlay, D-pad + ⚡.
- Julkaisu: GitHub Pages `https://teppoaland.github.io/pimeakatu/`.


