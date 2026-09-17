# 🏗️ Yleiset arkkitehtuurisäännöt

> **Tarkoitus:** Nämä ovat projektin "suojakaiteet". Cline noudattaa näitä automaattisesti jokaisessa istunnossa.

---

## Projektin luonne

Tämä on **modulaarinen peliprojekti**, joka koostuu:
- **Pääsivusta** (`index.html`, `gameState.js`, `street.js`, `style.css`) – "Pimeä Katu" -peliportaali
- **Erillisistä alipeleistä** omissa kansioissaan – itsenäisiä kokonaisuuksia

## Pääsivun suojaaminen

> ⚠️ **KRIITTINEN:** Älä koskaan muokkaa pääsivun tiedostoja ilman erillistä, nimenomaista pyyntöä.

Suojatut päätiedostot:
- `index.html` – Pääportaalin HTML-rakenne
- `gameState.js` – localStorage-tilanhallinta ja pelien välinen kommunikaatio
- `street.js` – "Pimeä Katu" -pääpelin logiikka
- `style.css` – CRT-retro-teema ja responsiivisuus

**Poikkeus:** Näitä saa muokata vain jos käyttäjä eksplisiittisesti pyytää muutosta juuri näihin tiedostoihin.

## Alapelien itsenäisyys

Jokainen alipeli on **itsenäinen kokonaisuus** omassa kansiossaan:

| Kansio | Peli | Tila |
|--------|------|------|
| `digGame1/` | ⛏️ Dig Game – kaivuripeli, yksi yhtenäinen maailma | ✅ Valmis |
| `digGame2/` | 💎 Boulder Däsh – 4 tason timanttipeli | ✅ Valmis |
| `bluemax_c64/` | ✈️ Blue Max – isometrinen lentopeli | 🚧 Tulossa |
| ~~`commando_c64/`~~ | ~~🔫 Commando~~ – **POISTETTU / EI OLEMASSA** | ❌ Kielletty |

> **Sääntö:** Älä sekoita eri pelien koodia keskenään. Jokainen peli käyttää vain oman kansionsa tiedostoja.

## 🚫 commando_c64/ – KIELLETTY HAARA

> ⛔ **ABSOLUUTTINEN KIELTO:** `commando_c64/`-kansiota **ei saa lukea, listata, selata, muokata, eikä siihen saa viitata millään tavalla**. Tätä kansiota ei ole olemassa projektissa. Älä koskaan käytä mitään työkalua (read_files, search_codebase, run_commands, editor) mihinkään polkuun joka alkaa `D:\AI\Main\commando_c64\` tai `commando_c64/`. Älä edes tarkista onko kansiota olemassa. Tämän kiellon rikkominen tuhlaa tokeneita täysin turhaan.

## Hakemistorakenne

```
D:\AI\Main\
├── index.html              Pääportaali
├── gameState.js            Tilanhallinta (localStorage)
├── street.js               Päävalikkopeli
├── style.css               CRT-teema
├── .clinerules/            Cline-säännöt (tämä hakemisto)
├── memory-bank/            Istuntojen välinen muisti
├── docs/                   Dokumentaatio ja memot
├── digGame1/               Alipeli 1
├── digGame2/               Alipeli 2
└── bluemax_c64/            Alipeli 3
```

## Yleiset käytännöt

1. **Kunnioita olemassa olevaa koodia** – älä refaktoroi ilman pyyntöä
2. **Pidä muutokset kohdistettuina** – jos teet alataskia, pysy sen scope:ssa
3. **Älä lisää riippuvuuksia** – projektissa ei käytetä npm-paketteja, kaikki on vanilla JS/CSS/HTML
4. **Kehitysversiot:** Kaikki pelit käyttävät `game_main.html`-kehitysversiota suoraan.
   - `game_main.html` = kehitysversio (lataa erilliset CSS/JS-tiedostot) – ainoa versio
   - Buildausta yhteen tiedostoon ei enää tehdä (Dig Game: `dig_game.html` poistettu)