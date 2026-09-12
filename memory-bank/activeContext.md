# 🎯 Aktiivinen konteksti

> **Kevyt:** Vain tämä tiedosto luetaan session alussa.

---

## 📍 Nyt

**v3.16** | 12.9.2026 | Commando MVP-pelimoottori valmis (4 tiedostoa) + bugikorjaus: syntaksivirhe korjattu (respawn), maasto #484, canvas min-height 200px

## 🔜 Seuraavaksi (odottaa valintaa)

- Commando-pelin aloitus
- Blue Mäx: TESTIMODE pois → palauta vihollisten ammunta normaalille 60% aggressiolle
- Ääniefektit pääportaaliin
- Pääsiäismunat Boulder Dashiin

## ⚠️ Huomiot

- **Pääportaali:** `position: absolute`, `opacity: 0.65`, landscape overlay, D-pad + ⚡
- **Notifikaatiot:** Vain ovi/kolikko, `setTimeout` 1.5s + fade 0.5s
- **Blue Mäx:** ✅ v3.10 – Musta ⅓-leveä mittari-HUD (polttoainepalkki + pommit + elämät + korkeus), ei pisteitä. Kentän ulkopuolella alt≤1 → STALL-kuolema. Ohjaus pois ST.TO:n ajalta. Viholliset 100% teholla. Polttoaineen loputtua syöksy + wrap-around, 3-kerroksinen räjähdys, mobiili-HUD overlayna. B=pommi, G=KK, L=laskeudu. Ilmapallo 8 taloa + 60s. Tankkaus. Kaikki talot bonus +5000.
- **Boulder Dash:** Debugissa avain heti | **Dig Game:** Täysin valmis
- **Versio:** v3.3 GitHub Pagesissa `https://teppoaland.github.io/pimeakatu/`