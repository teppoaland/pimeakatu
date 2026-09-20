# 📊 Projektin edistyminen

> v4.25 – 20.9.2026

## 🏮 Pääportaali – Pimeä Katu

| Ominaisuus | Tila |
|-----------|------|
| Katunäkymä, hahmo, lamput, ovet | ✅ |
| Kolikot (katu + pelit) | ✅ v3.86 – katu: kolikko jalkojen liikkuma-alalle (x 0–780, y 310–380), 120s respawn; DG1 1kpl, DG2 1/taso; **v4.22 – syntymäpaketti: uusi peli / reset antaa 2 kolikkoa valmiiksi (5 🍔 ohella); tallennettu saldo voittaa aina (0 pysyy 0:na)** |
| Hampurilaiset (lives) + BAR | ✅ v3.73 – 5 alussa, 1/40s, BAR:sta lisää, dramaattinen kuolemasekvenssi; **v4.12 – BAR-ostot: ▲/W = osta 1 (1 kolikko, katto 10), ▼/S = peru viimeisin osto (vain vierailun ostot, ei rahareikää), (o)/Space = poistu; reunanilmaisu estää toiston, tilateksti `Ostit Xx🍔 hampurilaista!`** |
| 🖼️ BAR-huoneen seinätaulu (äitihahmo) + sovitus vaakanäyttöön | ✅ v4.25 – seinätaulu **mustilla kehyksillä** (`assets/justiina.png`, 315×261) äidin lapun ja ostorivin **yläpuolella**; hampurilainen **2/3** koossa, alaosa edelleen pöydän pinnassa (y = 260, 53,3×45,3); asettelu lasketaan alhaalta ylös ja sovitetaan näkyvään ikkunaan (`winW`, `needPx`, `fitFs`) → mahtuu myös puhelimen vaakanäyttöön (vaaka 844×390: kehys 83,2×71); varapinta ennen kuvan latausta, ei uusia localStorage-avaimia; validoitu `%TEMP%\street-bar-picture-test.cjs` 0 löydöstä (5 laitekokoa) |
| Taustamusiikki (syntikkalooppi), äänet, CRT-teema | ✅ v4.21 – taustalla soi **proseduraalinen syntikkalooppi** (`MUSIC_SOURCE 'synth'`: rummut + basso + särökitara + melodia), 30 s soittoa (`SYNTH_PLAY_DURATION`) + **0,6 s häivytys** (`fadeOutSynth()` ramppaa `synthGain` 1 → 0) + 30–90 s tauko → sykli 60–120 s; `loadMusic()` ei lataa äänitiedostoa syntikkatilassa; aito äänite on vain **varatiekytkin** `'mp3'` (`MUSIC_FILE` = `knived_unafraid.mp3`) ja aidot koko kappaleet soi **ainoastaan jukeboxista**; `running.mp3` ei palaa (tekijänoikeudet); v4.18 – MP3-tilassa kappaleesta soi vain 30 s alku (`SONG_PLAY_LIMIT 30000`) + 0,6 s häivytys; mobiilifiksit: autoplay-esto ei poista musiikkia pysyvästi + `synthGain`-mykistys estää päällekkäin soimisen |
| Ajoneuvot, eläimet, sääefektit | ✅ |
| Mustat lehdettömät puut (isoimmat raot) | ✅ v3.82 – 2 kpl, siluetti, eri korkeus |
| Pienet ruohotupsut puiden juurella (1/4 koko) | ✅ v3.83 – 3 kpl per puu, random paikka raossa, huojuvat |
| Puut huojuvat tuulessa | ✅ v4.02 – drawBareTree sai swayX-parametrin (tyvi ankkuroitu, taipuma `rel^1.5`); drawTrees lukee pilvien windDir/windSpeed → hidas puuska + huojunta, latvan amplitudi 0.6–2.8 px, omat phase-arvot per puu |
| Sähkökaappi (1. puun vieressä) | ✅ v3.90 – harmaa laatikko + vilkkuva keltainen valo; sähköisku vain seinää vasten (pää kaapin yläreunan yläpuolella), ei alhaalta, ei tekstiä |
| Sähkökaappi 2 (talo 7, matala talo) | ✅ v4.01 – identtinen kopio talon 7 (buildings[6], x 560–610, h 145) vasemmalle seinälle x 560; `electricCabinets`-taulukko, törmäys + piirto loopilla. Sama suhde oveen (2px) ja ikkunoihin kuin talossa 3 |
| Kolikko potkusta talosta (1/5, 30s cooldown) | ✅ v3.93 – kukkaruukun sijaan 1/5 kolikko, 30s cooldown estää farmaamisen |
| Ajoneuvojen moottoriäänet (panoroiva surina) | ✅ v3.81 – mopo korkea, autot/ambulanssi matala, stereo-pannaus |
| Mobiiliohjaimet | ✅ |
| Mobiilikamera (vaakascrollaus pystymoodissa) | ✅ v3.91 – kosketuslaitteella zoom (täyttää korkeuden) + `camX` seuraa pelaajaa; PC: koko katu ennallaan |
| Lampun visuaalinen viimeistely | ✅ v3.96 – varren pyöreä gradientti + jalusta katukivetyksen rasterina, pystyraita vaihtelee oikealla/vasemmalla lampuittain |
| Teräsaidan alavaakarauta (vaihtelu) | ✅ v4.0 – pystysuuntainen pyöreä gradientti + niitit joka pystypiikin kohdalle, aiemmin tasainen #2e2e2e |
| Dig Däsh alkudialogi (vaakakuva) | ✅ v4.0 – #overlay-content max-height/overflow-y + @media (max-height: 500px) pienentää otsikon/tekstit, jotta ylä-/alakehykset mahtuvat |
| BAR-kyltti (talo 8) laskettu alemmas | ✅ v4.1 – kyltin alareuna dy-10 (3px ovivalon yläpuolella, 10px oven yläpuolella) |
| Ikkunat eivät jää oven taakse | ✅ v4.2 – drawBuildings: oven "ei-ikkunaa" -alue (DOOR_W+4 x DOOR_H+2, +2px reunus), ikkuna ohitetaan jos se leikkaa oven alueen |
| BAR-viittakyltti puunraossa | ✅ v4.3 → v3.98 – pieni matala nuolikyltti I====> varren sisällä "BAR" (terävä pikselifontti), siirretty vasemmalle (x≈143) + jalat; v4.5 tekstin koko puolitettu (scale 2→1); v4.6 yöelämän neon-kyltti: puuosa lähes musta siluetti #1F1614; v4.7 teksti fillText-hehkuksi (shadowColor #FF0055, blur 10, ydin #FF66A3, 'Press Start 2P' 9px); v4.8 teksti 'BAR >' + varsi pidennetään measureText-mittauksella; v3.98 palautettu alkuperäiseen pituuteen + teksti 'BAR>' (ilman väliä) kokeiluun (versio pudotettu v4.9 → v3.98, jatkossa +0.01) |
| Peliohjeet pois HUD:sta → popup 0-tilassa | ✅ v3.99 – updateHUD näyttää vain statuksen, ohje pop-upina (showSpawnHint) vain oletustilassa (ensimmäinen lataus / kuoleman reset), teksti + 'Ja muista Syödä!' |
| Aloituspopupin näyttöaika +2s | ✅ v4.00 – showNotification(text, durationMs = 2500) parametroitu; showSpawnHint kutsuu 4500 ms. Muiden popuppien (kolikko/avain/ovi/varoitus) aika ennallaan |
| Hahmon pikseliviilaus: silmä + katse, varjostus, kontrasti | ✅ v4.03 – silmä 2×2 `#2b2118` kulkusuunnan puolella (vilkahtaa 90 ms / ~3,6 s), `player.lookY` (update asettaa `moveY`:stä) siirtää katsetta ±1 px; lipan varjo, kasvojen takaosan varjo, leuan/niskan varjo pään alareunan alapuolelle, vyötäröraja, selän varjokaista `#2b57ab` + etureunan valokaista `#4a7de0`; housut `#16265c` (laivastonsininen erottuu paidasta), kengät `#221008` + valojuova, hihansuut + ihopisteet kädet |
| Hahmon maakosketusvarjo + pikseliterävyys | ✅ v4.03 – 2 kerrosta ellipsiä jalkojen alle (0.30 alpha rx 10 seisoen / 11 kävellen + 0.45 sisäkerros), piirretään ennen peilausta ja knockedDown-haaraa; `ctx.imageSmoothingEnabled = false` init():iin |
| Hahmon hengitys + käsien heilunta | ✅ v4.04 – `animClock`-kello; paikallaan ylävartalo 1 px alas ~2,4 s syklillä (36 frameä/vaihe, 4 vaihetta); käsien vastaheilunta (armPhase ±2 px x/y) **poistettu v4.05** – kädet lepoasennossa, seuraavat vain bobia |
| Potkun ennakointi + viuhka-VFX + nojaus | ✅ v4.04 – `ANTICIP = 0.2`: 20 % potusta jalka taakse (`swing = -0.35·kp/0.2`), sitten `sin`-heilahdus; ylävartalo 1 px taakse ennakossa / eteen osumassa (`kickLean` + translate). Viuhka-VFX (valkoiset kaaret + nopeusviivat) **poistettu v4.05** |
| Käsien heilunta ja viuhka-VFX pois | ✅ v4.05 – molemmat koettiin liioitteluiksi: kädet `px+3` / `px+pw-6` lepoasennossa (vain `bobY`), potkusta poistettu kaari-VFX. Ennakointi, nojaus, hit pause ja reunavalo ennallaan |
| Hit pause osumista | ✅ v4.04 – `HIT_PAUSE = 2`, `hitPauseTimer` pysäyttää `update()`:n alussa (render jatkaa); talon 0 ovi, pienet talot ja lamput (myös ylikuumeneminen). Ei ovista sisään kävelyssä eikä törmäyksissä |
| Dynaaminen lampunvalo hahmolle | ✅ v4.04 – lähin palava lamppu < 70 px → `rgba(255,221,136, 0.35·(1−d/70))` 1 px reunavalo vartalon (11 px) ja pään (3 px) valonpuoleiselle reunalle; lokaalikoordinaatit → kääntyy peilauksen mukana |
| Kaukaisen kaupungin siluetti (parallaksi 0.4×) | ✅ v4.06 – haaleat sinertävät taustatalot (50 % koossa, `BACKDROP_SCALE 0.5`) lähitalojen/puiden takana (tähtien/taivaan päällä); 4 kattomallia + reunalista, tumma ikkunaristikko 5×7 + himmeä lämmin ikkuna joka 3. taloon, ilmaperspektiivihuntu; generointi kerran init():ssä, tyvi kiveyksen alla |
| Talojen + ovien syvyys-skaalaus | ✅ v4.07 – `buildingWindowRows` + `buildingScale` (5 riviä 100 %, 4 riviä 95 %, 3 riviä 90 %); `drawBuildings` skaalaa talon ja `drawDoor` skaalaa oven pohjan keskipisteen ympäri; potku/törmäys (`DOOR_RADIUS`), lamput ja ikkunavalo-kirjanpito ennallaan |
| Mopo + kuski (punainen runko, kerrostettu kuski) | ✅ v4.08 – harmaa laatikko korvattu punaisella rungolla (`#D32F2F`) + kuskilla, joka istuu penkillä kerrostettuna (runko → kuski → etukate/tanko); kuski pelaajan väreillä, silmä eteen, käsi tangolla, jalat astinlaudalla (pään tärinä poistettu luonnottomana) |
| Ikkunakehykset pois taaimmaisista taloista (3 rivin talot) | ✅ v4.09 – `flatWindows`-lippu (`buildingWindowRows(b) <= 3`) ohittaa ikkunan vaalean ulkokehyksen (`strokeRect`) kaikissa kolmessa haarassa (valaistu talo, `litWindows`, pimeä `#2a2a3e`); talot b2/b4/b6 (skaala 90 %) → ikkunat ilman kehystä näyttävät pienemmiltä ja painuvat seinään (3D-porrastus 100/95/90 %). Täyttö, hehku, siluetti ja `litWindows`-kirjanpito ennallaan |
| Pimeiden ikkunoiden syvennys (3 rivin talot) | ✅ v4.10 – kehyksen poiston jälkeen ikkunat katosivat seinään; nyt `flatWindows` → täyttö `#05050d` + 1 px tumma ylävarjo `rgba(0,0,0,0.35)` + 1 px vaalea alaparre `lightenHex(bodyC, 0x06)` (`wy+14`) = ikkuna näyttää upotukselta. Muut talot ennallaan (`#0a0a15` + kehys). Valaistuihin ikkunoihin ei koskettu; potku sytyttää näiden kolmen talon kaikki 6 ikkunaa (`smallHouseLights`) |
| Ovikynnykset: kynnyslinja + laatta + **yksi pieni kivirivi** + laskettu reunakivi | ✅ v4.13 – kaikkiin 9 oveen; kiveys rajattu `GROUND_Y+7…+14` (y 317–324, puolileveys ovi+5) → **ei valu autotielle** (kaistat y 328/340); reunakivien + kadun viivojen katko oviaukon kohdalta (±ovi/2+5) + 2 px viisteet; vinot saumat kohti kynnystä + V-painuma, kynnysvalo vain aktiivisille oville |
| Kiveysrivien saumavaihe taloittain | ✅ v4.13 – `housePhase`/`houseDrift` (`initForeground`): saumavaihe 0–6 px ja sävy −1…+1 per talo (deterministinen LCG) → sama kiveysruudukko ei jatku yhtenä "barina" laidasta laitaan |
| 🧹 Siivous: commando_c64 pois git-historiasta + alipelikansion uudelleennimeäminen | ✅ v4.17 – `git filter-branch --index-filter` (vain `main`, Cline-checkpointit säilyivät) → 4 tiedostoa pois historiasta, 3 tyhjäksi jäänyttä committia karsiutui; `git mv bluemax_c64 bm` + `git mv docs/bluemax.md docs/bm.md`; viittaukset korjattu (`street.js` gameUrl + avainportti, `.clinerules/01`, `README.md`, `PROJECT.md`, `CHANGELOG.md`, `docs/plan.md`, `docs/bm.md`, muistipankki); versio v4.17 |
| 🧹 Kaupalliset viittaukset siivottu (julkaisuvalmiutta varten) | ✅ v4.17 (jatko) – bändin nimi pois `audio.js`-kommenteista (melodia ja soitto ennallaan, käyttäjän päätös), `BOULDER DASH` → `Boulder Däsh` (19 tekstiä), `C64` → `dev` (5 kohtaa: näkyvä HUD-tägi + otsikot + `docs/bm.md`), `docs/boulder-dash-memo.md` → `docs/bd-memo.md` ja `docs/boulder-dash-build-cleanup.md` → `docs/bd-cleanup.md`; **havainto: `street.js`:n `lamps[].label` on kuollutta dataa** → kadun kyltit eivät näytä pelien nimiä (vain BAR piirretään erikseen); asset-taso puhdas (repossa vain `knived_unafraid.mp3`, kaikki grafiikka proseduraalista, äänet synteettisiä); 7 regressiotestiä 0 löydöstä; ei versionostoa |
| 🏷️ Pelinimi: Boulder Däsh → Dig Däsh | ✅ 20.9.2026 – vain näkyvä nimi + tekstiviittaukset (23 kohtaa: pelin `<title>`/`<h1>`, `street.js`-label + kommentit, `gameState.js`/`bm/audio.js`-kommentit, README/PROJECT/docs/muistipankki); **sisäiset tunnisteet** (`boulderKeyCollected`, `BOULDER_KEY_COLLECTED`, `TILE.BOULDER`, `SCORE_BOULDER_FALL`), kansionimi `digGame2/` ja tiedostot `docs/bd-*.md` jäivät ennalleen (käyttäjän linjaus: sana `boulder` muuttujissa **ei** ole tavaramerkkiasia – saa olla, vain näkyvät tekstit muutetaan); ei versionostoa |
| 🧹/🏷️ Nimi yhdenmukaiseksi: Blue Max → Blue Mäx (ei-näkyvät tekstit) | ✅ 20.9.2026 – käyttäjän löydös `docs/plan.md:38` → koko repo tarkistettu: **näkyvät tekstit olivat jo muodossa `Blue Mäx`** (vaihdettu jo v2.9 / commit `99be099`: title, h1, canvas-intro, lamppulabel) ja `C64` poistettu v4.17:ssä, mutta **8 tiedostossa oli yhä muoto ilman ä:tä**: `docs/plan.md:38`, `.clinerules/01-general-architecture.md:33`, `PROJECT.md:31,58,66`, `docs/bm.md:1,7,13,157`, `bm/css/style.css:2`, `bm/js/audio.js:2`, `bm/js/game.js:2`, `street.js:1293` (kommentti, suojattu tiedosto – käyttäjän hyväksymä; sama rivi siivottiin jo v4.17:ssä) + `memory-bank/progress.md:76,80` → kaikki muotoon `Blue Mäx`; **ennallaan:** `const BlueMax`, `window.BlueMax.init`, `bmKeyCollected`, kansionimi `bm/`, `docs/bm.md`, näkyvät `bm/game_main.html:6,12` ja `bm/js/game.js:138`; **arvioitu ei-kaupallisiksi:** "Rule Britannia" (perinteinen 1740-luvun laulu, PD) ja "Sopwith Camel" (historiallinen WWI-kone); git-commit-metatiedot jätetään ennalleen (käyttäjän päätös 20.9.2026: *"ei tämä mikään kaupallinen/suuri tuote ole, ne ovat suunnitteluun liittyviä"* → ei `--msg-filter`-siivousta eikä uutta historian uudelleenkirjoitusta); ei versionostoa (sääntö 03) |


| Oviukko (Avenger): ovesta tuleva hyökkääjä | ✅ v4.14 – potkun pudotukseen 3. arvonta: **1/8 + 30 s cooldown → pelaajan kaksonen astuu ovesta kynnykseltä** (ei putoa kuten ruukku/kolikko), juoksee 2.0 px/f (> pelaaja 1.225) kiinni → **ei väistettävissä**; osuma = tainnutus 600 f + **−1 🍔** (ei tuplaosumaa; 🍔 0 → kuolema), paluu ovelle ja katoaminen; iframen aikana jäissä; portti `!avenger` estää ruukun/kolikon samaan aikaan; uusi ääni `playKnock()`; ei uusia tekstejä; **v4.15 – isku dramaattisemmaksi: kontakti jäädyttää koko maailman 3 s (hit-stop + vinjetti + iskuvälähdys + tärinä + tähdet), vasta lopuksi pelaaja kosahtaa kasaan (tainnutus 600 f + −1 🍔)** |
| 🎵 Jukebox-huone (talo 5, ovi x410) | ✅ v4.20 – potkaise ikkunat valaistuiksi → ovi aukeaa (2. painallus), 1 kolikko = koko kappale (`jukebox/` 3 × 128 kbps mp3, taso ≈ −13,5 LUFS); valinta ▲/▼ 0–3 (0 = ei valintaa → ei maksua eikä soittoa), soidessa valinta lukossa ja kappale soi loppuun; kappale peruuttaa taustamusiikin syklin ja taustamusiikki palaa `JUKEBOX_GAP` 2,5 s jälkeen; `killPlayer` pysäyttää myös jukeboxin; proseduraalinen Wurlitzer + neonkyltti + kynnysvalo kun valot palavat; 1/5 arpa ei ole enää tavoitettavissa talossa 5 (kuten hedelmäpelitalossa v4.11); **v4.21 – valintanuolet oikeinpäin: ▲/W = valitse ylös (−1), ▼/S = valitse alas (+1)** (rivi 0 on listan ylimpänä); **v4.22 – huoneen tekstit selkeiksi: koko asettelu sovitetaan näkyvään ikkunaan (`viewW`, keskitetty x = 400), yksi tumma paneeli, ei `shadowBlur`ia eikä `rgba`-tekstivärejä, fonttikoko näytön skaalan mukaan, kaappi vain kun `winW >= 620`, oven `♪JUKEBOX` 9 px + ääriviiva (hehku 3+|blink|·5)** |
| 💰 Salainen kolikkopalkkio (testityökalu) | ✅ v4.23 – vitoslamppu (x 720, talon 8 lamppu): **20 potkua putkeen** → **+20 kolikkoa** (avain-cheat 5 potkusta ennallaan: kaikki avaimet + koko valorivi syttyy); **hiljainen** – ei popuppia, ei ääntä, ei hiukkasia, vain saldo + HUD (testausta varten); putki nollautuu toisesta lampusta / tauosta > 2 s / palkkiosta / respawn-resetistä; **cooldown 60 s** (nupit `COIN_CHEAT_LAMP/KICKS/REWARD/GAP/COOLDOWN` = 4/20/20/120/3600); ei uusia localStorage-avaimia; testi `%TEMP%\street-cheat-test.cjs` 36 tarkistusta 0 löydöstä |
## 🍒 Hedelmäpeli (fruitgame/) – Vaihe 1 + debug 19.9.2026

| Ominaisuus | Tila |
|-----------|------|
| 3 rullaa / 1 voittolinja, 5 käsipiirrettyä symbolia (canvas 640×400) | ✅ Vaihe 1 |
| Rullanauha 20 merkkiä, painot 7/5/4/2/2, tulos arvotaan etukäteen (animaatio esittää) | ✅ |
| Maksut 💎35 🍔20 🔔12 🍋7 🍒4 + pari = panos takaisin, panos 1 kolikko | ✅ 125/125 yhdistelmää validoitu |
| RTP 78,49 % (simuloitu 78,5–78,8 %) | ✅ 1 M simulaatio + analyyttinen tarkistus |
| HUD (kolikot/panos/voitto/pyöräykset), napit, näppäimet, kosketus | ✅ |
| postMessage-protokolla: `fruitSync` / `fruitBet` / `fruitWin` / `RETURN_TO_STREET` | ✅ validoitu headless (iframe-tila) |
| **Pelin käynnistys (`DOMContentLoaded` → `new FruitGame()`)** | ✅ **korjattu debugissa 19.9.2026** (puuttui kokonaan) |
| **Canvas 1:1-skaalaus (`box-sizing: content-box`)** | ✅ **korjattu debugissa 19.9.2026** (3 px kehys kutisti piirtoalueen) |
| **Talon ilmainen pyöräytys (1 / 120 s, farmaus esto)** | ✅ **v4.11** – voiton saa pitää, ilmainen ei veloita, jäädytys pelin omassa localStorage-avaimessa |
| **Kytkentä katuun (Vaihe 2: talo 7 / buildings[6])** | ✅ **v4.11** – ovi aina auki, `fruitSync` + `fruitBet`/`fruitWin` + saldo-echo, validoitu `street-fruit-test.cjs`:llä |
| Dokumentaatio | ✅ `docs/fruit-game-memo.md` (säännöt, protokolla, kytkentä, testit) |
| Testipenkki | `%TEMP%\ftest.cjs` (peli) + `%TEMP%\street-fruit-test.cjs` (katu-integraatio), ei repossa |

## ⛏️ Dig Game (digGame1/) | 💎 Dig Däsh (digGame2/)

| Ominaisuus | Tila |
|-----------|------|
| Peruspelit (kaivu, fysiikka, viholliset) | ✅ |
| Äänet, kosketusohjaus, iframe | ✅ |
| Kolikot | ✅ v3.72 – DG1:1, DG2:4 (1/taso), hiljainen keräys |

## ✈️ Blue Mäx (bm/)

| Ominaisuus | Tila |
|-----------|------|
| Blue Mäx: lento, taistelu, HUD | ✅ |

## 🛠️ Infrastruktuuri
`.clinerules/`, `memory-bank/`, Git – ✅

| Ominaisuus | Tila |
|-----------|------|
| Tekijänoikeudet (`LICENSE` + README-osio) | ✅ 20.9.2026 – uusi juuren `LICENSE` (Copyright (c) 2024–2026 Teppo Ålander, All rights reserved, ei myönnä lisenssiä eikä käyttöoikeutta; myös grafiikka/äänet/`jukebox/`-kappaleet mainittu) + README-osio "Tekijänoikeudet / Copyright"; tekijännimi korjattu `Aland` → `Ålander`; ei versionostoa (vain dokumentaatio, sääntö 03) |
| 🔒 Talousbalanssi LUKITTU | ✅ v4.24 (20.9.2026) – käyttäjän päätös: kolikko-/🍔-/RTP-arvoja **ei enää säädetä** ilman erillistä pyyntöä. Uusi sitova sääntö `.clinerules/04-economy-balance.md` (ISO VAROITUS + lukitut arvot + pakollinen muutosprosessi), tausta `docs/economy-balance-memo.md` (talouslooppi + käyttäjän pelitestihavainnot mittapuuna: 1 kolikko pakko jättää, hedelmäpeli palauttaa yleensä 1–2, iso voitto ~1/30 pelikertaa), sääntö 02:n suojatut mekaniikat + `systemPatterns.md`-osio; ei koodimuutoksia |

