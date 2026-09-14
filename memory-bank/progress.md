# 📊 Projektin edistyminen

> **Tarkoitus:** Seurataan mitä on valmiina ja mitä on tekemättä. Päivitetään jokaisen alataskin päätteeksi.

---

## 🏮 Pääportaali – Pimeä Katu

| Ominaisuus | Tila | Huomiot |
|-----------|------|---------|
| Katunäkymä ja hahmo | ✅ Valmis | 9 taloa, 5 lamppua |
| Lamppujen potkiminen | ✅ Valmis | 5 lamppua sytytettävissä |
| Ovista sisään astuminen | ✅ Valmis | 5 aktiivista ovea |
| Kolikon kerääminen | ✅ Valmis | v3.45: Satunnainen X-sijainti (50–730) joka latauskerralla |
| Mobiiliohjaimet | ✅ Valmis | v1.2: JS force-show + D-pad + ⚡-nappi |
| CRT-retro-teema | ✅ Valmis | Scanline-efekti, vihreä fontti |
| Ääniefektit | ✅ Valmis | Potku (0.24) + kävely (0.12 lowpass-kahina) |
| Kukkaruukku-taloista | ✅ Valmis | Talot 0,2,4,6: valo varoituksena, potku → ruukku → tainnutus 10s |
| Katueläimet | ✅ Valmis | Hiiri/rotta (lineaarinen), jänis (loikkii, pysähtyy), 15s välein |
| Ajoneuvot kadulla | ✅ v3.51 | Kaksisuuntainen (L→R 340 + R→L 328), 3 tyyppiä: 🚗 auto, 🏍️ MP, 🚑 ambulanssi (valkoinen, punainen risti, keltainen vilkku, 20%) |
| Valojen elävöitys | ✅ Valmis | RGB-tuikinta ikkunoissa, moskiitot lampuissa |
| Poutayö-taivas | ✅ v3.40 | Sirppikuu + cirrus/hazy-pilvikaistale, tuuli 1–4 px/s |
| Etualan maisemointi | ✅ v3.41 | Kiveys, ruohot, viemärikannet + höyry, sanomalehti, kuoriainen |
| Rauta-aita | ✅ v3.42 | Musta takorauta-aita alalaidassa: pystypiikit, vaakaraudat, keskiaukko 130px, pallopäiset tolpat |
| Ruohot aidan juuressa | ✅ v3.42 | Siirretty kiveykseltä aidan alareunan eteen |
| Eläinten satunnainen rata | ✅ v3.42 | Juoksukorkeus arvotaan 305–335 jokaiselle spawnille |
| Lamppujen korjaus | ✅ v3.42 | Tolpan juuri +15px alas, kupu poleTop-8 (oli -22) |
| Lamppujen törmäysesto | ✅ v3.44 | Kiertäminen alhaalta (y>295). PLAYER_Y_MIN=280, MAX=350 (aidan taakse). Aita pelaajan päällä. |
| Taustamusiikki | ✅ Valmis | v3.28: "Running Free" täysi bändisoundi (rummut+basso+kitara+melodia, audio.js) |
| Talojen ulkoasun satunnaistus | ✅ v3.56 | 18 värisävyä + 7 lippatyyliä + 5 ovityyliä, arvotaan per talo joka F5 |

---

## ⛏️ Dig Game (digGame1/)

| Ominaisuus | Tila | Huomiot |
|-----------|------|---------|
| Yksi yhtenäinen maailma | ✅ Valmis | ~77 ruutua leveä |
| Kaivumekaniikka | ✅ Valmis | Välilyönti + suunta |
| Työntö ja veto | ✅ Valmis | Kivet, puut, talot |
| Painovoima | ✅ Valmis | Puut/talot putoavat |
| Viholliset | ✅ Valmis | Tulikärpänen, perhonen |
| Ääniefektit | ✅ Valmis | Web Audio API |
| Pisteytys | ✅ Valmis | Timantit, pudotukset |
| Kosketusohjaus | ✅ Valmis | Mobiili-D-pad |
| Iframe-integraatio | ✅ Valmis | `game_main.html` suoraan portaalissa |
| Buildaus poistettu | ✅ v3.18 | `dig_game.html` poistettu, ei enää pakkausta |
| Overlay skaalautuvuus | ✅ Korjattu | v3.17: fontit pienennetty, scrollaus, pystytilakehote |
| Timanttien keräysseuranta | ✅ Valmis | UI-laskuri |
| Poutayö-taivas | ✅ v3.30 | Tähdet, sirppikuu, cirrus+hazy (>100px), tuulianimaatio 7–16 px/s |
| Avain oikeaan alakulmaan | ✅ v3.30 | Siirretty SURFACE_ROW → BEDROCK_ROW-1 |
| Avain maalina + paluu kadulle | ✅ v3.47 | KEY-tiili vain oikeassa alakulmassa, segmenttien vanhat X→KEY poistettu |

---

## 💎 Boulder Däsh (digGame2/)

| Ominaisuus | Tila | Huomiot |
|-----------|------|---------|
| 4 tasoa | ✅ Valmis | Eri teemat ja vaikeudet |
| Painovoima | ✅ Valmis | Keikahdusviive 1 kehys |
| Viholliset | ✅ Valmis | Tulikärpänen, perhonen |
| Elämät (3) | ✅ Valmis | INITIAL_LIVES = 3 |
| Uloskäynti | ✅ v3.48 | Taso 1: kaikki 7 timanttia pakko kerätä (oli 5) |
| Aikaraja per taso | ✅ Valmis | Laskuri HUD:ssa |
| Ääniefektit | ✅ Valmis | Web Audio API |
| Kosketusohjaus | ✅ Valmis | Mobiili-D-pad |
| Iframe-integraatio | ✅ Valmis | Portaaliyhteensopiva, `game_main.html` suoraan |
| Debug-tila | ✅ Valmis | Debugissa avain heti kentästä 1 |
| Uusia kenttiä | ❌ Ei vielä | `levels.js` laajennettavissa |
| Pääsiäismunat | ❌ Ei vielä | `docs/boulder-dash-memo.md` ideoita |
| Ennätyspisteet | ❌ Ei vielä | localStorage-tallennus |

---

## ✈️ Blue Mäx (bluemax_c64/)

| Ominaisuus | Tila | Huomiot |
|-----------|------|---------|
| Pelin runko | ✅ Valmis | Lentely, ammunta, pommitus, laskeutuminen, tankkaus |
| Rakennusten tuho | ✅ Valmis | Pommi + KK-tuli, raunio-grafiikka |
| Ilmapallo + avain | ✅ Valmis | Ilmestyy 8 tuhotun talon JA 60s lennon jälkeen |
| Viholliset | ✅ Valmis | 100% teho: spawn 0.0077, sht 92-276/69-244 |
| Mobiiliohjaimet | ✅ Valmis | D-pad + B/G/L-napit, landscape overlay |
| Polttoaineen loppuminen | ✅ Valmis | Syöksymaahan + 3-kerroksinen räjähdys |
| Maailman wrap-around | ✅ Valmis | 12000px, kierroksen vaihto |
| Canvas-HUD | ✅ Valmis | Musta ⅓ mittaripaneeli: polttoainepalkki, 💣, ❤️, ▲korkeus |
| Kenttänousu | ✅ Valmis | Kentän ulkopuolella alt≤1 → STALL-kuolema, ei ohjausta rullauksessa |
| Nimi | ✅ Valmis | "Blue Mäx" tekijänoikeussyistä |

---

## 🔫 Commando (commando_c64/)

| Ominaisuus | Tila | Huomiot |
|-----------|------|---------|
| Pelin runko | ✅ Valmis | MVP: ylhäältä kuvattu, vierivä, 4 tiedostoa. **Jäissä** – tarvitaan valmis 3D HTML-moottori |
| Pelaajan ohjaus | ✅ Valmis | 8-suuntainen, WASD/nuolet + D-pad |
| Auto-fire kivääri | ✅ Valmis | 0.15s välein ylös |
| Kranaatit | ✅ Valmis | B-nappi, 6 kpl, räjähdyssäde 50px |
| Viholliset | ✅ Valmis | Sotilaat spawnaavat ylhäältä, ampuvat alas |
| Esteet | ✅ Valmis | Hiekkasäkit + bunkkerit, generoituva maasto |
| Elämät (3) | ✅ Valmis | Kuolemattomuus 2s osuman jälkeen |
| Voittoehto | ✅ Valmis | 2000px scrollattu → avain portaaliin |
| Ääniefektit | ✅ Valmis | Kivääri, kranaatti, räjähdys, kuolema, voitto |
| Kosketusohjaus | ✅ Valmis | D-pad + 💣-nappi |
| Porttaali-integraatio | ❌ Ei vielä | `gameUrl: null`, odottaa testausta |
| Useampia kenttiä | ❌ Ei vielä | Vain 1 kenttä MVP:ssä |
| Boss-vihollisia | ❌ Ei vielä | Jatkokehitys |

---

## 🛠️ Infrastruktuuri

| Ominaisuus | Tila | Huomiot |
|-----------|------|---------|
| `.clinerules/` säännöt | ✅ Valmis | `01-general-architecture.md`, `02-game-core.md`, `03-versioning.md` |
| `memory-bank/` muisti | ✅ Valmis | `activeContext.md`, `systemPatterns.md`, `progress.md` |
| `.clineignore` | ✅ Valmis | Tokenien säästö |
| MCP memory-palvelin | ✅ Valmis | `cline_mcp_settings.json` konfiguroitu |
| Git-versionhallinta | ✅ Valmis | Lokaali git |

---

## 📝 Seuraavat kehitysaskeleet

1. **Commando jäissä** – etsi valmis 3D HTML-pelimoottori pohjaksi
2. ~~Lisää ääniefektit pääportaaliin~~ ✅ v3.27
3. Toteuta pääsiäismunia Boulder Dashiin
4. Lisää ennätyspisteet (localStorage)
5. Blue Max: poista debug-rajoitukset / lisää vaikeustasot