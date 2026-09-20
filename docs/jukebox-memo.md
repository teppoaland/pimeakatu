# 🎵 Jukebox – memo (talo 5)

> Päivitetty 20.9.2026 – versio **v4.27**. Talo 5 (`buildings[4]`) on jukebox-huone,
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
  yläreunan yläpuolella (ulkolaatta `dx - 12 … +DOOR_W+24`, sisälaatta `dx - 10 … +DOOR_W+20`,
  teksti `dy - 7`). Kyltti on **terävä neoni** (v4.22): tumma ääriviiva
  (`strokeText`, 3 px) kannattaa tekstin, hehku on enää `3 + |blink|·5` (ennen
  `10 + |blink|·12`) ja fontti **9 px bold** (ennen 8 px) → luettavissa myös
  kännykässä. Kirkkaus: `62 ± 14` % kun valot palavat, muuten `46 ± 14` %.
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
| Kappale soi jo | valinta lukossa (`🔊 SOI NYT: <nimi>` + rivi `Soi loppuun asti – valinta lukossa`), ei tuplaveloitusta |
| Ääntä ei saada lainkaan | kolikko palautetaan + `🔇 Ääntä ei saatu – kolikko palautettiin.` |

- Kappale soitetaan **aina kokonaan loppuun** (`loop = false`, ei katkaisua).
- Valinta: **▲ / W** = valitse **ylös** (−1), **▼ / S** = valitse **alas** (+1)
  (0…3, reunanilmaisu → ei toistoa pohjassa). Rivi 0 ("ei valintaa") on listan
  ylimpänä, joten ▲ pienentää ja ▼ kasvattaa valintaa – **korjattu v4.21**
  (v4.20:ssä nuolet olivat väärinpäin).
- Poistuminen: **(o) / Space / Enter / ⚡-nappi**. Uusi vierailu alkaa aina valinnasta 0.
- Kappale soi myös alapelien (iframe) aikana; kuolema (`StreetAudio.stop()`) hiljentää sen.

---

## Huoneen ulkoasu ja luettavuus (v4.22)

Huone piirretään maailmakoordinaateissa 0–800, mutta **mobiilissa canvas on vain
`viewW` leveä** ja kamera keskittää huoneen (`camX = (800 − viewW) / 2`). Siksi
koko asettelu sovitetaan näkyvään ikkunaan:

- `winW = clamp(viewW, VIEWW_MIN 260, WORLD_W 800)`; sisältö on keskitetty
  `x = 400`:n ympärille ja enintään `winW − 24` leveäksi.
- **Yksi yhtenäinen tumma paneeli** (`#0b0710`, ohut violetti yläreuna) sisältää
  otsikon, kolikkosaldon, kappalelistan ja tilatekstit → teksti ei koskaan ole
  läpinäkyvän taustan tai seinän kohinan päällä.
- **Tekstit ovat teräviä:** `shadowBlur = 0` (nollataan heti huoneen alussa),
  ei `rgba`-tekstivärejä, ei vilkkuvaa alphaa. Valittu rivi = kirkas pinkki
  `#ff3d7f` + tumma teksti, soitossa oleva rivi = kulta `#2b2410`/`#ffdd88`.
- **Fonttikoko valitaan näytön mukaan:** `vs = canvas.clientHeight / canvas.height`
  (kapea kännykkä zoomataan 1:1:tä suuremmaksi) ja `needPx(target, base, max)`
  takaa, että ruudulla näkyy vähintään ~13–16 px. Kappalenimen fontti rajataan
  lisäksi sarakeleveyteen (`nameMaxW / (0.62 · 25)`), joten nimet eivät valu
  hintasarakkeen päälle.
- **Jukebox-kaappi piirretään vain kun sille jää tilaa** (`winW >= 620`), muuten
  lista saa koko leveyden (kaappi ei peitä eikä kutista tekstiä).
- Tilatekstit: `Ei valintaa – poistuminen ei maksa mitään` ·
  `Valinta: N – <nimi>` + `Poistu (⚡/Space) = soita (1 🪙)` tai `💰 Ei kolikoita!` ·
  soidessa `🔊 SOI NYT: <nimi>` + `Soi loppuun asti – valinta lukossa`.
- Alaohje: `▲/▼ = valitse   POISTU: (o) / Space` (kiinteä, ei vilkkumista).
- Kaapin kolikkoluukun `1 🪙` on yksivärinen (`#c8a000` / valittuna `#FFD700`),
  ei enää 60 % läpinäkyvyyttä eikä hehkua.

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

| Tiedosto | Kesto | Kanavat | Koko | Raita |
|---|---|---|---|---|
| `Knived_Our_song.mp3` | 4:24 | stereo | 4,0 MB | 1 |
| `Knived_Unafraid.mp3` | 4:44 | mono | 4,3 MB | 2 |
| `Knived_Unafraid_instrumental.mp3` | 2:08 | stereo | 2,0 MB | 3 |

- **Nimet korjattu 20.9.2026 (v4.27):** tiedostot nimettiin uudelleen `Knived_`-etuliitteellä, koska
  nimet olivat ristissä sisällön kanssa – raita 1 soitti Unafraidin ja raita 2 Our Songin
  (`unafraid.mp3` kantoi jopa ID3-otsikkoa "Our Song with bass"). Nimien ja `street.js`:n
  `JUKEBOX_TRACKS`-urlien on vastattava toisiaan: `Knived_Unafraid.mp3` = ennen `our_song.mp3`
  ja `Knived_Our_song.mp3` = ennen `unafraid.mp3`.
- Masterit ovat repon ulkopuolella `D:\AI\Knived` (`*.mpeg` on `.gitignore`ssa);
  repo sisältää vain pakatut 128 kbps mp3-versiot.
- Koodaus: `ffmpeg … -ar 44100 -b:a 128k`, taso normalisoitu **≈ −13,5 LUFS**
  (sama kuin taustamusiikki `knived_unafraid.mp3`, −12,9 LUFS):
  - `Knived_Our_song`: `-af volume=4dB,alimiter=limit=0.891:level=disabled`
    (masterin true peak +1,6 dBFS → limitteri tarvitaan; mitattu −13,6 LUFS, TP −0,8 dBFS)
  - `Knived_Unafraid`: `-af volume=-3.2dB` (mitattu −13,5 LUFS, TP −1,6 dBFS)
  - `Knived_Unafraid_instrumental`: `-af volume=-7.5dB` (mitattu −13,4 LUFS, TP −5,2 dBFS)
- **UI:ssa näkyvät nimet:** `1 Knived - Our Song` · `2 Knived - Unafraid` ·
  `3 Knived - Unafraid (inst.)` (järjestysnumero tulee rivin numerosarakkeesta;
  bändin nimi on mukana jokaisen kappaleen nimessä).
- **Huom `alimiter`:** oletus `level=true` normalisoi outputin takaisin 0 dB:hen, joten
  vahvistus ei pidä → käytä aina `level=disabled`.
- **Huom:** `Knived_Unafraid_instrumental` on sama äänite kuin pelin taustamusiikki
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
  `drawJukeboxRoom()` (paneeli + rivilista + tilalaatikko + Wurlitzer
  `drawJukeboxCabinet`, proseduraalinen, ei kuvatiedostoja).
- `drawJukeboxRoom()` sovittaa sisällön näkyvään ikkunaan (`viewW`) ja valitsee
  fonttikoot näytön skaalan mukaan – ks. **Huoneen ulkoasu ja luettavuus (v4.22)**.
  Koko piirto on `ctx.save()`/`restore()`-parin sisällä, joten huone ei vuoda
  fontti-/hehkutilaa kadulle.
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
- **`street-jukebox-layout-test.cjs`** (v4.22) – selkeys kolmella näyttökoolla:
  pysty-kännykkä 390×700, pieni kännykkä 320×568, vaaka-kännykkä 844×390 ja
  työpöytä 1024×700 (touch / ei touch). Tarkistaa että **kaikki huoneen tekstit mahtuvat näkyvään ikkunaan**
  (tekstin x-rajat vs. `camX … camX + viewW`, leveys lasketaan fontin koon ja
  perheen mukaan), että tekstit piirretään **ilman hehkua** (`shadowBlur 0`) ja
  **ilman `rgba`-väriä**, että paneeli/rivit pysyvät ikkunan sisällä, että 4
  kappaleriviä löytyvät ja ettei kappalenimi osu hintaan. Lisäksi syntymäpaketti:
  `defaultState` = **2 kolikkoa + 5 hampurilaista**, tuore peli alkaa samoilla
  luvuilla ja tallennettu 0 / 5 kolikkoa pysyvät ennallaan (ei ilmaista rahaa).
- **Regressiot (kaikki 0 löydöstä 20.9.2026):** `street-bar-test.cjs`,
  `street-fruit-test.cjs`, `street-avenger-test.cjs`, `street-threshold-test.cjs`,
  `street-winframe-test.cjs`, `street-bm-path-test.cjs`, `audio-music-test.cjs`.

