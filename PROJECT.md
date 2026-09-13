# 🏮 Pimeä Katu – Peliportaali

**Retrohenkinen HTML5 Canvas -peliportaali**, jossa meta-peli "Pimeä Katu" toimii
pelivalikkona ja sisältää useita alapelejä iframe-pohjaisesti.

## 🎮 Päävalikko: Pimeä Katu (`street.js`)

2D-sivukuvattu pimeä kaupunkikatu. Pelaaja liikkuu nuolilla, potkii katulamppuja
syttyäkseen ja astuu talojen oviin päästäkseen alapeleihin.

| Ominaisuus | Kuvaus |
|---|---|
| Hahmon ohjaus | Nuolinäppäimet / WASD + mobiilin D-pad |
| Toiminto | Välilyönti = potku (missä vain) / ovesta sisään |
| Lamput | 5 kpl talojen väleissä – potkaise sytyttääksesi |
| Ovet | 9 talossa, 5 aktiivista (lampun takana), 4 lukittua |
| Kolikko | Löydettävissä kadun oikeasta reunasta → `inventory.coin` |
| Reset | ✕-nappi oikealla ylhäällä → tyhjentää localStorage |
| Tilanhallinta | `localStorage`: lamput + inventory säilyy F5:n yli |

## 🧩 Alapelit

### ⛏️ Dig Game (`digGame1/`)
Yksi yhtenäinen maailma, ei tasoja. Pelaaja kaivaa maan alta, pudottaa puita ja taloja,
kerää timantteja. Leveys ~77 ruutua. [Lisätiedot →](docs/dig-game-memo.md)

### 💎 Boulder Däsh (`digGame2/`)
Klassinen 4 tason Boulder Dash -tyylinen timanttienkeruupeli aikarajalla.
[Lisätiedot →](docs/boulder-dash-memo.md)

### ✈️ Blue Max (`bluemax_c64/`) – *tulossa*
Isometrinen lentely- ja pommituspeli.

### 🔫 Commando (`commando_c64/`) – *tulossa*
Ylhäältä kuvattu sotapeli.

## 📁 Projektin rakenne

```
D:\AI\Main\
├── index.html            Pääportaalin HTML
├── style.css             CRT-retro-teema + responsiivisuus
├── street.js             "Pimeä Katu" -päävalikkopeli
├── gameState.js          localStorage-tilanhallinta
├── .gitignore            Versionhallinnan ignooraukset
├── PROJECT.md            Tämä tiedosto
├── CHANGELOG.md          Muutoshistoria
├── README.md             Pikaohje kehittäjälle
│
├── digGame1/             ⛏️ Dig Game
│   ├── css/style.css
│   ├── js/ (8 tiedostoa)
│   ├── game_main.html    Kehitysversio (ainoa versio)
│
├── digGame2/             💎 Boulder Däsh
│   ├── css/style.css
│   ├── js/ (8 tiedostoa)
│   ├── boulder_dash.html Buildattu standalone
│   └── game_main.html    Kehitysversio
│
├── bluemax_c64/          ✈️ Blue Max (tulossa)
├── commando_c64/         🔫 Commando (tulossa)
├── entrance/             Varakansio
│
└── docs/
    ├── plan.md            Alkuperäinen arkkitehtuurisuunnitelma
    ├── dig-game-memo.md   Dig Game -muistio
    ├── dig-game-roadmap.md Dig Game -kehityssuunnitelma
    └── boulder-dash-memo.md Boulder Däsh -muistio
```

## 🔧 Tekninen toteutus

- **Puhdas JavaScript** – ei ulkoisia kirjastoja, ei build-työkaluja
- **Canvas-pohjainen** renderöinti (`street.js` käyttää `<canvas>`-elementtiä)
- **iframe-integraatio** – alapelit ladataan iframe-overlayhin
- **localStorage** – pelitila säilyy selainistuntojen yli (`pimeakatu_gamestate`)
- **CRT Scanline** CSS-efekti retro-tunnelmaa varten
- **Mobiilituki** – D-pad + toimintanappi, `touch-action: none`
- **Responsiivinen** – canvas skaalautuu näytön kokoon

## 🚀 Käynnistys

Avaa `index.html` selaimessa. Ei vaadi palvelinta – toimii suoraan tiedostosta.

## 🧪 Tilan nollaus

Klikkaa oikean yläkulman **✕**-nappia → vahvista → localStorage tyhjennetään ja sivu latautuu uudelleen.