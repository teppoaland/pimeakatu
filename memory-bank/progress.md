# 📊 Projektin edistyminen

> v3.x – 17.9.2026

## 🏮 Pääportaali – Pimeä Katu

| Ominaisuus | Tila |
|-----------|------|
| Katunäkymä, hahmo, lamput, ovet | ✅ |
| Kolikot (katu + pelit) | ✅ v3.86 – katu: kolikko jalkojen liikkuma-alalle (x 0–780, y 310–380), 120s respawn; DG1 1kpl, DG2 1/taso |
| Hampurilaiset (lives) + BAR | ✅ v3.73 – 5 alussa, 1/40s, BAR:sta lisää, dramaattinen kuolemasekvenssi |
| Taustamusiikki (MP3-looppi), äänet, CRT-teema | ✅ v3.85 – aito MP3-looppi (`running.mp3`), mobiilifiksit: autoplay-esto ei poista MP3:a pysyvästi + `synthGain`-mykistys estää MP3:n ja syntikan päällekkäin soimisen |
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
| Boulder Dash alkudialogi (vaakakuva) | ✅ v4.0 – #overlay-content max-height/overflow-y + @media (max-height: 500px) pienentää otsikon/tekstit, jotta ylä-/alakehykset mahtuvat |
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


## ⛏️ Dig Game (digGame1/) | 💎 Boulder Dash (digGame2/)

| Ominaisuus | Tila |
|-----------|------|
| Peruspelit (kaivu, fysiikka, viholliset) | ✅ |
| Äänet, kosketusohjaus, iframe | ✅ |
| Kolikot | ✅ v3.72 – DG1:1, DG2:4 (1/taso), hiljainen keräys |

## ✈️ Blue Max (bluemax_c64/)

| Ominaisuus | Tila |
|-----------|------|
| Blue Max: lento, taistelu, HUD | ✅ |

## 🛠️ Infrastruktuuri
`.clinerules/`, `memory-bank/`, Git – ✅

