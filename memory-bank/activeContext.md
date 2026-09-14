# 🎯 Aktiivinen konteksti

> **Kevyt:** Vain tämä tiedosto luetaan session alussa.

---

## 📍 Nyt

**v3.51** | 14.9.2026 | Kaksisuuntainen liikenne + 🚑 ambulanssi: alempi (L→R, y=340) + ylempi (R→L, y=328). Kolmas ajoneuvotyyppi: valkoinen pakettiauto punaisella ristillä ja keltaisella vilkulla, nopeus 1.8–3.0 (hiiren vauhti). Pelaaja-animaatio elävöitetty.

## 🔒 Lukitut osa-alueet

- **Dialogi-tekstit:** Kaikkien pelien overlay/intro/viestit **LUKITTU**. Ei muutoksia ilman erillistä lupaa.
- **Pelien välinen logiikka:** Koko polku testattu läpi järjestyksessä (DG1 → DG2 → Blue Mäx). Avaimet, postMessage-kutsut, paluu kadulle — **LUKITTU**. Ei muutoksia ilman erillistä lupaa.

## 🔜 Seuraavaksi (odottaa valintaa)

- **Commando:** Jäissä – tarvitaan valmis 3D HTML-moottori pohjaksi ennen jatkoa
- Blue Mäx: TESTIMODE pois → palauta vihollisten ammunta normaalille 60% aggressiolle
- **Ääniefektit pääportaaliin:** ✅ Valmis v3.28 – "Running Free" täysi bändisoundi (rummut + basso + kitara + melodia, audio.js)
- **Pääsiäismunat Boulder Dashiin**

## ⚠️ Huomiot

- **Pääportaali:** `position: absolute`, `opacity: 0.65`, landscape overlay, D-pad + ⚡
- **Notifikaatiot:** Vain ovi/kolikko, `setTimeout` 2.5s + fade 0.5s
- **Blue Mäx:** ✅ v3.10 – Musta ⅓-leveä mittari-HUD (polttoainepalkki + pommit + elämät + korkeus), ei pisteitä. Kentän ulkopuolella alt≤1 → STALL-kuolema. Ohjaus pois ST.TO:n ajalta. Viholliset 100% teholla. Polttoaineen loputtua syöksy + wrap-around, 3-kerroksinen räjähdys, mobiili-HUD overlayna. B=pommi, G=KK, L=laskeudu. Ilmapallo 8 taloa + 60s. Tankkaus. Kaikki talot bonus +5000.
- **Boulder Dash:** Debugissa avain heti | **Dig Game:** Buildaus poistettu, `game_main.html` käytössä suoraan
- **Versio:** v3.3 GitHub Pagesissa `https://teppoaland.github.io/pimeakatu/`