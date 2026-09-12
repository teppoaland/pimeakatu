# 🎯 Aktiivinen konteksti

> **Kevyt:** Vain tämä tiedosto luetaan session alussa. `progress.md` ja `systemPatterns.md` vain tarvittaessa.

---

## 📍 Nyt

**v3.0** | 12.9.2026 | Blue Mäx: talot tuhottavissa (pommi+KK), ilmapallo 8 tuhotun talon jälkeen, viholliset ~60% aggressiolla

## 🔜 Seuraavaksi

- Commando-pelin aloitus
- Blue Max: debugin purku
- Ääniefektit pääportaaliin
- Pääsiäismunat Boulder Dashiin

## ⚠️ Huomiot

- **Ohjaimet:** `position: absolute`, `opacity: 0.65`, `@media (max-width:768px),(max-height:768px)`, pysty+vaaka sama
- **Työpöytä:** Ohjaimet piilossa `@media (min-width:769px) and (min-height:769px)`
- **Notifikaatiot:** Vain ovi/kolikko, ei lamppuja. `setTimeout` 1.5s + fade 0.5s
- **Potkuääni:** Web Audio API, 60ms highpass-kohina
- **Versio:** v2.2 GitHub Pagesissa `https://teppoaland.github.io/pimeakatu/`
- Blue Max pelikunnossa (debug) | Commando ei aloitettu