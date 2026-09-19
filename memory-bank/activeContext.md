# 🎯 Aktiivinen konteksti

> **Kevyt:** Vain tämä tiedosto luetaan session alussa.

---

## 📌 Kommunikaatiosääntö (KÄYTTÄJÄN PYYNTÖ)

> **"Lue membank"** → lue muistipankki hiljaa itseäsi varten. **ÄLÄ anna yhteenvetoa.** Muistipankki on Clinea varten, ei käyttäjälle raportoitavaksi. Käyttäjä on pyytänyt tätä useamman kerran.

---

## 📍 Nyt

**v4.05** | 19.9.2026 | Kaksi Vaihe 3:n efektiä poistettu liioiteltuina: **potkun viuhka-VFX** (valkoiset/harmaat kaaret `))` + nopeusviivat) poistettu kokonaan `drawPlayer`in potkuhaarasta, ja **käsien heilunta** poistettu – `armPhase`-vaiheistus pois, kädet piirretään lepoasentoon (`backArmX = px+3`, `frontArmX = px+pw-6`) ja ne seuraavat vain vartalon `bobY`-liikettä (hengitys/kävelyn 1 px). Potkun ennakointi, nojaus (`kickLean`), hit pause ja dynaaminen reunavalo säilyivät ennallaan. Versio v4.04 → v4.05.

**v4.04** | 19.9.2026 | Hahmon animaatio-juice (Vaihe 3): **hengitys** – paikallaan seisoessa ylävartalo laskee 1 px ~2,4 s syklillä (`Math.floor(animClock/36) % 4 >= 2`), ei liikkeen/potkun aikana. **Käsien vastaheilunta** – `armPhase` (walkFrame 1 → +1, 3 → −1) siirtää takakäden eteen/ylös ja etukäden taakse/alas (±2 px x ja y) → vastakkain jalkojen kanssa. **Poton ennakointi** – `ANTICIP = 0.2`: ensimmäiset 20 % potusta jalka vedetään taakse (`swing = -0.35·kp/0.2`), sitten heilahdus `sin`-käyrällä; ylävartalo nojaa 1 px taakse ennakossa ja eteen osumassa (`kickLean` + `ctx.translate`). **Viuhka-VFX** – kaksi valkoista kaarta (r 16 ja 21, kulmat 0.45–1.45 / 0.60–1.25) + 2 nopeusviivaa jalan radalle, alpha `0.45·sin(sp·π)`. **Hit pause** – `const HIT_PAUSE = 2`, `hitPauseTimer` pysäyttää `update()`:n alussa koko maailman 2 frameksi; asetetaan talon 0 oven, pienien talojen ovien ja lamppujen osumahaaroissa (ei ovista sisään kävelyssä eikä törmäyksissä). **Dynaaminen valo** – lähin *palava* lamppu alle 70 px antaa ohuen lämpimän reunavalon (`rgba(255,221,136, 0.35·(1−d/70))`) vartalon ja pään valonpuoleiselle reunalle (lasketaan lokaalikoordinaateissa → kääntyy peilauksen mukana). Lisäksi silmän vilkahdus siirretty `Date.now()`:stä `animClock`-kelloon (100 ms / 3,6 s). Versio v4.03 → v4.04.

**v4.03** | 19.9.2026 | Hahmon pikseliviilaus (Vaihe 1+2, `drawPlayer`): **silmä** 2×2 `#2b2118` kulkusuunnan puoleisella reunalla (+ vilkahdus 90 ms / ~3,6 s `Date.now()`-pohjaisesti), **katseen pystysuunta** uusi `player.lookY` (update asettaa `moveY`:stä, piirto siirtää silmää ±1 px), **lipan varjo** `rgba(0,0,0,0.22)` rivillä py+5, **kasvojen takaosan varjo** `rgba(0,0,0,0.10)` 2×4 px, **leuan/niskan varjo** `rgba(0,0,0,0.22)` 2 riviä py+12 alkaen (pään ympyrä peittää paidan yläreunan → varjo vasta pään alareunan tasolle), **vyötäröraja** `rgba(0,0,0,0.20)`, **selän varjokaista** `#2b57ab` + **etureunan valokaista** `#4a7de0`, **housut** `#224488` → tumma laivastonsininen `#16265c`, **kengät** `#331100` → `#221008` + valojuova `#3a2a1c`, **hihansuut** `#254a9c` + **kädet** (iho `#ffcc99` / rystyt `#e8b487`). Uusi **maakosketusvarjo** (2 kerrosta ellipsiä: 0.30 alpha rx 10 seisoen / 11 kävellen + 0.45 alpha sisäkerros) piirretään ennen peilausta ja ennen knockedDown-haaraa. Lisäksi `ctx.imageSmoothingEnabled = false` `init()`:iin. Versio v4.02 → v4.03.

**v4.02** | 19.9.2026 | Puut huojuvat tuulessa: `drawBareTree(cx, baseY, h, swayX)` – tyvi ankkuroitu maahan, siirto kasvaa korkeuden mukaan (`rel^1.5`), joten puu taipuu eikä kaadu jäykkänä. `drawTrees()` laskee huojunnan pilvien tuulesta (`windDir`/`windSpeed`): hidas puuska (periodi ~17s) + huojunta (1.2–1.5 rad/s), amplitudi latvassa 0.6–2.8 px (kova tuuli huojuttaa enemmän), lepoasento tuulen suuntaan. Puille omat `phase`-arvot → eivät huoju synkassa. Siluetin muoto ennallaan (vain x-siirto) → ei välkyntää. Versio v4.01 → v4.02.

**v4.01** | 19.9.2026 | Sähkökaappi: toinen identtinen ilmentymä talon 7 (buildings[6], x 560–610, matala h 145) vasemmalle seinälle x 560 (2px rako oveen, ikkunat kaapin yläpuolella – sama suhde kuin talossa 3). `electricCabinet` → `electricCabinets`-taulukko (2 kpl); törmäysloopissa `for (const cab of electricCabinets)` + `if (player.knockedDown) break;` (logiikka muuten identtinen); drawElectricCabinet piirtää molemmat samalla koodilla (vilkkuva valo synkassa). Versio v4.00 → v4.01.

**v4.00** | 19.9.2026 | Aloituspopupin (showSpawnHint: 'Liiku kadulla, potki kaikkea…') näyttöaika +2s → 4500 ms. showNotification sai valinnaisen 2. parametrin `durationMs` (oletus 2500 ms) → kaikki muut popupit (kolikko, avaimet, ovet, varoitus) ennallaan 2.5 s + fade 0.5 s. Vain showSpawnHint kutsuu arvolla 4500.

**v3.99** | 19.9.2026 | Peliohjeet poistettu HUD-palkista (street.js updateHUD + index.html #hud-bar tyhjä). Ohje näytetään nyt pop-upina (sama kuin kolikkoilmoitus, showNotification): showSpawnHint() kutsutaan init()ssä vain kun tila on oletus/0 (ensimmäinen lataus tai kuoleman reset), teksti 'Liiku kadulla, potki kaikkea, mutta omalla vastuulla. Saattaa asukkaat hermostua! Ja muista Syödä!'. HUD näyttää nyt vain statuksen (avaimet/kolikot/hampurilaiset).

## ✅ Hahmon viilaus valmis (Vaiheet 1–3)

- **Vaihe 1 (v4.03):** silmä + `lookY`-katse, lipan/kasvojen/leuan varjot, kylkivarjostus, housujen kontrasti, hihansuut + kädet
- **Vaihe 2 (v4.03):** maakosketusvarjo (2 kerrosta), `imageSmoothingEnabled = false`
- **Vaihe 3 (v4.04):** hengitys, potkun ennakointi + nojaus, hit pause, dynaaminen lampunvalo — *käsien vastaheilunta ja potkun viuhka-VFX poistettu v4.05:ssä liioiteltuina*

### Havainnot, jotka kannattaa muistaa
- Pään ympyrä (arc r=7, keskipiste `py+6`) peittää paidan ylimmät rivit (`py+10..py+12`) → pään/kaulan varjostus vasta pään alareunan (`py+13`) tasolle.
- `handleAction()` palaa heti osumasta → hit pause asetetaan haaroissa, ja `actionJustPressed` nollataan joka framessa `loop()`:n lopussa (ei tuplapotkua).
- `KICK_DURATION` ja törmäyslogiikka ennallaan – ennakointi/viuhka ovat vain piirron aikakäyrää (`ANTICIP = 0.2`).
- Testityökalu: `street.js` renderöityy headless (Node `vm` + Proxy-canvas-stub, rAF ohjattavissa) → `drawPlayer`-operaatiot ASCII-rasteriksi. Ei jätetty repoon – kannattaa tehdä uudelleen vastaaviin visualisointeihin.

## 🚧 Mahdollisia jatkoideoita (ei tehty)

- Potkun osumaan 1 px screen shake (voi tuntua CRT-teeman vastaiselta)
- Pää ja nyrkit "pixel-perfect" recteinä `arc()`-ympyrän sijaan
- Hahmon hengityksen syvyys 2 px tai hitaampi sykli, jos 1 px tuntuu liian pieneltä

## 🔒 Lukitut osa-alueet

- **Dialogi-tekstit:** Kaikkien pelien overlay/intro/viestit **LUKITTU**. Ei muutoksia ilman erillistä lupaa.
- **Pelien välinen logiikka:** Koko polku testattu läpi järjestyksessä (DG1 → DG2 → Blue Mäx). Avaimet, postMessage-kutsut, paluu kadulle — **LUKITTU**. Ei muutoksia ilman erillistä lupaa.
- **KAIKKI tekstit:** HUD-bar, notifikaatiot, lamppujen labelit, ovet, dialogit, overlay-tekstit — **LUKITTU**. Ei mitään tekstimuutoksia ilman erillistä pyyntöä.
- **Inventaario:** `inventory`-objektia (`coin`, `coinCount`, `hamburgerCount`) ei muokata ilman erillistä pyyntöä. Inventaario on lukittu.

## 🔜 Seuraavaksi (odottaa valintaa)

- Blue Mäx: TESTIMODE pois → palauta vihollisten ammunta normaalille 60% aggressiolle
- **Ääniefektit pääportaaliin:** ✅ Valmis v3.28 – "Running Free" täysi bändisoundi (rummut + basso + kitara + melodia, audio.js)
- **Pääsiäismunat Boulder Dashiin**

## ⚠️ Huomiot

- **Pääportaali:** `position: absolute`, `opacity: 0.65`, landscape overlay, D-pad + ⚡
- **Notifikaatiot:** Vain ovi/kolikko, `showNotification(text, durationMs = 2500)` → lukuaika 2.5s + fade 0.5s. Aloitusohje (showSpawnHint) 4500 ms (v4.00). Muiden popuppien aikoja ei pidennetä.
- **Blue Mäx:** ✅ v3.10 – Musta ⅓-leveä mittari-HUD (polttoainepalkki + pommit + elämät + korkeus), ei pisteitä. Kentän ulkopuolella alt≤1 → STALL-kuolema. Ohjaus pois ST.TO:n ajalta. Viholliset 100% teholla. Polttoaineen loputtua syöksy + wrap-around, 3-kerroksinen räjähdys, mobiili-HUD overlayna. B=pommi, G=KK, L=laskeudu. Ilmapallo 8 taloa + 60s. Tankkaus. Kaikki talot bonus +5000.
- **Boulder Dash:** Debugissa avain heti | **Dig Game:** Buildaus poistettu, `game_main.html` käytössä suoraan
- **Versio:** v3.3 GitHub Pagesissa `https://teppoaland.github.io/pimeakatu/`