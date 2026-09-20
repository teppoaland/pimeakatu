# 📊 Projektin edistyminen

> v4.17 – 20.9.2026

## 🏮 Pääportaali – Pimeä Katu

| Ominaisuus | Tila |
|-----------|------|
| Katunäkymä, hahmo, lamput, ovet | ✅ |
| Kolikot (katu + pelit) | ✅ v3.86 – katu: kolikko jalkojen liikkuma-alalle (x 0–780, y 310–380), 120s respawn; DG1 1kpl, DG2 1/taso |
| Hampurilaiset (lives) + BAR | ✅ v3.73 – 5 alussa, 1/40s, BAR:sta lisää, dramaattinen kuolemasekvenssi; **v4.12 – BAR-ostot: ▲/W = osta 1 (1 kolikko, katto 10), ▼/S = peru viimeisin osto (vain vierailun ostot, ei rahareikää), (o)/Space = poistu; reunanilmaisu estää toiston, tilateksti `Ostit Xx🍔 hampurilaista!`** |
| Taustamusiikki (MP3), äänet, CRT-teema | ✅ v4.16 – kappale `knived_unafraid.mp3` (2:08, 128 kbps, −13,0 LUFS) soi **kerran** ja sitten 30–90 s tauko (x2-toisto + 3 s tauko poistettu, `armPlayTimer` lukee keston elementistä → 30 s oletus ei katkaise); mobiilifiksit: autoplay-esto ei poista musiikkia pysyvästi + `synthGain`-mykistys estää MP3:n ja syntikan päällekkäin soimisen |
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


| Oviukko (Avenger): ovesta tuleva hyökkääjä | ✅ v4.14 – potkun pudotukseen 3. arvonta: **1/8 + 30 s cooldown → pelaajan kaksonen astuu ovesta kynnykseltä** (ei putoa kuten ruukku/kolikko), juoksee 2.0 px/f (> pelaaja 1.225) kiinni → **ei väistettävissä**; osuma = tainnutus 600 f + **−1 🍔** (ei tuplaosumaa; 🍔 0 → kuolema), paluu ovelle ja katoaminen; iframen aikana jäissä; portti `!avenger` estää ruukun/kolikon samaan aikaan; uusi ääni `playKnock()`; ei uusia tekstejä; **v4.15 – isku dramaattisemmaksi: kontakti jäädyttää koko maailman 3 s (hit-stop + vinjetti + iskuvälähdys + tärinä + tähdet), vasta lopuksi pelaaja kosahtaa kasaan (tainnutus 600 f + −1 🍔)** |
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

## ✈️ Blue Max (bm/)

| Ominaisuus | Tila |
|-----------|------|
| Blue Max: lento, taistelu, HUD | ✅ |

## 🛠️ Infrastruktuuri
`.clinerules/`, `memory-bank/`, Git – ✅

