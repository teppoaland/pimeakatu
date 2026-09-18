# 🎯 Aktiivinen konteksti

> **Kevyt:** Vain tämä tiedosto luetaan session alussa.

---

## 📌 Kommunikaatiosääntö (KÄYTTÄJÄN PYYNTÖ)

> **"Lue membank"** → lue muistipankki hiljaa itseäsi varten. **ÄLÄ anna yhteenvetoa.** Muistipankki on Clinea varten, ei käyttäjälle raportoitavaksi. Käyttäjä on pyytänyt tätä useamman kerran.

---

## 📍 Nyt

**v3.85** | 18.9.2026 | Jatkofiksi mobiiliäänelle: MP3 ja syntikka soivat hetken päällekkäin, koska syntikan jo ajoitetut nuotit (≈10 s eteenpäin) jatkoivat soimista MP3:n alettua — `clearInterval` ei peru jo ajoitettuja oskillaattorinuotteja. Korjaus: lisätty oma `synthGain`-välivahvistin (drum/bass/guitar/lead → `synthGain` → `masterGain`), ja `startMusicLoop()` mykistää `synthGain.gain=0` (heti hiljaa) + tyhjentää `loopId`:n; `startSynth()` palauttaa `synthGain.gain=1`. Kuolinääni (gongi) kulkee yhä suoraan `masterGain`iin, joten se ei mykisty.

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
- **Notifikaatiot:** Vain ovi/kolikko, `setTimeout` 2.5s + fade 0.5s
- **Blue Mäx:** ✅ v3.10 – Musta ⅓-leveä mittari-HUD (polttoainepalkki + pommit + elämät + korkeus), ei pisteitä. Kentän ulkopuolella alt≤1 → STALL-kuolema. Ohjaus pois ST.TO:n ajalta. Viholliset 100% teholla. Polttoaineen loputtua syöksy + wrap-around, 3-kerroksinen räjähdys, mobiili-HUD overlayna. B=pommi, G=KK, L=laskeudu. Ilmapallo 8 taloa + 60s. Tankkaus. Kaikki talot bonus +5000.
- **Boulder Dash:** Debugissa avain heti | **Dig Game:** Buildaus poistettu, `game_main.html` käytössä suoraan
- **Versio:** v3.3 GitHub Pagesissa `https://teppoaland.github.io/pimeakatu/`