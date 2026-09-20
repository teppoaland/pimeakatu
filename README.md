# 🏮 Pimeä Katu – Pikaohje

## Avaaminen
Avaa `index.html` selaimessa. Ei palvelinta – toimii `file:///` -protokollalla.

## Ohjaimet

| Näppäin | Toiminto |
|---|---|
| ⬆⬇⬅➡ / WASD | Liiku kadulla |
| Välilyönti | **Oven edessä** = astu sisään / **Muualla** = potku (lamppuun osuessa sytyttää) |
| R | - |
| ✕ (oikea yläkulma) | Nollaa koko peli (localStorage tyhjäksi) |

## Kehitys

```
index.html          → avaa selaimessa testataksesi
street.js           → päävalikon logiikka (muokkaus täällä)
style.css           → ulkoasu (CRT-efekti, värit, fontit)
gameState.js        → tallennus (localStorage-rakenne)
digGame1/           → ⛏️ Dig Game (kaivuripeli)
digGame2/           → 💎 Dig Däsh (timanttipeli)
docs/               → dokumentaatio ja suunnitelmat
```

## Git

Projekti käyttää **lokaalia git-versionhallintaa**. Ei etärepositoriota.

```bash
git init                  # alusta (jos ei vielä tehty)
git add .
git commit -m "viesti"
```

## Alapelien buildaus

Alapelit (`digGame1/`, `digGame2/`, `bm/`) käyttävät
`game_main.html`-kehitysversiota suoraan iframe-integraatiossa. Erillistä buildausta
yhteen tiedostoon ei enää tarvita – kehitys on suoraviivaisempaa ja kaikki tiedostot
ovat aina ajan tasalla.

## Tiedostot joita ei versionhallita

- `node_modules/` – ei käytössä
- IDE-asetukset (`.vscode/`, `.idea/`)
- Käyttöjärjestelmän roskat (`.DS_Store`, `Thumbs.db`)
- Väliaikaiset tiedostot (`tmp/`, `*.log`)