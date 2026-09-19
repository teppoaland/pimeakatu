# 🎯 Aktiivinen konteksti

> **Kevyt:** Vain tämä tiedosto luetaan session alussa.

---

## 📌 Kommunikaatiosääntö (KÄYTTÄJÄN PYYNTÖ)

> **"Lue membank"** → lue muistipankki hiljaa itseäsi varten. **ÄLÄ anna yhteenvetoa.** Muistipankki on Clinea varten, ei käyttäjälle raportoitavaksi. Käyttäjä on pyytänyt tätä useamman kerran.

---

## 📍 Nyt

**v4.01** | 19.9.2026 | Sähkökaappi: toinen identtinen ilmentymä talon 7 (buildings[6], x 560–610, matala h 145) vasemmalle seinälle x 560 (2px rako oveen, ikkunat kaapin yläpuolella – sama suhde kuin talossa 3). `electricCabinet` → `electricCabinets`-taulukko (2 kpl); törmäysloopissa `for (const cab of electricCabinets)` + `if (player.knockedDown) break;` (logiikka muuten identtinen); drawElectricCabinet piirtää molemmat samalla koodilla (vilkkuva valo synkassa). Versio v4.00 → v4.01.

**v4.00** | 19.9.2026 | Aloituspopupin (showSpawnHint: 'Liiku kadulla, potki kaikkea…') näyttöaika +2s → 4500 ms. showNotification sai valinnaisen 2. parametrin `durationMs` (oletus 2500 ms) → kaikki muut popupit (kolikko, avaimet, ovet, varoitus) ennallaan 2.5 s + fade 0.5 s. Vain showSpawnHint kutsuu arvolla 4500.

**v3.99** | 19.9.2026 | Peliohjeet poistettu HUD-palkista (street.js updateHUD + index.html #hud-bar tyhjä). Ohje näytetään nyt pop-upina (sama kuin kolikkoilmoitus, showNotification): showSpawnHint() kutsutaan init()ssä vain kun tila on oletus/0 (ensimmäinen lataus tai kuoleman reset), teksti 'Liiku kadulla, potki kaikkea, mutta omalla vastuulla. Saattaa asukkaat hermostua! Ja muista Syödä!'. HUD näyttää nyt vain statuksen (avaimet/kolikot/hampurilaiset).

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