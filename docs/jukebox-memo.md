# 🎵 Jukebox – memo (talo 5)

> Päivitetty 20.9.2026 – versio **v4.21**. Talo 5 (`buildings[4]`) on jukebox-huone,
> josta voi soittaa koko kappaleita 1 kolikolla. Kappaleet ovat `jukebox/`-kansiossa.

---

## Sijainti ja oviportti

- **Talo 5** = `buildings[4]` (x 380–440, h 155, **ovi x 410**) – eli BM-talon
  (`buildings[5]`, ovi x 490) **edessä**. Talossa ei ole lamppua.
- **Kaksivaiheinen ovi** (action-nappi / välilyönti):
  1. painallus ovella = **potku** → ikkunat syttyvät (`smallHouseLights[4].lit`, 20 s = 1200 f)
  2. painallus **valaistulla** ovella = **jukebox-huone aukeaa**
- Huoneen aikana maailma on jäissä (kuten BAR / palkintohuone) → ikkunavalojen
  ajastin ei kulu huoneen sisällä.
- Ovi piirretään auki (`drawDoor`: `isActive`) ja kynnysvalo syttyy (violetti neoni
  `THRESH_LIGHT_JUKEBOX '215,130,255'`) **vain kun ikkunat palavat**.
- Neonkyltti `♪JUKEBOX` on **kiinni yläkarmissa**: kyltin alareuna 1 px oviaukon
  yläreunan yläpuolella (ulkolaatta `dy - 19 … dy - 3`, sisälaatta `dy - 17 … dy - 5`,
  teksti `dy - 7`). Kyltti hehkuu kirkkaammin kun valot palavat.
- **Mitä muuttui talossa 5:** action-nappi vie huoneeseen kun valot palavat, joten
  1/5 arpa (kolikko / kukkaruukku / oviukko) ei ole enää tavoitettavissa tässä
  talossa. Muut potkupaikat (talo 1 ja talo 3) ja koko potkumekaniikka säilyivät
  ennallaan – sama ratkaisu kuin hedelmäpelitalossa `buildings[6]` (v4.11).

---

## Säännöt

| Tilanne | Lopputulos |
|---|---|
| Valinta 0 + poistuminen | ei veloitusta, ei soittoa |
| Valinta 1–3 + poistuminen | **−1 kolikko** + koko kappale alkaa soida |
| Valinta 1–3, 0 kolikkoa | ilmoitus `💰 Ei kolikoita!`, ei veloitusta, poistuminen onnistuu |
| Kappale soi jo | valinta lukossa (`🔊 SOI NYT: <nimi>` + rivi "Kappale soi loppuun asti – valinta vapautuu sen jälkeen"), ei tuplaveloitusta |
| Ääntä ei saada lainkaan | kolikko palautetaan + `🔇 Ääntä ei saatu – kolikko palautettiin.` |

- Kappale soitetaan **aina kokonaan loppuun** (`loop = false`, ei katkaisua).
- Valinta: **▲ / W** = valitse **ylös** (−1), **▼ / S** = valitse **alas** (+1)
  (0…3, reunanilmaisu → ei toistoa pohjassa). Rivi 0 ("ei valintaa") on listan
  ylimpänä, joten ▲ pienentää ja ▼ kasvattaa valintaa – **korjattu v4.21**
  (v4.20:ssä nuolet olivat väärinpäin).
- Poistuminen: **(o) / Space / Enter / ⚡-nappi**. Uusi vierailu alkaa aina valinnasta 0.
- Kappale soi myös alapelien (iframe) aikana; kuolema (`StreetAudio.stop()`) hiljentää sen.

---

## Taustamusiikki = syntikkalooppi (v4.21)

- Kadun taustamusiikki on **proseduraalinen syntikkalooppi** (`audio.js`: rummut +
  basso + särökitara + melodia, Web Audio) – sama ääni, joka oli aiemmin vain
  fallback. Aidot äänitteet ovat **vain** jukeboxissa.
- Kytkin: `MUSIC_SOURCE = 'synth'` (oletus) | `'mp3'`. `'synth'`-tilassa
  `loadMusic()` ei lataa äänitiedostoa lainkaan → `playPhase()` valitsee syntikan;
  `'mp3'` palauttaa aidon äänitteen (`MUSIC_FILE = 'knived_unafraid.mp3'`, alku +
  häivytys) yhden rivin muutoksella.
- Sykli: **30 s soittoa** (`SYNTH_PLAY_DURATION`) + **0,6 s häivytys**
  (`fadeOutSynth()` ramppaa `synthGain` 1 → 0, `SONG_FADE_OUT`) + **30–90 s tauko**
  (`getSilenceDuration`) → sykli 60–120 s. Satunnainen BPM 110–142 ja melodian
  suunta säilyivät.
- Jukebox-kappaleen aikana taustamusiikin sykli on peruttu (`playJukebox` →
  `cancelCycle`, myös `synthFadeTimer` nollataan); kappaleen päätyttyä taustalle
  palaa syntikka `JUKEBOX_GAP` 2,5 s jälkeen.
- **`running.mp3` (15,5 s lo-fi looppi) ei palaa:** se ja `docs/running.mpeg`
  poistettiin v4.16:ssa eikä niitä käytetä enää mistään polusta. Juuren
  `knived_unafraid.mp3` (tekijän oma teos) jää repoon `'mp3'`-varatien tiedostoksi.

---

## Äänitiedostot (`jukebox/`)

| Tiedosto | Kesto | Kanavat | Koko |
|---|---|---|---|
| `our_song.mp3` | 4:44 | mono | 4,3 MB |
| `unafraid.mp3` | 4:24 | stereo | 4,0 MB |
| `unafraid_instrumental.mp3` | 2:08 | stereo | 2,0 MB |

- Masterit ovat repon ulkopuolella `D:\AI\Knived` (`*.mpeg` on `.gitignore`ssa);
  repo sisältää vain pakatut 128 kbps mp3-versiot.
- Koodaus: `ffmpeg … -ar 44100 -b:a 128k`, taso normalisoitu **≈ −13,5 LUFS**
  (sama kuin taustamusiikki `knived_unafraid.mp3`, −12,9 LUFS):
  - `our_song`: `-af volume=-3.2dB` (mitattu −13,5 LUFS, TP −1,6 dBFS)
  - `unafraid`: `-af volume=4dB,alimiter=limit=0.891:level=disabled`
    (masterin true peak +1,6 dBFS → limitteri tarvitaan; mitattu −13,6 LUFS, TP −0,8 dBFS)
  - `unafraid_instrumental`: `-af volume=-7.5dB` (mitattu −13,4 LUFS, TP −5,2 dBFS)
- **UI:ssa näkyvät nimet:** `1 Knived - Our Song` · `2 Knived - Unafraid` ·
  `3 Knived - Unafraid (inst.)` (järjestysnumero tulee rivin numerosarakkeesta;
  bändin nimi on mukana jokaisen kappaleen nimessä).
- **Huom `alimiter`:** oletus `level=true` normalisoi outputin takaisin 0 dB:hen, joten
  vahvistus ei pidä → käytä aina `level=disabled`.
- **Huom:** `unafraid_instrumental` on sama äänite kuin pelin taustamusiikki
  (`knived_unafraid.mp3`, 128,05 s vs. 128,02 s). Jos 2 MB halutaan säästää, raita 3
  voi osoittaa juuritiedostoon `knived_unafraid.mp3`.
- Säädettävät nupit `audio.js`:ssä: `JUKEBOX_VOLUME = MUSIC_VOLUME` (0,05) ja
  `JUKEBOX_GAP = 2500` (ms ennen kuin taustamusiikki palaa).

---

## `audio.js` – rajapinta

- `playJukebox(url)` → **peruuttaa taustamusiikin syklin** (`cycleTimer`/`loopId`/`fadeTimer`
  nollaan, `musicEl.pause()` + `currentTime = 0`, `synthGain = 0`, `phase = 'jukebox'`),
  soittaa koko kappaleen. Palauttaa `false` jos AudioContext/ääni ei ole saatavilla
  (katu palauttaa silloin kolikon).
- `isJukeboxPlaying()`, `stopJukebox()`.
- Kappaleen `ended` → `JUKEBOX_GAP` (2,5 s) kuluttua `playPhase()` → taustamusiikki palaa
  ja alkaa alusta. Myös `error` ja autoplay-esto palauttavat taustamusiikin; estetty
  kappale soitetaan seuraavassa eleessä (`pendingJukeUrl`).
- **Suojat:** `start()` ja `onGesture()` eivät käynnistä taustamusiikkia kun
  `jukePlaying` tai `phase === 'jukebox'`; `stop()` (kuolema) pysäyttää myös jukeboxin.
- Peliäänet (SFX) eivät muutu: potku, kolikko, kävely ja kuolin-gongi toimivat kappaleen
  päällä normaalisti.

---

## `street.js` – kytkentä

- Vakiot/tila: `JUKEBOX_BLDG_IDX = 4`, `JUKEBOX_TRACKS` (3 raitaa), `jukeboxRoom`,
  `jukeSel`, `jukeHeldUp/Down`, `jukeTrack`.
- `handleAction()`: oma oviblokki **ennen** lamppusilmukkaa ja potkusilmukkaa
  (ehto: `smallHouseLights[4].lit` + `DOOR_RADIUS`).
- `update()`: oma huonehaara BAR-haaran mallilla; `render()`:
  `drawJukeboxRoom()` (rivilista + Wurlitzer `drawJukeboxCabinet`, proseduraalinen,
  ei kuvatiedostoja, koko piirto kankaan sisällä).
- `closeGame()` nollaa `jukeboxRoom`/`jukeSel`; potku- ja lamppulogiikka sekä muut
  talot ovat ennallaan.

---

## Testit (eivät repossa, `%TEMP%`)

- **`street-jukebox-test.cjs`** – Node `vm` + canvas/document-stub + DOM-nappirekisteri:
  portti (potku → valot → sisään), valinta ▲/▼ (clamp 0…3, reunanilmaisu), osto
  (−1 kolikko + oikea tiedosto), soitossa lukko, kappaleen päättyminen, 0 kolikkoa,
  äänen puuttuessa palautus, mobiilipolku (D-pad + ⚡) ja piirtorajat.
  Kulkureitti: alas (y 350) → oikealle 296 f → ylös (y 280) → ovi; huom **4 frameä**
  per painallus, koska potku asettaa hit-pausen (2 f).
- **`audio-jukebox-test.cjs`** – fake-kello + `<audio>`-stubi: syklin peruutus,
  `ended` → 2,5 s → taustamusiikki palaa, `start()`/ele-suojat, `stop()`,
  autoplay-eston uudelleenyritys.
- **Regressiot (kaikki 0 löydöstä 20.9.2026):** `street-bar-test.cjs`,
  `street-fruit-test.cjs`, `street-avenger-test.cjs`, `street-threshold-test.cjs`,
  `street-winframe-test.cjs`, `street-bm-path-test.cjs`, `audio-music-test.cjs`.

