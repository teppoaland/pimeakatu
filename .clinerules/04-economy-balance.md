# 🔒 TALOUS- JA TASAPAINOLUKKO – ÄLÄ MUUTA ILMAN ERILLISTÄ PYYNTÖÄ

> **TILA: LUKITTU 20.9.2026 (käyttäjän eksplisiittinen päätös).** Tämä sääntö on tavallisia sääntöjä
> tiukempi: tässä listatut arvot on **pelitestattu hyväksi**, eikä niitä saa säätää "parantelun",
> refaktoroinnin, "loogisuuden" tai oman maun vuoksi. Ks. myös `docs/economy-balance-memo.md`.

---

## ⚠️⚠️⚠️ ISO VAROITUS ⚠️⚠️⚠️

```
╔══════════════════════════════════════════════════════════════════════════════╗
║  ÄLÄ MUUTA KOLIKKO- TAI HAMPURILAISTALOUTTA.                                 ║
║  Nämä arvot pitävät pelin juuri oikeassa tasapainossa:                       ║
║    • pelaajan on PAKKO jättää 1 kolikko ja käydä katsomassa, onko pakko      ║
║      syödä (🍔), ettei henki lähde                                           ║
║    • hedelmäpeli antaa yleensä takaisin 1–2 kolikkoa → "peli pyörii          ║
║      omillaan hetken", mutta syö rahat pidemmällä juoksulla                  ║
║    • iso voitto (esim. 20 kolikkoa) on HARVINAINEN: noin kerran ~30 peli-    ║
║      kerrasta – jackpot tuntuu jackpotilta                                   ║
║  Tätä tasapainoa EI voi laskea etukäteen – se on löytynyt pelaamalla ja      ║
║  se on nyt sopiva. Jos jokin pyyntö koskee alla listattuja arvoja,           ║
║  PYSÄHDY, näytä tämä varoitus käyttäjälle ja kysy vahvistus.                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🔒 Lukitut arvot

| Alue | Arvo | Tiedosto |
|------|------|----------|
| Hedelmäpeli: panos | **1 kolikko / pyöräytys** (`BET`) | `fruitgame/js/constants.js` |
| Hedelmäpeli: symbolipainot | 🍒 7 · 🍋 5 · 🔔 4 · 🍔 2 · 💎 2 | `fruitgame/js/constants.js` |
| Hedelmäpeli: maksut | 💎 35 · 🍔 20 · 🔔 12 · 🍋 7 · 🍒 4 · pari = **panos takaisin** (`PAY_PAIR 1`) | `fruitgame/js/constants.js` |
| Hedelmäpeli: RTP | **≈ 78,5 %** (kolmikko 6,85 %, pari 35,3 %) – "talo voittaa aina pitkässä juoksussa" | `fruitgame/js/constants.js` |
| Hedelmäpeli: ilmainen pyöräytys | 1 kpl / **120 s** (`FREE_SPIN_COOLDOWN_MS`, avain `pimeakatu_fruit_free`) → max +0,785 kolikkoa / 2 min | `fruitgame/js/constants.js` |
| Kadun kolikko | 1 kpl kerrallaan, respawn **120 s** (`coinRespawnTimer = 7200`) | `street.js` |
| Kolikko potkusta | **1/5** (`Math.random() < 0.2`) + **30 s cooldown** (`kickCoinCooldown = 1800`) | `street.js` |
| Hampurilaiset (elämät) | alussa **5**, +1 / **40 s** (`hamburgerTimer = 2400`), katto BAR:sta **10** | `street.js`, `gameState.js` |
| BAR | **1 kolikko = 1 🍔**, katto 10, peruutus (▼) vain vierailun ostot | `street.js`, `docs/` |
| Jukebox | **1 kolikko = 1 koko kappale** | `street.js`, `docs/jukebox-memo.md` |
| Jukebox / Hedelmäpeli: aukiolo | **Vain öisin** (klo 20–06); päivällä (`dayT >= 0.5`) ovesta teksti-popup `Avoinna` / `Klo 20 - 06` – ei potkua, ei valoja, ei sisään (v4.34) | `street.js` (`CLOSED_SIGN`, `CLOSED_AT_DAYT`) |
| Makuuhuone (ex-palkintohuone, talo 7) | **3 avainta** = lukko (kolikkoreitti **poistettu** 20.9.2026/v4.33) · Nuku / Poistu = **ilmainen**, ei vaikuta talouteen | `street.js` |
| Nukkuminen: nälkä jäissä (v4.41) | Nälkäajastin **ei tikitä** makuuhuoneessa eikä Zzz-pimennyksen aikana → pelaaja ei voi kuolla nukkuessaan; herätessä ajastimelle jää vähintään **10 s** (`HUNGER_WAKE_GRACE = 600`). Tahti (1/40 s, 2400 framet) ja katto 10 **ennallaan** | `street.js` (`hungerOnHold()`) |
| Oviukko / kukkaruukku / sähkökaappi | osuma = tainnutus + **−1 🍔** (0 → kuolema) | `street.js` |
| Syntymäpaketti (uusi peli / reset) | **2 kolikkoa + 5 🍔** (`defaultState.inventory`) | `gameState.js` |

---

## ✅ Mikä ei ole lukossa

- **Testityökalut** (eivät ole tulonlähde eivätkä vaikuta balanssiin): `COIN_CHEAT_*`-nupit (`street.js`),
  `?coins=N` ja `?debug` (`fruitgame`), `?day=0` / `?day=1` (`street.js`: pakotettu yö/päivä, ei tallenna),
  `bm`:n debug-moodi, `MUSIC_SOURCE`-kytkin, testikopioiden `_dbg`.
- **Ulkoasu, tekstit, äänet, animaatiot** ja muut kuin yllä listatut parametrit – niitä saa muuttaa normaalisti.

---

## 📋 Jos balanssia joskus muutetaan (pakollinen prosessi)

1. **Vain käyttäjän eksplisiittisestä pyynnöstä** – ei koskaan oma-aloitteisesti.
2. Kirjaa muutos **ennen/jälkeen** -arvoina tähän tiedostoon ja `docs/economy-balance-memo.md`:hen.
3. Aja validoinnit: hedelmäpelin maksutaulukko (125/125) + RTP-simulaatio + katu-integraatio
   (`%TEMP%\ftest.cjs`, `%TEMP%\street-fruit-test.cjs`) sekä street-regressiot 0 löydöstä.
4. Versionosto **+0.01** (sääntö 03) ja muistipankin päivitys.

---

## 📜 Muutoshistoria (ennen → jälkeen)

| Pvm | Versio | Muutos | Ennen | Jälkeen |
|-----|--------|--------|-------|---------|
| 20.9.2026 | v4.33 | Talo 7: palkintohuone → **makuuhuone** (Nuku/Poistu). Pääsy vain 3 avaimella, kolikkoreitti poistettu (käyttäjän pyyntö: *"3 avainta on se lukko tässä, kolikko-lukituksen saa poistaa"*) | Pääsy: kaikki avaimet **tai 3 kolikkoa**; huoneessa pokaali + "To be continued…" | Pääsy: **vain 3 avainta** (ovi aina auki avaimilla, lamppua ei tarvita); huoneessa sänky + Nuku/Poistu. **Nukkuminen ja poistuminen ovat ilmaisia** → ei vaikutusta kolikko-/🍔-talouteen |
| 20.9.2026 | v4.34 | Jukebox + Hedelmäpeli auki aina | Auki **vain öisin (klo 20–06)**; päivällä ovesta teksti-popup `Avoinna` / `Klo 20 - 06`. **Ei muutoksia panokseen, painoihin, maksuihin, RTP:hen, 🍔-tahtiin eikä hintoihin** – vain aukioloaika |
| 20.9.2026 | v4.41 | Hampurilaisajastin tikitti myös nukkuessa – herätessä se jatkui täsmälleen siitä mihin jäi, joten 1 🍔:lla nukkuja saattoi kuolla heti herätessään | Nälkä on **jäissä** makuuhuoneessa ja Zzz-pimennyksen aikana (`hungerOnHold()`), eikä pelaaja voi kuolla nukkuessaan. Herätessä ajastimelle jää vähintään **10 s** (`HUNGER_WAKE_GRACE 600`). **Lukitut arvot ennallaan:** 2400 framet (1/40 s), katto 10, hinnat, RTP. Rajaus: **vain nukkuminen** – BAR/jukebox/iframe-pelit tikittävät ennallaan |
