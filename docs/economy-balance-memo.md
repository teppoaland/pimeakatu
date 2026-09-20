# 💰 Talous- ja tasapainomemo (Pimeä Katu)

> **TILA: LUKITTU 20.9.2026.** Sääntö `04-economy-balance.md` on sitova: näitä arvoja ei muuteta
> ilman käyttäjän eksplisiittistä pyyntöä. Tämä memo kertoo **miksi** lukko on olemassa ja mitkä
> arvot ovat lukossa.

---

## 1. Talouslooppi (miten raha kiertää)

```
          ┌──────────────────────── kadun tulot ────────────────────────┐
          │ katu-kolikko 1 kpl / 120 s · kolikko potkusta 1/5 (30 s cd) │
          │ hedelmäpelitalo (ilmainen pyöräytys 1/120 s)                │
          └──────────────────────────────┬──────────────────────────────┘
                                         ▼
   ┌──────────── käytön kohteet (raha pois) ─────────────┐
   │ BAR:        1 kolikko = 1 🍔 (katto 10)            │
   │ Jukebox:    1 kolikko = 1 koko kappale             │
   │ Hedelmäpeli:1 kolikko / pyöräytys, RTP 78,5 %      │
   │ Makuuhuone: 3 avainta (Nuku/Poistu ilmaisia)      │
   └────────────────────────┬───────────────────────────┘
                            ▼
   ┌──────────── paine (pakko pitää huolta) ────────────┐
   │ 🍔 5 alussa, +1 / 40 s · osuma (oviukko, ruukku,   │
   │ sähkökaappi) = −1 🍔 · 🍔 0 → kuolema + reload      │
   └────────────────────────────────────────────────────┘
```

Ydinajatus: pelaajan on **pakko jättää 1 kolikko** ja käydä katsomassa, onko 🍔:tä pakko ostaa –
ja samalla hedelmäpeli imee kolikoita, koska voitot eivät kata panoksia.

---

## 2. Lukitut arvot

### Hedelmäpeli (`fruitgame/js/constants.js`)
| Parametri | Arvo |
|---|---|
| Panos `BET` | **1 kolikko / pyöräytys** |
| Symbolipainot | 🍒 7 · 🍋 5 · 🔔 4 · 🍔 2 · 💎 2 (rullanauha 20 merkkiä) |
| Maksut | 💎 35 · 🍔 20 · 🔔 12 · 🍋 7 · 🍒 4 · `PAY_PAIR 1` = **panos takaisin** |
| RTP | **≈ 78,5 %** (analyyttinen 78,49 %, simuloitu 1 M = 78,5–78,8 %) |
| Osumat | kolmikko 6,85 % · pari 35,3 % · ei voittoa 57,9 % → **42,1 % pyöräytyksistä palauttaa jotain** |
| Ilmainen pyöräytys | 1 kpl / **120 s** (`FREE_SPIN_COOLDOWN_MS`), avain `pimeakatu_fruit_free` → max **+0,785 kolikkoa / 2 min** |
| Aukiolo (v4.34) | **Vain öisin (klo 20–06).** Päivällä (`dayT >= 0.5`) ovesta tulee teksti-popup, ei peliä. Panos/painot/maksut/RTP **ennallaan** |

Talon etu ≈ **21,5 % panoksesta**: pelaaja menettää pitkässä juoksussa noin viidenneksen
jokaisesta pyöräytyksestä – "syö rahat yleensä aina, mutta jos tuuria, voi saada hiukan enemmän,
ihan kuin oikeassa elämässä".

### Katu (`street.js`, `gameState.js`)
| Parametri | Arvo |
|---|---|
| Katu-kolikko | 1 kpl kerrallaan, respawn **120 s** (`coinRespawnTimer = 7200`) |
| Kolikko potkusta | **1/5** (`Math.random() < 0.2`) + **30 s** cooldown (`kickCoinCooldown = 1800`) |
| Hampurilaiset | alussa **5**, +1 / **40 s** (`hamburgerTimer = 2400` framet) |
| BAR | **1 kolikko = 1 🍔** (katto 10, ▼ peruu vain vierailun ostot) |
| Jukebox | **1 kolikko = 1 koko kappale**, auki vain öisin (v4.34) |
| Makuuhuone (ex-palkintohuone, talo 7) | **3 avainta** = lukko (kolikkoreitti poistettu v4.33). Nuku/Poistu **ilmaisia** → ei vaikutusta talouteen |
| Oviukko / kukkaruukku / sähkökaappi | osuma = tainnutus + **−1 🍔** (🍔 0 → kuolema) |
| Syntymäpaketti | uusi peli / reset: **2 kolikkoa + 5 🍔** |

### Aukioloaika (v4.34) – ei lukittu talousarvo

Jukebox (talo 5) ja Hedelmäpeli (talo 7) ovat auki **vain öisin (klo 20–06)**. Päivällä
(`dayT >= 0.5`, nuppi `CLOSED_AT_DAYT`) ovesta tulee sama teksti-popup kuin lukitusta
ovesta (`CLOSED_SIGN = 'Avoinna\nKlo 20 - 06'`) eikä huone/peli aukea (`street.js`).

- **Mikään lukittu arvo ei muutu:** panos 1, painot, maksut, RTP ≈ 78,5 %, ilmainen
  pyöräytys 1/120 s, jukeboxin 1 kolikko / kappale, 🍔-tahti ja BAR-hinnat ovat ennallaan.
- Muutos koskee vain **sitä, milloin kolikoita voi käyttää**. Yö (= pelin normaali tila)
  toimii täsmälleen kuten ennen; päivä on **lopputila** (3 avainta kerätty), jolloin raha
  jää käyttämättä – se ei lisää tuloja eikä muuta RTP:tä.

---

## 3. Hyväksytty pelitestitulos (käyttäjän havainnot 20.9.2026) – TÄMÄ ON MITTAPUU

- **"AINA pitää jättää 1 kolikko ja käydä katsomassa, onko pakko syödä, ettei mene henki."**
- **"Kerran olen saanut pelaamalla 20 kolikkoa ehkä 30x jälkeen."** → iso voitto on harvinainen.
- **"Yleensä juuri 1–2 että peliä voi pyörittää 'omillaan hetken'."**
- **"Toimii hampurilaisten kanssa ja mitä normipeliin tulee kolikkoja tasapainossa."**
- **"Tätä ei voi etukäteen laskea, niin se on nyt sopiva."** → tasapaino on empiirisesti löydetty,
  siksi se lukitaan eikä sitä "korjata" laskennallisesti.

---

## 4. Testityökalut eivät ole osa balanssia

`COIN_CHEAT_*` (v4.23, kadun vitoslamppu), `fruitgame?coins=N` / `?debug`, `bm`:n debug-moodi ja
`MUSIC_SOURCE`-kytkin ovat **testausta** varten eivätkä ne kuvaa pelaajan taloutta. Niitä saa säätää
vapaasti (esim. `COIN_CHEAT_COOLDOWN = 0` nopeampaan testaukseen) ilman versionostoa tai lupaa.

---

## 5. Jos balanssia muutetaan (pakollinen prosessi)

1. Vain käyttäjän eksplisiittisestä pyynnöstä (sääntö `04-economy-balance.md`).
2. Kirjaa ennen/jälkeen tähän memoon ja sääntöön.
3. Aja: `%TEMP%\ftest.cjs` (maksutaulukko 125/125 + RTP-simulaatio), `%TEMP%\street-fruit-test.cjs`,
   `%TEMP%\street-bar-test.cjs`, `%TEMP%\street-cheat-test.cjs` + street-regressiot → 0 löydöstä.
4. Versionosto +0.01 ja muistipankki.

---

## 6. Muutoshistoria (ennen → jälkeen)

| Pvm | Versio | Ennen | Jälkeen |
|-----|--------|-------|---------|
| 20.9.2026 | v4.33 | Palkintohuone (talo 7): pääsy **kaikki avaimet tai 3 kolikkoa**; huoneessa pokaali | Makuuhuone (talo 7): pääsy **vain 3 avainta** (kolikkoreitti poistettu); Nuku/Poistu ilmaisia. **Kolikko-/🍔-talous ei muutu** – poistui vain yksi kolikoiden käyttökohde |
| 20.9.2026 | v4.34 | Jukebox ja Hedelmäpeli olivat auki aina (yöllä ja päivällä) | Auki **vain öisin (klo 20–06)**; päivällä ovesta teksti-popup `Avoinna` / `Klo 20 - 06` (`street.js`: `CLOSED_SIGN`, `CLOSED_AT_DAYT 0.5`). **Panos, painot, maksut, RTP, 🍔-tahti ja hinnat ennallaan** – muuttui vain aukioloaika |
