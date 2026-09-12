# 📊 Projektin edistyminen

> **Tarkoitus:** Seurataan mitä on valmiina ja mitä on tekemättä. Päivitetään jokaisen alataskin päätteeksi.

---

## 🏮 Pääportaali – Pimeä Katu

| Ominaisuus | Tila | Huomiot |
|-----------|------|---------|
| Katunäkymä ja hahmo | ✅ Valmis | 9 taloa, 5 lamppua |
| Lamppujen potkiminen | ✅ Valmis | 5 lamppua sytytettävissä |
| Ovista sisään astuminen | ✅ Valmis | 5 aktiivista ovea |
| Kolikon kerääminen | ✅ Valmis | Kadun oikeassa reunassa |
| Mobiiliohjaimet | ✅ Valmis | v1.2: JS force-show + D-pad + ⚡-nappi |
| CRT-retro-teema | ✅ Valmis | Scanline-efekti, vihreä fontti |
| Ääniefektit | ❌ Ei vielä | Web Audio API -äänet puuttuvat |
| Päivä-/yökierto | ❌ Ei vielä | Mahdollinen jatkokehitys |

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
| Iframe-integraatio | ✅ Valmis | Portaaliyhteensopiva |
| Timanttien keräysseuranta | ✅ Valmis | UI-laskuri |

---

## 💎 Boulder Däsh (digGame2/)

| Ominaisuus | Tila | Huomiot |
|-----------|------|---------|
| 4 tasoa | ✅ Valmis | Eri teemat ja vaikeudet |
| Painovoima | ✅ Valmis | Keikahdusviive 1 kehys |
| Viholliset | ✅ Valmis | Tulikärpänen, perhonen |
| Elämät (3) | ✅ Valmis | INITIAL_LIVES = 3 |
| Uloskäynti | ✅ Valmis | Avain + timanttikiintiö |
| Aikaraja per taso | ✅ Valmis | Laskuri HUD:ssa |
| Ääniefektit | ✅ Valmis | Web Audio API |
| Kosketusohjaus | ✅ Valmis | Mobiili-D-pad |
| Iframe-integraatio | ✅ Valmis | Portaaliyhteensopiva |
| Debug-tila | ✅ Valmis | Debugissa avain heti kentästä 1 |
| Uusia kenttiä | ❌ Ei vielä | `levels.js` laajennettavissa |
| Pääsiäismunat | ❌ Ei vielä | `docs/boulder-dash-memo.md` ideoita |
| Ennätyspisteet | ❌ Ei vielä | localStorage-tallennus |

---

## ✈️ Blue Max (bluemax_c64/)

| Ominaisuus | Tila | Huomiot |
|-----------|------|---------|
| Pelin runko | ✅ Pelikunnossa | Debug-moodi, viholliset minimoitu helpompaa testausta varten |
| Viholliset | 🚧 Debug | Minimoidut viholliset; täysi vaikeus vaatii debugin poistoa |

---

## 🔫 Commando (commando_c64/)

| Ominaisuus | Tila | Huomiot |
|-----------|------|---------|
| Pelin runko | ❌ Ei aloitettu | Tyhjä kansio |

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

1. Aloita Commando-pelin kehitys
2. Lisää ääniefektit pääportaaliin
3. Toteuta pääsiäismunia Boulder Dashiin
4. Lisää ennätyspisteet (localStorage)
5. Blue Max: poista debug-rajoitukset / lisää vaikeustasot