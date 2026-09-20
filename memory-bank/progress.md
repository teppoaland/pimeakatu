# 📊 Projektin edistyminen

> **v4.36 – 20.9.2026** · Kompaktoitu 20.9.2026 (täysi historia git-historiassa, viimeisin täysi versio `ffb1dd9`)

## 🏮 Pääportaali – Pimeä Katu

| Ominaisuus | Tila |
|-----------|------|
| Katunäkymä, hahmo, 9 lamppua, 9 ovea, ajoneuvot, eläimet, sää | ✅ |
| Hahmon viilaus | ✅ v4.03–v4.05 – silmä + `lookY`, lipan/kasvojen/leuan varjot, maakosketusvarjo, hengitys, potkun ennakointi (`ANTICIP`) + nojaus, hit pause, dynaaminen lampunvalo (viuhka-VFX + käsien heilunta poistettu) |
| Pelaajan syvyysskaalaus | ✅ v4.31 – `playerDepthScale()`: ±10 % (0,90 kauas / 1,00 keskikohdalla y=315 / 1,10 lähelle), ankkuri jalkojen kosketuspisteessä (myös tainnutusasento + varjo); visuaalinen vain – hitboxit, törmäykset ja kamera ennallaan |
| Kolikot | ✅ v3.86 / v4.22 – katu: 1 kpl, näkyvissä 10 s + 30 s tauko, 120 s respawn; DG1 1 kpl, DG2 1/taso; syntymäpaketti 2 kolikkoa (tallennettu saldo voittaa) |
| Hampurilaiset + BAR | ✅ v3.73 / v4.12 – 5 alussa, +1 / 40 s; BAR: `▲/W` osta 1 (katto 10), `▼/S` peru vierailun ostot, `(o)/Space` poistu |
| 🖼️ BAR-huoneen seinätaulu | ✅ v4.25–v4.26 – `assets/justiina.png` mustilla kehyksillä (kuva 57,9×48, kehys 61,9×52), hampurilainen 2/3, asettelu alhaalta ylös, `winW`/`needPx`/`fitFs`-sovitus vaakanäyttöön; memo `docs/bar-memo.md` |
| Talot: syvyys + ikkunat | ✅ v4.07–v4.10 – `buildingScale` 100/95/90 %, kehykset pois 3 rivin taloista, pimeiden ikkunoiden syvennys |
| Taustan kaupungin siluetti | ✅ v4.06 – parallaksi 0.4, skaala 0.5, 4 kattomallia |
| Puut + ruohotupsut | ✅ v3.82–v4.02 – siluetit, huojunta tuulessa, 3 tupsua / puu |
| Sähkökaapit (2) | ✅ v3.90 / v4.01 – 2 px alemmas, 20 % pienempi (8×14), vilkkutahti /520; osuma −1 🍔 |
| Mopo + ajoneuvoäänet | ✅ v3.81 / v4.08 – punainen runko + kuski pelaajan väreillä; panoroiva surina |
| Kolikko potkusta / oviukko | ✅ v3.93 / v4.14–v4.15 – 1/5 kolikko (30 s cooldown); oviukko 1/8 + 30 s, ei väistettävissä, 3 s jäädytys + −1 🍔 |
| Ovikynnykset | ✅ v4.13 – kynnyslaatta + 1 kivirivi, kiveys vain y 317–324 |
| Mobiilikamera + ohjaimet | ✅ v3.91 – zoom + `camX` seuraa; D-pad + ⚡ overlay |
| Taustamusiikki + SFX | ✅ v3.28 / v4.16–v4.21 – syntikkalooppi (`MUSIC_SOURCE 'synth'`, 30 s + 0,6 s häivytys + 30–90 s tauko); `'mp3'` varatie (`knived_unafraid.mp3`, 30 s); `running.mp3` ei palaa |
| 🎵 Jukebox-huone (talo 5) | ✅ v4.20–v4.23 – ikkunat valaistuiksi → ovi auki; 3 kappaletta (`Knived - …`), 1 kolikko / koko kappale; valinta ▲/▼ 0–3, soidessa lukossa; nuolet v4.21; mobiilasettelu v4.22; **v4.27 – tiedostonimet korjattu vastaamaan sisältöä (`jukebox/Knived_*.mp3`; aiemmin raita 1 ja 2 soivat ristissä)**; **v4.34 – auki vain öisin (klo 20–06)** |
| Palkintohuone (talo 8) | ✅ kaikki avaimet TAI 3 kolikkoa |
| 💰 Salainen kolikkopalkkio (testityökalu) | ✅ v4.23 – vitoslamppu 20 potkua → +20 kolikkoa, hiljainen; putki katkeaa toiseen lamppuun / 2 s taukoon, cooldown 60 s; avain-cheat 5 potkusta ennallaan |
| 🛏️ Makuuhuone (ex-palkintohuone, talo 7) | ✅ v4.33 – lukko = **3 avainta** (kolikkoreitti poistettu); avaimilla ovi aina auki ilman lamppua. Paksu sänky sivusta + ikkuna (kuu/aurinko), rivit **Nuku / Poistu** (▲/▼ + `(o)`/Space/⚡), mobiilisovitus jukeboxin mallilla. **Nuku** = pimennys ~1,5 s → päivä ⇄ yö + tallennus; **Poistu** = ei muutosta. Ilmainen. **Testattu käyttäjän toimesta 20.9.2026 → "toimii juuri kuten pitää"** |
| ☀️ Päivä/yö (lopputila) | ✅ v4.32 / v4.33 – 3 avainta → `dayT` 0→1 (**~20 s**): päivätaivas, **kuu → aurinko**, tähdet/tähdenlento/satelliitti pois, lamppujen hehku himmenee (`lamp.lit` ennallaan), additive-päivänvalo-wash; liuku odottaa kadulle paluuta. **v4.33:** tila tallennetaan (`state.isDay`), liuku molempiin suuntiin (`NIGHT_FADE_FRAMES`) ja makuuhuoneen Nuku vaihtaa sen; **auringon valkoinen sisäkiekko poistettu**; testityökalut `?day=1` / `?day=0` |
| Popupit | ✅ v3.99 / v4.00 – ohjeet pois HUD:sta; `showNotification(2500 ms)`, aloitusohje 4500 ms |
| 🌙 Jukebox & Hedelmäpeli vain öisin | ✅ v4.34 – päivällä (`dayT >= 0.5`) ovesta teksti-popup `Avoinna` / `Klo 20 - 06` (`CLOSED_SIGN`, `nightOnlyClosed()`); jukeboxin ovea ei potkita eikä valoja sytytetä päivällä. Yöllä portti ennallaan. `#notification` sai `white-space: pre-line` (2 riviä). **Talousarvot ennallaan** |
| 🚗 Ajovalot päivällä | ✅ v4.35 – `VEHICLE_HEADLIGHT_DIM 1`: auton ja mopon etuvalo + hehku ja valokeila himmenevät `dayT`:n myötä (`headlightDim`/`headlightOn`), pois kokonaan päivällä; takavalot, ambulanssin kattovilkku ja `hasHeadlight`-arpa ennallaan |
| 🛏️ Nukkumisen Zzz | ✅ v4.36 – `SLEEP_DARK_FRAMES 45` (~0,75 s pimennys) + `SLEEP_ZZZ_FRAMES 180` → Zzz näkyy tasan **3 s** (yhteensä ~3,75 s); pimennys lasketaan kuluneesta ajasta, joten Zzz ei enää vilahtele |

## 🍒 Hedelmäpeli (fruitgame/) – talo 7, auki vain öisin (v4.34)

| Ominaisuus | Tila |
|-----------|------|
| 3 rullaa / 1 voittolinja, 5 käsipiirrettyä symbolia (canvas 640×400) | ✅ Vaihe 1 |
| Painot 🍒7 🍋5 🔔4 🍔2 💎2, maksut 💎35 🍔20 🔔12 🍋7 🍒4 + pari = panos takaisin, panos 1 → RTP 78,49 % | ✅ 125/125 yhdistelmää + 1 M simulaatio |
| Ilmainen pyöräytys 1 / 120 s (pelin oma avain `pimeakatu_fruit_free`) | ✅ v4.11 |
| Kytkentä katuun: `fruitSync` / `fruitBet` / `fruitWin` / `RETURN_TO_STREET` + saldo-echo | ✅ v4.11 |
| Debug-korjaukset 19.9.2026: `new FruitGame()` käynnistys + `box-sizing: content-box` | ✅ |
| 🖼️ Pelihuoneen seinäkuva | ✅ v4.28–v4.30 – `#wall-pic` HTML-elementtinä (ei canvasissa), koko vapaasta seinätilasta (`WALL_PIC_H_RATIO 0.28`, min 90 px, rako 0), keskitetty ja kiinni pelikentän yläreunassa, vaakatasossa piiloon; kuva `fruitgame/assets/dude_mv.jpg` (MV, v4.30) |
| 🌙 Aukiolo | ✅ v4.34 – auki vain öisin (klo 20–06); päivällä ovi → popup `Avoinna` / `Klo 20 - 06` (`CLOSED_SIGN`), ei `enterGame`ia |
| Dokumentaatio | ✅ `docs/fruit-game-memo.md` |

## ⛏️ Dig Game · 💎 Dig Däsh · ✈️ Blue Mäx

| Peli | Tila |
|------|------|
| ⛏️ Dig Game (`digGame1/`) | ✅ valmis – yksi yhtenäinen kenttä (~77 ruutua), kolikot 1 kpl, avain → Dig Däsh |
| 💎 Dig Däsh (`digGame2/`) | ✅ valmis – 4 tasoa, kolikot 1/taso (4 kpl), avain → Blue Mäx; näkyvä nimi "Dig Däsh" (tunnisteet `boulder*` ennallaan) |
| ✈️ Blue Mäx (`bm/`) | ✅ pelattava – lento, taistelu, mittari-HUD, wrap-around, mobiili-HUD; **TESTIMODE päällä** (viholliset minimissä) → palautettava 60 % aggressiolle |

## 🛠️ Infrastruktuuri

| Ominaisuus | Tila |
|-----------|------|
| `.clinerules/` (01–05) + `memory-bank/` + Git | ✅ |
| Tekijänoikeudet | ✅ 20.9.2026 – juuren uusi `LICENSE` (Copyright (c) 2024–2026 Teppo Ålander, All rights reserved, ei myönnä lisenssiä eikä käyttöoikeutta; myös grafiikka/äänet/`jukebox/`-kappaleet mainittu) + README-osio "Tekijänoikeudet / Copyright"; tekijänimi korjattu `Aland` → `Ålander` |
| 🔒 Talousbalanssi lukittu | ✅ v4.24 – sääntö 04 + `docs/economy-balance-memo.md`; ei koodimuutoksia |
| Muistipankin kompaktio | ✅ 20.9.2026 – `activeContext.md` 83 kt → ~16 kt, `progress.md` ja `systemPatterns.md` tiivistetty; täysi historia git-historiassa (`ffb1dd9`) |
| Pelinimien yhdenmukaistus | ✅ 20.9.2026 – näkyvät nimet "Dig Däsh" ja "Blue Mäx" kaikkialla; sisäiset tunnisteet ennallaan |
| Julkaisu | GitHub Pages `https://teppoaland.github.io/pimeakatu/` |

## 🧪 Testipenkit (ei repossa)

`%TEMP%\*.cjs` – `street-bar-test`, `street-bar-picture-test`, `street-jukebox-test`, `street-jukebox-layout-test`,
`street-cheat-test`, `street-avenger-test`, `street-threshold-test`, `street-winframe-test`, `street-fruit-test`,
`street-bm-path-test`, `audio-music-test`, `audio-jukebox-test`, `ftest` (hedelmäpeli). Tekniikka: Node `vm` +
canvas/document-stub, rAF käsin ohjattuna.

