# 📊 Projektin edistyminen

> **v4.42 – 20.9.2026** · Kompaktoitu 20.9.2026 (täysi historia git-historiassa, viimeisin täysi versio `ffb1dd9`)

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
| 🛏️ Makuuhuone (ex-palkintohuone, talo 7) | ✅ v4.33 / v4.43 – **v4.43: ovi aina auki** (ei avaimia eikä lamppua, päivällä ja yöllä kuten BAR; avainpopup poistettu, kynnysvalo + oven ulkoasu seuraavat samaa `sleepOpen`-ehtoa). Aiempi lukko **3 avainta** poistui; kolikkoreitti poistettu jo v4.33. Paksu sänky sivusta + ikkuna (kuu/aurinko), rivit **Nuku / Poistu** (▲/▼ + `(o)`/Space/⚡), mobiilisovitus jukeboxin mallilla. **Nuku** = pimennys ~1,5 s → päivä ⇄ yö + tallennus; **Poistu** = ei muutosta. Ilmainen. **Testattu käyttäjän toimesta 20.9.2026 → "toimii juuri kuten pitää"** |
| ☀️ Päivä/yö (lopputila) | ✅ v4.32 / v4.33 – 3 avainta → `dayT` 0→1 (**~20 s**): päivätaivas, **kuu → aurinko**, tähdet/tähdenlento/satelliitti pois, lamppujen hehku himmenee (`lamp.lit` ennallaan), additive-päivänvalo-wash; liuku odottaa kadulle paluuta. **v4.33:** tila tallennetaan (`state.isDay`), liuku molempiin suuntiin (`NIGHT_FADE_FRAMES`) ja makuuhuoneen Nuku vaihtaa sen; **auringon valkoinen sisäkiekko poistettu**; testityökalut `?day=1` / `?day=0` |
| Popupit | ✅ v3.99 / v4.00 – ohjeet pois HUD:sta; `showNotification(2500 ms)`, aloitusohje 4500 ms |
| 🌙 Jukebox & Hedelmäpeli vain öisin | ✅ v4.34 – päivällä (`dayT >= 0.5`) ovesta teksti-popup `Avoinna` / `Klo 20 - 06` (`CLOSED_SIGN`, `nightOnlyClosed()`); jukeboxin ovea ei potkita eikä valoja sytytetä päivällä. Yöllä portti ennallaan. `#notification` sai `white-space: pre-line` (2 riviä). **Talousarvot ennallaan** |
| 🚗 Ajovalot päivällä | ✅ v4.35 – `VEHICLE_HEADLIGHT_DIM 1`: auton ja mopon etuvalo + hehku ja valokeila himmenevät `dayT`:n myötä (`headlightDim`/`headlightOn`), pois kokonaan päivällä; takavalot, ambulanssin kattovilkku ja `hasHeadlight`-arpa ennallaan |
| 🛏️ Nukkumisen Zzz | ✅ v4.36 – `SLEEP_DARK_FRAMES 45` (~0,75 s pimennys) + `SLEEP_ZZZ_FRAMES 180` → Zzz näkyy tasan **3 s** (yhteensä ~3,75 s); pimennys lasketaan kuluneesta ajasta, joten Zzz ei enää vilahtele |
| 🚦 Päiväliikenne ×2 | ✅ v4.37 – `TRAFFIC_DAY_MULT 2`: spawn-väli 20–40 s → **10–20 s / kaista** täydellä päivällä (kerroin liukuu `dayT`:n mukana). Yöllä ennallaan; kaistat, tyypit, nopeudet ja törmäykset ennallaan (1 ajoneuvo/kaista) |
| 🚪 Päivällä ovet auki ilman lamppua | ✅ v4.38 – `lampFreeOpen()` (`DOOR_NO_LAMP_AT_DAY`, raja `CLOSED_AT_DAYT 0.5`): päivällä ovi aukeaa ilman potkaistua katuvaloa; sama ehto ohjaa oven ulkoasua (`isActive`, kynnysvalo). Avainportit, makuuhuoneen 3 avainta, BAR, yöaukiolo ja potkumekaniikka ennallaan |
| 🦟 Moskiitot pois päivältä | ✅ v4.38 – `MOSQUITO_DAY_DIM 1`: moskiitot vain kun `1 - MOSQUITO_DAY_DIM * dayT > 0.01` → yöllä piirto bitilleen ennallaan, päivällä ei näy |
| 💡 Päivä sammuttaa katuvalot | ✅ v4.38 – `dayLampsOff`: kun `dayT === 1`, kaikkien lamppujen `lit` → false + `state.litLamps` tallennetaan; lippu nollautuu vasta `dayT === 0` → sammutus kerran per auringonnousu. Valot voi yhä potkaista päälle päivällä. **Käyttäjän testaus 20.9.2026: "kuin tosielämän valoisuustunnistimet" → hyväksytty** |
| 🍔 HUD:n 🍔-varoitus | ✅ v4.39 – `HUNGER_WARN 3`: vilkkuva punainen (`burger-warning` / `burgerBlink` 0,8 s) heti kun hampurilaisia on ≤ 3 (aiemmin ≤ 2); `style.css` ennallaan |
| ☁️ Päiväpilvet tummenevat | ✅ v4.40 – `drawClouds()` liu'uttaa värin (`CLOUD_NIGHT_*` → `CLOUD_DAY_*`) ja alphan (`CLOUD_DAY_ALPHA 5×`) `dayT`:n mukaan; muoto, määrä, kaistale y 40–80, tuuli ja piirtojärjestys ennallaan; `dayT = 0` = entinen yökuva. **Käyttäjän testaus: päivä ⇄ yö -vaihdos "toimii HELVETIN hienosti", "kylmät väreet"** |
| 🛏️ Nälkä jäihin nukkuessa | ✅ v4.41 – `hungerOnHold()` (`sleepRoom || sleepPhase > 0`) pysäyttää nälkäajastimen makuuhuoneessa ja Zzz-pimennyksessä → pelaaja **ei voi kuolla nukkuessaan**; herätessä `HUNGER_WAKE_GRACE 600` (väh. 10 s aikaa reagoida, ajastin ei nollaudu täyteen). Rajaus: vain nukkuminen – BAR/jukebox/iframe-pelit ennallaan. **Lukitut arvot (2400, katto 10, hinnat, RTP) ennallaan** |
| 🌙☀️ Kuu ↔ aurinko | ✅ v4.41 – kuu seisoo yöllä oikealla (`MOON_X 680`) ja aurinko päivällä vasemmalla (`SUN_X 140`); vaihdossa **ei liukua** – pelkkä alpha-ristihäivytys (`1 − dayT` / `dayT`), joten kuu häipyy pois ja aurinko tulee näkyviin (päivä → yö toisinpäin). `dayT = 0` = entinen yökuva bitilleen |
| 💡 Yö sytyttää katuvalot yksi kerrallaan | ✅ v4.42 – kun `dayT === 0` ja pelaaja on edennyt (`state.isDay === false`), lamput syttyvät itsestään vasemmalta oikealle (~0,3 s väli: `NIGHT_LAMP_FIRST 30` / `NIGHT_LAMP_INTERVAL 18` / `NIGHT_LAMP_ORDER 'wave'`) + `playLampOn()`-naksahdus + kipinähiukkaset. `nightShowArmed` herää vain aidosta päivä→yö-siirtymästä → uudessa pelissä ja sivunlatauksessa valot potkitaan yhä itse. `kickCount` ei kasva (cheatit/ylikuumeneminen ennallaan), ovet aukeavat ilman potkua vain kun päivä/yö on ratkaistu. `?day=0` näyttää efektin heti. **Käyttäjän testaus 20.9.2026: "Tuli hieno" – sopivasti pikkuisen liioiteltu (led-valot vs. vanhat dramaattiset lamput) → hyväksytty** |
| 🚪 Makuuhuoneen ovi auki ilman avaimia | ✅ v4.43 – makuuhuoneeseen (talo 7, `buildings[7]`) pääsee **aina**: ei 3 avainta eikä lamppua, päivällä ja yöllä (kuten BAR). `handleAction()` avaa huoneen oven edestä (`lamp.bldgIdx === SLEEP_BLDG_IDX`, ehto ennen `lamp.lit \|\| lampFreeOpen()`), kuollut avainpopup poistettu; oven ulkoasu (`drawDoor()`) ja kynnysvalo (`drawThresholdPaving()`) seuraavat samaa `sleepOpen`-ehtoa. Avainportit ja koko muu katu ennallaan; **talous ennallaan** (Nuku/Poistu ilmaisia). Seuraus: nukkua voi heti ensimmäisenä yönä → `state.isDay` voi ratketa ennen avaimia. **Käyttäjän pyyntö 20.9.2026** |
| 🛏️ Nuku → +1 🍔 | ✅ v4.44 – makuuhuoneessa Nuku antaa **+1 🍔** herätessä (katto 10, sama kuin BAR). Käyttäjän pyyntö 21.9.2026. Nälkä jäissä ja HUNGER_WAKE_GRACE ennallaan; muut talousarvot (2400, katto 10, hinnat, RTP) eivät muutu |




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

