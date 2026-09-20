/* ═══════════════════════════════════════════════════════════
   street.js – "Pimeä Katu" -päävalikkopeli
   2D-sivukuvattu pimeä kaupunkikatu: 9 taloa, ovet,
   5 katulamppua talojen väleissä.
   ═══════════════════════════════════════════════════════════ */

const Street = (() => {
    let canvas, ctx;

    const WORLD_W = 800;
    const WORLD_H = 400;
    const GROUND_Y = 310;

    /* ── Pelaaja ─────────────────────────────────────── */
    const player = {
        x: 40, y: GROUND_Y - 20, w: 20, h: 30,
        vx: 0, vy: 0, facing: 1, lookY: 0, walking: false,
        walkFrame: 0, walkTimer: 0,
        kicking: false, kickFrame: 0,
        knockedDown: false, knockdownTimer: 0
    };
    const PLAYER_SPEED = 1.225;   // hidastettu 30% (oli 1.75) – kävely hitaampi kuin autot
    const GRAVITY = 0.4;
    const JUMP_VEL = -7;
    const KICK_DURATION = 10; // frameä @ ~60fps ≈ 170ms
    const HIT_PAUSE = 2;      // hit pause -pysähdys osumasta (~33 ms) – vain potkun osumille

    /* ── Syötteet ────────────────────────────────────── */
    const keys = {};
    let actionPressed = false;
    let actionJustPressed = false;

    /* ── Talot ───────────────────────────────────────── */
    const buildings = [
        { x: 0,   w: 80, h: 200 },
        { x: 90,  w: 60, h: 170 },
        { x: 200, w: 50, h: 140 },
        { x: 260, w: 70, h: 190 },
        { x: 380, w: 60, h: 155 },
        { x: 450, w: 80, h: 210 },
        { x: 560, w: 50, h: 145 },
        { x: 640, w: 70, h: 180 },
        { x: 730, w: 70, h: 195 }
    ];

    // Yölliset harmaansävyt – arvotaan taloille joka latauskerralla
    const BUILDING_PALETTE = [
        '#1a1a2e', '#1c1a1e', '#1a1f1c', '#1e1a1a', '#1a1c24',
        '#1a1e22', '#1c1c1a', '#1a1a24', '#1e1c1a',
        '#1b1a20', '#1a1d1e', '#1d1a1c', '#1a1b26', '#1c1e1a',
        '#1e1a1e', '#1a221e', '#1c1a22', '#1a1e1c'
    ];

    function randomizeBuildingColors() {
        // Fisher-Yates shuffle kopio paletista
        const shuffled = BUILDING_PALETTE.slice();
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        for (let i = 0; i < buildings.length; i++) {
            buildings[i].bodyColor = shuffled[i];
            buildings[i].corniceType = Math.floor(Math.random() * 7);  // 0–6
            // Ovityypit ilman lautamallia (4)
            const doorTypes = [0,1,3,5,6];
            buildings[i].doorType = doorTypes[Math.floor(Math.random() * doorTypes.length)];
        }
    }

    /* ── Lamput (talojen väleissä) ──────────────────── */
    const lamps = [
        { x: 85,  bldgIdx: 1, lit: false, label: 'DIG\nGAME',    gameUrl: 'digGame1/game_main.html' },
        { x: 255, bldgIdx: 3, lit: false, label: 'DIG\nDÄSH', gameUrl: 'digGame2/game_main.html' },
        { x: 445, bldgIdx: 5, lit: false, label: 'BLUE\nMÄX',     gameUrl: 'bm/game_main.html' },
        { x: 625, bldgIdx: 7, lit: false, label: 'COM-\nMANDO',   gameUrl: null },
        { x: 720, bldgIdx: 8, lit: false, label: 'BAR',   gameUrl: null }
    ];

    const LAMP_POST_H = 75;
    const DOOR_W = 26;
    const DOOR_H = 32;
    const DOOR_RADIUS = 19;

    /* ── Ovien kynnysviuhka (yksi kivirivi heti kynnyksen vieressä) ── */
    // Renkaat: d = syvyys, w = puolileveys renkaan ulkoreunalla, n = kiilakivien määrä
    // HUOM: talot ovat kiinni kadun varressa → vain yksi rivi, ei saa valua autotielle.
    const THRESH_RINGS = [
        { d: 5, w: 16, n: 3 }
    ];
    const THRESH_TOP_Y = 7;          // rivin yläraja GROUND_Y:n alapuolella (kynnyslaatan alla)
    const THRESH_DIP = 2;            // V-painuma keskellä (kiveys vajoaa ovea kohti)
    const THRESH_DETAILS = true;     // kulumat, halkeamat, pikkukivet
    const THRESH_LIGHT = true;       // oviaukon valo aktiivisille oville
    const THRESH_LIGHT_HOUSE = '255,230,150';   // talojen lämmin valo
    const THRESH_LIGHT_BAR = '255,102,163';     // BAR: neonpinkki (sopii kylttiin)
    const THRESH_LIGHT_JUKEBOX = '215,130,255'; // Jukebox-talo (talo 5): violetti neoni
    const KERB_GAP_EXTRA = 5;        // lasketun reunakiven lisäys oven leveyteen

    /* ── Mustat lehdettömät puut (isoimmat raot) ── */
    // Isoimmat raot: talo 1–2 (x 150–200) ja talo 3–4 (x 330–380).
    // 1. puu = 1/3 viereisestä matalasta talosta (buildings[2].h = 140), pienennetty 30%
    // 2. puu = 2/3 ensimmäisen puun alkuperäisestä korkeudesta (ei pienennystä)
    const TREE1_H = buildings[2].h / 3 * 0.7;
    const TREE2_H = buildings[2].h / 3 * 2 / 3;
    const trees = [
        { x: 175, h: TREE1_H, phase: Math.random() * Math.PI * 2 },   // rako talojen 1–2 välissä
        { x: 355, h: TREE2_H, phase: Math.random() * Math.PI * 2 }    // rako talojen 3–4 välissä
    ];

/* ── Kolikko ─────────────────────────────────────── */
    const coin = { x: 590, y: 325, collected: false, sparkle: 0, despawnTimer: 0, despawnCooldown: 0 };
    // Kolikko ilmestyy sinne, missä pelaajan jalat voivat liikkua:
    //   x: 0..(WORLD_W - player.w), y: GROUND_Y..(WORLD_H - 50 + player.h)
    const COIN_X_MIN = 0;
    const COIN_X_MAX = WORLD_W - player.w;          // 780
    const COIN_Y_MIN = GROUND_Y;                    // 310 – jalat maan tasolla
    const COIN_Y_MAX = (WORLD_H - 50) + player.h;   // 380 – jalat alimmillaan (aidan takana)
    function randomCoinX() { return COIN_X_MIN + Math.random() * (COIN_X_MAX - COIN_X_MIN); }
    function randomCoinY() { return COIN_Y_MIN + Math.random() * (COIN_Y_MAX - COIN_Y_MIN); }

    /* ── Sähkökaapit (talojen kyljissä, kerrostalon vas. seinä) ── */
    // 1. kaappi: 1. puu (trees[0], x 175) on talojen 1–2 välissä. Sen oikealla
    // puolella olevan talon (buildings[2], x 200–250) vasen seinä on x 200.
    // 2. kaappi: talo 7 (buildings[6], x 560–610, matala h 145) – sama ilmentymä
    // kopiona, vasen seinä x 560 (2px rako oveen, ikkunat kaapin yläpuolella).
    // Kaappi on ikkunan kokoinen (8×14), harmaa, yläosassa vilkkuva keltainen valo.
    // Osuminen antaa sähköiskun: tajunta pois + hampurilaisen menetys (kuten kukkaruukku/auto).
    const electricCabinets = [
        { x: 200, w: 8, h: 14, y: GROUND_Y - 16 },   // talo 3 – vasen seinä (pohja GROUND_Y-2)
        { x: 560, w: 8, h: 14, y: GROUND_Y - 16 }    // talo 7 – vasen seinä (matala talo)
    ];

    /* ── Avain (Dig Gamesta) ───────────────────────── */
    let digKeyCollected = false;
    let boulderKeyCollected = false;
    let bmKeyCollected = false;
    // Sama ehto kuin palkintohuoneessa (handleAction) ja HUD:issa – yksi lähde.
    function allKeysCollected() {
        return digKeyCollected && boulderKeyCollected && bmKeyCollected;
    }
    /* ── Makuuhuone (ex-palkintohuone, talo 7) ────────
       Lukko = 3 avainta (v4.33, kolikkoreitti poistettu). Huoneessa on
       kaksi valintaa: Nuku ja Poistu.
         Poistu = ei muuta mitään (päivä/yö pysyy ennallaan)
         Nuku   = päivä → yö  TAI  yö → päivä
       Molemmat ovat ilmaisia eikä niillä ole vaikutusta talouteen. */
    let sleepRoom = false;         // makuuhuone päällä
    let sleepSel = 0;              // 0 = Nuku, 1 = Poistu
    let sleepHeldUp = false;       // ▲ reunanilmaisu
    let sleepHeldDown = false;     // ▼ reunanilmaisu
    let sleepPhase = 0;            // > 0 = nukkumisen pimennys käynnissä (frameä)
    const SLEEP_DARK_FRAMES = 45;   // ~0,75 s: ruutu ehtii mustaksi ennen Zzziä
    const SLEEP_ZZZ_FRAMES  = 180;  // ~3 s: itse Zzz-efekti mustalla taustalla
    const SLEEP_FADE_FRAMES = SLEEP_DARK_FRAMES + SLEEP_ZZZ_FRAMES;  // ~3,75 s yhteensä
    let isDay = false;             // tallennettu päivä/yö-tila (state.isDay)
    let barRoom = false;
    let barBuyQty = 0;             // BAR: tämän vierailun ostetut (▼ peruu vain nämä)
    let barBuyHeldUp = false;      // ▲ reunanilmaisu – ei toistoa pohjassa
    let barBuyHeldDown = false;    // ▼ reunanilmaisu

    /* ── Jukebox (talo 5, buildings[4], ovi x 410) ────
       Ovi aukeaa vasta kun talon ikkunat on potkaistu valaistuiksi
       (1. painallus ovella = potku → valot 20 s, 2. painallus = sisään).
       1 kolikko = 1 kappale, joka soi kokonaan loppuun asti. */
    const JUKEBOX_BLDG_IDX = 4;
    /* Makuuhuone (ex-palkintohuone, talo 7, ovi x 675, lamps[3]):
       lukko = 3 avainta, ei kolikoita (v4.33) */
    const SLEEP_BLDG_IDX = 7;
    /* Tiedostonimet vastaavat sisältöä (korjattu 20.9.2026, v4.27): aiemmin
       `our_song.mp3` ja `unafraid.mp3` olivat ristissä keskenään → raita 1 ja 2
       soivat valitun nimen vastaisesti. Älä "korjaa" nimiä takaisin ristiin. */
    const JUKEBOX_TRACKS = [
        { url: 'jukebox/Knived_Our_song.mp3',              title: 'Knived - Our Song' },
        { url: 'jukebox/Knived_Unafraid.mp3',              title: 'Knived - Unafraid' },
        { url: 'jukebox/Knived_Unafraid_instrumental.mp3', title: 'Knived - Unafraid (inst.)' }
    ];
    let jukeboxRoom = false;
    let jukeSel = 0;               // 0 = ei valintaa, 1..N = kappale
    let jukeHeldUp = false;        // ▲ reunanilmaisu
    let jukeHeldDown = false;      // ▼ reunanilmaisu
    let jukeTrack = 0;             // soiva kappale (1..N, 0 = ei mitään tällä istunnolla)
    let coinCount = 0;
    let coinRespawnTimer = 0;
    let hamburgerCount = 5;
    let hamburgerTimer = 2400;  // 40s @ ~60fps
    let firstHouseWindowsLit = false;
    let firstHouseKickCount = 0;
    let firstHouseKickTarget = 0;    // random 3-6, arvotaan ekan potkun yhteydessä
    let firstHouseWindowTimer = 0;   // 20s laskuri, nollautuu joka potkusta
    let flowerPot = null;            // { x, y, vx, vy, active, rotation }
    let kickCoin = null;             // { x, y, vy, landed, ttl } – kolikko potkusta
    let kickCoinCooldown = 0;        // 30s tauko ennen kuin uusi kolikko voi pudota potkusta

    /* ── Salainen kolikkopalkkio (TESTITYÖKALU, v4.23) ────────
       Vitoslamppu (lamps[4], x 720) 20 potkua putkeen → +20 kolikkoa.
       Avain-cheat (5 potkua → kaikki avaimet + koko valorivi syttyy) säilyy
       koskemattomana; tämä on sen jatko ("5 + 15 heti perään").
       Ei popuppia, ei ääntä, ei hiukkasia – vain saldo kasvaa (HUD + tallennus).
       Putki nollautuu: välissä toinen lamppu, tauko > COIN_CHEAT_GAP, palkkio,
       respawn/reset. Cooldownin aikana potkut eivät kerrytä putkea lainkaan. */
    const COIN_CHEAT_LAMP     = 4;      // vitoslamppu (x 720, BAR-lamppu)
    const COIN_CHEAT_KICKS    = 20;     // potkut putkeen (5 avain-cheat + 15 jatkoa)
    const COIN_CHEAT_REWARD   = 20;     // kolikkoa palkkiosta
    const COIN_CHEAT_GAP      = 120;    // 2s @ ~60fps: sallittu väli potkujen välissä
    const COIN_CHEAT_COOLDOWN = 3600;   // 60s @ ~60fps palkkion jälkeen (0 = ei cooldownia)
    let coinCheatStreak = 0;            // peräkkäiset potkut vitoslamppuun
    let coinCheatGapTimer = 0;          // montako frameä putki vielä pysyy voimassa
    let coinCheatCooldown = 0;          // cooldownin jäljellä olevat framet

    /* ── Oviukko (Avenger): kolikon vastakohta ────────
       Ei putoa ikkunasta kuten ruukku/kolikko – astuu OVESTA kynnykseltä ja
       juoksee pelaajan kiinni. Nopeus > pelaajan nopeus → ei väistettävissä.
       Osuma = tainnutus + 1 hampurilainen (kuten kukkaruukku), mutta pakollinen.
       AVENGER_KIND: 'twin' = pelaajan kaksonen (nyt). 'dog' = koira myöhemmin. */
    const AVENGER_KIND      = 'twin';
    const AVENGER_CHANCE    = 0.12;    // 1/8 – harvinaisempi kuin kolikko (1/5)
    const AVENGER_COOLDOWN  = 1800;    // 30s tauko @ ~60fps (kuten potkukolikolla)
    const AVENGER_SPEED     = 2.0;     // > PLAYER_SPEED (1.225) → tavoittaa aina
    const AVENGER_TELEGRAPH = 21;      // ~350ms oviaukon varoitus ennen ulostuloa
    const AVENGER_HIT_R     = 18;      // osumasäde (px)
    const AVENGER_STUN      = 600;     // 10s tainnutus (sama kuin ruukulla/autolla)
    const AVENGER_FREEZE    = 180;     // 3s jäädytys (hit-stop) kontaktista ennen kosahtamista
    let avenger = null;              // { x, y, w, h, bldgIdx, facing, phase, timer, walkTimer, scale }
    let avengerCooldown = 0;         // tauko ennen kuin uusi oviukko voi tulla
    let playerDead = false;          // kuolemasekvenssi käynnissä
    let deathTimer = 0;              // laskuri ennen reloadia (frameä)
    let deathAlpha = 0;              // mustan overlayn alpha (0→1 pimennyksen aikana)
    const smallHouseLights = {};     // { '2': { lit: false, timer: 0 }, ... }
    let groundAnimal = null;         // { type, x, y, vx, direction, hopY, hopVel, animTimer, pauseTimer }
    let animalSpawnTimer = 900;      // 15s välein
    let isTouchDevice = false;
    let animClock = 0;                // animaatiokello (~frameä): hengitys + silmän vilkahdus
    let hitPauseTimer = 0;            // hit pause -laskuri: maailma jäätyy osumasta (frameä)
    let iframeOpen = false;           // alapeli auki (overlay) → päivän liuku pysähtyy

    /* ── Kamera (mobiili: vaakasuuntainen seuranta) ── */
    let viewW = WORLD_W;          // näkyvä maailmanleveys (PC: koko katu)
    let camX = 0;                 // kameraoffsetti vaakasuunnassa (0 = ei siirtoa)
    const CAMERA_LERP = 0.18;     // seurannan pehmeys (0–1)
    const VIEWW_MIN = 260;        // mobiilizoomauksen minimi-leveys (ei liian äärimmäinen)

    /* ── Kaukaisen kaupungin siluetti (parallaksitausta) ── */
    // Haalea sinertävä skyline lähitalojen ja puiden takana (peittää tähdet).
    // BACKDROP_PARALLAX = kuinka suuren osan kameran liikkeestä tausta "jättää väliin".
    const BACKDROP_PARALLAX = 0.4;       // tausta liikkuu 40 % kameran nopeudesta
    const BACKDROP_BASE_Y  = GROUND_Y + 4; // tyvi jää aina kiveyksen alle (ei 1px rakoa)
    const BACKDROP_PALETTE = ['#141a2c', '#171e33', '#1b2338', '#1f2942'];
    const BACKDROP_SCALE   = 0.5;        // taustatalot 50 % koossa – hillitty, kaukainen
    // Ikkunaristikko skaalattu 50 %: 10×14 → 5×7, välit 9/14 → 5/7, offset 8/10 → 4/5
    const BACKDROP_WIN_W  = Math.max(4, Math.round(10 * BACKDROP_SCALE));   // 5
    const BACKDROP_WIN_H  = Math.max(5, Math.round(14 * BACKDROP_SCALE));   // 7
    const BACKDROP_WIN_DX = Math.max(3, Math.round(9 * BACKDROP_SCALE));    // 5
    const BACKDROP_WIN_DY = Math.max(4, Math.round(14 * BACKDROP_SCALE));   // 7
    const BACKDROP_WIN_OX = Math.max(2, Math.round(8 * BACKDROP_SCALE));    // 4
    const BACKDROP_WIN_OY = Math.max(3, Math.round(10 * BACKDROP_SCALE));   // 5
    let backdrop = null;                 // { blocks: [...] } – generoidaan kerran init():ssä

    /* ── Päivä/yö (v4.33) ──
       Kun pelaaja on läpäissyt kaikki kolme peliä, kadulle nousee päivä kerran
       (kuu vaihtuu auringoksi, valoisuus päivätasolle). Sen jälkeen tilan voi
       vaihtaa talon 7 makuuhuoneessa (Nuku: päivä ⇄ yö) ja valinta tallennetaan
       (state.isDay). Yksi liukuva arvo dayT (0 = yö … 1 = päivä) ohjaa kaikki
       muutokset, joten yö-tila piirtyy täsmälleen kuten ennen (kaikki lisäykset
       ovat ehtoja dayT > 0). VISUAALINEN VAIN: hitboxit, törmäykset, kamera,
       avaimet ja talous eivät muutu mihinkään. Poikkeus: Jukebox ja
       Hedelmäpeli ovat auki vain öisin (v4.34, ks. CLOSED_SIGN). */
    let dayT = 0;                          // 0 = yö … 1 = päivä (liukuva)
    const DAY_FADE_FRAMES   = 1200;        // ~20 s auringonnousu (yö → päivä)
    const NIGHT_FADE_FRAMES = 1200;        // ~20 s auringonlasku (päivä → yö)
    const DAY_SKY_TOP     = '#3f7fc0';     // päivätaivaan yläosa
    const DAY_SKY_MID     = '#78b4e0';     // keskikohta
    const DAY_SKY_HORIZON = '#ffd9a0';     // lämmin horisontti
    const SUN_X = 660, SUN_Y = 62, SUN_R = 26;
    const DAY_LIGHT_RGB   = [70, 58, 40];  // additive-päivänvalon sävy
    const DAY_LIGHT_ALPHA = 0.30;          // 0 = ei valoa … ~0.35 = kirkas päivä
    const LAMP_DAY_DIM    = 0.15;          // paljonko lampun hehkusta jää päivällä
    const VEHICLE_HEADLIGHT_DIM = 1;       // ajovalot: 1 = kokonaan pois päivällä, 0 = ei muutosta
    /* Testityökalut (eivät tallenna mitään): ?day=1 = päivä heti,
       ?day=0 = pakota yö. Pakotettu tila ohittaa tallennetun tilan eikä
       käynnistä ensiauringonnousua → kumpaankin suuntaan voi testata. */
    const DAY_PARAM = (typeof location !== 'undefined' && typeof URLSearchParams !== 'undefined')
        ? new URLSearchParams(location.search).get('day') : null;
    const DAY_FORCE = (DAY_PARAM === '1') ? 'day' : (DAY_PARAM === '0' ? 'night' : null);
    const DAY_DEBUG = DAY_FORCE !== null;   // pakotettu → liuku heti perille

    /* ── Aukiolo (v4.34): Jukebox ja Hedelmäpeli auki vain öisin ──
       Päivällä ovesta tulee sama teksti-popup kuin lukitusta ovesta.
       Talousarvot eivät muutu – vain aukioloaika. Nuppi: CLOSED_AT_DAYT
       (sama raja kuin makuuhuoneen tilanvaihdossa: dayT >= 0.5 = päivä). */
    const CLOSED_SIGN    = 'Avoinna\nKlo 20 - 06';
    const CLOSED_AT_DAYT = 0.5;   // tämän yli = päivä = ovet kiinni
    function nightOnlyClosed() { return dayT >= CLOSED_AT_DAYT; }

    /* Päivän tavoite liu'ulle: 1 = päivä, 0 = yö. Tallennettu tila
       (isDay) ratkaisee, paitsi pakotettuna ?day=0/1. */
    function dayTarget() {
        if (DAY_FORCE === 'day') return 1;
        if (DAY_FORCE === 'night') return 0;
        return isDay ? 1 : 0;
    }

    // Kaksisuuntainen liikenne: kaksi ajorataa (kaistaa)
    // 0 = alempi (lahempana kameraa), vasemmalta oikealle
    // 1 = ylempi (kauempana), oikealta vasemmalle
    const LANE_DEFS = [
        { y: 340, direction: 1  },  // alempi (L→R)
        { y: 328, direction: -1 }   // ylempi (R→L)
    ];
    let vehicles = [null, null];      // yksi ajoneuvo per kaista
    let spawnTimers = [300, 300];     // 5 s ekaan spawniin molemmille

    /* ── Kukkaruukun pudotus ──────────────────────── */
    function spawnFlowerPot(bldg) {
        const dc = doorCenter(bldg);
        spawnParticles(dc.x, dc.y, '#ff6644', 8);
        const windowY = GROUND_Y - bldg.h + 40;
        flowerPot = { x: dc.x, y: windowY, vx: 0, vy: 0, rotation: 0, active: true };
    }

    /* ── Oviukko: astuu ovesta kynnykseltä (ei putoa ikkunasta) ── */
    function spawnAvenger(bldg) {
        const dc = doorCenter(bldg);
        spawnParticles(dc.x, dc.y, '#ff8866', 8);
        avenger = {
            x: dc.x - 10, y: GROUND_Y - 30, w: 20, h: 30,
            bldgIdx: buildings.indexOf(bldg),
            facing: 1, phase: 'emerge', timer: AVENGER_TELEGRAPH,
            walkTimer: 0, scale: buildingScale(bldg)
        };
    }

    /* ── Potkun pudotus: oviukko (1/8) → kolikko (1/5) → kukkaruukku ── */
    function spawnKickDrop(bldg) {
        const dc = doorCenter(bldg);
        const windowY = GROUND_Y - bldg.h + 40;
        // 1/8 oviukko – kolikon vastakohta (tainnutus + 1 hampurilainen)
        if (avengerCooldown <= 0 && !avenger && Math.random() < AVENGER_CHANCE) {
            avengerCooldown = AVENGER_COOLDOWN;
            spawnAvenger(bldg);
            return;
        }
        // 1/5 kolikko – mutta vain jos cooldown on ohi (estää kolikoiden farmaamisen)
        if (kickCoinCooldown <= 0 && Math.random() < 0.2) {
            spawnParticles(dc.x, windowY, '#ffd700', 8);
            kickCoin = { x: dc.x, y: windowY, vy: 0, landed: false, ttl: 600 };
            kickCoinCooldown = 1800;  // 30s @ 60fps
        } else {
            spawnFlowerPot(bldg);
        }
    }

    /* ── Oviukon päivitys: emerge → chase → hold (3 s) → kosahtaminen → return ──
       Kutsutaan sekä normaalivirrasta että tainnutus-haarasta, jotta paluu
       ovelle jatkuu myös silloin kun pelaaja makaa maassa.
       Ei näkymätöntä osumaa iframe-pelin aikana (loop() ei pysähdy overlayn ajaksi). */
    function updateAvenger(dt) {
        if (!avenger) return;
        const ov = document.getElementById('game-iframe-overlay');
        if (ov && ov.classList.contains('active')) return;   // peli auki → jäihin

        const a = avenger;
        const acx = a.x + a.w / 2, acy = a.y + a.h / 2;
        const pcx = player.x + player.w / 2, pcy = player.y + player.h / 2;

        // 1) Varoitus: ovi aukeaa kynnyksellä ennen kuin hahmo astuu ulos
        if (a.phase === 'emerge') {
            a.timer -= dt;
            if (a.timer <= 0) a.phase = 'chase';
            return;
        }

        // 2) Peräänkäynti – nopeampi kuin pelaaja → tavoittaa aina (ei väistettävissä)
        if (a.phase === 'chase') {
            a.facing = (pcx - acx) >= 0 ? 1 : -1;
            a.x += Math.sign(pcx - acx) * AVENGER_SPEED * dt;
            a.y += Math.sign(player.y - a.y) * AVENGER_SPEED * dt;
            a.walkTimer += dt;
            const d = Math.sqrt((pcx - acx) * (pcx - acx) + (pcy - acy) * (pcy - acy));
            if (d < AVENGER_HIT_R) {
                // Kontakti: koko maailma jäätyy 3 s (hit-stop) → dramaattinen isku
                spawnParticles(pcx, pcy, '#ffaa44', 12);
                playKnock();
                a.phase = 'hold';
                hitPauseTimer = AVENGER_FREEZE;
            }
            return;
        }

        // 3) Jäädytys (3 s): maailma seisoo – vasta lopuksi pelaaja kosahtaa kasaan
        if (a.phase === 'hold') {
            if (!player.knockedDown) { knockPlayerDown(); }   // tainnutus + 1 🍔 (vain kerran)
            spawnParticles(pcx, pcy, '#ff6644', 18);
            playKnock();
            a.phase = 'return';
            return;
        }

        // 4) Paluu: kävelee takaisin kynnykselle ja katoaa ovesta
        const homeX = doorCenter(buildings[a.bldgIdx]).x - a.w / 2;
        const homeY = GROUND_Y - a.h;
        a.x += Math.sign(homeX - a.x) * AVENGER_SPEED * dt;
        a.y += Math.sign(homeY - a.y) * AVENGER_SPEED * dt;
        a.walkTimer += dt;
        a.facing = (homeX - a.x) >= 0 ? 1 : -1;
        if (Math.abs(homeX - a.x) < 2 && Math.abs(homeY - a.y) < 2) {
            spawnParticles(homeX + a.w / 2, GROUND_Y - 10, '#ff8866', 8);
            avenger = null;
        }
    }

    /* ── Onnettomuus: tainnutus + 1 hampurilainen ───
       Sama vaikutus kuin kukkaruukulla/autolla/sähköiskulla.
       Käyttää vain uusi oviukko-koodi – vanhat haarat ennallaan. */
    function knockPlayerDown() {
        player.knockedDown = true;
        player.knockdownTimer = AVENGER_STUN;
        player.kicking = false;
        player.kickFrame = 0;
        hamburgerCount--;
        state.inventory.hamburgerCount = hamburgerCount;
        GameState.save(state);
        updateHUD();
        if (hamburgerCount <= 0) { killPlayer(); }
    }

    /* ── Pelaajan kuolema (hampurilaiset loppu) ────── */
    function killPlayer() {
        playerDead = true;
        deathTimer = 180;          // 3s @ ~60fps
        deathAlpha = 0;
        player.knockedDown = true; // pelaaja kaatuu maahan
        player.knockdownTimer = 9999; // pysyy maassa koko sekvenssin ajan
        player.vx = 0;
        player.kicking = false;
        for (let li = 0; li < vehicles.length; li++) {
            if (vehicles[li] && vehicles[li].engine) stopVehicleEngine(vehicles[li].engine);
        }
        StreetAudio.stop();        // pysäytä taustamusiikki
        StreetAudio.playDeathGong(); // gongi kumahtaa
    }

    /* ── Pienten talojen valot ──────────────────── */
    for (let i = 0; i < buildings.length; i++) {
        if (i !== 0 && !lamps.some(l => l.bldgIdx === i)) {
            smallHouseLights[i] = { lit: false, timer: 0 };
        }
    }
    let savedPlayerX = 40;
    let savedPlayerY = GROUND_Y - 20;

    /* ── Tila ────────────────────────────────────────── */
    let state;
    let animFrameId;
    let lastTime = 0;
    let particles = [];
    let stars = [];
    let shootingStar = null;   // Tähdenlento
    let satellite = null;      // Satelliitti
    let clouds = [];            // Pilvet (cirrus + hazy)
    let lastCloudTime = 0;     // Pilvien dt-laskenta
    let windDir = Math.random() < 0.5 ? 1 : -1;
    let windSpeed = 2 + Math.random() * 3; // px/s (2–5)

    /* ── Potkuääni (Web Audio API) ────────────────── */
    let audioCtx = null;
    let _audioListenersAdded = false;
    function initAudio() {
        if (!audioCtx) {
            audioCtx = StreetAudio.getCtx();
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (!_audioListenersAdded) {
            _audioListenersAdded = true;
            const resumeAudio = () => {
                if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
            };
            document.addEventListener('touchstart', resumeAudio, { passive: true });
            document.addEventListener('mousedown', resumeAudio);
            document.addEventListener('keydown', resumeAudio);
        }
    }
    function playKick() {
        try {
            initAudio();
            if (!audioCtx || audioCtx.state !== 'running') return;
            const now = audioCtx.currentTime;
            // Lyhyt napsaus – kohina + terävä alku
            const buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.06), audioCtx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.008));
            }
            const src = audioCtx.createBufferSource();
            src.buffer = buf;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = 800;
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.83, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            src.connect(filter).connect(gain).connect(audioCtx.destination);
            src.start(now);
            src.stop(now + 0.06);
        } catch(e) {}
    }
    /* ── Kävelyääni ──────────────────────────────── */
    function playWalk() {
        try {
            initAudio();
            if (!audioCtx || audioCtx.state !== 'running') return;
            const now = audioCtx.currentTime;
            const buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.05), audioCtx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1) * Math.exp(-i/(audioCtx.sampleRate*0.012));
            const src = audioCtx.createBufferSource(); src.buffer = buf;
            const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 300;
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.68, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            src.connect(filter).connect(gain).connect(audioCtx.destination);
            src.start(now); src.stop(now + 0.05);
        } catch(e) {}
    }
    /* ── Kolikkoääni ──────────────────────────────── */
    function playCoin() {
        try {
            initAudio();
            if (!audioCtx || audioCtx.state !== 'running') return;
            const now = audioCtx.currentTime;
            // Vieno pling – kaksi sine-oskillaattoria (1200 + 1800 Hz)
            [1200, 1800].forEach(freq => {
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
                osc.connect(gain).connect(audioCtx.destination);
                osc.start(now); osc.stop(now + 0.08);
            });
        } catch(e) {}
    }
    /* ── Tömähdys (oviukon osuma) ──────────────────── */
    function playKnock() {
        try {
            initAudio();
            if (!audioCtx || audioCtx.state !== 'running') return;
            const now = audioCtx.currentTime;
            // Matala tömähdys: kohina + lyhyt matala jyrinä
            const buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.12), audioCtx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.02));
            }
            const src = audioCtx.createBufferSource();
            src.buffer = buf;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 500;
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.75, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
            src.connect(filter).connect(gain).connect(audioCtx.destination);
            src.start(now); src.stop(now + 0.12);

            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(45, now + 0.11);
            const ogain = audioCtx.createGain();
            ogain.gain.setValueAtTime(0.30, now);
            ogain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
            osc.connect(ogain).connect(audioCtx.destination);
            osc.start(now); osc.stop(now + 0.12);
        } catch(e) {}
    }
    /* ── Sähköiskun ääni ───────────────────────────── */
    function playZap() {
        try {
            initAudio();
            if (!audioCtx || audioCtx.state !== 'running') return;
            const now = audioCtx.currentTime;
            // Surina: kohina + nopea neliöaalto-sweep alas
            const buf = audioCtx.createBuffer(1, Math.floor(audioCtx.sampleRate * 0.18), audioCtx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.04));
            }
            const src = audioCtx.createBufferSource();
            src.buffer = buf;
            const ngain = audioCtx.createGain();
            ngain.gain.setValueAtTime(0.5, now);
            ngain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            src.connect(ngain).connect(audioCtx.destination);
            src.start(now); src.stop(now + 0.18);

            const osc = audioCtx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
            const ogain = audioCtx.createGain();
            ogain.gain.setValueAtTime(0.12, now);
            ogain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(ogain).connect(audioCtx.destination);
            osc.start(now); osc.stop(now + 0.15);
        } catch(e) {}
    }

    /* ── Ajoneuvon moottoriääni ────────────────────── */
    function startVehicleEngine(v) {
        try {
            initAudio();
            if (!audioCtx || audioCtx.state !== 'running') return null;
            const now = audioCtx.currentTime;
            let baseFreq, gainVal, lfoRate, lowpassFreq;
            if (v.type === 'motorcycle') {
                baseFreq = 185; gainVal = 0.025; lfoRate = 15; lowpassFreq = 2200;
            } else if (v.type === 'ambulance') {
                baseFreq = 55; gainVal = 0.08; lfoRate = 6; lowpassFreq = 420;
            } else { // car
                baseFreq = 82; gainVal = 0.065; lfoRate = 9; lowpassFreq = 640;
            }
            // Pääoskillaattori – moottorin perusjyrinä
            const osc = audioCtx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = baseFreq;
            // LFO: taajuusmodulaatio → suriseva "zzz"/"ZZZzzz"-jyrinä
            const lfo = audioCtx.createOscillator();
            lfo.type = 'triangle';
            lfo.frequency.value = lfoRate;
            const lfoGain = audioCtx.createGain();
            lfoGain.gain.value = baseFreq * 0.22;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            // Alipäästösuodatin pehmentää sahahampaan
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = lowpassFreq;
            // Äänenvoimakkuus (pehmeä fade-in)
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.linearRampToValueAtTime(gainVal, now + 0.5);
            // Stereopanorointi – ääni seuraa auton x-sijaintia
            const panner = (typeof audioCtx.createStereoPanner === 'function') ? audioCtx.createStereoPanner() : null;
            osc.connect(filter);
            filter.connect(gain);
            if (panner) { gain.connect(panner); panner.connect(audioCtx.destination); }
            else { gain.connect(audioCtx.destination); }
            osc.start(now);
            lfo.start(now);
            const engine = { osc, lfo, gain, panner };
            updateVehicleEngine(engine, v);
            return engine;
        } catch (e) { return null; }
    }

    function updateVehicleEngine(engine, v) {
        if (!engine || !audioCtx || !engine.panner) return;
        try {
            const pan = Math.max(-1, Math.min(1, (v.x / WORLD_W) * 2 - 1));
            engine.panner.pan.setTargetAtTime(pan, audioCtx.currentTime, 0.05);
        } catch (e) {}
    }

    function stopVehicleEngine(engine) {
        if (!engine || !audioCtx) return;
        try {
            const now = audioCtx.currentTime;
            engine.gain.gain.cancelScheduledValues(now);
            engine.gain.gain.setValueAtTime(Math.max(engine.gain.gain.value, 0.0001), now);
            engine.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
            engine.osc.stop(now + 0.4);
            engine.lfo.stop(now + 0.4);
        } catch (e) {}
    }

    // Apufunktio: oven keskipiste
    function doorCenter(bldg) {
        return {
            x: bldg.x + bldg.w / 2,
            y: GROUND_Y - DOOR_H / 2
        };
    }

    /* ═══════════════════════════════════════════════════
       ALOITUS
       ═══════════════════════════════════════════════════ */
    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        // Pikseliterävyys: ei pehmennystä skaalattaessa (sprite-piirto)
        ctx.imageSmoothingEnabled = false;
        randomizeBuildingColors();  // arvo taloille uudet sävyt joka kerta
        state = GameState.load();
        for (let i = 0; i < lamps.length; i++) {
            lamps[i].lit = state.litLamps[i];
            lamps[i].kickCount = lamps[i].kickCount || 0;
            lamps[i].overheat = lamps[i].overheat || false;
            lamps[i].overheatTimer = lamps[i].overheatTimer || 0;
            if (!lamps[i].baseShade) {
                const g = 35 + Math.random() * 30;  // 35–65 harmaan vaaleus
                lamps[i].baseShade = 'hsl(0,0%,' + g + '%)';
                lamps[i].hatShade  = 'hsl(0,0%,' + (g - 8) + '%)';
            }
        }
        coin.collected = state.inventory.coin;
        coinCount = state.inventory.coinCount || 0;
        coinRespawnTimer = coin.collected ? 1 : 0;
        coin.despawnTimer = coin.collected ? 0 : 600;
        hamburgerCount = state.inventory.hamburgerCount || 5;
        hamburgerTimer = 2400;
        if (coin.collected) { coin.x = -100; coin.y = -100; }
        else { coin.x = randomCoinX(); coin.y = randomCoinY(); }
        digKeyCollected = state.digKeyCollected || false;
        boulderKeyCollected = state.boulderKeyCollected || false;
        bmKeyCollected = state.bmKeyCollected || false;
        /* Päivä/yö on tallennettu tila (state.isDay, v4.33):
             null  = ei vielä ratkaistu → 3 avainta nostaa päivän kerran
             true  = päivä, false = yö (makuuhuoneen Nuku-valinta)
           Valmiiksi läpäisty peli avautuu siis suoraan päivänä (v4.32-käytös),
           mutta nukkumalla tilan voi vaihtaa ja valinta pysyy tallessa. */
        if (state.isDay == null && !DAY_FORCE && allKeysCollected()) {
            state.isDay = true;
            GameState.save(state);
        }
        isDay = (state.isDay === true);
        dayT = dayTarget();
        stars = [];
        for (let i = 0; i < 80; i++) {
            stars.push({
                x: Math.random() * WORLD_W,
                y: Math.random() * (GROUND_Y - 30),
                r: Math.random() * 1.5 + 0.5,
                blink: Math.random() * Math.PI * 2
            });
        }
        initClouds();
        initBackdrop();
        initForeground();
        setupInput();
        resize();
        lastTime = performance.now();
        loop(lastTime);
        StreetAudio.init();
        updateHUD();

        // Näytä ohjepopup vain tuoreessa/0-tilassa (ensimmäinen lataus tai kuoleman reset)
        if (JSON.stringify(state) === JSON.stringify(GameState.defaultState)) {
            showSpawnHint();
        }
    }

    /* ═══════════════════════════════════════════════════
       SYÖTTEET
       ═══════════════════════════════════════════════════ */
    function setupInput() {
        // ⚡ Pakota D-pad näkyviin kaikilla kosketuslaitteilla
        //    (varmempi kuin pelkkä CSS @media, toimii myös HTTPS/Pagesissa)
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            isTouchDevice = true;
            const tr = document.getElementById('touch-row');
            if (tr) tr.classList.add('force-show');
        }

        window.addEventListener('keydown', e => {
            keys[e.key] = true;
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!actionPressed) actionJustPressed = true;
                actionPressed = true;
            }
            if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', e => {
            keys[e.key] = false;
            if (e.key === ' ' || e.key === 'Enter') actionPressed = false;
        });

        const setupBtn = (id, key) => {
            const btn = document.getElementById(id);
            if (!btn) return;

            // Estetään synteettisten mouse-tapahtumien kaksoiskäsittely mobiililla
            let touchActive = false;

            const onDown = (e) => {
                e.preventDefault();
                if (id === 'action-btn' && !actionPressed) actionJustPressed = true;
                if (id === 'action-btn') actionPressed = true;
                keys[key] = true;
            };
            const onUp = (e) => {
                e.preventDefault();
                keys[key] = false;
                if (id === 'action-btn') actionPressed = false;
            };
            const onCancel = () => {
                keys[key] = false;
                if (id === 'action-btn') actionPressed = false;
            };

            // Mobiili: kosketustapahtumat
            btn.addEventListener('touchstart', (e) => {
                touchActive = true;
                onDown(e);
            }, { passive: false });
            btn.addEventListener('touchend', (e) => {
                onUp(e);
                // Viiveellä nollataan, jotta myöhästynyt synteettinen mousedown ei mene läpi
                setTimeout(() => { touchActive = false; }, 400);
            }, { passive: false });
            btn.addEventListener('touchcancel', (e) => {
                onCancel();
                setTimeout(() => { touchActive = false; }, 400);
            }, { passive: false });

            // Työpöytä: hiiritapahtumat (ohitetaan jos touch-aktiivinen)
            btn.addEventListener('mousedown', (e) => {
                if (touchActive) return;
                onDown(e);
            });
            btn.addEventListener('mouseup', (e) => {
                if (touchActive) return;
                onUp(e);
            });
            btn.addEventListener('mouseleave', () => {
                if (touchActive) return;
                onCancel();
            });
        };

        setupBtn('btn-up', 'ArrowUp');
        setupBtn('btn-down', 'ArrowDown');
        setupBtn('btn-left', 'ArrowLeft');
        setupBtn('btn-right', 'ArrowRight');
        setupBtn('action-btn', ' ');
    }

    /* ═══════════════════════════════════════════════════
       PELISILMUKKA
       ═══════════════════════════════════════════════════ */
    function loop(timestamp) {
        animFrameId = requestAnimationFrame(loop);
        const dt = Math.min((timestamp - lastTime) / 16.667, 3);
        lastTime = timestamp;
        updateLitWindows();
        update(dt);
        render();
        actionJustPressed = false;
    }
    const LAMP_RADIUS = 30;
/* ═══════════════════════════════════════════════════
       PÄIVITYS
       ═══════════════════════════════════════════════════ */
    /* ── Kamera: seuraa pelaajaa vaakasuunnassa (mobiili) ── */
    function updateCamera() {
        if (viewW >= WORLD_W) { camX = 0; return; }
        const target = Math.max(0, Math.min(WORLD_W - viewW, player.x + player.w / 2 - viewW / 2));
        camX += (target - camX) * CAMERA_LERP;
        if (Math.abs(target - camX) < 0.5) camX = target;
    }

    function update(dt) {
        // ── Hit pause: maailma jäätyy 2 frameä osumasta (render jatkaa) ──
        if (hitPauseTimer > 0) { hitPauseTimer -= dt; return; }

        // Animaatiokello (hengitys, silmän vilkahdus)
        animClock += dt;

        // ── Päivä/yö: liuku kohti tallennettua tavoitetta ──
        // Ensiauringonnousu (v4.32-käytös): kun kaikki 3 avainta on koossa eikä
        // tilaa ole vielä ratkaistu, kadulle nousee päivä kerran. Sen jälkeen
        // tila on tallennettu (state.isDay) ja makuuhuoneen Nuku-valinta
        // vaihtaa sitä vapaasti (päivä ⇄ yö).
        if (state.isDay == null && !DAY_FORCE && allKeysCollected()) {
            state.isDay = true;
            isDay = true;
            GameState.save(state);
        }
        // Liuku pysäytetään, kunnes pelaaja on taas kadulla: avain saadaan
        // alapelistä (iframe) ja huoneista → muutos näkyy kadulle palatessa
        // eikä jää taustalla näkymättömiin.
        const dayWanted = dayTarget();
        if (dayT !== dayWanted && !iframeOpen && !sleepRoom && !barRoom && !jukeboxRoom) {
            const fadeFrames = (dayWanted > dayT) ? DAY_FADE_FRAMES : NIGHT_FADE_FRAMES;
            const step = DAY_DEBUG ? 1 : dt / fadeFrames;
            if (dayWanted > dayT) {
                const wasNight = dayT === 0;
                dayT = Math.min(1, dayT + step);
                if (wasNight) { shootingStar = null; satellite = null; }
            } else {
                dayT = Math.max(0, dayT - step);
            }
            if (Math.abs(dayWanted - dayT) < step) dayT = dayWanted;  // ei jää värähtelyä
        }

        // ── Kuolemasekvenssi ─────────────────────────
        if (playerDead) {
            deathTimer -= dt;
            deathAlpha = Math.min(1, 1 - (deathTimer / 180));
            if (deathTimer <= 0) {
                GameState.reset();
                location.reload();
            }
            return;
        }

        // ── Makuuhuone (ex-palkintohuone, talo 7) ──
        //   ▲ / W = Nuku     ▼ / S = Poistu   (valinta liikkuu reunoilla)
        //   (o) / Space / Enter / ⚡ = vahvista valinta
        //   Poistuminen ilman nukkumista ei muuta päivä/yö-tilaa mihinkään.
        //   Nuku → pimennys (SLEEP_FADE_FRAMES) → tila vaihtuu → takaisin kadulle.
        if (sleepRoom) {
            // Nukkumisen pimennys: tila vaihtuu vasta pimennyksen lopussa
            if (sleepPhase > 0) {
                sleepPhase -= dt;
                if (sleepPhase <= 0) {
                    sleepPhase = 0;
                    // Tila vaihtuu siitä, miltä katu parhaillaan näyttää
                    // (toimii myös keskellä hämärtymistä ja ?day-testityökalulla)
                    isDay = !(dayT >= 0.5);        // päivä → yö  TAI  yö → päivä
                    if (!DAY_FORCE) {              // testityökalut eivät tallenna
                        state.isDay = isDay;
                        GameState.save(state);
                    }
                    sleepRoom = false;
                    sleepSel = 0;
                    sleepHeldUp = false;
                    sleepHeldDown = false;
                    updateHUD();
                }
                actionJustPressed = false;
                return;
            }

            const selUp = !!(keys['ArrowUp'] || keys['w'] || keys['W']);
            const selDown = !!(keys['ArrowDown'] || keys['s'] || keys['S']);
            if (selUp && !sleepHeldUp) sleepSel = Math.max(0, sleepSel - 1);
            if (selDown && !sleepHeldDown) sleepSel = Math.min(1, sleepSel + 1);
            sleepHeldUp = selUp;
            sleepHeldDown = selDown;

            if (actionJustPressed) {
                if (sleepSel === 0) {
                    sleepPhase = SLEEP_FADE_FRAMES;   // nukahdus käynnissä
                } else {
                    // Poistu: ei muutosta päivä/yö-tilaan
                    sleepRoom = false;
                    sleepSel = 0;
                    sleepHeldUp = false;
                    sleepHeldDown = false;
                }
            }
            actionJustPressed = false;
            return;
        }

        // BAR room – ostomäärää säädetään nuolilla, poistuminen toimintonapista
        //   ▲ / W = osta 1 hampurilainen (1 kolikko)      ▼ / S = peru viimeisin osto
        //   (o) / Space / Enter = poistu
        if (barRoom) {
            const buyUp = !!(keys['ArrowUp'] || keys['w'] || keys['W']);
            const buyDown = !!(keys['ArrowDown'] || keys['s'] || keys['S']);

            if (buyUp && !barBuyHeldUp && coinCount > 0 && hamburgerCount < 10) {
                hamburgerCount++;
                coinCount--;
                barBuyQty++;
                state.inventory.hamburgerCount = hamburgerCount;
                state.inventory.coinCount = coinCount;
                GameState.save(state);
                updateHUD();
                playCoin();
            }
            if (buyDown && !barBuyHeldDown && barBuyQty > 0) {
                hamburgerCount--;
                coinCount++;
                barBuyQty--;
                state.inventory.hamburgerCount = hamburgerCount;
                state.inventory.coinCount = coinCount;
                GameState.save(state);
                updateHUD();
                playCoin();
            }
            barBuyHeldUp = buyUp;
            barBuyHeldDown = buyDown;

            if (actionJustPressed) {
                barRoom = false;
                barBuyQty = 0;
                barBuyHeldUp = false;
                barBuyHeldDown = false;
            }
            actionJustPressed = false;
            return;
        }

        // JUKEBOX-huone (talo 5) – valinta nuolilla, osto + soitto poistuttaessa
        //   ▲ / W = valitse YLÖS (pienempi rivi)   ▼ / S = valitse ALAS (isompi rivi)
        //   Rivi 0 ("ei valintaa") on listan ylimpänä → ▲ = jukeSel - 1, ▼ = jukeSel + 1
        //   0 = ei valintaa → poistuminen ei veloita eikä soita mitään
        //   (o) / Space / Enter / ⚡ = poistu: valinta 1-N → 1 kolikko + koko kappale
        if (jukeboxRoom) {
            const selUp = !!(keys['ArrowUp'] || keys['w'] || keys['W']);
            const selDown = !!(keys['ArrowDown'] || keys['s'] || keys['S']);
            const trackCount = JUKEBOX_TRACKS.length;
            const songPlaying = StreetAudio.isJukeboxPlaying();

            // Valinta on lukossa kun kappale soi (soi aina loppuun asti)
            if (!songPlaying) {
                if (selUp && !jukeHeldUp) jukeSel = Math.max(0, jukeSel - 1);
                if (selDown && !jukeHeldDown) jukeSel = Math.min(trackCount, jukeSel + 1);
            }
            jukeHeldUp = selUp;
            jukeHeldDown = selDown;

            if (actionJustPressed) {
                if (!songPlaying && jukeSel > 0) {
                    if (coinCount > 0) {
                        coinCount--;
                        state.inventory.coinCount = coinCount;
                        GameState.save(state);
                        updateHUD();
                        if (StreetAudio.playJukebox(JUKEBOX_TRACKS[jukeSel - 1].url)) {
                            jukeTrack = jukeSel;
                            playCoin();
                        } else {
                            // Ääntä ei saatu lainkaan → kolikko takaisin
                            coinCount++;
                            state.inventory.coinCount = coinCount;
                            GameState.save(state);
                            updateHUD();
                            showNotification('🔇 Ääntä ei saatu – kolikko palautettiin.');
                        }
                    } else {
                        showNotification('💰 Ei kolikoita!');
                    }
                }
                jukeboxRoom = false;
                jukeSel = 0;
                jukeHeldUp = false;
                jukeHeldDown = false;
            }
            actionJustPressed = false;
            return;
        }

        updateClouds(dt);
        updateForeground(dt);

        // Tainnutus - kukkaruukku osui
        if (player.knockedDown) {
            player.knockdownTimer -= dt;
            player.vx = 0; player.vy += GRAVITY * dt; player.y += player.vy * dt;
            if (player.y + player.h >= GROUND_Y + 10) { player.y = GROUND_Y + 10 - player.h; player.vy = 0; }
            if (player.knockdownTimer <= 0) { player.knockedDown = false; player.knockdownTimer = 0; }
            if (player.kicking) { player.kickFrame += dt; if (player.kickFrame >= KICK_DURATION) { player.kicking = false; player.kickFrame = 0; } }
            for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.x += p.vx; p.y += p.vy; p.life--; if (p.life <= 0) particles.splice(i, 1); }
            coin.sparkle += 0.05 * dt;
            if (firstHouseWindowsLit && firstHouseWindowTimer > 0) { firstHouseWindowTimer -= dt; if (firstHouseWindowTimer <= 0) { firstHouseWindowsLit = false; firstHouseKickCount = 0; firstHouseKickTarget = 0; } }
            for (const idx in smallHouseLights) { const sh = smallHouseLights[idx]; if (sh.lit && sh.timer > 0) { sh.timer -= dt; if (sh.timer <= 0) { sh.lit = false; sh.timer = 0; } } }
            updateAvenger(dt);   // oviukko: paluu ovelle jatkuu tainnutuksen aikana
            for (let i = 0; i < lamps.length; i++) { if (lamps[i].overheatTimer > 0) { lamps[i].overheatTimer -= dt; if (lamps[i].overheatTimer <= 0) { lamps[i].overheatTimer = 0; lamps[i].overheat = false; lamps[i].kickCount = 0; } } }
            if (!shootingStar || !shootingStar.active) { if (shootingStar) { shootingStar.timer -= dt; } if (!shootingStar || shootingStar.timer <= 0) { const ang = -0.3 - Math.random() * 0.5; const spd = 1.5 + Math.random() * 2.5; shootingStar = { x: -10 + Math.random() * WORLD_W * 0.4, y: 15 + Math.random() * 100, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, active: true, life: 120 + Math.random() * 180, trail: [], timer: 600 + Math.random() * 2100 }; } } else { shootingStar.x += shootingStar.vx * dt; shootingStar.y -= shootingStar.vy * dt; shootingStar.trail.push({x: shootingStar.x, y: shootingStar.y}); if (shootingStar.trail.length > 18) shootingStar.trail.shift(); shootingStar.life -= dt; if (shootingStar.life <= 0 || shootingStar.x > WORLD_W + 30 || shootingStar.y < -30 || shootingStar.y > GROUND_Y) { shootingStar.active = false; } }
            if (!satellite || !satellite.active) { if (satellite) { satellite.timer -= dt; } if (!satellite || satellite.timer <= 0) { const dir2 = Math.random() < 0.5 ? 1 : -1; satellite = { x: dir2 > 0 ? -10 : WORLD_W + 10, y: 25 + Math.random() * 70, vx: dir2 * (0.25 + Math.random() * 0.5), active: true, blinkPhase: Math.random() * Math.PI * 2, timer: 400 + Math.random() * 900 }; } } else { satellite.x += satellite.vx * dt; satellite.blinkPhase += 0.08 * dt; if ((satellite.vx > 0 && satellite.x > WORLD_W + 15) || (satellite.vx < 0 && satellite.x < -15)) { satellite.active = false; } }
            actionJustPressed = false;
            return;
        }

        // ── Liike ──────────────────────────────────
        let moveX = 0;
        if (keys['ArrowLeft'] || keys['a'] || keys['A'])  moveX = -1;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) moveX = 1;
        player.vx = moveX * PLAYER_SPEED;

        // Vertikaalinen liike ylös/alas (ei hyppyä, ei painovoimaa)
        const PLAYER_Y_MIN = GROUND_Y - player.h;            // 280 = yläraja (maksimoitu liikealue)
        const PLAYER_Y_MAX = WORLD_H - 50;                     // 350 = aidan yläreuna, pelaaja aidan takana
        let moveY = 0;
        if (keys['ArrowUp'] || keys['w'] || keys['W'])     moveY = -1;
        if (keys['ArrowDown'] || keys['s'] || keys['S'])   moveY = 1;
        player.y += moveY * PLAYER_SPEED * dt;
        player.y = Math.max(PLAYER_Y_MIN, Math.min(PLAYER_Y_MAX, player.y));
        player.lookY = moveY;   // katseen suunta piirtoa varten (−1 ylös, +1 alas)
        player.vy = 0;

        player.x += player.vx * dt;

        // Estä pelaajaa kävelemästä lampputolppien läpi
        // Lamppu on kadun puolella → pelaaja kiertää joko ALHAALTA (edestä) tai YLHÄÄLTÄ (takaa)
        const LAMP_BLOCK_X = 15;
        const LAMP_PASS_FRONT_Y = GROUND_Y;       // 310 – center alle = edestä ohi
        const LAMP_PASS_BEHIND_Y = 286;            // player.y ≤ 286 = takaa ohi (rakennusten juuressa)
        for (const lamp of lamps) {
            const cx = player.x + player.w / 2;
            const cy = player.y + player.h / 2;
            const dx = cx - lamp.x;
            if (cy < LAMP_PASS_FRONT_Y && player.y > LAMP_PASS_BEHIND_Y && Math.abs(dx) < LAMP_BLOCK_X) {
                if (dx < 0) {
                    player.x = lamp.x - LAMP_BLOCK_X - player.w / 2;
                } else {
                    player.x = lamp.x + LAMP_BLOCK_X - player.w / 2;
                }
            }
        }

        player.x = Math.max(0, Math.min(WORLD_W - player.w, player.x));

        updateCamera();

        const onGround = true;  // pelaaja on aina pinnalla (ei hyppyjä)

        // Päivitä kävelyanimaatio
        if (moveX !== 0) {
            player.facing = moveX;
            player.walking = true;
            player.walkTimer += dt;
            if (player.walkTimer > 8) {
                player.walkFrame = (player.walkFrame + 1) % 4;
                player.walkTimer = 0;
                if (onGround) playWalk();
            }
        } else {
            player.walking = false;
            player.walkFrame = 0;
            player.walkTimer = 0;
        }

        // Potku-animaatio
        if (player.kicking) {
            player.kickFrame += dt;
            if (player.kickFrame >= KICK_DURATION) {
                player.kicking = false;
                player.kickFrame = 0;
            }
        }

        // ── Kolikon keräys ──────────────────────────
        if (!coin.collected) {
            const dx = (player.x + player.w/2) - coin.x;
            const dy = (player.y + player.h/2) - coin.y;
            if (Math.sqrt(dx*dx + dy*dy) < 30) {
                const cx = coin.x, cy = coin.y;
                coinCount++;
                state.inventory.coin = true;
                state.inventory.coinCount = coinCount;
                GameState.save(state);
                coin.collected = true; coin.x = -100; coin.y = -100;
                playCoin();
                coinRespawnTimer = 7200;  // 120s @ 60fps
                showNotification('💰 Löysit kolikon! (' + coinCount + ' kpl)');
                spawnParticles(cx, cy, '#ffd700', 12);
                updateHUD();
            }
        }

        // ── Kolikon respawn (120s välein) ──────
        if (coin.collected && coinRespawnTimer > 0) {
            coinRespawnTimer -= dt;
            if (coinRespawnTimer <= 0) {
                coin.collected = false;
                coin.x = randomCoinX(); coin.y = randomCoinY();
                coin.despawnTimer = 600;  // 10s katoamisajastin
                coinRespawnTimer = 0;
            }
        }

        // ── Kolikon katoaminen (10s) ──────
        if (!coin.collected && coin.despawnTimer > 0) {
            coin.despawnTimer -= dt;
            if (coin.despawnTimer <= 0) {
                coin.x = -100; coin.y = -100;        // piilota
                coin.despawnTimer = 0;
                coin.despawnCooldown = 1800;          // 30s tauko ennen uutta
            }
        }

        // ── Kolikon cooldown katoamisen jälkeen ──────
        if (!coin.collected && coin.despawnCooldown > 0) {
            coin.despawnCooldown -= dt;
            if (coin.despawnCooldown <= 0) {
                coin.x = randomCoinX(); coin.y = randomCoinY();
                coin.despawnTimer = 600;  // uusi 10s
            }
        }

        // ── Sähkökaapit: sähköisku ─────────────────
        for (const cab of electricCabinets) {
            if (player.knockedDown) break;   // isku jo saatu – ei toista kaappia samalla kertaa
            // Vaakasuunnassa laatikon sisällä, pystysuunnassa pää kaapin
            // yläreunan yläpuolella (seinää vasten) → ei osumaa alhaalta.
            if (player.x < cab.x + cab.w && player.x + player.w > cab.x &&
                player.y < cab.y && player.y + player.h > cab.y) {
                player.knockedDown = true;
                player.knockdownTimer = 600;
                player.kicking = false;
                player.kickFrame = 0;
                // Sähköisku viskaa pelaajan taaksepäin (estää heti uudelleen osumisen)
                const ccx = cab.x + cab.w / 2;
                const pushDir = (player.x + player.w / 2) < ccx ? -1 : 1;
                player.x = Math.max(0, Math.min(WORLD_W - player.w, player.x + pushDir * 30));
                spawnParticles(ccx, cab.y + cab.h / 2, '#ffe066', 16);
                playZap();
                hamburgerCount--;
                state.inventory.hamburgerCount = hamburgerCount;
                GameState.save(state);
                updateHUD();
                if (hamburgerCount <= 0) {
                    killPlayer();
                }
            }
        }

        // ── Hampurilaisajastin (1/60s) ──────────
        if (hamburgerCount > 0) {
            hamburgerTimer -= dt;
            if (hamburgerTimer <= 0) {
                hamburgerCount--;
                state.inventory.hamburgerCount = hamburgerCount;
                GameState.save(state);
                updateHUD();
                if (hamburgerCount <= 0) {
                    killPlayer();
                    return;
                }
                hamburgerTimer = 2400;
            }
        }

        // ── Toiminto ────────────────────────────────
        if (actionJustPressed) handleAction();

        // ── Partikkelit ─────────────────────────────
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            if (p.life <= 0) particles.splice(i, 1);
        }

        // ── Lamppujen ylikuumenemisajastin ─────────
        for (let i = 0; i < lamps.length; i++) {
            if (lamps[i].overheatTimer > 0) {
                lamps[i].overheatTimer -= dt;
                if (lamps[i].overheatTimer <= 0) {
                    lamps[i].overheatTimer = 0;
                    lamps[i].overheat = false;
                    lamps[i].kickCount = 0;
                }
            }
        }

        // ── Notifikaatio ─────────────────────────────
        // (hoidetaan nyt setTimeoutilla showNotification-funktiossa)
        coin.sparkle += 0.05 * dt;

        // ── Talon 0 ikkunoiden ajastin (20s ilman potkua → sammuu) ──
        if (firstHouseWindowsLit && firstHouseWindowTimer > 0) {
            firstHouseWindowTimer -= dt;
            if (firstHouseWindowTimer <= 0) {
                firstHouseWindowsLit = false;
                firstHouseKickCount = 0;
                firstHouseKickTarget = 0;
            }
        }

        // ── Pienten talojen valoajastin ────────────────
        for (const idx in smallHouseLights) {
            const sh = smallHouseLights[idx];
            if (sh.lit && sh.timer > 0) { sh.timer -= dt; if (sh.timer <= 0) { sh.lit = false; sh.timer = 0; } }
        }

        // ── Kukkaruukun fysiikka ──────────────────────
        if (flowerPot && flowerPot.active) {
            flowerPot.vy += 0.12 * dt; flowerPot.x += flowerPot.vx * dt; flowerPot.y += flowerPot.vy * dt; flowerPot.rotation += 0.08 * dt;
            const fpx = flowerPot.x, fpy = flowerPot.y, ppx = player.x + player.w/2, ppy = player.y;
            if (Math.sqrt((fpx-ppx)*(fpx-ppx)+(fpy-ppy)*(fpy-ppy)) < 20) {
                if (!player.knockedDown) {
                    player.knockedDown = true; player.knockdownTimer = 600; player.kicking = false; player.kickFrame = 0;
                    hamburgerCount--;
                    state.inventory.hamburgerCount = hamburgerCount;
                    GameState.save(state);
                    updateHUD();
                    if (hamburgerCount <= 0) { killPlayer(); }
                }
                spawnParticles(ppx, ppy, '#ff6644', 15); flowerPot = null;
            } else if (flowerPot.y > GROUND_Y + 20 || flowerPot.x < -30 || flowerPot.x > WORLD_W + 30) {
                if (flowerPot.y > GROUND_Y) spawnParticles(flowerPot.x, GROUND_Y, '#8B4513', 5);
                flowerPot = null;
            }
        }

        // ── Potkusta pudonneen kolikon fysiikka ──────
        if (kickCoinCooldown > 0) kickCoinCooldown -= dt;
        // Salainen kolikkopalkkio: putken vanheneminen + cooldown
        if (coinCheatGapTimer > 0) { coinCheatGapTimer -= dt; if (coinCheatGapTimer <= 0) { coinCheatGapTimer = 0; coinCheatStreak = 0; } }
        if (coinCheatCooldown > 0) { coinCheatCooldown -= dt; if (coinCheatCooldown < 0) coinCheatCooldown = 0; }
        if (kickCoin) {
            if (!kickCoin.landed) {
                kickCoin.vy += 0.12 * dt;
                kickCoin.y += kickCoin.vy * dt;
                if (kickCoin.y >= GROUND_Y + 10) {
                    kickCoin.y = GROUND_Y + 10;
                    kickCoin.landed = true;
                    spawnParticles(kickCoin.x, kickCoin.y, '#ffd700', 6);
                }
            } else {
                kickCoin.ttl -= dt;
                if (kickCoin.ttl <= 0) kickCoin = null;
            }
            if (kickCoin) {
                const kpx = kickCoin.x, kpy = kickCoin.y;
                const ppx = player.x + player.w / 2, ppy = player.y + player.h / 2;
                if (Math.sqrt((kpx - ppx) * (kpx - ppx) + (kpy - ppy) * (kpy - ppy)) < 30) {
                    coinCount++;
                    state.inventory.coin = true;
                    state.inventory.coinCount = coinCount;
                    GameState.save(state);
                    playCoin();
                    showNotification('💰 Löysit kolikon! (' + coinCount + ' kpl)');
                    spawnParticles(kpx, kpy, '#ffd700', 12);
                    updateHUD();
                    kickCoin = null;
                }
            }
        }

        // ── Oviukko (Avenger) ────────────────────────
        if (avengerCooldown > 0) avengerCooldown -= dt;
        updateAvenger(dt);

        // ── Katueläin ────────────────────────────────
        if (!groundAnimal) {
            animalSpawnTimer -= dt;
            if (animalSpawnTimer <= 0) {
                const types = ['mouse','mouse','rat','rat','rabbit']; const type = types[Math.floor(Math.random()*types.length)];
                const dir = Math.random()<0.5?1:-1;
                // Satunnainen juoksukorkeus: aidan juuresta (335) nykyiseen ylälaitaan (305)
                const baseY = GROUND_Y - 5 + Math.random() * (GROUND_Y + 25 - (GROUND_Y - 5));
                let w,h,speed;
                if (type==='mouse') { w=8; h=4; speed=1.8+Math.random()*1.2; }
                else if (type==='rat') { w=14; h=6; speed=1.2+Math.random()*0.8; }
                else { w=10; h=10; speed=1.5+Math.random()*0.8; }
                groundAnimal = { type,w,h,x:dir>0?-w:WORLD_W+w,y:baseY-h,vx:dir*speed,direction:dir,hopY:0,hopVel:0,animTimer:0,pauseTimer:0 };
                animalSpawnTimer = 900;
            }
        } else {
            const a = groundAnimal;
            if (!(a.type==='rabbit'&&a.pauseTimer>0)) { a.x += a.vx * dt; a.animTimer += dt; }
            if (a.type === 'rabbit') {
                if (a.pauseTimer > 0) { a.pauseTimer -= dt; a.vx = 0; if (a.pauseTimer<=0) a.vx = a.direction*(1.5+Math.random()*0.8); }
                else {
                    if (a.hopY===0 && Math.random()<0.08*dt) a.hopVel = -0.9 - Math.random()*0.5;
                    if (a.hopVel!==0 || a.hopY<0) { a.hopY += a.hopVel*dt; a.hopVel += 0.15*dt; if (a.hopY>=0) { a.hopY=0; a.hopVel=0; } }
                    if (Math.random() < 0.002*dt) a.pauseTimer = 120 + Math.floor(Math.random()*480);
                }
            }
            if ((a.direction>0 && a.x>WORLD_W+a.w+10) || (a.direction<0 && a.x<-a.w-10)) groundAnimal = null;
        }

        // ── Ajoneuvo: kaksi ajorataa ──────────────────────
        for (let li = 0; li < LANE_DEFS.length; li++) {
            const lane = LANE_DEFS[li];
            if (!vehicles[li]) {
                spawnTimers[li] -= dt;
                if (spawnTimers[li] <= 0) {
                    const dir = lane.direction;
                    const vehRnd = Math.random();
                    let type, w, h, speed;
                    if (vehRnd < 0.4) {
                        type = 'car'; w = 80; h = 30; speed = 1.0 + Math.random() * 0.5;
                    } else if (vehRnd < 0.8) {
                        type = 'motorcycle'; w = 40; h = 22; speed = 1.5 + Math.random() * 1.0;
                    } else {
                        type = 'ambulance'; w = 80; h = 34; speed = 1.8 + Math.random() * 1.2;
                    }
                    const vehicle = {
                        type,
                        x: dir > 0 ? -w : WORLD_W + w,
                        y: lane.y,
                        w, h,
                        vx: dir * speed,
                        direction: dir,
                        hasHeadlight: type !== 'motorcycle' || Math.random() < 0.5
                    };
                    vehicle.engine = startVehicleEngine(vehicle);
                    vehicles[li] = vehicle;
                    spawnTimers[li] = 1200 + Math.random() * 1200; // 20–40s
                }
            } else {
                const v = vehicles[li];
                v.x += v.vx * dt;
                updateVehicleEngine(v.engine, v);
                if ((v.direction > 0 && v.x > WORLD_W + v.w + 10) || (v.direction < 0 && v.x < -v.w - 10)) {
                    stopVehicleEngine(v.engine);
                    vehicles[li] = null;
                }
            }
        }

        // ── Ajoneuvon törmäys (molemmat kaistat) ─────────
        if (!player.knockedDown) {
            const playerCY = player.y + player.h / 2;
            const gapCenter = (LANE_DEFS[0].y + LANE_DEFS[1].y) / 2;  // 334
            const inGap = Math.abs(playerCY - gapCenter) < 5;          // ±5px turvakaista

            // Kumman kaistan auton kanssa pelaaja on enemmän limittäin?
            const CAR_H = 30; // tyypillinen auton korkeus
            const pTop = player.y, pBot = player.y + player.h;
            const ov0 = Math.max(0, Math.min(pBot, LANE_DEFS[0].y + CAR_H) - Math.max(pTop, LANE_DEFS[0].y));
            const ov1 = Math.max(0, Math.min(pBot, LANE_DEFS[1].y + CAR_H) - Math.max(pTop, LANE_DEFS[1].y));

            for (let li = 0; li < LANE_DEFS.length; li++) {
                const v = vehicles[li];
                if (!v) continue;

                // Pelaaja teräsaidan juuressa → ei kumpikaan kaista osu
                if (player.y >= PLAYER_Y_MAX - 3) continue;

                // Pelaaja kaistojen välisessä raossa → ei osumaa
                if (inGap) continue;

                // Pelaaja on vain lähimmällä kaistalla – kauemman kaistan autot menevät ohi
                if (li === 0 && ov1 > ov0) continue;
                if (li === 1 && ov0 > ov1) continue;

                const vCollisionTop = v.y + v.h * 0.5;
                if (v.x < player.x + player.w && v.x + v.w > player.x &&
                    player.y + player.h > vCollisionTop && player.y < v.y + v.h) {
                    player.knockedDown = true;
                    player.knockdownTimer = 600;
                    player.kicking = false;
                    player.kickFrame = 0;
                    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#ffaa44', 15);
                    hamburgerCount--;
                    state.inventory.hamburgerCount = hamburgerCount;
                    GameState.save(state);
                    updateHUD();
                    if (hamburgerCount <= 0) { killPlayer(); }
                    break;
                }
            }
        }

        // ── Tähdenlento + satelliitti (vain yöllä) ────
        // Päivällä (dayT > 0) niitä ei enää spawnata; update() nollaa
        // kesken lennon olleet oliot päivän alkaessa.
        if (dayT <= 0) {
            if (!shootingStar || !shootingStar.active) {
                if (shootingStar) { shootingStar.timer -= dt; }
                if (!shootingStar || shootingStar.timer <= 0) {
                    const ang = -0.3 - Math.random() * 0.5;
                    const spd = 1.5 + Math.random() * 2.5;
                    shootingStar = {
                        x: -10 + Math.random() * WORLD_W * 0.4,
                        y: 15 + Math.random() * 100,
                        vx: Math.cos(ang) * spd,
                        vy: Math.sin(ang) * spd,
                        active: true, life: 120 + Math.random() * 180,
                        trail: [], timer: 600 + Math.random() * 2100
                    };
                }
            } else {
                shootingStar.x += shootingStar.vx * dt;
                shootingStar.y -= shootingStar.vy * dt;
                shootingStar.trail.push({x: shootingStar.x, y: shootingStar.y});
                if (shootingStar.trail.length > 18) shootingStar.trail.shift();
                shootingStar.life -= dt;
                if (shootingStar.life <= 0 || shootingStar.x > WORLD_W + 30 || shootingStar.y < -30 || shootingStar.y > GROUND_Y) {
                    shootingStar.active = false;
                }
            }

            if (!satellite || !satellite.active) {
                if (satellite) { satellite.timer -= dt; }
                if (!satellite || satellite.timer <= 0) {
                    const dir = Math.random() < 0.5 ? 1 : -1;
                    satellite = {
                        x: dir > 0 ? -10 : WORLD_W + 10,
                        y: 25 + Math.random() * 70,
                        vx: dir * (0.25 + Math.random() * 0.5),
                        active: true, blinkPhase: Math.random() * Math.PI * 2,
                        timer: 400 + Math.random() * 900
                    };
                }
            } else {
                satellite.x += satellite.vx * dt;
                satellite.blinkPhase += 0.08 * dt;
                if ((satellite.vx > 0 && satellite.x > WORLD_W + 15) || (satellite.vx < 0 && satellite.x < -15)) {
                    satellite.active = false;
                }
            }
        }
    }
/* ── Toimintopainikkeen käsittely ──────────────── */
    function handleAction() {
        const px = player.x + player.w / 2;
        const py = player.y + player.h / 2;

        // 0. HEDELMÄPELI (talo 7, buildings[6], x 560–610) – ei lamppua eikä avainta,
        //    mutta auki vain öisin (v4.34)
        const fruitDoor = doorCenter(buildings[6]);
        const fdx = px - fruitDoor.x, fdy = py - fruitDoor.y;
        if (Math.sqrt(fdx * fdx + fdy * fdy) < DOOR_RADIUS) {
            if (nightOnlyClosed()) { showNotification(CLOSED_SIGN); return; }
            enterGame('fruitgame/game_main.html');
            return;
        }

        // 0.5 JUKEBOX (talo 5, buildings[4], ovi x 410) – auki vain öisin (v4.34);
        //     yöllä ovi aukeaa vasta kun talon ikkunat palavat
        //     (1. painallus ovella = potku → valot syttyvät 20 s)
        const jkDoor = doorCenter(buildings[JUKEBOX_BLDG_IDX]);
        const jkLights = smallHouseLights[JUKEBOX_BLDG_IDX];
        const jkdx = px - jkDoor.x, jkdy = py - jkDoor.y;
        const jkInReach = Math.sqrt(jkdx * jkdx + jkdy * jkdy) < DOOR_RADIUS;
        if (jkInReach && nightOnlyClosed()) { showNotification(CLOSED_SIGN); return; }
        if (jkLights && jkLights.lit && jkInReach) {
            jukeboxRoom = true;
            jukeSel = 0;
            jukeHeldUp = false;
            jukeHeldDown = false;
            return;
        }

        // 1. OVET ENSIN – ei potkua, kävellään suoraan sisään
        for (let i = 0; i < lamps.length; i++) {
            const lamp = lamps[i];
            const dc = doorCenter(buildings[lamp.bldgIdx]);
            const dx = px - dc.x, dy = py - dc.y;
            if (Math.sqrt(dx*dx + dy*dy) < DOOR_RADIUS) {
                // BAR – aina auki (talo 8, lamp[4])
                if (i === 4) {
                    barRoom = true;
                    barBuyQty = 0;
                    barBuyHeldUp = false;
                    barBuyHeldDown = false;
                    return;
                }
                // Makuuhuone (talo 7): kun kaikki 3 avainta on koossa, ovi on
                // aina auki – lamppua ei tarvita ("3 avainta on lukko", v4.33).
                if (lamp.bldgIdx === SLEEP_BLDG_IDX && allKeysCollected()) {
                    sleepRoom = true;
                    sleepSel = 0;
                    sleepHeldUp = false;
                    sleepHeldDown = false;
                    sleepPhase = 0;
                    return;
                }
                if (lamp.lit) {
                    // Dig Däsh vaatii Dig Gamesta kerätyn avaimen
                    if (lamp.gameUrl && lamp.gameUrl.includes('digGame2') && !digKeyCollected) {
                        showNotification('🔑 Avain puuttuu! Saat avaimen kun läpäiset ensin pelin ensimmäisessä talossa!');
                        return;
                    }
                    // Blue Mäx vaatii Dig Däshistä kerätyn avaimen
                    if (lamp.gameUrl && lamp.gameUrl.includes('bm/') && !boulderKeyCollected) {
                        showNotification('🔑 Avain puuttuu tonttu! Hae se edellisestä talosta!');
                        return;
                    }
                    if (lamp.gameUrl) { enterGame(lamp.gameUrl); }
                    else if (lamp.bldgIdx === SLEEP_BLDG_IDX) {
                        // Talo 7 (makuuhuone): lukko = 3 avainta. Ilman avaimia
                        // ei sisään, vaikka lamppu palaisi (v4.33).
                        showNotification('🚧 Ei tänne pääse ilman avainta! Hanki kaikki kolme avainta.');
                    } else { showNotification('🚧 Ei tänne pääse ilman avainta! Hanki avaimet tai keksi jotain muuta.'); }
                } else {
                    showNotification('💡 Ovi on lukossa.\nSytytä lamppu ensin!');
                }
                return;
            }
        }
// Talon 0 ovi – potkimalla ikkunoihin syttyy valot (3-6 potkua)
        const dc0 = doorCenter(buildings[0]);
        const dx0 = px - dc0.x, dy0 = py - dc0.y;
        if (Math.sqrt(dx0*dx0 + dy0*dy0) < DOOR_RADIUS) {
            playKick();
            player.kicking = true;
            player.kickFrame = 0;
            hitPauseTimer = HIT_PAUSE;   // tuntuva osuma
            if (firstHouseWindowsLit && !flowerPot && !kickCoin && !avenger) { spawnKickDrop(buildings[0]); return; }
            if (firstHouseKickTarget === 0) {
                firstHouseKickTarget = 3 + Math.floor(Math.random() * 4); // 3-6
            }
            firstHouseKickCount++;
            if (firstHouseKickCount === 3) {
                showNotification('Varo! Kohta saattaa käydä heikosti. Kokeile seuraavaa ovea.');
            }
            firstHouseWindowTimer = 1200; // 20s
            if (firstHouseKickCount >= firstHouseKickTarget && !firstHouseWindowsLit) {
                firstHouseWindowsLit = true;
                spawnParticles(dc0.x, dc0.y, '#ffdd88', 10);
            }
            return;
        }
        for (let i = 0; i < buildings.length; i++) {
            if (lamps.some(l => l.bldgIdx === i)) continue;
            if (i === 0) continue;
            const dc = doorCenter(buildings[i]);
            const dx = px - dc.x, dy = py - dc.y;
            if (Math.sqrt(dx*dx + dy*dy) < DOOR_RADIUS) {
                playKick(); player.kicking = true; player.kickFrame = 0;
                hitPauseTimer = HIT_PAUSE;   // tuntuva osuma
                const sh = smallHouseLights[i];
                if (sh.lit && !flowerPot && !kickCoin && !avenger) { spawnKickDrop(buildings[i]); }
                else { sh.lit = true; sh.timer = 1200; spawnParticles(dc.x, dc.y, '#ffdd88', 6); }
                return;
            }
        }

        // 2. Ei oven lähellä → POTKU!
        playKick();
        player.kicking = true;
        player.kickFrame = 0;

        // Tarkista osuuko potku lamppuun
        for (let i = 0; i < lamps.length; i++) {
            const lamp = lamps[i];
            const dx = px - lamp.x, dy = py - (GROUND_Y + 15);
            if (Math.sqrt(dx*dx + dy*dy) < LAMP_RADIUS + 10) {
                // Jos lamppu on ylikuumentunut, älä tee mitään
                if (lamp.overheat) {
                    return;
                }
                // Toggle ON/OFF
                lamps[i].lit = !lamps[i].lit;
                state.litLamps[i] = lamps[i].lit;
                // Laske potkut
                lamps[i].kickCount = (lamps[i].kickCount || 0) + 1;
                hitPauseTimer = HIT_PAUSE;   // tuntuva osuma (myös ylikuumeneminen)

                // ── Salainen kolikkopalkkio (TESTITYÖKALU, v4.23) ──
                // Avain-cheatin jatko: vitoslamppu 20 potkua putkeen → +20 kolikkoa.
                // Hiljainen: ei popuppia, ei ääntä, ei hiukkasia → vain saldo kasvaa.
                if (i === COIN_CHEAT_LAMP) {
                    if (coinCheatCooldown > 0) {
                        coinCheatStreak = 0;             // cooldownin aikana ei kerrytetä
                    } else {
                        coinCheatStreak++;
                        coinCheatGapTimer = COIN_CHEAT_GAP;
                        if (coinCheatStreak >= COIN_CHEAT_KICKS) {
                            coinCheatStreak = 0;
                            coinCheatGapTimer = 0;
                            coinCheatCooldown = COIN_CHEAT_COOLDOWN;
                            coinCount += COIN_CHEAT_REWARD;
                            state.inventory.coin = true;
                            state.inventory.coinCount = coinCount;
                            GameState.save(state);
                            updateHUD();
                        }
                    }
                } else {
                    coinCheatStreak = 0;                 // välissä toinen lamppu → putki katki
                }

                if (lamps[i].kickCount >= 5) {
// Salainen lamppu: 5 potkua → avaa kaikki ovet (vain viimeinen lamppu)
                    if (i === 4) {
                        for (let j = 0; j < lamps.length; j++) {
                            lamps[j].lit = true;
                            state.litLamps[j] = true;
                        }
                        digKeyCollected = true;
                        state.digKeyCollected = true;
                        boulderKeyCollected = true;
                        state.boulderKeyCollected = true;
                        bmKeyCollected = true;
                        state.bmKeyCollected = true;
                        lamps[i].kickCount = 0;
                        GameState.save(state);
                    } else {
                    // 5 potkua putkeen → ylikuumenee 20 sekunniksi
                    lamps[i].lit = false;
                    lamps[i].overheat = true;
                    lamps[i].overheatTimer = 1200; // 20s @ ~60fps
                    state.litLamps[i] = false;
                    GameState.save(state);
                    spawnParticles(lamp.x, GROUND_Y + 19 - LAMP_POST_H, '#ff4400', 20);
                    }
                    return;
                }

                GameState.save(state);
                if (lamps[i].lit) {
                    spawnParticles(lamp.x, GROUND_Y + 19 - LAMP_POST_H, '#ffff88', 8);
                } else {
                    // Lamppu sammui – ei tekstiä, näkyy visuaalisesti
                }
                return;
            }
        }
    }

    /* Lähettää kadun kolikkosaldon hedelmäpeliin (postMessage) */
    function sendFruitBalance() {
        const overlay = document.getElementById('game-iframe-overlay');
        const iframe = overlay ? overlay.querySelector('iframe') : null;
        if (iframe && iframe.contentWindow) {
            try { iframe.contentWindow.postMessage({ type: 'fruitSync', coins: coinCount }, '*'); } catch (e) {}
        }
    }

    function enterGame(url) {
        // Tallenna pelaajan sijainti ennen peliin menoa
        savedPlayerX = player.x;
        savedPlayerY = player.y;
        GameState.save(state);
        // Tyhjennä näppäintila, ettei jää jumiin
        clearKeys();
        const overlay = document.getElementById('game-iframe-overlay');
        const iframe = overlay.querySelector('iframe');
        // Näytä overlay ENSIN, sitten vasta lataa iframe
        // (estää 0×0 canvas -bugin pelien käynnistyessä)
        overlay.classList.add('active');
        iframeOpen = true;   // päivän liuku odottaa, että pelaaja palaa kadulle
        // StreetAudio.stop(); – musiikki jatkaa soimista pelien aikana (sykli hoitaa tauot)
        iframe.onload = () => {
            try { iframe.contentWindow.focus(); } catch(e) {}
            // Hedelmäpeli: lähetä kadun kolikkosaldo peliin
            if (url && url.indexOf('fruitgame') !== -1) sendFruitBalance();
        };
        iframe.src = url;
        window._streetReturn = (e) => {
            if (e.data === 'RETURN_TO_STREET') closeGame();
            if (e.data === 'KEY_COLLECTED') {
                digKeyCollected = true;
                state.digKeyCollected = true;
                GameState.save(state);
            }
            if (e.data === 'BM_KEY_COLLECTED') {
                bmKeyCollected = true;
                state.bmKeyCollected = true;
                GameState.save(state);
            }
            if (e.data === 'BOULDER_KEY_COLLECTED') {
                boulderKeyCollected = true;
                state.boulderKeyCollected = true;
                GameState.save(state);
            }
            if (e.data === 'COIN_COLLECTED') {
                coinCount++;
                state.inventory.coinCount = coinCount;
                GameState.save(state);
                updateHUD();
            }
            // Hedelmäpeli: panos (−1 kolikko / pyöräytys)
            if (e.data && e.data.type === 'fruitBet') {
                coinCount = Math.max(0, coinCount - 1);
                state.inventory.coinCount = coinCount;
                GameState.save(state);
                updateHUD();
                sendFruitBalance();
            }
            // Hedelmäpeli: voitot (+n kolikkoa)
            if (e.data && e.data.type === 'fruitWin' && typeof e.data.coins === 'number') {
                coinCount += Math.max(0, Math.floor(e.data.coins));
                state.inventory.coinCount = coinCount;
                GameState.save(state);
                updateHUD();
                sendFruitBalance();
            }
        };
        window.addEventListener('message', window._streetReturn);
    }

    function closeGame() {
        const overlay = document.getElementById('game-iframe-overlay');
        const iframe = overlay.querySelector('iframe');

        // Vapauta iframen fokus ENNEN piilotusta
        try { iframe.contentWindow && iframe.contentWindow.blur(); } catch(e) {}
        iframe.blur();

        overlay.classList.remove('active');
        iframe.src = '';
        iframeOpen = false;   // takaisin kadulla → päivän liuku jatkuu

        if (window._streetReturn) {
            window.removeEventListener('message', window._streetReturn);
            window._streetReturn = null;
        }

        // Tyhjää näppäintila ja palauta fokus pääsivulle
        clearKeys();
        window.focus();
        try { canvas.focus(); } catch(e) {}
        // Varmistus: fokusoi canvas uudelleen pienen viiveen jälkeen
        setTimeout(() => {
            try { canvas.focus(); } catch(e) {}
        }, 50);
        StreetAudio.start(); // herätä AudioContext jos suspendattu
        state = GameState.load();
        for (let i = 0; i < lamps.length; i++) {
            lamps[i].lit = state.litLamps[i];
            lamps[i].kickCount = 0;
            lamps[i].overheat = false;
            lamps[i].overheatTimer = 0;
        }
        // Salainen kolikkopalkkio: ei siirry elämältä/istunnolta toiselle
        coinCheatStreak = 0;
        coinCheatGapTimer = 0;
        coinCheatCooldown = 0;
        coin.collected = state.inventory.coin;
        coinCount = state.inventory.coinCount || 0;
        coinRespawnTimer = coin.collected ? 1 : 0;
        coin.despawnTimer = coin.collected ? 0 : 600;
        hamburgerCount = state.inventory.hamburgerCount || 5;
        hamburgerTimer = 2400;
        if (coin.collected) { coin.x = -100; coin.y = -100; }
        else { coin.x = randomCoinX(); coin.y = randomCoinY(); }
        digKeyCollected = state.digKeyCollected || false;
        boulderKeyCollected = state.boulderKeyCollected || false;
        bmKeyCollected = state.bmKeyCollected || false;
        sleepRoom = false;
        sleepSel = 0;
        sleepHeldUp = false;
        sleepHeldDown = false;
        sleepPhase = 0;
        isDay = (state.isDay === true);   // tallennettu päivä/yö pysyy
        barRoom = false;
        jukeboxRoom = false;
        jukeSel = 0;
        jukeHeldUp = false;
        jukeHeldDown = false;
        player.x = savedPlayerX; player.y = savedPlayerY;
        player.vx = 0; player.vy = 0;
        updateHUD();
    }

    /** Tyhjentää kaikki näppäintilat ja action-flagit */
    function clearKeys() {
        for (const k in keys) delete keys[k];
        actionPressed = false;
        actionJustPressed = false;
    }

    // durationMs: lukuaika näytöllä. Oletus 2500 ms (kaikki muut popupit),
    // vain aloitusohje käyttää pidempää aikaa (showSpawnHint).
    function showNotification(text, durationMs = 2500) {
        const el = document.getElementById('notification');
        // Peruuta edellinen aikakatkaisu jos uusi teksti tulee
        if (el._timeout) clearTimeout(el._timeout);
        if (el._fadeTimeout) clearTimeout(el._fadeTimeout);
        // Näytä teksti heti
        el.textContent = text;
        el.style.opacity = '1';
        el.style.transition = 'none';
        el.style.animation = 'popIn 0.3s ease-out';
        // Lukuaika (oletus 2.5s), sitten fadeout 0.5s
        el._timeout = setTimeout(() => {
            el.style.transition = 'opacity 0.5s';
            el.style.opacity = '0';
            el._fadeTimeout = setTimeout(() => {
                el.textContent = '';
                el.style.animation = 'none';
            }, 500);
        }, durationMs);
    }

    function showSpawnHint() {
        // Aloitusohje: pitempi lukuaika (+2s) kuin muilla popupeilla
        showNotification('Liiku kadulla, potki kaikkea, mutta omalla vastuulla. Saattaa asukkaat hermostua! Ja muista Syödä!', 4500);
    }

    function spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4 - 2,
                color, life: 20 + Math.random() * 20, maxLife: 40
            });
        }
    }

    function updateHUD() {
        const coinEl = document.querySelector('#hud-inventory .inv-coin');
        if (coinEl) coinEl.classList.toggle('has', state.inventory.coin);
        // Inventaario HUD-palkkiin (ei muuta alkuperäistä tekstiä, lisää vain statuksen)
        const hudBar = document.getElementById('hud-bar');
        const allKeys = allKeysCollected();
        let status = '';
        if (allKeys) status = ' 🗝️ Kaikki avaimet!';
        else {
            const keys = (digKeyCollected?1:0) + (boulderKeyCollected?1:0) + (bmKeyCollected?1:0);
            status = ' 🔑 Avaimia: ' + keys + '/3';
        }
        status += ' | 💰 Kolikoita: ' + coinCount;
        // Hampurilaiset (lives)
        var burgerStr = '';
        if (hamburgerCount <= 2) {
            for (var bi = 0; bi < hamburgerCount; bi++) burgerStr += '🍔';
            burgerStr = '<span class="burger-warning">' + burgerStr + '</span>';
        } else {
            for (var bi = 0; bi < hamburgerCount; bi++) burgerStr += '🍔';
        }
        status += ' | ' + burgerStr;
        if (hudBar) hudBar.innerHTML = '<span style="display:block;text-align:center;margin-top:2px">' + status + '</span>';
    }

    /* ── Pilvijärjestelmä (cirrus + hazy, kapea kaistale) ── */
    function initClouds() {
        clouds = [];
        windDir = Math.random() < 0.5 ? 1 : -1;
        windSpeed = 2 + Math.random() * 3; // px/s (2–5)

        // Pilvikaistale: y=40..80, noin 40px korkea
        const bandTop = 40, bandH = 40;
        for (let i = 0; i < 18; i++) {
            const typeRoll = Math.random();
            let w, opacity, type;
            if (typeRoll < 0.35) {
                type = 'cirrus';
                w = 60 + Math.random() * 180;
                opacity = 0.005 + Math.random() * 0.015;
            } else {
                type = 'hazy';
                w = 80 + Math.random() * 220;
                opacity = 0.015 + Math.random() * 0.035;
            }
            clouds.push({
                x: Math.random() * WORLD_W,
                y: bandTop + Math.random() * bandH,
                w: w, opacity: opacity, type: type,
            });
        }
    }

    function updateClouds(dt) {
        if (!lastCloudTime) { lastCloudTime = performance.now(); return; }
        // dt tulee jo parametrina, käytä suoraan
        for (const c of clouds) {
            c.x += windDir * windSpeed * dt / 16.667; // normalisoi ~60fps frameen
            // Wrap-around
            if (c.x > WORLD_W + c.w) c.x = -c.w;
            else if (c.x < -c.w) c.x = WORLD_W + c.w;
        }
    }

    function drawClouds() {
        for (const c of clouds) {
            const x = c.x, y = c.y;
            if (x < -c.w || x > WORLD_W + c.w) continue;

            const a = c.opacity;
            ctx.save();

            if (c.type === 'cirrus') {
                // Ohuet haituvaiset cirrus-juovat (korkeus ~1-2px)
                const streaks = 3 + Math.floor(c.w * 0.015);
                for (let i = 0; i < streaks; i++) {
                    const ox = (i - (streaks - 1) / 2) * (c.w * 0.11);
                    const oy = (i % 3 - 1) * 1.0;
                    const sw = c.w * 0.5 * (0.6 + 0.4 * (1 - Math.abs(i - (streaks - 1) / 2) / (streaks / 2)));
                    const fa = a * (0.35 + 0.65 * (1 - Math.abs(i - (streaks - 1) / 2) / (streaks / 2)));
                    ctx.fillStyle = 'rgba(190,200,225,' + fa + ')';
                    ctx.beginPath();
                    ctx.ellipse(x + ox, y + oy, sw, 1.0, 0.015 * (i - 1), 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                // Hazy: vaakasuoria päällekkäisiä hattaraellipsejä
                const baseClr = '180,195,215';
                const parts = 4 + Math.floor(c.w * 0.012);
                for (let i = 0; i < parts; i++) {
                    const ox = (i - (parts - 1) / 2) * (c.w * 0.14);
                    const oy = Math.sin(i * 2.3) * 2.5;
                    const dist = Math.abs(i - (parts - 1) / 2) / ((parts - 1) / 2);
                    const lw = c.w * (0.15 + 0.10 * (1 - dist));
                    const la = a * (0.5 + 0.5 * (1 - dist));
                    ctx.fillStyle = 'rgba(' + baseClr + ',' + la + ')';
                    ctx.beginPath();
                    ctx.ellipse(x + ox, y + oy, lw, 3 + dist * 2, 0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.restore();
        }
    }

    /* ── Kaukaisen kaupungin siluetti – kertagenerointi (ei randomia per frame) ── */
    function initBackdrop() {
        backdrop = { blocks: [] };
        let x = 0;
        let blockIdx = 0;
        while (x < WORLD_W) {
            const w = Math.round((28 + Math.floor(Math.random() * 43)) * BACKDROP_SCALE);   // 14–35
            const h = Math.round((100 + Math.floor(Math.random() * 131)) * BACKDROP_SCALE); // 50–115
            const b = {
                x, w, h,
                color: BACKDROP_PALETTE[Math.floor(Math.random() * BACKDROP_PALETTE.length)],
                roof: Math.floor(Math.random() * 4),                  // 0 tasakatto, 1 porrastus, 2 harja, 3 laite
                band: Math.random() < 0.5,
                winCols: Math.max(1, Math.floor((w - BACKDROP_WIN_OX * 2) / BACKDROP_WIN_DX)),
                winRows: Math.max(1, Math.floor((h - BACKDROP_WIN_OY * 2) / BACKDROP_WIN_DY)),
                device: Math.floor(Math.random() * 3),                // kattolaite (roof === 3)
                deviceX: 0.2 + Math.random() * 0.6,                   // kattolaitteen paikka (osuus leveydestä)
                lit: null
            };
            // Joka 3. talo saa yhden himmeän lämpimän ikkunan (eloa, ei sekoitu pelattaviin)
            if (blockIdx % 3 === 0) {
                b.lit = {
                    c: Math.floor(Math.random() * b.winCols),
                    r: Math.floor(Math.random() * b.winRows)
                };
            }
            blockIdx++;
            backdrop.blocks.push(b);
            x += w;   // talot kiinni toisissaan → yhtenäinen skyline
        }
    }

    /* ── Etualan elementit (kiveys, ruohot, viemärit, kuoriainen) ── */
    function initForeground() {
        foreground = {
            copingStones: [],     // Reunakivet
            pavingStones: [],     // Kiveysrivit
            grassTufts: [],
            treeGrassTufts: [],  // Pienet ruohotupsut puiden juurella (1/4 koko)
            manholes: [],
            beetle: null,
            newspaper: null,
            ironFence: null,     // Rauta-aita alalaidassa
            thresholds: [],      // Ovien kynnysviuhkat (esilaskettu geometria)
            kerbGaps: []         // Oviaukkojen kohdat (laskettu reunakivi)
        };

        // Reunakivet (yläreuna)
        let sx = 0;
        while (sx < WORLD_W) {
            const gap = 22 + Math.floor(Math.random() * 10);
            foreground.copingStones.push({ x: sx, w: gap - 2, shade: 1 + Math.floor(Math.random() * 3) });
            sx += gap;
        }

        // Kiveyspinta (4 riviä) – saumavaihe ja sävy vaihtelevat taloittain,
        // jotta sama kiveysruudukko ei jatku yhtenä "barina" laidasta laitaan.
        const houseAt = (x) => {
            for (let i = 0; i < buildings.length; i++) {
                const b = buildings[i];
                if (x >= b.x && x < b.x + b.w) return i;
            }
            return -1;   // talojen väli (rako)
        };
        const housePhase = [], houseDrift = [];
        for (let i = 0; i < buildings.length; i++) {
            let hs = i * 2089 + 7;
            const hrnd = () => { hs = (hs * 9301 + 49297) % 233280; return hs / 233280; };
            housePhase.push(Math.round(hrnd() * 6));       // 0–6 px saumavaihe per talo
            houseDrift.push(Math.round(hrnd() * 2 - 1));   // −1 / 0 / +1 sävy per talo
        }
        for (let row = 0; row < 4; row++) {
            const ry = GROUND_Y + 5 + row * 20;
            const colOff = row % 2 === 0 ? 0 : 11;
            let sx = colOff;
            while (sx < WORLD_W) {
                const sw = 16 + Math.floor(Math.random() * 12);
                const sh = 16 + Math.floor(Math.random() * 5);
                const hi = houseAt(sx);
                const phase = hi >= 0 ? housePhase[hi] : 0;
                const drift = hi >= 0 ? houseDrift[hi] : 0;
                const shade = Math.max(10, Math.min(17, 10 + Math.floor(Math.random() * 8) + drift));
                foreground.pavingStones.push({ x: sx + phase, y: ry, w: sw, h: sh, shade: shade });
                sx += sw + Math.floor(Math.random() * 4);
            }
        }

        // Ruohotupsut (4 kpl, heti aidan edessä)
        for (let i = 0; i < 4; i++) {
            foreground.grassTufts.push({
                x: 60 + Math.random() * 680,
                y: WORLD_H - 10 + Math.random() * 5,   // aidan juuressa, alareunan tuntumassa
                blades: 3 + Math.floor(Math.random() * 3),  // 3-5 kortta
                phase: Math.random() * Math.PI * 2
            });
        }
        // Lajittele vasemmalta oikealle
        foreground.grassTufts.sort((a, b) => a.x - b.x);

        // Pienet ruohotupsut (1/4 koko) puiden juurella – random paikka raossa
        // Puut: talot 1–2 (x 150–200) ja talot 3–4 (x 330–380), raon leveys ~50px
        for (const tr of trees) {
            for (let i = 0; i < 3; i++) {
                foreground.treeGrassTufts.push({
                    x: tr.x - 25 + Math.random() * 50,
                    y: GROUND_Y - 5 + Math.random() * 5,   // puun juurella
                    blades: 3 + Math.floor(Math.random() * 3),  // 3-5 kortta
                    phase: Math.random() * Math.PI * 2
                });
            }
        }
        foreground.treeGrassTufts.sort((a, b) => a.x - b.x);

        // Viemärinkannet (2 kpl)
        foreground.manholes.push({
            x: 200 + Math.random() * 30,
            y: GROUND_Y + 24 + Math.random() * 6,
            steamTimer: 180 + Math.random() * 300,
            steamParticles: []
        });
        foreground.manholes.push({
            x: 570 + Math.random() * 30,
            y: GROUND_Y + 22 + Math.random() * 8,
            steamTimer: 180 + Math.random() * 300,
            steamParticles: []
        });

        // Kuoriainen
        foreground.beetle = {
            x: 100 + Math.random() * 600,
            y: GROUND_Y + 62 + Math.random() * 20,
            dir: Math.random() < 0.5 ? 1 : -1,
            animTimer: Math.random() * Math.PI * 2,
            speed: 0.3 + Math.random() * 0.3
        };

        // Sanomalehti
        foreground.newspaper = {
            x: 460 + Math.random() * 60,
            y: GROUND_Y + 40 + Math.random() * 10,
            angle: -0.05 + Math.random() * 0.1
        };

        // Ovien kynnysviuhkat – tarvitsee viemärien paikat (detaljien väistö)
        buildThresholds();

        // Rauta-aita – musta takorauta-aita kadun alalaitaan, keskellä aukko
        const FENCE_TOP = WORLD_H - 50;        // aidan yläreuna
        const FENCE_BOTTOM = WORLD_H;           // aidan alareuna (canvasin pohja)
        const FENCE_BAR_SPACING = 12;           // pystypiikkien väli
        const GAP_START = 335;                  // keskiaukon alku
        const GAP_END = 465;                    // keskiaukon loppu (130px aukko)
        const segments = [];
        // Vasen segmentti
        const segs = [{ start: 0, end: GAP_START }, { start: GAP_END, end: WORLD_W }];
        for (const seg of segs) {
            const bars = [];
            let bx = seg.start + 6; // pieni marginaali reunasta
            while (bx < seg.end - 2) {
                bars.push(bx);
                bx += FENCE_BAR_SPACING;
            }
            segments.push({ startX: seg.start, endX: seg.end, barX: bars });
        }
        foreground.ironFence = {
            topY: FENCE_TOP,
            bottomRailY: WORLD_H - 6,
            barSpacing: FENCE_BAR_SPACING,
            gapStart: GAP_START,
            gapEnd: GAP_END,
            segments: segments
        };
    }

    /* ── Ovien kynnysviuhka: esilaskettu geometria (kerran initissä) ──
       Kiveys "kaatuu" kohti ovea: saumat osoittavat kynnykseen, renkaat
       syvenevät ovesta poispäin ja keskusta painuu hieman (V-painuma).
       Kiilat ryhmitellään sävyittäin → muutama fill per ovi per frame. */
    function buildThresholds() {
        if (!foreground) return;
        foreground.thresholds = [];
        foreground.kerbGaps = [];

        const SAMPLE_U = [-1, -0.5, 0, 0.5, 1];   // jaetut rajapistenäytteet → ei rakoja renkaiden väliin
        const nearManhole = (x, y, r) => {
            for (const mh of foreground.manholes) {
                const dx = mh.x - x, dy = mh.y - y;
                if (dx * dx + dy * dy < r * r) return true;
            }
            return false;
        };

        for (let bi = 0; bi < buildings.length; bi++) {
            const b = buildings[bi];
            const cx = b.x + b.w / 2;                 // sama piste kuin oven keskipiste
            const s = buildingScale(b);               // syvyys/leveys skaalautuvat kuten ovi
            // Deterministinen random per talo (sama tekniikka kuin lampun jalustassa)
            let seed = bi * 7919 + 13;
            const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

            const gapHalf = (DOOR_W * s) / 2 + KERB_GAP_EXTRA;
            const yTop = GROUND_Y + THRESH_TOP_Y;
            const dipAt = (u) => THRESH_DIP * (1 - Math.abs(u)) * s;
            const edgeX = (u, w) => cx + u * w * s;         // w = skaalaamaton puolileveys
            const edgeY = (u, baseY) => baseY + dipAt(u);
            const usWith = (uA, uB) => {                    // u-arvot välillä [uA,uB] (rajapistenäytteet mukaan)
                const out = [uA];
                for (const su of SAMPLE_U) if (su > uA + 1e-9 && su < uB - 1e-9) out.push(su);
                out.push(uB);
                return out;
            };

            const groups = new Map(), wear = new Map();
            const add = (map, shade, poly) => {
                const key = Math.max(0, Math.min(255, Math.round(shade)));
                if (!map.has(key)) map.set(key, []);
                map.get(key).push(poly);
            };
            const seams = [], hseams = [], ringYs = [];
            const leftEdge = [edgeX(-1, DOOR_W / 2), yTop];
            const rightEdge = [edgeX(1, DOOR_W / 2), yTop];
            let wIn = DOOR_W / 2, y0 = yTop;
            for (let r = 0; r < THRESH_RINGS.length; r++) {
                const cfg = THRESH_RINGS[r];
                const n = cfg.n, y1 = y0 + cfg.d * s;
                ringYs.push([y0, y1]);
                // Renkaan yläraja – sama pistejono kuin edellisen renkaan alaraja
                const topHs = [];
                for (const u of SAMPLE_U) topHs.push(edgeX(u, wIn), edgeY(u, y0));
                hseams.push(topHs);
                // Kiilakivet: saumat osoittavat kynnykseen
                for (let i = 0; i < n; i++) {
                    const uA = (i / n) * 2 - 1, uB = ((i + 1) / n) * 2 - 1;
                    const poly = [];
                    for (const u of usWith(uA, uB)) poly.push(edgeX(u, wIn), edgeY(u, y0));
                    const botUs = usWith(uA, uB);
                    for (let k = botUs.length - 1; k >= 0; k--) poly.push(edgeX(botUs[k], cfg.w), edgeY(botUs[k], y1));
                    // Lähempänä ovea hieman vaaleampi (kuivempi sisäänkäynti)
                    const shade = 12.5 + (THRESH_RINGS.length - r) * 0.6 + (rnd() * 3 - 1.5);
                    add(groups, shade, poly);
                    // Tallattu keskilinja (kuluminen) – piirretään peruskiilojen päälle
                    if (i === Math.floor(n / 2) && rnd() < 0.8) add(wear, shade - 2.5, poly);
                    if (i > 0) seams.push([edgeX(uA, wIn), edgeY(uA, y0), edgeX(uA, cfg.w), edgeY(uA, y1)]);
                }
                leftEdge.push(edgeX(-1, cfg.w), y1);
                rightEdge.push(edgeX(1, cfg.w), y1);
                wIn = cfg.w; y0 = y1;
            }
            // Viuhkan alaraja
            const botHs = [];
            for (const u of SAMPLE_U) botHs.push(edgeX(u, wIn), edgeY(u, y0));
            hseams.push(botHs);

            // Ulkoreuna: yläraja (V-painuma) → oikea vino sivu → alaraja → vasen vino sivu
            const border = [];
            for (const u of SAMPLE_U) border.push(edgeX(u, DOOR_W / 2), edgeY(u, yTop));
            for (let k = 2; k < rightEdge.length; k += 2) border.push(rightEdge[k], rightEdge[k + 1]);
            for (let k = botHs.length - 2; k >= 2; k -= 2) border.push(botHs[k], botHs[k + 1]);
            for (let k = leftEdge.length - 2; k >= 2; k -= 2) border.push(leftEdge[k], leftEdge[k + 1]);
            // Detaljit: halkeamat (saumaa pitkin) + pikkukivet
            const cracks = [], pebbles = [];
            if (THRESH_DETAILS) {
                for (let c = 0; c < 2 && seams.length >= 2; c++) {
                    const ln = seams[Math.floor(rnd() * seams.length)];
                    const t0 = 0.3 + rnd() * 0.15, t1 = Math.min(1, t0 + 0.45 + rnd() * 0.2);
                    cracks.push([ln[0] + (ln[2] - ln[0]) * t0, ln[1] + (ln[3] - ln[1]) * t0,
                                 ln[0] + (ln[2] - ln[0]) * t1, ln[1] + (ln[3] - ln[1]) * t1]);
                }
                for (let p = 0; p < 2; p++) {
                    const u = rnd() * 2 - 1;
                    const rr = Math.floor(rnd() * THRESH_RINGS.length);
                    const wA = rr === 0 ? DOOR_W / 2 : THRESH_RINGS[rr - 1].w;
                    const wB = THRESH_RINGS[rr].w;
                    const t = 0.15 + rnd() * 0.8;
                    const px = edgeX(u, wA + (wB - wA) * t);
                    const py = ringYs[rr][0] + (ringYs[rr][1] - ringYs[rr][0]) * t;
                    if (nearManhole(px, py, 15)) continue;   // ei detaljeja viemärinkannen päälle
                    pebbles.push([Math.round(px), Math.round(py), rnd() < 0.5 ? 1 : 2, 1,
                                  rnd() < 0.5 ? '#3a3a3a' : '#2c2c2c']);
                }
            }

            const toBuckets = (map) => {
                const arr = [];
                for (const [shade, polys] of map) {
                    const hex = shade.toString(16).padStart(2, '0');
                    arr.push({ fill: '#' + hex + hex + hex, polys: polys });
                }
                arr.sort((a, b) => a.fill < b.fill ? -1 : 1);
                return arr;
            };

            const slabW = Math.round((DOOR_W + 2) * s);
            const gapL = Math.round(cx - gapHalf), gapR = Math.round(cx + gapHalf);
            foreground.thresholds.push({
                bldgIdx: bi,
                cx: cx,
                gapL: gapL,
                gapR: gapR,
                groups: toBuckets(groups),
                wear: toBuckets(wear),
                seams: seams,
                hseams: hseams,
                border: border,
                cracks: cracks,
                pebbles: pebbles,
                slab: { x: Math.round(cx - slabW / 2), y: GROUND_Y + 2, w: slabW, h: Math.max(4, Math.round(5 * s)) },
                lightRGB: bi === 8 ? THRESH_LIGHT_BAR
                        : bi === JUKEBOX_BLDG_IDX ? THRESH_LIGHT_JUKEBOX
                        : THRESH_LIGHT_HOUSE,
                depth: y0 - yTop
            });
            foreground.kerbGaps.push({ l: gapL, r: gapR });
        }
        foreground.kerbGaps.sort((a, b) => a.l - b.l);
    }

    function updateForeground(dt) {
        if (!foreground) return;
        const fg = foreground;

        // Viemärien höyry
        for (const mh of fg.manholes) {
            mh.steamTimer -= dt;
            if (mh.steamTimer <= 0) {
                // Tuota uusi höyrypartikkeli
                const count = 1 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count; i++) {
                    mh.steamParticles.push({
                        x: mh.x + (Math.random() - 0.5) * 14,
                        y: mh.y - 2,
                        vy: -0.15 - Math.random() * 0.25,
                        vx: (Math.random() - 0.5) * 0.15,
                        alpha: 0.15 + Math.random() * 0.1,
                        life: 60 + Math.random() * 90,
                        r: 2 + Math.random() * 4
                    });
                }
                mh.steamTimer = 180 + Math.random() * 420;
            }
            // Päivitä olemassaolevat höyryt
            for (let i = mh.steamParticles.length - 1; i >= 0; i--) {
                const p = mh.steamParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.r += 0.012 * dt;
                p.life -= dt;
                p.alpha *= 0.997;
                if (p.life <= 0 || p.alpha < 0.005) mh.steamParticles.splice(i, 1);
            }
        }

        // Kuoriainen
        if (fg.beetle) {
            const b = fg.beetle;
            b.x += b.dir * b.speed * dt;
            b.animTimer += 0.08 * dt;
            // Käännös reunoilla
            if (b.x < 20 && b.dir < 0) b.dir = 1;
            if (b.x > WORLD_W - 20 && b.dir > 0) b.dir = -1;
        }
    }

/* ═══════════════════════════════════════════════════
       PIIRTO – tausta, talot, maa
       ═══════════════════════════════════════════════════ */
    function render() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, viewW, WORLD_H);

        if (sleepRoom) { camX = (WORLD_W - viewW) / 2; ctx.save(); ctx.translate(-Math.round(camX), 0); drawSleepRoom(); ctx.restore(); return; }

        if (barRoom) { camX = (WORLD_W - viewW) / 2; ctx.save(); ctx.translate(-Math.round(camX), 0); drawBarRoom(); ctx.restore(); return; }

        if (jukeboxRoom) { camX = (WORLD_W - viewW) / 2; ctx.save(); ctx.translate(-Math.round(camX), 0); drawJukeboxRoom(); ctx.restore(); return; }

        ctx.save();
        ctx.translate(-Math.round(camX), 0);
        // Oviukon isku: 1–2 px tärinä jäädytyksen aikana (hitPauseTimer toimii kellona)
        if (avenger && avenger.phase === 'hold' && hitPauseTimer > 0) {
            ctx.translate(Math.round(Math.sin(hitPauseTimer * 0.9) * 1.6), 0);
        }

        // Taivas
        const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        skyGrad.addColorStop(0, '#0a0a1e');
        skyGrad.addColorStop(0.6, '#111133');
        skyGrad.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, WORLD_W, GROUND_Y);

        // Päivätaivas (lopputila) – liukuu yötaivaan päälle dayT:n mukaan
        if (dayT > 0) {
            const dayGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
            dayGrad.addColorStop(0, DAY_SKY_TOP);
            dayGrad.addColorStop(0.55, DAY_SKY_MID);
            dayGrad.addColorStop(1, DAY_SKY_HORIZON);
            ctx.save();
            ctx.globalAlpha = dayT;
            ctx.fillStyle = dayGrad;
            ctx.fillRect(0, 0, WORLD_W, GROUND_Y);
            ctx.restore();
        }

        // Sirppikuu (häipyy päivän tullessa)
        if (dayT < 1) {
            ctx.save();
            ctx.globalAlpha = 1 - dayT;
            const moonX = 680, moonY = 60, moonR = 28;
            const moonGlow = ctx.createRadialGradient(moonX, moonY, moonR * 0.4, moonX, moonY, moonR * 2.8);
            moonGlow.addColorStop(0, 'rgba(255,250,210,0.18)');
            moonGlow.addColorStop(0.4, 'rgba(255,250,210,0.06)');
            moonGlow.addColorStop(1, 'rgba(255,250,210,0)');
            ctx.fillStyle = moonGlow;
            ctx.beginPath(); ctx.arc(moonX, moonY, moonR * 2.8, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff8cc';   // keltaisempi kuu
            ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI*2); ctx.fill();
            const crescentRight = true;  // sirppi aukeaa oikealle
            const shadowOff = crescentRight ? moonR * 0.4 : -moonR * 0.4;
            ctx.fillStyle = '#0a0a1e';
            ctx.beginPath(); ctx.arc(moonX + shadowOff, moonY - moonR * 0.08, moonR * 0.78, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }

        // Aurinko (päivä) – kuun tilalla samassa kohdassa, ristihäivytys
        if (dayT > 0) {
            ctx.save();
            ctx.globalAlpha = dayT;
            // Hehku
            const sunGlow = ctx.createRadialGradient(SUN_X, SUN_Y, SUN_R * 0.4, SUN_X, SUN_Y, SUN_R * 3.4);
            sunGlow.addColorStop(0, 'rgba(255,224,120,0.55)');
            sunGlow.addColorStop(0.4, 'rgba(255,210,100,0.20)');
            sunGlow.addColorStop(1, 'rgba(255,200,80,0)');
            ctx.fillStyle = sunGlow;
            ctx.beginPath(); ctx.arc(SUN_X, SUN_Y, SUN_R * 3.4, 0, Math.PI*2); ctx.fill();
            // Hitaasti pyörivä sädekehä
            const spin = Date.now() * 0.00012;
            ctx.strokeStyle = 'rgba(255,238,160,0.35)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 8; i++) {
                const ang = spin + i * Math.PI / 4;
                const r0 = SUN_R + 5;
                const r1 = r0 + (i % 2 === 0 ? 9 : 5);
                ctx.beginPath();
                ctx.moveTo(SUN_X + Math.cos(ang) * r0, SUN_Y + Math.sin(ang) * r0);
                ctx.lineTo(SUN_X + Math.cos(ang) * r1, SUN_Y + Math.sin(ang) * r1);
                ctx.stroke();
            }
            // Kiekko: tasainen lämmin keltainen (ei valkoista palloa keskellä)
            ctx.fillStyle = '#ffe066';
            ctx.beginPath(); ctx.arc(SUN_X, SUN_Y, SUN_R, 0, Math.PI*2); ctx.fill();
            ctx.restore();
        }

        // Pilvet (kapea cirrus/hazy-kaistale)
        drawClouds();

        // Tähdet (jokaisella oma random twinkle) – himmenevät päivän tullessa
        if (dayT < 1) {
            const starFade = 1 - dayT;
            for (const s of stars) {
                const freq = 800 + s.blink * 3000;
                const twinkle = Math.sin(Date.now() / freq + s.blink) * 0.5 + 0.5;
                const a = (0.15 + twinkle * 0.7) * starFade;
                ctx.fillStyle = 'rgba(255,255,' + Math.floor(200 + twinkle * 55) + ',' + a + ')';
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
                // Kirkas pilkahdus
                if (twinkle > 0.92) {
                    ctx.fillStyle = 'rgba(255,255,255,' + (a * 1.5) + ')';
                    ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 0.5, 0, Math.PI*2); ctx.fill();
                }
            }
        }

        // Tähdenlento (vain yöllä)
        if (dayT <= 0 && shootingStar && shootingStar.active) {
            for (let t = 0; t < shootingStar.trail.length; t++) {
                const tr = shootingStar.trail[t];
                const alpha = (t / shootingStar.trail.length) * 0.5;
                ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
                ctx.beginPath(); ctx.arc(tr.x, tr.y, 0.5, 0, Math.PI*2); ctx.fill();
            }
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.beginPath(); ctx.arc(shootingStar.x, shootingStar.y, 0.8, 0, Math.PI*2); ctx.fill();
            const sg = ctx.createRadialGradient(shootingStar.x, shootingStar.y, 0, shootingStar.x, shootingStar.y, 4);
            sg.addColorStop(0, 'rgba(255,255,255,0.35)');
            sg.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = sg;
            ctx.beginPath(); ctx.arc(shootingStar.x, shootingStar.y, 4, 0, Math.PI*2); ctx.fill();
        }

        // Satelliitti (pieni vilkkuva piste) – vain yöllä
        if (dayT <= 0 && satellite && satellite.active) {
            const blink = Math.sin(satellite.blinkPhase) * 0.5 + 0.5;
            const alpha = 0.25 + blink * 0.65;
            ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
            ctx.beginPath(); ctx.arc(satellite.x, satellite.y, 1.5, 0, Math.PI*2); ctx.fill();
        }

        // Kaukainen kaupunkisiluetti (parallaksi 0.4×) – tähtien/taivaan päällä, talojen takana
        drawBackdrop(camX * (1 - BACKDROP_PARALLAX));
        drawBuildings();
        drawGround();

        // Sähkökaapit (talojen kyljissä)
        drawElectricCabinet();

        // Mustat lehdettömät puut (raoissa)
        drawTrees();
        // Pienet ruohotupsut puiden juurella
        if (foreground) { drawTreeGrassTufts(); }

        // BAR-viittakyltti (puunraossa, osoittaa oikealle)
        drawBarSign();

        // Lamput
        for (const lamp of lamps) drawLampPost(lamp);

        // Ovet – kaikkiin taloihin
        for (const bldg of buildings) drawDoor(bldg);

        // Kolikko
        if (!coin.collected) drawCoin();

        // Kukkaruukku
        if (flowerPot && flowerPot.active) drawFlowerPot();

        // Potkusta pudonnut kolikko
        if (kickCoin) drawKickCoin();

        // Katueläin
        if (groundAnimal) drawAnimal();

        // Oviukko (Avenger) – piirretään pelaajan alle
        if (avenger) drawAvenger();

        // Pelaaja
        drawPlayer();

        // Ajoneuvot – ylempi kaista (kauempana) ensin, alempi (lähempänä) päälle
        if (vehicles[1]) drawVehicle(vehicles[1]);
        if (vehicles[0]) drawVehicle(vehicles[0]);

        // Rauta-aita (etualalla, pelaajan takana → piirretään pelaajan päälle)
        if (foreground && foreground.ironFence) { drawIronFence(); }
        // Ruohotupsut aidan juuressa
        if (foreground) { drawGrassTufts(); }

        // Partikkelit
        for (const p of particles) {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x-2, p.y-2, 4, 4);
        }
        ctx.globalAlpha = 1;

        // ── Päivänvalo (lopputila: kaikki 3 avainta) ──
        // Yksi additive-kerros kirkastaa koko kadun (asfaltti, talot, siluetti,
        // puut, ajoneuvot, pelaaja) ilman että yhtään piirtofunktiota tai
        // väripalettia tarvitsee säätää uudelleen. Piirretään ennen oviukon
        // vinjettiä ja kuoleman pimennystä → ne toimivat ennallaan.
        if (dayT > 0) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.fillStyle = 'rgba(' + DAY_LIGHT_RGB[0] + ',' + DAY_LIGHT_RGB[1] + ',' + DAY_LIGHT_RGB[2] + ',' + (DAY_LIGHT_ALPHA * dayT).toFixed(3) + ')';
            ctx.fillRect(0, 0, WORLD_W, WORLD_H);
            ctx.restore();
        }

        // ── Oviukon isku: jäädytyksen vinjetti + iskuvälähdys + tähdet ──
        if (avenger && avenger.phase === 'hold') {
            const hk = 1 - Math.max(0, Math.min(1, hitPauseTimer / AVENGER_FREEZE));   // 0 → 1
            // Iskuvälähdys heti kontaktissa
            if (hk < 0.10) {
                ctx.fillStyle = 'rgba(255,235,205,' + (0.45 * (1 - hk / 0.10)).toFixed(3) + ')';
                ctx.fillRect(0, 0, WORLD_W, WORLD_H);
            }
            // Tummenevat reunat (vinjetti) koko 3 s jäädytyksen ajan
            const vg = ctx.createRadialGradient(WORLD_W / 2, 190, 70, WORLD_W / 2, 190, 430);
            vg.addColorStop(0, 'rgba(0,0,0,0)');
            vg.addColorStop(1, 'rgba(0,0,0,' + (0.6 * Math.min(1, hk * 1.6)).toFixed(3) + ')');
            ctx.fillStyle = vg;
            ctx.fillRect(0, 0, WORLD_W, WORLD_H);
            // Tähdet alkavat kiertää pään ympäri jo ennen kosahtamista
            const sx0 = player.x + player.w / 2, sy0 = player.y + 6;
            const st = (AVENGER_FREEZE - Math.max(0, hitPauseTimer)) * 0.07;
            ctx.strokeStyle = '#ffdd44'; ctx.lineWidth = 1;
            for (let si = 0; si < 3; si++) {
                const ang = st + si * 2.1;
                const ax2 = sx0 + Math.cos(ang) * 14, ay2 = sy0 + Math.sin(ang) * 8;
                ctx.beginPath();
                ctx.moveTo(ax2 - 2, ay2 - 2); ctx.lineTo(ax2 + 2, ay2 + 2);
                ctx.moveTo(ax2 + 2, ay2 - 2); ctx.lineTo(ax2 - 2, ay2 + 2);
                ctx.stroke();
            }
        }

        // ── Kuoleman pimennys ─────────────────────────
        if (playerDead) {
            ctx.fillStyle = 'rgba(0,0,0,' + deathAlpha + ')';
            ctx.fillRect(0, 0, WORLD_W, WORLD_H);
        }

        ctx.restore();
    }

    /* ── Rauhalliset ikkunavalot (0-5 kpl, 1-10min paloaika) ── */
    const litWindows = []; // { wx, wy, bldgIdx, offTime }

    function collectAllWindows() {
        const all = [];
        for (let bi = 0; bi < buildings.length; bi++) {
            const b = buildings[bi];
            for (let wy = GROUND_Y - b.h + 25; wy < GROUND_Y - 35; wy += 32) {
                for (let wx = b.x + 10; wx < b.x + b.w - 15; wx += 24) {
                    if (wx + 10 > b.x + b.w - 6) continue;
                    all.push({ wx, wy, bldgIdx: bi });
                }
            }
        }
        return all;
    }

    let _allWindows = null;
    function getAvailableWindows() {
        if (!_allWindows) _allWindows = collectAllWindows();
        // Suodata pois talot joiden valot on potkittu päälle
        return _allWindows.filter(w => {
            const idx = w.bldgIdx;
            if (idx === 0 && firstHouseWindowsLit) return false;
            if (smallHouseLights[idx] && smallHouseLights[idx].lit) return false;
            return true;
        });
    }

    // Väriavustajat ikkunoille: keltainen (60%), sinertävä TV (20%), punertava tunnelma (20%)
    function pickColorType() {
        const r = Math.random() * 100;
        if (r < 60) return 'yellow';
        if (r < 80) return 'blue';
        return 'red';
    }

    // Deterministinen väri ikkunan sijainnin perusteella (houseLit-taloille)
    function getWindowColorType(wx, wy, bldgIdx) {
        const hash = (wx * 31 + wy * 17 + bldgIdx * 7) % 100;
        if (hash < 60) return 'yellow';
        if (hash < 80) return 'blue';
        return 'red';
    }

    function addRandomLitWindow() {
        const avail = getAvailableWindows().filter(w => 
            !litWindows.some(l => l.wx === w.wx && l.wy === w.wy && l.bldgIdx === w.bldgIdx)
        );
        if (avail.length === 0) return;
        const w = avail[Math.floor(Math.random() * avail.length)];
        // 10-30 s (debug)
        const duration = 10000 + Math.random() * 20000;
        litWindows.push({ wx: w.wx, wy: w.wy, bldgIdx: w.bldgIdx, offTime: Date.now() + duration, colorType: pickColorType() });
    }

    function updateLitWindows() {
        const now = Date.now();
        let changed = false;
        // Poista sammuneet
        for (let i = litWindows.length - 1; i >= 0; i--) {
            if (now >= litWindows[i].offTime) {
                litWindows.splice(i, 1);
                changed = true;
            }
        }
        // Vain kun joku sammui: arvo uusi tavoite 0-5
        if (changed) {
            const target = Math.floor(Math.random() * 6); // 0..5
            while (litWindows.length < target) addRandomLitWindow();
            while (litWindows.length > 5) litWindows.shift();
        }
    }

    function isWindowLit(wx, wy, bldgIdx) {
        return litWindows.some(w => w.wx === wx && w.wy === wy && w.bldgIdx === bldgIdx);
    }

    // Apufunktio: vaalentaa hex-väriä lisäämällä offsetin RGB-kanaviin
    function lightenHex(hex, offset) {
        const r = Math.min(255, parseInt(hex.slice(1,3), 16) + offset);
        const g = Math.min(255, parseInt(hex.slice(3,5), 16) + offset);
        const b = Math.min(255, parseInt(hex.slice(5,7), 16) + offset);
        return '#' + [r,g,b].map(v => v.toString(16).padStart(2,'0')).join('');
    }

    // Siluetin todennäköisyys keltaisessa ikkunassa (0.50 = testaus, myöhemmin 0.05)
    const SILHOUETTE_CHANCE = 0.50;

    function shouldShowSilhouette(wx, wy, bldgIdx, colorType) {
        if (colorType !== 'yellow') return false;
        const hash = (wx * 13 + wy * 29 + bldgIdx * 41) % 1000;
        return hash < SILHOUETTE_CHANCE * 1000;
    }

    function drawSilhouette(wx, wy) {
        // Pieni tumma figuuri 10×14 ikkunassa (seisoo alalaidalla)
        const cx = wx + 5, cy = wy;
        // Pää – tummempi
        ctx.fillStyle = 'rgba(6,3,1,0.72)';
        ctx.beginPath();
        ctx.arc(cx, cy + 5.8, 1.8, 0, Math.PI * 2);
        ctx.fill();
        // Hartiat – selkeästi leveät, tunnistettava siluetti
        ctx.fillStyle = 'rgba(8,4,1,0.62)';
        ctx.fillRect(cx - 2.0, cy + 8, 4.0, 1.1);
        // Vartalo – selvästi kapeampi, kapenee jalkoihin
        ctx.beginPath();
        ctx.moveTo(cx - 1.0, cy + 9.1);
        ctx.lineTo(cx + 1.0, cy + 9.1);
        ctx.lineTo(cx + 0.6, cy + 13);
        ctx.lineTo(cx - 0.6, cy + 13);
        ctx.closePath();
        ctx.fill();
    }

    // Alusta: 0-5 ikkunaa heti palamaan
    for (let i = 0; i < Math.floor(Math.random() * 6); i++) addRandomLitWindow();

    // Palauttaa ikkunan värit tyypin perusteella: keltainen, sinertävä (TV), punertava (tunnelma)
    function getWindowColors(colorType, wx, wy) {
        const dt = Date.now() * 0.001;
        const f1 = 0.92 + Math.sin(dt*2.3 + wx*0.07 + wy*0.13)*0.08;
        let r, g, b, glowR, glowG, glowB;
        if (colorType === 'blue') {
            // Sinertävä TV-valo: kylmä sinivalkoinen
            r = Math.floor(60 + Math.sin(dt*1.9+wy*0.1)*15);
            g = Math.floor(150 + Math.sin(dt*2.1+wx*0.08)*20);
            b = Math.floor(220 + Math.sin(dt*1.5+wy*0.06)*10);
            glowR = 80; glowG = 180; glowB = 255;
        } else if (colorType === 'red') {
            // Punertava tunnelmavalo: lämmin oranssi/punainen
            r = Math.floor(230 + Math.sin(dt*1.9+wy*0.1)*10);
            g = Math.floor(55 + Math.sin(dt*2.1+wx*0.08)*15);
            b = Math.floor(25 + Math.sin(dt*1.5+wy*0.06)*15);
            glowR = 255; glowG = 80; glowB = 60;
        } else {
            // Keltainen (oletus): eri keltaisen sävyjä
            r = Math.floor(240 + Math.sin(dt*1.9+wy*0.1)*10);
            g = Math.floor(195 + Math.sin(dt*2.1+wx*0.08)*15);
            b = Math.floor(75 + Math.sin(dt*1.5+wy*0.06)*20);
            glowR = 255; glowG = 200; glowB = 80;
        }
        const fillAlpha = (0.72 * f1).toFixed(3);
        return {
            fill: `rgba(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)},${fillAlpha})`,
            stroke: `rgba(${Math.floor(r*1.08)},${Math.floor(g*0.95)},${Math.floor(b*1.3)},0.55)`,
            glow0: `rgba(${glowR},${glowG},${glowB},0.22)`,
            glow1: `rgba(${glowR},${glowG},${glowB},0)`
        };
    }

    // Apufunktio: ikkunarivien määrä talolle (sama logiikka kuin drawBuildingsin ikkunasilmukka)
    function buildingWindowRows(b) {
        return Math.ceil((b.h - 60) / 32);
    }

    // Syvyysefekti: matalampi talo = kauempana = pienempi
    // 5 riviä = 100 %, 4 riviä = 95 %, 3 riviä = 90 %
    function buildingScale(b) {
        const rows = buildingWindowRows(b);
        if (rows >= 5) return 1.00;
        if (rows === 4) return 0.95;
        return 0.90;
    }

    function drawBuildings() {
        for (const b of buildings) {
            const idx = buildings.indexOf(b);
            // Runko – käytä talon omaa yönsävyä, fallback jos puuttuu
            const bodyC = b.bodyColor || '#1a1a2e';
            // Syvyysefekti: skaalaa talo pohjan keskipisteen ympäri (ovet pysyvät paikoillaan)
            const s = buildingScale(b);
            // Taaimmaiset talot (3 ikkunariviä, skaala 90 %): ei vaaleita ulkokehyksiä
            // → ikkunat painuvat seinään ja näyttävät pienemmiltä (syvyysvaikutelma)
            const flatWindows = buildingWindowRows(b) <= 3;
            const cx = b.x + b.w / 2;
            ctx.save();
            ctx.translate(cx, GROUND_Y);
            ctx.scale(s, s);
            ctx.translate(-cx, -GROUND_Y);
            ctx.fillStyle = bodyC;
            ctx.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
            // Ikkunat
            const houseLit = (idx === 0 && firstHouseWindowsLit) || (smallHouseLights[idx] && smallHouseLights[idx].lit);
            // Oven "ei-ikkunaa" -alue (sis. +2px syvennysreunus) – ikkunoita ei piirretä oven taakse
            const dLeft = b.x + b.w / 2 - DOOR_W / 2 - 2;
            const dTop = GROUND_Y - DOOR_H - 2;
            const dRight = dLeft + DOOR_W + 4;
            for (let wy = GROUND_Y - b.h + 25; wy < GROUND_Y - 35; wy += 32) {
                for (let wx = b.x + 10; wx < b.x + b.w - 15; wx += 24) {
                    if (wx + 10 > b.x + b.w - 6) continue;
                    // Ohita ikkuna joka jää oven (tai sen kehyksen) taakse
                    if (wx + 10 > dLeft && wx < dRight && wy + 14 > dTop) continue;
                    if (houseLit) {
                        const ct = getWindowColorType(wx, wy, idx);
                        const wc = getWindowColors(ct, wx, wy);
                        ctx.fillStyle = wc.fill;
                        ctx.fillRect(wx, wy, 10, 14);
                        if (shouldShowSilhouette(wx, wy, idx, ct)) drawSilhouette(wx, wy);
                        if (!flatWindows) {
                            ctx.strokeStyle = wc.stroke; ctx.lineWidth = 1;
                            ctx.strokeRect(wx, wy, 10, 14);
                        }
                        const glow = ctx.createRadialGradient(wx+5, wy+7, 1, wx+5, wy+7, 12);
                        glow.addColorStop(0, wc.glow0);
                        glow.addColorStop(1, wc.glow1);
                        ctx.fillStyle = glow;
                        ctx.fillRect(wx-6, wy-5, 22, 24);
                    } else {
                        const litWin = litWindows.find(w => w.wx === wx && w.wy === wy && w.bldgIdx === idx);
                        if (litWin) {
                            const ct = litWin.colorType || 'yellow';
                            const wc = getWindowColors(ct, wx, wy);
                            ctx.fillStyle = wc.fill;
                            ctx.fillRect(wx, wy, 10, 14);
                            if (shouldShowSilhouette(wx, wy, idx, ct)) drawSilhouette(wx, wy);
                            if (!flatWindows) {
                                ctx.strokeStyle = wc.stroke; ctx.lineWidth = 1;
                                ctx.strokeRect(wx, wy, 10, 14);
                            }
                            const glow = ctx.createRadialGradient(wx+5, wy+7, 1, wx+5, wy+7, 12);
                            glow.addColorStop(0, wc.glow0);
                            glow.addColorStop(1, wc.glow1);
                            ctx.fillStyle = glow;
                            ctx.fillRect(wx-6, wy-5, 22, 24);
                        } else {
                            // 3 rivin talot (flatWindows): ei kehystä → ikkuna erottuu syvennyksenä.
                            // Tummempi täyttö + 1 px tumma ylävarjo + 1 px vaalea alaparre = upotus seinässä.
                            ctx.fillStyle = flatWindows ? '#05050d' : '#0a0a15';
                            ctx.fillRect(wx, wy, 10, 14);
                            if (flatWindows) {
                                ctx.fillStyle = 'rgba(0,0,0,0.35)';
                                ctx.fillRect(wx, wy, 10, 1);
                                ctx.fillStyle = lightenHex(bodyC, 0x06);
                                ctx.fillRect(wx, wy + 14, 10, 1);
                            } else {
                                ctx.strokeStyle = '#2a2a3e'; ctx.lineWidth = 1;
                                ctx.strokeRect(wx, wy, 10, 14);
                            }
                        }
                    }
                }
            }
            // Yläreuna / lippa – tyyli arvottu per talo
            drawCornice(b, bodyC);
            ctx.restore();
        }
    }

    /* ── Kaukaisen kaupungin siluetti – piirto ── */
    // bgShift = kameran "jälkeenjäävä" siirto kerrokselle (render antaa camX*(1-0.4)).
    function drawBackdrop(bgShift) {
        if (!backdrop) return;
        ctx.save();
        ctx.translate(Math.round(bgShift), 0);
        for (const b of backdrop.blocks) drawBackdropBlock(b);
        // Ilmaperspektiivi: ohut sinertävä huntu horisontin yläpuolella häivyttää siluetin kärkiä
        const haze = ctx.createLinearGradient(0, GROUND_Y - 120, 0, GROUND_Y);
        haze.addColorStop(0, 'rgba(120,140,190,0)');
        haze.addColorStop(1, 'rgba(120,140,190,0.05)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, GROUND_Y - 120, WORLD_W, 120);
        ctx.restore();
    }

    function drawBackdropBlock(b) {
        const topY = BACKDROP_BASE_Y - b.h;
        // Runko – litteä haalea sävy (ei gradienttia: kaukainen kohde)
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, topY, b.w, b.h);

        // Ikkunaristikko – runkoa tummempi, ilman reunoja ja glow'ta (skaalattu 50 %)
        ctx.fillStyle = '#0f1424';
        for (let r = 0; r < b.winRows; r++) {
            for (let c = 0; c < b.winCols; c++) {
                const wx = b.x + BACKDROP_WIN_OX + c * BACKDROP_WIN_DX;
                const wy = topY + BACKDROP_WIN_OY + r * BACKDROP_WIN_DY;
                if (wx + BACKDROP_WIN_W > b.x + b.w - BACKDROP_WIN_OX) continue;    // ei reunan yli
                if (wy + BACKDROP_WIN_H > BACKDROP_BASE_Y - BACKDROP_WIN_OY) continue;
                ctx.fillRect(wx, wy, BACKDROP_WIN_W, BACKDROP_WIN_H);
            }
        }

        // Yksi himmeä lämmin ikkuna (jos lohkolle arvottu)
        if (b.lit) {
            const wx = b.x + BACKDROP_WIN_OX + b.lit.c * BACKDROP_WIN_DX;
            const wy = topY + BACKDROP_WIN_OY + b.lit.r * BACKDROP_WIN_DY;
            ctx.fillStyle = 'rgba(255,214,150,0.10)';
            ctx.fillRect(wx, wy, BACKDROP_WIN_W, BACKDROP_WIN_H);
        }

        // Katto – 4 mallia (skaalattu 50 %)
        const topC = lightenHex(b.color, 0x08);
        switch (b.roof) {
            case 0: // tasakatto + parapet
                ctx.fillStyle = topC;
                ctx.fillRect(b.x - 1, topY - 2, b.w + 2, 2);
                break;
            case 1: // porrastettu (2 askelmaa)
                ctx.fillStyle = topC;
                ctx.fillRect(b.x + Math.floor(b.w * 0.3), topY - 2, Math.ceil(b.w * 0.4), 2);
                ctx.fillStyle = topC;
                ctx.fillRect(b.x - 1, topY - 4, b.w + 2, 2);
                break;
            case 2: // harjakatto (vinot laidat)
                ctx.fillStyle = topC;
                ctx.beginPath();
                ctx.moveTo(b.x - 1, topY);
                ctx.lineTo(b.x + b.w / 2, topY - 4);
                ctx.lineTo(b.x + b.w + 1, topY);
                ctx.closePath();
                ctx.fill();
                break;
            case 3: { // kattolaite (vesitorni / antenni / hormi) – paikka kiinteä initistä
                const dx = b.x + Math.round(b.w * b.deviceX);
                if (b.device === 0) {
                    // vesitorni: ohut jalka + säiliö
                    ctx.fillStyle = topC;
                    ctx.fillRect(dx - 1, topY - 5, 2, 5);
                    ctx.fillRect(dx - 3, topY - 8, 6, 3);
                } else if (b.device === 1) {
                    // antenni: ohut pystysauva
                    ctx.fillStyle = topC;
                    ctx.fillRect(dx, topY - 6, 1, 6);
                } else {
                    // hormi
                    ctx.fillStyle = topC;
                    ctx.fillRect(dx - 2, topY - 4, 4, 4);
                }
                break;
            }
        }

        // Reunalista (band) – ohut vaaleampi viiva rungon yläosassa
        if (b.band) {
            ctx.fillStyle = lightenHex(b.color, 0x06);
            ctx.fillRect(b.x, topY + 3, b.w, 1);
        }
    }

    /* ── Sähkökaapit (talojen kyljissä, kerrostalon vas. seinä) ── */
    function drawElectricCabinet() {
        for (const c of electricCabinets) {
            const cx = c.x, cy = c.y, cw = c.w, ch = c.h;
            const centerX = cx + cw / 2;

            // Runko (harmaa metalli) – pelkkä laatikko
            ctx.fillStyle = '#55555c';
            ctx.fillRect(cx, cy, cw, ch);
            ctx.fillStyle = '#6c6c74';
            ctx.fillRect(cx + 1, cy + 1, cw - 2, 2);
            ctx.strokeStyle = '#2b2b31';
            ctx.strokeRect(cx + 0.5, cy + 0.5, cw - 1, ch - 1);

            // Etuluukku
            ctx.fillStyle = '#48484f';
            ctx.fillRect(cx + 2, cy + 5, cw - 4, ch - 7);
            ctx.fillStyle = '#3d3d43';
            ctx.fillRect(cx + 2, cy + 5, cw - 4, 1);

            // Vilkkuva keltainen varoitusvalo yläosassa
            const on = Math.sin(Date.now() / 520) > 0;
            if (on) {
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(centerX, cy - 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
                const glow = ctx.createRadialGradient(centerX, cy - 2, 0.5, centerX, cy - 2, 7);
                glow.addColorStop(0, 'rgba(255,215,0,0.6)');
                glow.addColorStop(1, 'rgba(255,215,0,0)');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(centerX, cy - 2, 7, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillStyle = '#4a4410';
                ctx.beginPath();
                ctx.arc(centerX, cy - 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Lippatyylit (0–6): erilaisia kattolippoja
    function drawCornice(b, bodyC) {
        const topY = GROUND_Y - b.h;
        const topC = lightenHex(bodyC, 0x0e);
        const topC2 = lightenHex(bodyC, 0x06);
        const topCDark = lightenHex(bodyC, 0x04);

        switch (b.corniceType || 0) {
            case 0: // Tasainen peruslippa (alkuperäinen)
                ctx.fillStyle = topC;
                ctx.fillRect(b.x - 2, topY - 3, b.w + 4, 5);
                break;
            case 1: // Leveä uloke
                ctx.fillStyle = topC2;
                ctx.fillRect(b.x - 2, topY - 2, b.w + 4, 3);
                ctx.fillStyle = topC;
                ctx.fillRect(b.x - 6, topY - 6, b.w + 12, 4);
                break;
            case 2: // Porrastettu (3 askelmaa)
                ctx.fillStyle = topC2;
                ctx.fillRect(b.x - 1, topY - 2, b.w + 2, 3);
                ctx.fillStyle = topC;
                ctx.fillRect(b.x - 3, topY - 5, b.w + 6, 3);
                ctx.fillStyle = topCDark;
                ctx.fillRect(b.x - 4, topY - 8, b.w + 8, 3);
                break;
            case 3: // Kaksoiskaista
                ctx.fillStyle = topC;
                ctx.fillRect(b.x - 3, topY - 4, b.w + 6, 3);
                ctx.fillStyle = topC2;
                ctx.fillRect(b.x - 3, topY - 8, b.w + 6, 3);
                ctx.fillStyle = bodyC;
                ctx.fillRect(b.x - 3, topY - 7, b.w + 6, 1);
                break;
            case 4: // Viistetty / trapezoidi (leveämpi alhaalta)
                ctx.fillStyle = topC;
                ctx.fillRect(b.x - 5, topY - 3, b.w + 10, 7);
                ctx.fillStyle = topC2;
                ctx.fillRect(b.x - 2, topY - 7, b.w + 4, 4);
                break;
            case 5: // Hammasrivikoriste (dentil)
                ctx.fillStyle = topC;
                ctx.fillRect(b.x - 3, topY - 6, b.w + 6, 5);
                ctx.fillStyle = topC2;
                ctx.fillRect(b.x - 3, topY - 9, b.w + 6, 3);
                // Pienet pystyhampaat
                ctx.fillStyle = topCDark;
                const dentW = 5, gap = 6, count = Math.floor(b.w / (dentW + gap));
                const startX = b.x + (b.w - count * (dentW + gap) + gap) / 2;
                for (let d = 0; d < count; d++) {
                    ctx.fillRect(startX + d * (dentW + gap), topY - 6, dentW, 5);
                }
                break;
            case 6: // Ohut moderni
                ctx.fillStyle = topC;
                ctx.fillRect(b.x - 1, topY - 3, b.w + 2, 4);
                ctx.fillStyle = topC2;
                ctx.fillRect(b.x - 4, topY - 5, b.w + 8, 2);
                break;
        }
    }

    /* ── Musta lehdetön puu (siluetti taivasta vasten) ── */
    // swayX = latvan vaakasiirto tuulen mukana (px). Tyvi pysyy maassa kiinni,
    // siirto kasvaa korkeuden mukaan → puu taipuu, ei kaadu jäykkänä.
    function drawBareTree(cx, baseY, h, swayX) {
        if (!swayX) swayX = 0;
        // Korkeuden mukaan kasvava taipuma (0 tyvessä, täysi latvassa)
        const offAt = (y) => {
            const rel = Math.max(0, Math.min(1, (baseY - y) / h));
            return swayX * rel * Math.sqrt(rel);   // rel^1.5 – pehmeä taipuma
        };
        ctx.fillStyle = '#000';
        ctx.strokeStyle = '#000';
        ctx.lineCap = 'round';

        const trunkH = h * 0.45;
        const trunkW = Math.max(2, h * 0.16);

        // Runko (tyvestä leveämpi, latvaa kohti kapeampi) – tyvi ankkuroitu
        ctx.beginPath();
        ctx.moveTo(cx - trunkW * 0.5, baseY);
        ctx.lineTo(cx + trunkW * 0.5, baseY);
        ctx.lineTo(cx + trunkW * 0.18 + offAt(baseY - trunkH), baseY - trunkH);
        ctx.lineTo(cx - trunkW * 0.18 + offAt(baseY - trunkH), baseY - trunkH);
        ctx.closePath();
        ctx.fill();

        // Deterministinen 2D-kohina (sama tulos joka ruudulla → ei välkyntää)
        function noise2(x, y) {
            const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
            return s - Math.floor(s); // [0,1)
        }

        // Haarat – orgaaninen, epäsymmetrinen rekursio (deterministinen kohina)
        // Piirrossa pisteet siirretään tuulen taipuman mukaan: alku- ja loppupiste
        // saavat saman siirron kuin y-koordinaatti → haarat pysyvät kiinni toisissaan.
        function branch(x, y, ang, len, w, depth) {
            if (len < 1.5 || w < 0.5 || depth > 7) return;
            const x2 = x + Math.cos(ang) * len;
            const y2 = y + Math.sin(ang) * len;
            ctx.lineWidth = w;
            ctx.beginPath();
            ctx.moveTo(x + offAt(y), y);
            ctx.lineTo(x2 + offAt(y2), y2);
            ctx.stroke();

            // Epäsymmetrinen haarautuminen: kulmat, pituudet ja leveydet vaihtelevat
            const n1 = noise2(x2, y2);
            const n2 = noise2(y2 + 3.1, x2 - 2.7);
            const spread = 0.3 + n1 * 0.45;            // 0.3–0.75 rad
            const bend = (n2 - 0.5) * 0.6;             // koko latvan taivutussuunta
            const lenL = len * (0.6 + n1 * 0.25);      // 0.6–0.85
            const lenR = len * (0.6 + n2 * 0.25);
            const w2 = w * 0.62;
            branch(x2, y2, ang - spread + bend, lenL, w2, depth + 1);
            branch(x2, y2, ang + spread * (0.7 + n2 * 0.6) + bend, lenR, w2 * (0.9 + n1 * 0.2), depth + 1);
        }

        const topY = baseY - trunkH;
        branch(cx, topY, -Math.PI / 2, h * 0.52, trunkW * 0.4, 0);
        branch(cx, topY, -Math.PI / 2 - 0.85, h * 0.42, trunkW * 0.28, 0);
        branch(cx, topY, -Math.PI / 2 + 0.7, h * 0.46, trunkW * 0.26, 0);

        // Palauta oletus, ettei pyöreä viivapää vuoda muihin piirroksiin
        ctx.lineCap = 'butt';
    }

    function drawTrees() {
        // Tuuli: pilvet kulkevat windDir/windSpeed-arvolla (initClouds) → puut
        // nojaavat samaan suuntaan ja huojuvat tuulen voiman mukaan.
        const t = Date.now() * 0.001;                       // sekunnit
        for (const tr of trees) {
            const phase = tr.phase || 0;
            const gust = 0.65 + 0.35 * Math.sin(t * 0.37 + phase);        // hidas puuska
            const osc = Math.sin(t * (1.0 + windSpeed * 0.10) + phase);   // huojunta
            const amp = (0.65 + windSpeed * 0.25) * gust;                 // latvan amplitudi (px)
            const lean = windDir * amp * 0.5;                             // lepoasento tuulen suuntaan
            drawBareTree(tr.x, GROUND_Y - 5, tr.h, lean + osc * amp);
        }
    }

    /* Terävä pikselifontti (3x5 glyphit) – ei anti-aliasointia, pysyy terävänä skaalauksessa */
    function drawPixelText(text, cx, cy, scale, color) {
        const G = {
            'B': [[1,1,1],[1,0,1],[1,1,1],[1,0,1],[1,1,1]],
            'A': [[0,1,0],[1,0,1],[1,1,1],[1,0,1],[1,0,1]],
            'R': [[1,1,1],[1,0,1],[1,1,1],[1,1,0],[1,0,1]],
        };
        const rows = 5, cols = 3;
        const gw = cols * scale;
        const gap = scale;
        const totalW = text.length * gw + (text.length - 1) * gap;
        // Pyöristä aloitus kokonaisluvuiksi → terävät reunat (ei anti-aliasointia)
        const startX = Math.round(cx - totalW / 2);
        const startY = Math.round(cy - (rows * scale) / 2);
        ctx.fillStyle = color;
        for (let li = 0; li < text.length; li++) {
            const g = G[text[li]];
            if (!g) continue;
            const gx = startX + li * (gw + gap);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (g[r][c]) ctx.fillRect(gx + c * scale, startY + r * scale, scale, scale);
                }
            }
        }
    }

    /* ── BAR-viittakyltti (puunraossa, osoittaa oikealle) ── */
    function drawBarSign() {
        const sx = 143;               // siirretty vasemmalle (hiukan vasemman talon päälle)
        const cy = GROUND_Y - 10;     // matala keskikorkeus
        const tailW = 3;              // I-häntä
        const shaftLen = 22;          // varsi (palautettu alkuperäiseen pituuteen)
        const headLen = 9;            // nuolenkärki
        const halfH = 5;              // varren puolikorkeus

        // Pieniä jalkoja – kyltti ei roiku ilmassa (laudan alta maahan)
        const legW = 2;
        const legTop = cy + halfH;             // laudan alareuna
        const legH = GROUND_Y - legTop;        // maahan asti
        ctx.fillStyle = '#1F1614';
        ctx.fillRect(sx + tailW + 2, legTop, legW, legH);
        ctx.fillRect(sx + tailW + shaftLen - legW - 2, legTop, legW, legH);

        // Kyltin runko – pimeä puinen nuoli I====> (lähes musta siluetti)
        ctx.fillStyle = '#1F1614';
        // Häntä (I)
        ctx.fillRect(sx, cy - halfH, tailW, halfH * 2);
        // Varsi (====)
        ctx.fillRect(sx + tailW, cy - halfH, shaftLen, halfH * 2);
        // Nuolenkärki (>)
        ctx.beginPath();
        ctx.moveTo(sx + tailW + shaftLen, cy - halfH - 2);
        ctx.lineTo(sx + tailW + shaftLen + headLen, cy);
        ctx.lineTo(sx + tailW + shaftLen, cy + halfH + 2);
        ctx.closePath();
        ctx.fill();

        // Hienovarainen reunus – vain aavistus määrittelyä pimeässä siluetissa
        ctx.strokeStyle = '#0c0908';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Neon-teksti 'BAR>' – '>' muodostaa nuolen neonvärisenä (keskitetään kyltille)
        const tcx = sx + (tailW + shaftLen + headLen) / 2;
        const tcy = cy;
        ctx.save();
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#FF0055';   // Hohteen väri (hieman tummempi punapinkki kuin itse teksti)
        ctx.shadowBlur = 10;           // Kuinka kauas hohde leviää
        ctx.fillStyle = '#FF66A3';     // Itse tekstin (kirjainten) ydin, hieman kirkkaampi/vaaleampi
        ctx.fillText('BAR>', tcx, tcy);
        ctx.restore();
    }


    function drawGround() {
        // Taustapohja
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, GROUND_Y, WORLD_W, WORLD_H - GROUND_Y);

        // Yläreunan katukiveys (reunakivet) – oviaukon kohdalla katkaistu (laskettu reunakivi)
        const copingY = GROUND_Y - 4, copingH = 8;
        for (const cs of foreground.copingStones) {
            for (const seg of splitAtKerbGaps(cs.x, cs.x + cs.w)) {
                ctx.fillStyle = '#2' + cs.shade + '2' + cs.shade + '2' + cs.shade;
                ctx.fillRect(seg[0], copingY, seg[1] - seg[0], copingH);
                ctx.fillStyle = '#161616';
                ctx.fillRect(seg[0], copingY, seg[1] - seg[0], 1);
            }
        }

        // Kiveyspinta – esigeneroiduista
        for (const ps of foreground.pavingStones) {
            const hex = ps.shade.toString(16).padStart(2, '0');
            ctx.fillStyle = '#' + hex + hex + hex;
            ctx.fillRect(ps.x, ps.y, ps.w, ps.h);
            ctx.fillStyle = '#151515';
            ctx.fillRect(ps.x, ps.y, 1, ps.h);
            ctx.fillRect(ps.x, ps.y + ps.h - 1, ps.w, 1);
        }

        // Ala- ja yläreunaviivat (katkaistu oviaukon kohdalta – laskettu reunakivi)
        drawStreetLine(GROUND_Y, 3, '#2a2a2a');
        drawStreetLine(GROUND_Y - 2, 2, '#3a3a3a');

        // Ovien kynnysviuhka + laskettu reunakivi + kynnyslaatta
        if (foreground) { drawThresholdPaving(); }

        // Viemärinkannet
        if (foreground) { drawManholes(); }

        // Sanomalehti
        if (foreground && foreground.newspaper) { drawNewspaper(); }

        // Kuoriainen
        if (foreground && foreground.beetle) { drawBeetle(); }

    }

    /* Katkaisee vaakaviivan oviaukkojen kohdalta (laskettu reunakivi) */
    function drawStreetLine(y, h, style) {
        ctx.fillStyle = style;
        const gaps = (foreground && foreground.kerbGaps) ? foreground.kerbGaps : [];
        let x = 0;
        for (const g of gaps) {
            if (g.l > x) ctx.fillRect(x, y, g.l - x, h);
            if (g.r > x) x = g.r;
        }
        if (x < WORLD_W) ctx.fillRect(x, y, WORLD_W - x, h);
    }

    /* Palauttaa [x0,x1]-palat, jotka jäävät oviaukkojen ulkopuolelle */
    function splitAtKerbGaps(x0, x1) {
        const gaps = (foreground && foreground.kerbGaps) ? foreground.kerbGaps : [];
        let parts = [[x0, x1]];
        for (const g of gaps) {
            const next = [];
            for (const seg of parts) {
                if (g.r <= seg[0] || g.l >= seg[1]) { next.push(seg); continue; }
                if (g.l > seg[0]) next.push([seg[0], g.l]);
                if (g.r < seg[1]) next.push([g.r, seg[1]]);
            }
            parts = next;
        }
        return parts.filter(seg => seg[1] - seg[0] > 0.5);
    }

    /* ── Ovien kynnysviuhka + laskettu reunakivi + kynnyslaatta ──
       Kiveys kaatuu/kallistuu ovea kohti: vinot saumat, V-painuma,
       laskettu reunakivi katkaisee kadun viivat oviaukon kohdalta. */
    function drawThresholdPaving() {
        if (!foreground || !foreground.thresholds) return;
        const fillPolys = (grp) => {
            ctx.fillStyle = grp.fill;
            ctx.beginPath();
            for (const poly of grp.polys) {
                ctx.moveTo(poly[0], poly[1]);
                for (let i = 2; i < poly.length; i += 2) ctx.lineTo(poly[i], poly[i + 1]);
                ctx.closePath();
            }
            ctx.fill();
        };

        for (const t of foreground.thresholds) {
            // 1) Kiilakivet sävyryhmittäin (muutama fill per ovi)
            for (const grp of t.groups) fillPolys(grp);

            // 1b) Tallattu keskilinja (kuluminen) peruskiilojen päälle
            for (const grp of t.wear) fillPolys(grp);

            // 2) Oviaukon valo (vain aktiivisille oville – sama logiikka kuin drawDoor)
            const isBar = t.bldgIdx === 8;
            const ownerLamp = lamps.find(l => l.bldgIdx === t.bldgIdx);
            const jukeboxLit = t.bldgIdx === JUKEBOX_BLDG_IDX &&
                               !!(smallHouseLights[t.bldgIdx] && smallHouseLights[t.bldgIdx].lit);
            // Makuuhuone (talo 7): 3 avainta = ovi aina auki (valo palaa kynnyksellä)
            const sleepOpen = t.bldgIdx === SLEEP_BLDG_IDX && allKeysCollected();
            const active = isBar || jukeboxLit || sleepOpen || !!(ownerLamp && ownerLamp.lit);
            if (THRESH_LIGHT && active) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(t.border[0], t.border[1]);
                for (let i = 2; i < t.border.length; i += 2) ctx.lineTo(t.border[i], t.border[i + 1]);
                ctx.closePath();
                ctx.clip();
                const r = t.depth + 12;
                const lg = ctx.createRadialGradient(t.cx, GROUND_Y + 2, 2, t.cx, GROUND_Y + 2, r);
                lg.addColorStop(0, 'rgba(' + t.lightRGB + ',0.16)');
                lg.addColorStop(0.5, 'rgba(' + t.lightRGB + ',0.06)');
                lg.addColorStop(1, 'rgba(' + t.lightRGB + ',0)');
                ctx.fillStyle = lg;
                ctx.fillRect(t.cx - r, GROUND_Y, r * 2, r);
                ctx.restore();
            }

            // 3) Saumat (vinot) + renkaiden rajapisteet
            ctx.strokeStyle = '#161616';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (const ln of t.seams) { ctx.moveTo(ln[0], ln[1]); ctx.lineTo(ln[2], ln[3]); }
            for (const hs of t.hseams) {
                ctx.moveTo(hs[0], hs[1]);
                for (let i = 2; i < hs.length; i += 2) ctx.lineTo(hs[i], hs[i + 1]);
            }
            ctx.stroke();
            // 4) Halkeamat + pikkukivet
            if (THRESH_DETAILS) {
                if (t.cracks.length) {
                    ctx.strokeStyle = '#0d0d0d';
                    ctx.beginPath();
                    for (const ln of t.cracks) { ctx.moveTo(ln[0], ln[1]); ctx.lineTo(ln[2], ln[3]); }
                    ctx.stroke();
                }
                for (const pb of t.pebbles) {
                    ctx.fillStyle = pb[4];
                    ctx.fillRect(pb[0], pb[1], pb[2], pb[3]);
                }
            }

            // 5) Viuhkan ulkoreuna – erottaa viuhkan suorasta kiveyksestä
            ctx.strokeStyle = '#0e0e0e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(t.border[0], t.border[1]);
            for (let i = 2; i < t.border.length; i += 2) ctx.lineTo(t.border[i], t.border[i + 1]);
            ctx.closePath();
            ctx.stroke();
            ctx.lineWidth = 1;

            // 6) Laskettu reunakivi: kynnyslinja oven alle + viisteet katkon reunoille
            const gw = t.gapR - t.gapL;
            ctx.fillStyle = '#3a3a3a';
            ctx.fillRect(t.gapL + 2, GROUND_Y, gw - 4, 1);          // kynnyslinjan yläreuna
            ctx.fillStyle = '#1c1c1c';
            ctx.fillRect(t.gapL, GROUND_Y + 1, gw, 1);              // varjoraot kynnyksen alle
            ctx.fillStyle = '#343434';
            ctx.fillRect(t.gapL, GROUND_Y - 3, 2, 4);               // viiste vasen (reunakivi kaatuu alas)
            ctx.fillRect(t.gapR - 2, GROUND_Y - 3, 2, 4);           // viiste oikea
            ctx.fillStyle = '#0b0b0b';
            ctx.fillRect(t.gapL, GROUND_Y - 4, 1, 5);
            ctx.fillRect(t.gapR - 1, GROUND_Y - 4, 1, 5);

            // 7) Kynnyslaatta (ovi nousee kynnyksellä)
            const sb = t.slab;
            ctx.fillStyle = '#2f2f2f';
            ctx.fillRect(sb.x, sb.y, sb.w, 1);
            ctx.fillStyle = '#232323';
            ctx.fillRect(sb.x, sb.y + 1, sb.w, sb.h - 2);
            ctx.fillStyle = '#141414';
            ctx.fillRect(sb.x, sb.y + sb.h - 1, sb.w, 1);
            ctx.fillStyle = '#0e0e0e';
            ctx.fillRect(sb.x - 1, sb.y, 1, sb.h);
            ctx.fillRect(sb.x + sb.w, sb.y, 1, sb.h);
        }
    }

    /* Etualan apufunktiot ─────────────────────────── */
    function drawManholes() {
        for (const mh of foreground.manholes) {
            const mx = mh.x, my = mh.y;
            ctx.fillStyle = '#0d0d0d';
            ctx.beginPath();
            ctx.ellipse(mx + 1, my + 2, 15, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#2a2a2e';
            ctx.beginPath();
            ctx.ellipse(mx, my, 14, 7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#1a1a1e'; ctx.lineWidth = 1;
            ctx.stroke();
            ctx.strokeStyle = '#3a3a3e';
            ctx.beginPath();
            ctx.ellipse(mx, my - 2, 12, 5, 0, Math.PI, 0);
            ctx.stroke();
            ctx.fillStyle = '#444';
            for (let n = 0; n < 6; n++) {
                const angle = n * Math.PI / 3 + 0.2;
                ctx.beginPath();
                ctx.arc(mx + Math.cos(angle) * 10, my + Math.sin(angle) * 4.5, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
            for (const p of mh.steamParticles) {
                ctx.fillStyle = 'rgba(200,205,215,' + p.alpha + ')';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    function drawNewspaper() {
        const n = foreground.newspaper;
        const t = Date.now() * 0.0008;
        const flipAngle = n.angle + Math.sin(t + n.x * 0.01) * 0.04;
        ctx.save();
        ctx.translate(n.x, n.y);
        ctx.rotate(flipAngle);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(1, 2, 22, 12);
        ctx.fillStyle = '#999';
        ctx.fillRect(0, 0, 22, 12);
        ctx.fillStyle = '#aaa';
        ctx.fillRect(0, 0, 22, 1);
        ctx.fillStyle = '#666';
        ctx.fillRect(2, 3, 12, 1);
        ctx.fillRect(2, 5, 16, 1);
        ctx.fillRect(2, 7, 10, 1);
        ctx.fillRect(12, 7, 4, 1);
        ctx.fillStyle = '#777';
        ctx.fillRect(2, 9, 14, 1);
        ctx.restore();
    }

    function drawTuft(tx, ty, blades, phase, scale, t) {
        const sway = Math.sin(t + phase) * 2 * scale;
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.beginPath();
        ctx.ellipse(tx, ty + 3 * scale, 5 * scale, 2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let b = 0; b < blades; b++) {
            const bx = tx + (-3 + b * 2.5) * scale;
            const bh = (7 + (b % 3) * 4) * scale;
            const bend = sway * (0.6 + b * 0.15);
            ctx.strokeStyle = b % 2 === 0 ? '#3a4a2a' : '#4a5a30';
            ctx.lineWidth = 1.2 * scale;
            ctx.beginPath();
            ctx.moveTo(bx, ty);
            ctx.quadraticCurveTo(bx + bend * 0.5, ty - bh * 0.5, bx + bend, ty - bh);
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawGrassTufts() {
        const t = Date.now() * 0.003;
        for (const tuft of foreground.grassTufts) {
            drawTuft(tuft.x, tuft.y, tuft.blades, tuft.phase, 1, t);
        }
    }

    function drawTreeGrassTufts() {
        const t = Date.now() * 0.003;
        for (const tuft of foreground.treeGrassTufts) {
            drawTuft(tuft.x, tuft.y, tuft.blades, tuft.phase, 0.25, t);
        }
    }

    function drawBeetle() {
        const b = foreground.beetle;
        const bx = b.x, by = b.y;
        const legPhase = Math.sin(b.animTimer) * 1.5;
        ctx.save();
        if (b.dir < 0) { ctx.translate(bx, 0); ctx.scale(-1, 1); ctx.translate(-bx, 0); }
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(bx - 3, by + 1 + legPhase, 1, 2);
        ctx.fillRect(bx - 1, by + 1 - legPhase, 1, 2);
        ctx.fillRect(bx + 2, by + 1 + legPhase, 1, 2);
        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.ellipse(bx, by, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0a0a0a';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(bx + 3, by - 1);
        ctx.lineTo(bx + 7, by - 4);
        ctx.moveTo(bx + 3, by - 0.5);
        ctx.lineTo(bx + 6, by + 1);
        ctx.stroke();
        ctx.restore();
    }

    function drawIronFence() {
        const f = foreground.ironFence;
        if (!f || !f.segments) return;

        for (const seg of f.segments) {
            const startX = seg.startX;
            const endX = seg.endX;
            const bars = seg.barX;

            // ── Varjo aidan takana ──
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.fillRect(startX + 2, f.topY + 2, endX - startX - 4, f.bottomRailY - f.topY + 2);

            // ── Vaakaraudat ──
            // Alajuoksu (paksumpi) – pyöreä sylinteriefekti pystygradientilla
            const railGrad = ctx.createLinearGradient(0, f.bottomRailY - 1, 0, f.bottomRailY + 6);
            railGrad.addColorStop(0,   '#3a3a3a');   // yläkiilto
            railGrad.addColorStop(0.5, '#2e2e2e');   // keskiosa
            railGrad.addColorStop(1,   '#1a1a1a');   // alavarjo
            ctx.fillStyle = railGrad;
            ctx.fillRect(startX, f.bottomRailY - 1, endX - startX, 7);
            // Niitit joka pystypiikin kohdalle (miltei musta, ei valopilkku)
            for (const bx of bars) {
                ctx.fillStyle = '#0b0b0b';
                ctx.beginPath();
                ctx.arc(bx + 1, f.bottomRailY + 2, 1.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#171717';
                ctx.beginPath();
                ctx.arc(bx + 0.6, f.bottomRailY + 1.6, 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
            // Yläjuoksu
            ctx.fillStyle = '#222222';
            ctx.fillRect(startX, f.topY + 12, endX - startX, 4);
            ctx.fillStyle = '#2e2e2e';
            ctx.fillRect(startX + 1, f.topY + 13, endX - startX - 2, 2);

            // ── Pystypiikit ──
            for (const bx of bars) {
                // Piikin varsi
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(bx, f.topY + 15, 2, f.bottomRailY - f.topY - 15);
                // Piikin kärki (terävä yläosa)
                ctx.fillStyle = '#252525';
                ctx.beginPath();
                ctx.moveTo(bx - 1, f.topY + 15);
                ctx.lineTo(bx + 1, f.topY + 15);
                ctx.lineTo(bx + 1, f.topY + 1);
                ctx.lineTo(bx + 0.5, f.topY - 1);
                ctx.lineTo(bx, f.topY - 5);
                ctx.lineTo(bx - 0.5, f.topY - 1);
                ctx.lineTo(bx - 1, f.topY + 1);
                ctx.closePath();
                ctx.fill();
                // Kevyt kiilto piikin kärkeen
                ctx.fillStyle = '#3a3a3a';
                ctx.beginPath();
                ctx.moveTo(bx - 0.3, f.topY + 5);
                ctx.lineTo(bx + 0.3, f.topY + 5);
                ctx.lineTo(bx + 0.3, f.topY - 1);
                ctx.lineTo(bx, f.topY - 4);
                ctx.closePath();
                ctx.fill();
            }

            // ── Päätytolpat (segmenttien reunat) ──
            const drawEndPost = (px) => {
                ctx.fillStyle = '#080808';
                ctx.fillRect(px - 3, f.topY - 2, 6, f.bottomRailY - f.topY + 8);
                ctx.fillStyle = '#151515';
                ctx.fillRect(px - 2, f.topY, 4, f.bottomRailY - f.topY);
                // Tolpan pallo
                ctx.fillStyle = '#0a0a0a';
                ctx.beginPath();
                ctx.arc(px, f.topY - 4, 4.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#1a1a1a';
                ctx.beginPath();
                ctx.arc(px - 0.5, f.topY - 5, 2, 0, Math.PI * 2);
                ctx.fill();
            };
            drawEndPost(startX);
            drawEndPost(endX);
        }

        // ── Keskiaukon reunatolpat (paksummat, koristeellisemmat) ──
        const drawGapPost = (px) => {
            // Tolpan runko
            ctx.fillStyle = '#080808';
            ctx.fillRect(px - 4, f.topY - 6, 8, f.bottomRailY - f.topY + 12);
            ctx.fillStyle = '#121212';
            ctx.fillRect(px - 3, f.topY - 2, 6, f.bottomRailY - f.topY + 4);
            // Koriste-ura
            ctx.fillStyle = '#080808';
            ctx.fillRect(px - 2, f.topY + 18, 4, 14);
            // Pallo huipulla
            ctx.fillStyle = '#0a0a0a';
            ctx.beginPath();
            ctx.arc(px, f.topY - 6, 5.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#1e1e1e';
            ctx.beginPath();
            ctx.arc(px - 1, f.topY - 8, 2.5, 0, Math.PI * 2);
            ctx.fill();
            // Alahela
            ctx.fillStyle = '#151515';
            ctx.fillRect(px - 4, f.bottomRailY + 2, 8, 6);
        };
        drawGapPost(f.gapStart);
        drawGapPost(f.gapEnd);
    }

    /* ── Makuuhuone (ex-palkintohuone, talo 7) ────
       Lukko = 3 avainta (v4.33). Huoneessa on kaksi valintaa:
         Nuku   = vaihtaa päivä/yö-tilan (päivä → yö TAI yö → päivä)
         Poistu = ei muuta mitään
       Molemmat ovat ilmaisia. Sänky on piirretty sivusta (pääty, paksu patja,
       tyyny, peitto ja jalat), ja ikkunasta näkyy tämänhetkinen tila.

       SISÄLTÖ SOVITETAAN NÄKYVÄÄN IKKUNAAN (kuten jukebox v4.22): mobiilissa
       canvas on vain `viewW` (260–800) leveä ja kamera keskittää huoneen, joten
       kaikki sijoitetaan x = 400:n ympärille ja enintään `winW − 24` leveäksi.
       Koko piirto on save()/restore()-parin sisällä, ettei tila vuoda kadulle. */
    function drawSleepRoom() {
        const W = WORLD_W, H = WORLD_H;
        const now = Date.now();

        ctx.save();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'rgba(0,0,0,0)';
        ctx.textBaseline = 'alphabetic';

        /* Ikkunasovitus + fonttikoko (näytön skaala: kapea kännykkä zoomataan) */
        const winW   = Math.round(Math.min(WORLD_W, Math.max(VIEWW_MIN, viewW)));
        const wide   = winW >= 560;                 // sivuikkunalle jää tilaa
        const panelW = Math.max(196, winW - 24);
        const panelX = Math.round(400 - panelW / 2);
        const padX   = 12;
        const rowX   = panelX + padX;
        const rowW   = panelW - padX * 2;
        const vs = (canvas && canvas.height && canvas.clientHeight)
            ? canvas.clientHeight / canvas.height : 1;
        const vsafe = (vs > 0.25) ? vs : 1;
        const needPx = (target, base, max) =>
            Math.round(Math.max(base, Math.min(max, target / vsafe)));

        /* Pystyasettelu: paneeli ylhäällä, sänky alhaalla */
        const titleY  = 80;
        const stateY  = titleY + 22;
        const nameFs  = needPx(15, 12, 15);
        const rowH    = Math.max(18, Math.round(nameFs * 1.5));
        const rowGap  = 6;
        const listTop = stateY + 14;
        const listH   = 2 * (rowH + rowGap) - rowGap;
        const hintY   = listTop + listH + 18;
        const panelTop    = titleY - 26;
        const panelBottom = hintY + 10;

        // 1) Tausta: seinä (yöllä kylmä, päivällä lämmin) + lattia
        ctx.fillStyle = isDay ? '#241d2c' : '#07070f';
        ctx.fillRect(0, 0, W, H);
        const wall = ctx.createLinearGradient(0, 40, 0, GROUND_Y);
        if (isDay) {
            wall.addColorStop(0, '#3b3149');
            wall.addColorStop(1, '#4c4058');
        } else {
            wall.addColorStop(0, '#151326');
            wall.addColorStop(1, '#221f36');
        }
        ctx.fillStyle = wall;
        ctx.fillRect(40, 40, W - 80, GROUND_Y - 40);
        // Lattia + lautojen perspektiivi (sänky seisoo tällä)
        ctx.fillStyle = isDay ? '#2c2434' : '#0f0d18';
        ctx.fillRect(40, GROUND_Y, W - 80, H - GROUND_Y - 40);
        ctx.strokeStyle = isDay ? '#1d1722' : '#08070e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 8; i++) {
            const fx = 40 + i * (W - 80) / 8;
            ctx.moveTo(fx, GROUND_Y + 1);
            ctx.lineTo(fx + (fx - W / 2) * 0.16, H - 40);
        }
        ctx.stroke();

        // 2) Paneeli: otsikko + nykyinen tila + valinnat (yksi tumma laatta)
        ctx.fillStyle = '#0b0812';
        ctx.fillRect(panelX, panelTop, panelW, panelBottom - panelTop);
        ctx.strokeStyle = '#3a3348';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX + 0.5, panelTop + 0.5, panelW - 1, panelBottom - panelTop - 1);
        // Yläreunan sävy kertoo tilan: keltainen = päivä, sininen = yö
        ctx.fillStyle = isDay ? '#ffd070' : '#7c8ad8';
        ctx.fillRect(panelX, panelTop, panelW, 2);

        ctx.textAlign = 'center';
        ctx.font = needPx(16, 12, 16) + 'px "Press Start 2P", monospace';
        ctx.fillStyle = '#eae4f2';
        ctx.fillText('MAKUUHUONE', 400, titleY);

        ctx.font = 'bold ' + nameFs + 'px "Courier New", monospace';
        ctx.fillStyle = isDay ? '#ffdd88' : '#c8d8ff';
        ctx.fillText('Nyt: ' + (isDay ? '☀️ Päivä' : '🌙 Yö'), 400, stateY);

        /* 3) Valinnat: 0 = Nuku, 1 = Poistu
              ▲/▼ liikuttaa valintaa, ⚡ / Space / (o) vahvistaa */
        const rows = [
            { label: 'Nuku',   note: isDay ? '→ yö' : '→ päivä' },
            { label: 'Poistu', note: 'ei muuta tilaa' }
        ];
        for (let i = 0; i < rows.length; i++) {
            const y = listTop + i * (rowH + rowGap);
            const selected = (i === sleepSel);
            const bg     = selected ? '#ffd070' : '#171122';
            const border = selected ? '#fff3d0' : '#3a3348';
            const fg     = selected ? '#1c1400' : '#eae4f2';
            const dim    = selected ? '#5c4400' : '#948ca8';

            ctx.fillStyle = bg;
            ctx.fillRect(rowX, y, rowW, rowH);
            ctx.strokeStyle = border;
            ctx.lineWidth = 1;
            ctx.strokeRect(rowX + 0.5, y + 0.5, rowW - 1, rowH - 1);

            ctx.textBaseline = 'middle';
            const cy = Math.round(y + rowH / 2) + 1;
            ctx.textAlign = 'left';
            ctx.font = nameFs + 'px "Courier New", monospace';
            ctx.fillStyle = fg;
            ctx.fillText((selected ? '▶ ' : '   ') + rows[i].label, rowX + 8, cy);
            ctx.textAlign = 'right';
            ctx.fillStyle = dim;
            ctx.fillText(rows[i].note, rowX + rowW - 8, cy);
        }
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'center';
        ctx.font = Math.max(10, Math.min(nameFs - 1, 13)) + 'px Arial, sans-serif';
        ctx.fillStyle = '#e9e9ef';
        ctx.fillText('▲/▼ = valitse   ⚡/Space = vahvista', 400, hintY);
        ctx.textAlign = 'left';

        // 4) Sänky sivusta: pääty, paksu patja, tyyny, peitto ja jalat
        const bedW  = Math.min(340, panelW - 16);
        const bedL  = Math.round(400 - bedW / 2);
        const bedR  = bedL + bedW;
        const bedFoot = GROUND_Y - 2;              // 308 – jalkojen pohja
        const legH = 10, frameH = 12, mattH = 38;
        const legTop   = bedFoot - legH;           // 298
        const frameTop = legTop - frameH;          // 286
        const mattTop  = frameTop - mattH;         // 248
        const headTop  = mattTop - 34;             // 214 – päädyn yläreuna
        const headW    = 13;
        const pillowW  = Math.round(bedW * 0.24);

        // Jalat
        ctx.fillStyle = '#241812';
        ctx.fillRect(bedL + 16, legTop, 9, legH);
        ctx.fillRect(bedR - 27, legTop, 9, legH);

        // Runko (patjan alla)
        ctx.fillStyle = '#2e2019';
        ctx.fillRect(bedL + 4, frameTop, bedW - 8, frameH);
        ctx.fillStyle = '#3d2a1d';
        ctx.fillRect(bedL + 4, frameTop, bedW - 8, 3);

        // Pääty (vasemmassa reunassa)
        ctx.fillStyle = '#33241a';
        ctx.fillRect(bedL, headTop, headW, frameTop - headTop + 6);
        ctx.fillStyle = '#48321f';
        ctx.fillRect(bedL + 3, headTop + 6, 7, frameTop - headTop - 14);

        // Tyyny
        ctx.fillStyle = '#efe6d2';
        ctx.fillRect(bedL + 18, mattTop - 12, pillowW, 20);
        ctx.fillStyle = '#fbf5e6';
        ctx.fillRect(bedL + 18, mattTop - 12, pillowW, 3);
        ctx.fillStyle = '#d8ceb6';
        ctx.fillRect(bedL + 18, mattTop + 4, pillowW, 4);

        // Paksu patja (yläreuna, runko, keskiviiva, alavarjo)
        ctx.fillStyle = '#cfc6b2';
        ctx.fillRect(bedL + 8, mattTop, bedW - 16, mattH);
        ctx.fillStyle = '#e7dfcb';
        ctx.fillRect(bedL + 8, mattTop, bedW - 16, 5);
        ctx.fillStyle = '#b8af9b';
        ctx.fillRect(bedL + 8, mattTop + Math.round(mattH / 2), bedW - 16, 1);
        ctx.fillStyle = '#a89f8c';
        ctx.fillRect(bedL + 8, mattTop + mattH - 5, bedW - 16, 5);

        // Peitto (jalkopää peittyy, tyyny jää näkyviin)
        const blkL = bedL + 24 + pillowW;
        const blkR = bedR - 8;
        ctx.fillStyle = '#3b4c86';
        ctx.fillRect(blkL, mattTop - 6, blkR - blkL, mattH + 8);
        ctx.fillStyle = '#4d61a6';
        ctx.fillRect(blkL, mattTop - 6, blkR - blkL, 4);
        ctx.fillStyle = '#2f3c6c';
        ctx.fillRect(blkL, mattTop + 12, blkR - blkL, 2);
        ctx.fillRect(blkL, mattTop + 24, blkR - blkL, 2);

        // 5) Ikkuna (vain kun sille jää tilaa): näyttää tämänhetkisen tilan
        if (wide) {
            const wx = 626, wy = 204, ww = 92, wh = 72;
            ctx.fillStyle = '#241d2e';
            ctx.fillRect(wx - 4, wy - 4, ww + 8, wh + 8);
            const sky = ctx.createLinearGradient(0, wy, 0, wy + wh);
            if (isDay) { sky.addColorStop(0, '#4b8fd0'); sky.addColorStop(1, '#a8d4f0'); }
            else       { sky.addColorStop(0, '#0a1030'); sky.addColorStop(1, '#1b2352'); }
            ctx.fillStyle = sky;
            ctx.fillRect(wx, wy, ww, wh);

            if (isDay) {
                // Aurinko: tasainen keltainen kiekko (ei valkoista palloa keskellä)
                ctx.fillStyle = '#ffe066';
                ctx.beginPath(); ctx.arc(wx + ww * 0.7, wy + wh * 0.34, 11, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = 'rgba(255,224,120,0.85)';
                ctx.lineWidth = 1;
                for (let i = 0; i < 8; i++) {
                    const a = i * Math.PI / 4 + 0.3;
                    ctx.beginPath();
                    ctx.moveTo(wx + ww * 0.7 + Math.cos(a) * 15, wy + wh * 0.34 + Math.sin(a) * 15);
                    ctx.lineTo(wx + ww * 0.7 + Math.cos(a) * 20, wy + wh * 0.34 + Math.sin(a) * 20);
                    ctx.stroke();
                }
            } else {
                // Sirppikuu + pari tähteä
                ctx.fillStyle = '#fff8cc';
                ctx.beginPath(); ctx.arc(wx + ww * 0.7, wy + wh * 0.34, 11, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#0a1030';
                ctx.beginPath(); ctx.arc(wx + ww * 0.7 + 5, wy + wh * 0.34 - 1, 9, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(wx + 12, wy + 14, 2, 2);
                ctx.fillRect(wx + 27, wy + 24, 2, 2);
                ctx.fillRect(wx + 16, wy + 50, 2, 2);
            }

            // Ikkunaristikko + verhojen varjot reunoissa
            ctx.strokeStyle = '#2b2438';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
            ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2);
            ctx.stroke();
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.fillRect(wx, wy, 5, wh);
            ctx.fillRect(wx + ww - 5, wy, 5, wh);
        }

        // 6) Nukkumisen pimennys: ruutu tummuu mustaksi ~0,75 s aikana
        //    (SLEEP_DARK_FRAMES), minkä jälkeen itse "Zzz…"-efekti näkyy ~3 s
        //    (SLEEP_ZZZ_FRAMES) – yhteensä ~3,75 s. Tila vaihtuu vasta lopussa.
        //    HUOM: pimennys lasketaan KULUNEESTA ajasta (ei jäljellä olevasta),
        //    muuten musta kerros ja Zzz ehtivät mukaan vasta aivan lopussa.
        if (sleepPhase > 0) {
            const elapsed = SLEEP_FADE_FRAMES - sleepPhase;              // kulunut aika
            const fade = Math.max(0, Math.min(1, elapsed / SLEEP_DARK_FRAMES));
            ctx.fillStyle = 'rgba(0,0,0,' + fade.toFixed(3) + ')';
            ctx.fillRect(0, 0, W, H);
            if (fade > 0.05) {
                ctx.globalAlpha = fade;          // Zzz himmenee sisään pimennyksen mukana
                ctx.textAlign = 'center';
                ctx.font = 'bold ' + needPx(20, 16, 22) + 'px "Courier New", monospace';
                ctx.fillStyle = '#ffe9a8';
                ctx.fillText('Zzz…', 400, 250 + Math.round(Math.sin(now / 300) * 3));
                ctx.textAlign = 'left';
                ctx.globalAlpha = 1;
            }
        }

        ctx.restore();
    }

    /* ── Jukebox-huone (talo 5) ────────────────────
       Valinta: 0 = ei valintaa (ei veloitusta), 1..N = kappale (1 kolikko,
       soi kokonaan loppuun). HUOM: jukebox ei muuta peliääniä mitenkään.

       SELKEYS (v4.22): kaikki tekstit piirretään terävinä (ei
       shadowBlur-sumennusta eikä läpinäkyvää tekstiä) ja koko asettelu
       sovitetaan siihen ikkunaan, joka ruudulla oikeasti näkyy. Mobiilissa
       canvas on vain `viewW` leveä ja kamera keskittää huoneen (camX), joten
       kiinteä 800 px:n asettelu (tekstit x 62…) jäi kankaan ulkopuolelle –
       kapealla kännykällä näkyi vain listan keskikohta. Sisältö on nyt
       keskitetty x = 400:n ympärille ja enintään `winW − 24` leveäksi. */
    function drawJukeboxRoom() {
        const W = WORLD_W, H = WORLD_H;
        const now = Date.now();
        const playing = StreetAudio.isJukeboxPlaying();
        const trackCount = JUKEBOX_TRACKS.length;

        ctx.save();
        // Ei pehmennystä: nollataan kadulta mahdollisesti periytynyt hehku
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'rgba(0,0,0,0)';
        ctx.textBaseline = 'alphabetic';

        /* Sovitus näkyvään ikkunaan (ks. selitys yllä) */
        const winW = Math.round(Math.min(WORLD_W, Math.max(VIEWW_MIN, viewW)));
        const wide = winW >= 620;                 // jukebox-kaappi mahtuu viereen
        const CAB_W = 176, CAB_GAP = 26, PANEL_MAX = 520;
        const panelW = Math.round(wide
            ? Math.min(PANEL_MAX, winW - CAB_W - CAB_GAP - 26)
            : Math.max(196, winW - 24));
        const panelX = Math.round(400 - (wide ? panelW + CAB_GAP + CAB_W : panelW) / 2);
        const padX = 12;
        const rowX = panelX + padX;
        const rowW = panelW - padX * 2;

        /* Näytön skaala (canvas CSS-px / puskurin px): kapea kännykkä
           zoomataan 1:1:tä suuremmaksi → fontin maailmakoko voi olla
           pienempi ja näkyä silti isona. `needPx` valitsee fontin
           maailmakoon niin, että ruudulla näkyy vähintään `target` px. */
        const vs = (canvas && canvas.height && canvas.clientHeight)
            ? canvas.clientHeight / canvas.height : 1;
        const vsafe = (vs > 0.25) ? vs : 1;
        const needPx = (target, base, max) =>
            Math.round(Math.max(base, Math.min(max, target / vsafe)));

        /* Sarakeleveydet paneelin leveydestä; pisin kappalenimi on 25 merkkiä
           → fonttikoko ei koskaan ylitä nimen saraketta */
        const numW     = Math.max(20, Math.round(rowW * 0.055));
        const priceW   = Math.max(46, Math.round(rowW * 0.14));
        const nameMaxW = rowW - numW - priceW - 16;
        const nameFs = Math.max(9, Math.min(needPx(16, 13, 16),
                             Math.floor(nameMaxW / (0.62 * 25))));

        /* Pystyasettelu */
        const titleY   = 82;
        const stacked  = panelW < 470;            // kolikkosaldo omalle rivilleen
        const balY     = stacked ? titleY + 22 : titleY;
        const listTop  = stacked ? balY + 20 : titleY + 22;
        const rowGap   = 6;
        const rowH     = Math.max(18, Math.round(nameFs * 1.9));
        const listH    = (trackCount + 1) * (rowH + rowGap) - rowGap;

        /* Tilatekstit: yksi rivi = yksi fillText, jotta rivi ei koskaan
           katkea keskeltä (luettavuus + testit nojaavat kokonaisiin riveihin) */
        const info = [];
        if (playing) {
            const t = (jukeTrack > 0) ? JUKEBOX_TRACKS[jukeTrack - 1].title : '';
            info.push({ text: '🔊 SOI NYT: ' + t, color: '#ffdd88' });
            info.push({ text: 'Soi loppuun asti – valinta lukossa', color: '#c9a95f' });
        } else if (jukeSel > 0) {
            info.push({ text: 'Valinta: ' + jukeSel + ' – ' + JUKEBOX_TRACKS[jukeSel - 1].title,
                        color: '#ffffff' });
            if (coinCount > 0) {
                info.push({ text: 'Poistu (⚡/Space) = soita (1 🪙)', color: '#8ce88c' });
            } else {
                info.push({ text: '💰 Ei kolikoita!', color: '#ff8080' });
            }
        } else {
            info.push({ text: 'Ei valintaa – poistuminen ei maksa mitään', color: '#d8d2e2' });
        }
        const infoFs     = Math.max(9, Math.min(nameFs - 2, 15));
        const infoLineH  = infoFs + 4;
        const infoTop    = listTop + listH + 10;
        const infoH      = info.length * infoLineH + 10;
        const infoBottom = infoTop + infoH;

        /* Yksi yhtenäinen tumma paneeli koko sisällölle = paras kontrasti
           (ei läpinäkyvyyttä eikä seinän kohinaa tekstin alla) */
        const panelTop    = titleY - 24;
        const panelBottom = infoBottom + 8;

        /* Fontin asetus + koon sovitus: asettaa `ctx.font`in ja palauttaa
           käytetyn koon, jolla teksti mahtuu enintään maxW:iin (≥ minFs) */
        const setFitFont = (text, maxW, baseFs, minFs, family) => {
            ctx.font = baseFs + 'px ' + family;
            const w = ctx.measureText(text).width;
            let fs = baseFs;
            if (w > maxW) fs = Math.max(minFs, Math.floor(baseFs * maxW / w));
            ctx.font = fs + 'px ' + family;
            return fs;
        };

        // 1) Tausta + lämminvioletti seinä
        ctx.fillStyle = '#08060e';
        ctx.fillRect(0, 0, W, H);
        const wall = ctx.createLinearGradient(0, 50, 0, GROUND_Y);
        wall.addColorStop(0, '#1c1122');
        wall.addColorStop(1, '#2b1a2e');
        ctx.fillStyle = wall;
        ctx.fillRect(40, 50, W - 80, GROUND_Y - 50);
        // Lattia + lautojen perspektiivi
        ctx.fillStyle = '#120d16';
        ctx.fillRect(40, GROUND_Y, W - 80, H - GROUND_Y - 40);
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.fillRect(40, GROUND_Y, W - 80, 1);
        ctx.strokeStyle = 'rgba(0,0,0,0.35)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= 8; i++) {
            const fx = 40 + i * (W - 80) / 8;
            ctx.moveTo(fx, GROUND_Y + 1);
            ctx.lineTo(fx + (fx - W / 2) * 0.16, H - 40);
        }
        ctx.stroke();

        // 2) Paneeli: yksi tumma laatta listalle ja tilateksteille
        ctx.fillStyle = '#0b0710';
        ctx.fillRect(panelX, panelTop, panelW, panelBottom - panelTop);
        ctx.strokeStyle = '#3a3348';
        ctx.lineWidth = 1;
        ctx.strokeRect(panelX + 0.5, panelTop + 0.5, panelW - 1, panelBottom - panelTop - 1);
        // Ohut neonreuna (terävä viiva, ei hehkua)
        ctx.fillStyle = '#ff4f96';
        ctx.fillRect(panelX, panelTop, panelW, 2);

        // 3) Otsikko + kolikkosaldo (yksiväriset, ei hehkua)
        ctx.textAlign = 'left';
        setFitFont('♪ JUKEBOX', stacked ? rowW : Math.round(rowW * 0.5),
                   needPx(16, 12, 16), 10, '"Press Start 2P", monospace');
        ctx.fillStyle = '#ff4f96';
        ctx.fillText('♪ JUKEBOX', rowX, titleY);

        const balText = '💰 Kolikoita: ' + coinCount;
        setFitFont(balText, rowW * (stacked ? 1 : 0.5),
                   Math.max(11, Math.min(nameFs, 14)), 10, '"Courier New", monospace');
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = stacked ? 'left' : 'right';
        ctx.fillText(balText, stacked ? rowX : rowX + rowW, balY);

        // 4) Kappalelista: rivi 0 = ei valintaa, rivit 1..N = kappaleet
        for (let i = 0; i <= trackCount; i++) {
            const y = listTop + i * (rowH + rowGap);
            const selected = (i === jukeSel);
            const playingRow = playing && i > 0 && i === jukeTrack;
            // Tausta: valittu = kirkas pinkki (tumma teksti), soitossa = kulta
            const bg     = selected ? '#ff3d7f' : (playingRow ? '#2b2410' : '#171122');
            const border = selected ? '#ffd0e2' : (playingRow ? '#ffdd88' : '#3a3348');
            const fg     = selected ? '#1c000a' : (playingRow ? '#ffe9a8' : '#eae4f2');
            const dim    = selected ? '#5c1230' : (playingRow ? '#c9a95f' : '#948ca8');

            ctx.fillStyle = bg;
            ctx.fillRect(rowX, y, rowW, rowH);
            ctx.strokeStyle = border;
            ctx.lineWidth = 1;
            ctx.strokeRect(rowX + 0.5, y + 0.5, rowW - 1, rowH - 1);

            ctx.textBaseline = 'middle';
            const cy = Math.round(y + rowH / 2) + 1;
            const sideFs = Math.max(11, nameFs - 1);

            // Numero
            ctx.textAlign = 'left';
            ctx.fillStyle = fg;
            ctx.font = Math.max(8, Math.min(10, Math.round(nameFs * 0.62))) +
                       'px "Press Start 2P", monospace';
            ctx.fillText(String(i), rowX + 10, cy);

            // Kappaleen nimi (leikataan vain jos ei mahdu sarakkeeseen)
            let trackName = (i === 0) ? 'ei valintaa' : JUKEBOX_TRACKS[i - 1].title;
            ctx.font = nameFs + 'px "Courier New", monospace';
            while (trackName.length > 4 && ctx.measureText(trackName).width > nameMaxW) {
                trackName = trackName.slice(0, -2) + '…';
            }
            ctx.fillStyle = fg;
            ctx.fillText(trackName, rowX + 10 + numW, cy);

            // Oikea reuna: soitossa ♪ SOI, kappaleilla hinta, rivillä 0 viiva
            ctx.textAlign = 'right';
            if (playingRow) {
                ctx.font = 'bold ' + sideFs + 'px "Courier New", monospace';
                ctx.fillStyle = selected ? fg : '#ffdd88';
                ctx.fillText('♪ SOI', rowX + rowW - 10, cy);
            } else if (i > 0) {
                ctx.font = sideFs + 'px "Courier New", monospace';
                ctx.fillStyle = selected ? fg : '#ffd700';
                ctx.fillText('1 🪙', rowX + rowW - 10, cy);
            } else {
                ctx.font = sideFs + 'px "Courier New", monospace';
                ctx.fillStyle = dim;
                ctx.fillText('–', rowX + rowW - 10, cy);
            }
        }
        ctx.textBaseline = 'alphabetic';
        // 5) Tilatekstit omassa laatikossaan (yksivärinen, ei läpinäkyvyyttä)
        ctx.fillStyle = '#16101f';
        ctx.fillRect(rowX, infoTop, rowW, infoH);
        ctx.strokeStyle = '#4a4160';
        ctx.lineWidth = 1;
        ctx.strokeRect(rowX + 0.5, infoTop + 0.5, rowW - 1, infoH - 1);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < info.length; i++) {
            const it = info[i];
            setFitFont(it.text, rowW - 16, infoFs, 9, '"Courier New", monospace');
            ctx.fillStyle = it.color;
            ctx.fillText(it.text, 400, Math.round(infoTop + infoH / 2 +
                         (i - (info.length - 1) / 2) * infoLineH));
        }
        ctx.textBaseline = 'alphabetic';

        // 6) Jukebox-kone oikealla – vain kun sille jää tilaa (ei peitä listaa)
        if (wide) {
            drawJukeboxCabinet(panelX + panelW + CAB_GAP, GROUND_Y + 4, now, playing, jukeSel > 0);
        }

        // 7) Alaohje (kiinteä ja terävä – ei vilkkumista)
        ctx.textAlign = 'center';
        setFitFont('▲/▼ = valitse   POISTU: (o) / Space', winW - 16, 12, 10, 'Arial, sans-serif');
        ctx.fillStyle = '#e9e9ef';
        ctx.fillText('▲/▼ = valitse   POISTU: (o) / Space', 400, 380);
        ctx.textAlign = 'left';

        ctx.restore();
    }

    /* Jukebox-kone: Wurlitzer-henkinen kaappi (proseduraalinen, ei kuvatiedostoja) */
    function drawJukeboxCabinet(x, baseY, now, playing, armed) {
        const w = 176, h = 210;
        const top = baseY - h;
        const cx = x + w / 2;

        // Varjo lattialla
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath();
        ctx.ellipse(cx, baseY + 2, w * 0.5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Runko: tumma puu/metal, kaareva huippu
        const body = ctx.createLinearGradient(x, 0, x + w, 0);
        body.addColorStop(0, '#20120c');
        body.addColorStop(0.35, '#5a3a22');
        body.addColorStop(0.7, '#3a2418');
        body.addColorStop(1, '#20120c');
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(x, baseY);
        ctx.lineTo(x, top + 46);
        ctx.quadraticCurveTo(x, top, cx, top);
        ctx.quadraticCurveTo(x + w, top, x + w, top + 46);
        ctx.lineTo(x + w, baseY);
        ctx.closePath();
        ctx.fill();

        // Neonkaari: vuorotellen pinkki ja keltainen, hidas pulssi
        const segs = 9;
        const pulse = (Math.sin(now / 260) + 1) / 2;
        ctx.lineWidth = 5;
        for (let i = 0; i < segs; i++) {
            const a0 = Math.PI + (i / segs) * Math.PI;
            const a1 = Math.PI + ((i + 1) / segs) * Math.PI;
            if (i % 2 === 0) {
                ctx.strokeStyle = 'rgba(255,0,85,' + (0.5 + pulse * 0.45).toFixed(2) + ')';
                ctx.shadowColor = '#FF0055';
            } else {
                ctx.strokeStyle = 'rgba(255,221,136,' + (0.45 + (1 - pulse) * 0.45).toFixed(2) + ')';
                ctx.shadowColor = '#ffdd88';
            }
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.ellipse(cx, top + 46, w * 0.44, 40, 0, a0, a1);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Kromirivat kaaren alta alas
        for (let i = 1; i < 7; i++) {
            const rx = x + (w * i) / 7;
            const g = ctx.createLinearGradient(rx - 2, 0, rx + 2, 0);
            g.addColorStop(0, 'rgba(255,255,255,0.04)');
            g.addColorStop(0.5, 'rgba(255,255,255,0.3)');
            g.addColorStop(1, 'rgba(0,0,0,0.3)');
            ctx.fillStyle = g;
            ctx.fillRect(rx - 2, top + 62, 4, baseY - top - 64);
        }

        // Levypesä + levy (pyörii kun kappale soi)
        const recY = top + 80, recR = 28;
        ctx.fillStyle = '#0d0a10';
        ctx.beginPath(); ctx.arc(cx, recY, recR + 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#171320';
        ctx.beginPath(); ctx.arc(cx, recY, recR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        for (let r = 9; r < recR - 3; r += 3) { ctx.beginPath(); ctx.arc(cx, recY, r, 0, Math.PI * 2); ctx.stroke(); }
        ctx.fillStyle = '#ffdd88';
        ctx.beginPath(); ctx.arc(cx, recY, 3, 0, Math.PI * 2); ctx.fill();
        if (playing) {
            const spin = (now / 300) % (Math.PI * 2);
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.fillRect(cx + Math.cos(spin) * 18 - 1, recY + Math.sin(spin) * 18 - 1, 2, 2);
        }

        // Kaiutinritilä alaosassa
        for (let gy = baseY - 30; gy < baseY - 8; gy += 5) {
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.fillRect(x + 16, gy, w - 32, 2);
        }

        // Kolikkoluukku + hinta (terävä: yksivärinen teksti, ei läpinäkyvyyttä)
        const slotW = 46, slotH = 14;
        const sx = x + w - slotW - 12, sy = top + 62;
        ctx.fillStyle = '#2b2b34';
        ctx.fillRect(sx, sy, slotW, slotH);
        ctx.strokeStyle = armed ? '#FFD700' : '#8a7a2a';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 0.5, sy + 0.5, slotW - 1, slotH - 1);
        ctx.fillStyle = armed ? '#FFD700' : '#c8a000';
        ctx.font = '10px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1 🪙', sx + slotW / 2, sy + 10);
        ctx.textAlign = 'start';

        // Jalusta
        ctx.fillStyle = '#170d08';
        ctx.fillRect(x + 6, baseY - 8, w - 12, 8);
    }

    /* ── BAR-huoneen seinätaulu (äitihahmo, kuva) ─────────────
       Kuva ladataan kerran. Jos se ei ole vielä valmis (tai lataus
       epäonnistuu), kehyksen sisään piirretään tumma varapinta → asettelu
       pysyy samana eikä piirto kaadu. `typeof Image` -tarkistus pitää
       headless-validonnat (Node-stub) toiminnassa. */
    const BAR_PIC_SRC = 'assets/justiina.png';
    const barPic = (typeof Image === 'function') ? new Image() : null;
    let barPicReady = false;
    if (barPic) {
        barPic.onload  = () => { barPicReady = true; };
        barPic.onerror = () => { barPicReady = false; };
        barPic.src = BAR_PIC_SRC;
    }

    /* ── BAR-huone (talo 8) ────────────────────── */
    function drawBarRoom() {
        // Täysin pimeä tausta
        ctx.fillStyle = '#100808';
        ctx.fillRect(0, 0, WORLD_W, WORLD_H);

        // Seinä – lämmin sävy
        const ga = ctx.createLinearGradient(0, 0, 0, WORLD_H);
        ga.addColorStop(0, '#1a1210');
        ga.addColorStop(1, '#252015');
        ctx.fillStyle = ga;
        ctx.fillRect(60, 60, WORLD_W - 120, WORLD_H - 120);

        // Pöytä
        const tw = 200, th = 14;
        const tx = (WORLD_W - tw) / 2, ty = GROUND_Y - 50;
        ctx.fillStyle = '#4a3520';
        ctx.fillRect(tx, ty, tw, th);
        ctx.fillStyle = '#5a4530';
        ctx.fillRect(tx + 4, ty - 2, tw - 8, 4);
        ctx.fillStyle = '#3a2510';
        ctx.fillRect(tx + 10, ty + th, 10, 50);
        ctx.fillRect(tx + tw - 20, ty + th, 10, 50);

        /* Iso hampurilainen – pöydän pinnalla, skaalattu 2/3:een (v4.25).
           Skaalaus tehdään pöydän pinnan keskipisteestä (bx, ty), joten
           hampurilaisen alaosa pysyy tarkalleen pöydän pinnassa. */
        const BURGER_SCALE = 2 / 3;
        const BURGER_H = 68;                 // alkuperäinen korkeus (by−26 … by+42)
        const bx = tx + tw / 2, by = ty - 42;
        const burgerTop = ty - BURGER_H * BURGER_SCALE;

        ctx.save();
        ctx.translate(bx, ty);
        ctx.scale(BURGER_SCALE, BURGER_SCALE);
        ctx.translate(-bx, -ty);

        // Alapulla
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(bx, by + 28, 40, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.ellipse(bx, by + 25, 38, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pihvi
        ctx.fillStyle = '#4a2010';
        ctx.fillRect(bx - 36, by + 13, 72, 18);
        ctx.fillStyle = '#3a1810';
        ctx.fillRect(bx - 33, by + 16, 66, 12);
        ctx.fillStyle = '#5a3020';
        ctx.beginPath();
        ctx.ellipse(bx, by + 13, 37, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Juusto
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(bx - 34, by + 8);
        ctx.lineTo(bx - 10, by - 2);
        ctx.lineTo(bx + 10, by + 8);
        ctx.lineTo(bx + 34, by + 8);
        ctx.lineTo(bx + 20, by + 13);
        ctx.lineTo(bx - 20, by + 13);
        ctx.closePath();
        ctx.fill();

        // Salaatti
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.moveTo(bx - 34, by);
        for (let i = 0; i < 12; i++) {
            const sx = bx - 34 + i * 5.8;
            const sy = by + Math.sin(i * 0.8) * 3;
            ctx.lineTo(sx, sy);
        }
        ctx.lineTo(bx + 34, by + 5);
        ctx.lineTo(bx - 34, by + 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#388E3C';
        ctx.beginPath();
        ctx.moveTo(bx - 34, by);
        for (let i = 0; i < 12; i++) {
            const sx = bx - 34 + i * 5.8;
            const sy = by + Math.sin(i * 0.8) * 3;
            ctx.lineTo(sx, sy + 1);
        }
        ctx.lineTo(bx + 34, by + 6);
        ctx.lineTo(bx - 34, by + 2);
        ctx.closePath();
        ctx.fill();

        // Ylapulla
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.ellipse(bx, by - 8, 38, 18, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.ellipse(bx, by - 10, 40, 16, 0, Math.PI, 0);
        ctx.fill();

        // Seesaminsiemenet
        ctx.fillStyle = '#F5DEB3';
        var seeds = [[-12, -16], [5, -19], [18, -14], [-20, -10], [25, -8],
            [-8, -6], [0, -5], [15, -6], [-16, -5], [10, -10]];
        for (var si = 0; si < seeds.length; si++) {
            ctx.fillRect(bx + seeds[si][0], by + seeds[si][1], 3, 3);
        }

        // Hoyry
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 1.5;
        var steamT = Date.now() / 600;
        for (var si2 = 0; si2 < 3; si2++) {
            var sx2 = bx - 15 + si2 * 15;
            var sy2 = by - 30 + Math.sin(steamT + si2 * 2.1) * 8;
            ctx.beginPath();
            ctx.moveTo(sx2, sy2);
            ctx.quadraticCurveTo(sx2 + 4, sy2 - 10, sx2 + 8, sy2 - 3);
            ctx.stroke();
        }

        ctx.restore();   // hampurilaisen skaalaus päättyy

        /* ── Asettelu: taulu + äidin lappu + ostotilanne ────────────────
           Kaikki mitoitetaan siitä ikkunasta, joka ruudulla oikeasti näkyy
           (kuten jukebox-huoneessa v4.22): mobiilissa canvas on vain `viewW`
           leveä ja kamera keskittää huoneen (camX), joten kiinteä 800 px:n
           asettelu jäisi kankaan ulkopuolelle. Fonttikoko valitaan näytön
           skaalan mukaan (`needPx`) → tekstit pysyvät luettavina myös
           puhelimen vaakanäytössä. Sisältö mahtuu aina seinän yläreunan
           (y = 60) ja ostorivin väliin eikä mikään osu hampurilaiseen. */
        const winW = Math.round(Math.min(WORLD_W, Math.max(VIEWW_MIN, viewW)));
        const vs = (canvas && canvas.height && canvas.clientHeight)
            ? canvas.clientHeight / canvas.height : 1;
        const vsafe = (vs > 0.25) ? vs : 1;
        const needPx = (target, base, max) =>
            Math.round(Math.max(base, Math.min(max, target / vsafe)));

        /* Suurin fonttikoko, jolla kaikki `rows`-rivit mahtuvat maxW:iin */
        const fitFs = (rows, weight, baseFs, minFs, family, maxW) => {
            let w = 0;
            ctx.font = weight + ' ' + baseFs + 'px ' + family;
            for (let i = 0; i < rows.length; i++) {
                w = Math.max(w, ctx.measureText(rows[i]).width);
            }
            if (w <= maxW) return baseFs;
            return Math.max(minFs, Math.floor(baseFs * maxW / w));
        };

        /* Äidin lappu – 3 riviä (varoitus hampurilaisten kulutuksesta) */
        const hintLines = [
            'SEURAA HAMPURILAISTEN KULUTUSTA',
            'MUISTA SYÖDÄ VILLE!',
            'Tv. Äiti'
        ];
        const boxPad = 36;                    // laatikon sisämarginaali
        const hintFs = fitFs(hintLines, 'bold', needPx(12, 10, 12), 8,
                             '"Courier New", monospace', winW - 28 - boxPad);
        ctx.font = 'bold ' + hintFs + 'px "Courier New", monospace';
        let maxHintW = 0;
        for (let m = 0; m < hintLines.length; m++) {
            maxHintW = Math.max(maxHintW, ctx.measureText(hintLines[m]).width);
        }
        const hintBoxW = Math.ceil(maxHintW + boxPad);
        const hintLineH = hintFs + 3;
        const hintBoxH = hintLineH * 3 + 6;

        /* Ostotilanteen rivi – fontti pisimmän vaihtoehdon mukaan */
        const infoRows = [
            'Ostit ' + Math.max(barBuyQty, 1) + 'x🍔 hampurilaista!',
            '🍔 Hampurilaiskiintiö täynnä Osta jotain muuta!.',
            '🍔 Ei kolikoita. Hommaa massia!'
        ];
        const infoFs = fitFs(infoRows, 'normal', needPx(15, 13, 15), 8,
                             '"Courier New", monospace', winW - 24);
        const infoBaseline = Math.round(burgerTop - 8);

        /* Sijoitus alhaalta ylös: ostorivi (hampurilaisen yläpuolella),
           sen alla äidin lappu ja ylimpänä pieni seinätaulu ohuissa
           mustissa kehyksissä. Taulu on kiinteän kokoinen (ei täytä koko
           seinää) ja keskitetään seinän yläreunan ja lapun väliin. */
        const infoTop = infoBaseline - infoFs;
        const noteX = Math.round(400 - hintBoxW / 2);
        const noteY = Math.round(infoTop - 4 - hintBoxH);
        const PIC_PAD = 2;                    // mustan kehyksen paksuus
        const PIC_TOP = 60;                   // seinä alkaa y = 60
        const PIC_MAX_IMG_H = 48;             // kuvan maksimikorkeus (pieni taulu)
        const picAspect = (barPicReady && barPic.naturalHeight > 0)
            ? barPic.naturalWidth / barPic.naturalHeight : 315 / 261;
        const picBand = noteY - 6 - PIC_TOP;  // vapaa seinätila taululle
        let picImgH = Math.min(PIC_MAX_IMG_H, picBand - PIC_PAD * 2);
        let picImgW = picImgH * picAspect;
        const picMaxW = winW - 24;            // kapea ikkuna: ei reunojen yli
        if (picImgW + PIC_PAD * 2 > picMaxW) {
            picImgW = picMaxW - PIC_PAD * 2;
            picImgH = picImgW / picAspect;
        }
        const picFrameW = picImgW + PIC_PAD * 2;
        const picFrameH = picImgH + PIC_PAD * 2;
        const picX = Math.round(400 - picFrameW / 2);
        const picY = Math.round(PIC_TOP + (picBand - picFrameH) / 2);

        /* Taulun varjo seinälle, musta kehys ja kuva
           (varakuva, jos kuva ei ole vielä latautunut) */
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(picX + 3, picY + 4, picFrameW, picFrameH);
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(picX, picY, picFrameW, picFrameH);
        if (barPicReady) {
            ctx.imageSmoothingEnabled = true; // valokuva → pehmennetty skaalaus
            ctx.drawImage(barPic, picX + PIC_PAD, picY + PIC_PAD, picImgW, picImgH);
            ctx.imageSmoothingEnabled = false;
        } else {
            const pg = ctx.createLinearGradient(0, picY, 0, picY + picImgH);
            pg.addColorStop(0, '#242424');
            pg.addColorStop(1, '#0e0e0e');
            ctx.fillStyle = pg;
            ctx.fillRect(picX + PIC_PAD, picY + PIC_PAD, picImgW, picImgH);
        }

        /* Äidin lappu (keltaiset raamit) – taulun alla */
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(15, 8, 4, 0.9)';
        ctx.strokeStyle = '#ffcc44';
        ctx.lineWidth = 2;
        ctx.fillRect(noteX, noteY, hintBoxW, hintBoxH);
        ctx.strokeRect(noteX, noteY, hintBoxW, hintBoxH);
        ctx.font = 'bold ' + hintFs + 'px "Courier New", monospace';
        for (let hi = 0; hi < hintLines.length; hi++) {
            ctx.fillStyle = (hi === 2) ? '#ff6644' : '#ffdd88';
            ctx.fillText(hintLines[hi], noteX + hintBoxW / 2,
                         noteY + hintLineH * (hi + 1) + 1);
        }

        // Info-tekstit – ostomäärä = tämän vierailun ostot (▼ pienentää sitä)
        ctx.fillStyle = '#eeddcc';
        ctx.font = 'normal ' + infoFs + 'px "Courier New", monospace';
        ctx.textAlign = 'center';
        if (barBuyQty > 0) {
            ctx.fillText('Ostit ' + barBuyQty + 'x🍔 hampurilaista!', 400, infoBaseline);
        } else if (hamburgerCount >= 10) {
            ctx.fillText('🍔 Hampurilaiskiintiö täynnä Osta jotain muuta!.', 400, infoBaseline);
        } else if (coinCount <= 0) {
            ctx.fillText('🍔 Ei kolikoita. Hommaa massia!', 400, infoBaseline);
        }

        // Ohjevihje: ▲ osta / ▼ peru / (o) poistu
        var pulse = Math.sin(Date.now() / 800) * 0.3 + 0.7;
        ctx.fillStyle = 'rgba(255,255,255,' + pulse + ')';
        var exitRow = '▲ = osta 1 🍔   ▼ = peru 1   POISTU: (o) / Space';
        ctx.font = Math.max(8, fitFs([exitRow], 'normal', 10, 8, 'Arial, sans-serif',
                                     winW - 24)) + 'px Arial, sans-serif';
        ctx.fillText(exitRow, 400, 370);
        ctx.textAlign = 'start';
    }

/* ── Lampputolppa ─────────────────────────────── */
    function drawLampPost(lamp) {
        const bx = lamp.x;                    // tolpan juuri (x)
        const by = GROUND_Y + 15;              // tolpan juuri (y = maanpinta + 15px alempana)
        const poleTop = by - LAMP_POST_H + 15; // tolpan yläpää
        const bulbY = poleTop - 8;             // lampun kupu (lähempänä tolppaa)
        // Päivällä hehku himmenee (LAMP_DAY_DIM). HUOM: lamp.lit ei muutu
        // mihinkään → ovet, pelit ja makuuhuone aukeavat kuten ennenkin.
        const dayDim = 1 - LAMP_DAY_DIM * dayT;
// Ylikuumentuneen lampun punainen hehku + savu
        if (lamp.overheat) {
            const flicker = Math.sin(Date.now() * 0.02) * 0.4 + 0.6;
            const g = ctx.createRadialGradient(bx, bulbY + 10, 3, bx, bulbY + 10, 50);
            g.addColorStop(0, 'rgba(255,80,20,' + (0.25 * flicker) + ')');
            g.addColorStop(0.5, 'rgba(255,40,0,' + (0.06 * flicker) + ')');
            g.addColorStop(1, 'rgba(255,20,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(bx, bulbY + 10, 50, 0, Math.PI*2); ctx.fill();

            // Savupilvi
            const smokeAlpha = 0.15 + flicker * 0.2;
            ctx.fillStyle = 'rgba(80,80,80,' + smokeAlpha + ')';
            ctx.beginPath();
            const smokeY = bulbY - 8 - Math.sin(Date.now() * 0.015) * 6;
            ctx.arc(bx - 4, smokeY, 6, 0, Math.PI*2); ctx.fill();
            ctx.arc(bx + 4, smokeY - 2, 5, 0, Math.PI*2); ctx.fill();
            ctx.arc(bx, smokeY - 4, 7, 0, Math.PI*2); ctx.fill();
        }

        // Valokeila (jos palaa) – himmenee päivällä
        if (lamp.lit && dayDim > 0.01) {
            const g = ctx.createRadialGradient(bx, bulbY + 10, 4, bx, bulbY + 10, 90);
            g.addColorStop(0, 'rgba(255,240,150,' + (0.7 * dayDim).toFixed(3) + ')');
            g.addColorStop(0.5, 'rgba(255,200,50,' + (0.15 * dayDim).toFixed(3) + ')');
            g.addColorStop(1, 'rgba(255,200,50,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(bx, bulbY + 10, 90, 0, Math.PI*2); ctx.fill();
        }

        // Tolpan varsi (puinen/rautainen) – keskeltä vaalea, reunoilta tumma = pyöreä sylinteriefekti
        const poleGrad = ctx.createLinearGradient(bx - 3, 0, bx + 3, 0);
        poleGrad.addColorStop(0,   '#33230f');  // vasen reuna (tumma)
        poleGrad.addColorStop(0.5, '#6f5230');  // keskusta (vaalea)
        poleGrad.addColorStop(1,   '#241708');  // oikea reuna (tummin)
        ctx.fillStyle = poleGrad;
        ctx.fillRect(bx - 3, poleTop, 6, by - poleTop);

        // Tolpan jalusta – katukivetyksen rasteri (vaihtelevat sävyt + saumat)
        const baseL = parseInt((lamp.baseShade || 'hsl(0,0%,50%)').match(/(\d+)%/)[1], 10);
        const baseX = bx - 7, baseY = by - 6, baseW = 14, baseH = 6;
        // Saumatausta (mortar) – tumma, erottaa kivet
        ctx.fillStyle = 'hsl(0,0%,' + Math.max(10, baseL - 24) + '%)';
        ctx.fillRect(baseX, baseY, baseW, baseH);
        // Kivet: kaksi limittäistä riviä, deterministinen sävyvaihtelu per lamppu
        // Pystyraita (kivien välinen sauma) peilataan oikealle/vasemmalle per lamppu
        let s = lamp.x * 7 + baseL;
        const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
        const stoneW = 6, stoneH = 2, gap = 1;
        const mirror = rnd() < 0.5;  // kaksi vaihtoehtoa: pystyraita oikealla tai vasemmalla
        for (let row = 0; row < 2; row++) {
            const y = baseY + row * (stoneH + gap);
            const offset = row === 1 ? -Math.floor(stoneW / 2) : 0;
            const stones = [];
            for (let x = offset; x < baseW; x += stoneW + gap) {
                const sx = Math.max(baseX, baseX + x);
                const sw = Math.min(stoneW, baseX + baseW - sx);
                if (sw > 0) stones.push([sx, sw]);
            }
            if (mirror) {
                for (const st of stones) st[0] = baseX + baseW - (st[0] - baseX + st[1]);
            }
            for (const [sx, sw] of stones) {
                const shade = baseL - 8 + rnd() * 28;  // vähän vaaleampaa kuin kuva
                ctx.fillStyle = 'hsl(0,0%,' + Math.round(Math.min(82, Math.max(16, shade))) + '%)';
                ctx.fillRect(sx, y, sw, stoneH);
            }
        }
        // Yläreunan ohut valokorostus (bevel)
        ctx.fillStyle = 'hsl(0,0%,' + Math.min(90, baseL + 30) + '%)';
        ctx.fillRect(baseX, baseY, baseW, 1);

        // Poikkipalkki lampun alla
        ctx.fillStyle = '#4a3820';
        ctx.fillRect(bx - 10, poleTop - 4, 20, 4);

        // Lampun kupu
        let cupFill;
        if (lamp.overheat) {
            cupFill = 'rgba(255,' + Math.round(60 + (Math.sin(Date.now() * 0.025) * 0.3 + 0.7) * 40) + ',10,0.8)';
        } else if (lamp.lit) {
            cupFill = '#ffffaa';
        } else {
            // Staattinen (ei pala): pyöreä dome – keskiö vaalea, laidat tummemmat
            const cupGrad = ctx.createRadialGradient(bx, bulbY + 3, 1, bx, bulbY + 3, 10);
            cupGrad.addColorStop(0,    '#3a3a3a');
            cupGrad.addColorStop(0.55, '#262626');
            cupGrad.addColorStop(1,    '#141414');
            cupFill = cupGrad;
        }
        ctx.fillStyle = cupFill;
        ctx.beginPath();
        ctx.arc(bx, bulbY + 6, 9, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = lamp.overheat ? '#882200' : '#555'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, bulbY + 6, 9, Math.PI, 0);
        ctx.stroke();

        // Kuvun "hattu" (patinoitu harmaa) – pyöreä: keskiö vaalea, laidat tummemmat
        if (lamp.overheat) {
            ctx.fillStyle = '#662200';
            ctx.fillRect(bx - 9, bulbY - 3, 18, 4);
        } else {
            const capGrad = ctx.createLinearGradient(bx - 9, 0, bx + 9, 0);
            capGrad.addColorStop(0,   '#2f2f2f');
            capGrad.addColorStop(0.5, '#5f5f5f');
            capGrad.addColorStop(1,   '#2f2f2f');
            ctx.fillStyle = capGrad;
            ctx.fillRect(bx - 9, bulbY - 3, 18, 4);
        }

        // Pieni valopilkku kuvun sisällä (himmenee päivällä)
        if (lamp.lit && dayDim > 0.01) {
            ctx.save();
            ctx.globalAlpha = dayDim;
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(bx, bulbY + 4, 4, 0, Math.PI*2);
            ctx.fill();
            // Moskiitot lampun valossa
            const t = Date.now() * 0.001;
            const mAlphaMin = isTouchDevice ? 0.25 : 0.126;
            const mAlphaRange = isTouchDevice ? 0.2 : 0.063;
            const mRadius = isTouchDevice ? 2.0 : 1.3;
            const mGlow = isTouchDevice;
            for (let m = 0; m < 4; m++) {
                const mt = t * (1.1 + m * 0.25);
                const mx = bx + Math.cos(mt + m * 2.3) * (10 + Math.sin(mt * 0.6) * 5);
                const my = bulbY + 6 + Math.sin(mt * 1.2 + m * 1.7) * (8 + Math.cos(mt * 0.8) * 4);
                const malpha = mAlphaMin + Math.sin(mt * 2.5 + m) * mAlphaRange;
                if (mGlow) {
                    const glow = ctx.createRadialGradient(mx, my, 0, mx, my, mRadius * 2);
                    glow.addColorStop(0, 'rgba(255,220,140,' + malpha + ')');
                    glow.addColorStop(1, 'rgba(255,220,140,0)');
                    ctx.fillStyle = glow;
                    ctx.beginPath();
                    ctx.arc(mx, my, mRadius * 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = 'rgba(255,240,170,' + Math.min(1, malpha + (mGlow ? 0.15 : 0)) + ')';
                ctx.beginPath();
                ctx.arc(mx, my, mRadius, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
        if (lamp.overheat) {
            const flicker = Math.sin(Date.now() * 0.03) * 0.4 + 0.6;
            ctx.fillStyle = 'rgba(255,120,20,' + flicker + ')';
            ctx.beginPath();
            ctx.arc(bx, bulbY + 4, 3, 0, Math.PI*2);
            ctx.fill();
        }
    }

    /* ── Ovi talossa ─────────────────────────────── */
    function drawDoor(bldg) {
        const dc = doorCenter(bldg);
        const dx = dc.x - DOOR_W / 2;
        const dy = GROUND_Y - DOOR_H;
        const ownerLamp = lamps.find(l => l.bldgIdx === buildings.indexOf(bldg));
        const bldgIdx = buildings.indexOf(bldg);
        const isBar = (bldgIdx === 8);
        // Jukebox-talo (5): ovi näkyy auki vasta kun ikkunat on potkaistu valaistuiksi
        const isJukebox = (bldgIdx === JUKEBOX_BLDG_IDX);
        const jukeboxOpen = isJukebox && !!(smallHouseLights[bldgIdx] && smallHouseLights[bldgIdx].lit);
        // Makuuhuone (talo 7): kun kaikki 3 avainta on koossa, ovi on aina auki
        const sleepOpen = (bldgIdx === SLEEP_BLDG_IDX) && allKeysCollected();
        const isActive = (isBar || jukeboxOpen || sleepOpen) ? true : (ownerLamp && ownerLamp.lit);
        const doorType = bldg.doorType || 0;

        // Syvyysefekti: ovi skaalautuu talon etäisyyden mukaan (pohjan keskipisteen ympäri)
        const s = buildingScale(bldg);
        ctx.save();
        ctx.translate(dc.x, GROUND_Y);
        ctx.scale(s, s);
        ctx.translate(-dc.x, -GROUND_Y);

        // Ovikaari / syvennys (kaikille yhteinen)
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(dx - 2, dy - 2, DOOR_W + 4, DOOR_H + 2);

        // Oven runkovärit
        const doorBase = isActive ? '#5a3a20' : '#1a1010';
        const doorAccent = isActive ? '#7a4a30' : '#2a1a1a';
        const doorLight = isActive ? '#8a5a40' : '#1e1515';
        const doorDark = isActive ? '#3a2010' : '#0e0a0a';

        switch (doorType) {
            case 0: // Klassinen kaksipaneeli (alkuperäinen)
                ctx.fillStyle = doorBase; ctx.fillRect(dx, dy, DOOR_W, DOOR_H);
                ctx.strokeStyle = doorAccent; ctx.lineWidth = 1;
                ctx.strokeRect(dx + 3, dy + 3, Math.floor(DOOR_W/2) - 6, DOOR_H - 10);
                ctx.strokeRect(dx + DOOR_W/2 + 2, dy + 3, Math.floor(DOOR_W/2) - 6, DOOR_H - 10);
                drawHandle(dx + DOOR_W - 6, dy + DOOR_H/2, isActive);
                break;
            case 1: // Yksipaneeli (keskitetty)
                ctx.fillStyle = doorBase; ctx.fillRect(dx, dy, DOOR_W, DOOR_H);
                ctx.strokeStyle = doorAccent; ctx.lineWidth = 1;
                const pw = DOOR_W - 12, ph = DOOR_H - 16;
                ctx.strokeRect(dx + 6, dy + 5, pw, ph);
                ctx.strokeStyle = doorDark; ctx.lineWidth = 0.5;
                ctx.strokeRect(dx + 8, dy + 7, pw - 4, ph - 4);
                drawHandle(dx + DOOR_W - 7, dy + DOOR_H/2, isActive);
                break;
            case 2: // Kaariovi
                ctx.fillStyle = doorBase; ctx.fillRect(dx, dy + 8, DOOR_W, DOOR_H - 8);
                ctx.beginPath(); ctx.arc(dc.x, dy + 8, DOOR_W/2, Math.PI, 0); ctx.fill();
                ctx.strokeStyle = doorAccent; ctx.lineWidth = 1; ctx.stroke();
                ctx.strokeStyle = doorAccent; ctx.lineWidth = 0.7;
                ctx.beginPath(); ctx.arc(dc.x - DOOR_W/4 + 1, dy + 12, DOOR_W/4 - 3, Math.PI*0.9, Math.PI*2.1); ctx.stroke();
                ctx.beginPath(); ctx.arc(dc.x + DOOR_W/4 - 1, dy + 12, DOOR_W/4 - 3, Math.PI*0.9, Math.PI*2.1, true); ctx.stroke();
                drawHandle(dx + DOOR_W - 6, dy + DOOR_H/2 + 4, isActive);
                break;
            case 3: // Ikkunaovi (lasi yläosassa)
                ctx.fillStyle = doorBase; ctx.fillRect(dx, dy, DOOR_W, DOOR_H);
                const wiY = dy + 4, wiH = 14, wiP = 5;
                ctx.fillStyle = isActive ? '#3a3020' : '#0a0a10';
                ctx.fillRect(dx + wiP, wiY, DOOR_W - wiP*2, wiH);
                ctx.fillStyle = isActive ? 'rgba(255,200,100,0.25)' : 'rgba(20,20,30,0.4)';
                ctx.fillRect(dx + wiP + 1, wiY + 1, DOOR_W - wiP*2 - 2, wiH - 2);
                ctx.strokeStyle = doorDark; ctx.lineWidth = 0.7;
                ctx.strokeRect(dx + wiP + 1, wiY + 1, DOOR_W - wiP*2 - 2, wiH - 2);
                ctx.beginPath(); ctx.moveTo(dc.x, wiY + 1); ctx.lineTo(dc.x, wiY + wiH - 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(dx + wiP + 1, wiY + wiH/2); ctx.lineTo(dx + DOOR_W - wiP - 2, wiY + wiH/2); ctx.stroke();
                ctx.strokeStyle = doorAccent; ctx.lineWidth = 1;
                ctx.strokeRect(dx + 4, wiY + wiH + 5, DOOR_W - 8, DOOR_H - wiH - 14);
                drawHandle(dx + DOOR_W - 6, dy + DOOR_H/2, isActive);
                break;
            case 4: // Lautaovi (pystylaudoitus)
                ctx.fillStyle = doorBase; ctx.fillRect(dx, dy, DOOR_W, DOOR_H);
                const pW = 6, pN = Math.floor(DOOR_W / pW);
                for (let p = 0; p < pN; p++) {
                    ctx.fillStyle = p % 2 === 0 ? doorBase : doorDark;
                    ctx.fillRect(dx + p * pW, dy, pW, DOOR_H);
                }
                ctx.fillStyle = doorDark;
                ctx.fillRect(dx + 1, dy + 6, DOOR_W - 2, 3);
                ctx.fillRect(dx + 1, dy + DOOR_H - 10, DOOR_W - 2, 3);
                ctx.fillStyle = doorLight;
                for (let p = 0; p < pN; p++) {
                    ctx.fillRect(dx + p * pW + 1, dy + 7, 2, 1);
                    ctx.fillRect(dx + p * pW + 1, dy + DOOR_H - 9, 2, 1);
                }
                drawHandle(dx + DOOR_W - 7, dy + DOOR_H/2, isActive);
                break;
            case 5: // Moderni sileä ovi
                ctx.fillStyle = doorBase;
                ctx.fillRect(dx + 1, dy + 1, DOOR_W - 2, DOOR_H - 2);
                ctx.strokeStyle = doorAccent; ctx.lineWidth = 1.5;
                ctx.strokeRect(dx + 1, dy + 1, DOOR_W - 2, DOOR_H - 2);
                const barY = dy + DOOR_H/2;
                ctx.fillStyle = isActive ? '#ccaa66' : '#444';
                ctx.fillRect(dx + DOOR_W - 10, barY - 1, 8, 3);
                ctx.fillStyle = isActive ? '#ffd700' : '#555';
                ctx.fillRect(dx + DOOR_W - 9, barY - 0.5, 6, 2);
                ctx.fillStyle = isActive ? '#ffd700' : '#333';
                ctx.beginPath();
                ctx.arc(dx + DOOR_W - 7, dy + DOOR_H/2 - 6, 1.8, 0, Math.PI*2);
                ctx.fill();
                break;
            case 6: // Koristeellinen (listoitukset + tympanoni)
                ctx.fillStyle = doorBase; ctx.fillRect(dx, dy, DOOR_W, DOOR_H);
                ctx.strokeStyle = doorAccent; ctx.lineWidth = 1;
                ctx.strokeRect(dx + 2, dy + 2, DOOR_W - 4, DOOR_H - 4);
                ctx.strokeStyle = doorLight; ctx.lineWidth = 0.7;
                ctx.strokeRect(dx + 4, dy + 4, DOOR_W - 8, DOOR_H - 8);
                ctx.fillStyle = doorDark;
                ctx.fillRect(dx + 5, dy + 6, DOOR_W - 10, 10);
                ctx.strokeStyle = doorLight; ctx.lineWidth = 0.5;
                ctx.strokeRect(dx + 5, dy + 6, DOOR_W - 10, 10);
                ctx.strokeStyle = doorAccent; ctx.lineWidth = 0.7;
                ctx.strokeRect(dx + 7, dy + 20, DOOR_W/2 - 10, DOOR_H - 28);
                ctx.strokeRect(dx + DOOR_W/2 + 2, dy + 20, DOOR_W/2 - 10, DOOR_H - 28);
                drawHandle(dx + DOOR_W - 7, dy + DOOR_H/2, isActive);
                break;
        }

        // Merkkivalo oven yllä (kaikille yhteinen)
        if (ownerLamp) {
            ctx.fillStyle = ownerLamp.lit ? '#ffd700' : '#222';
            if (ownerLamp.lit) { ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 6; }
            ctx.fillRect(dx + DOOR_W/2 - 5, dy - 7, 10, 3);
            ctx.shadowBlur = 0;
        }

        // BAR-kyltti oven yllä (talo 8)
        if (isBar) {
            ctx.fillStyle = '#6b2d0a';
            ctx.fillRect(dx - 4, dy - 26, DOOR_W + 8, 16);
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(dx - 2, dy - 24, DOOR_W + 4, 12);
            const barPhase = Date.now() / 350;
            const blink = Math.sin(barPhase);
            const barHue = 46 + blink * 6;
            const barLight = 50 + blink * 38;              // 12–88 % – selkeä vilkku
            ctx.fillStyle = 'hsl(' + barHue + ', 100%, ' + barLight + '%)';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 6 + Math.abs(blink) * 16;     // hehku voimistuu kirkkaana
            ctx.font = 'bold 9px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('  BAR  ', dc.x, dy - 14);
            ctx.shadowBlur = 0;
            ctx.textAlign = 'start';
        }

        // Jukebox-kyltti oven yllä (talo 5) – kiinni yläkarmissa (alareuna 1 px
        // oviaukon yläreunan yläpuolella). Terävä neoni: tumma ääriviiva
        // pitää tekstin luettavana, hehku on pieni (ei sumeaa massaa).
        if (isJukebox) {
            ctx.fillStyle = '#2a1030';
            ctx.fillRect(dx - 12, dy - 19, DOOR_W + 24, 16);
            ctx.fillStyle = '#3d1846';
            ctx.fillRect(dx - 10, dy - 17, DOOR_W + 20, 12);
            const jkBlink = Math.sin(Date.now() / 420);
            const jkLight = (jukeboxOpen ? 62 : 46) + jkBlink * 14;
            ctx.font = 'bold 9px "Courier New", monospace';
            ctx.textAlign = 'center';
            ctx.lineJoin = 'round';
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(18,4,22,0.9)';
            ctx.strokeText('♪JUKEBOX', dc.x, dy - 7);
            ctx.fillStyle = 'hsl(318, 100%, ' + jkLight + '%)';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 3 + Math.abs(jkBlink) * 5;
            ctx.fillText('♪JUKEBOX', dc.x, dy - 7);
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;
            ctx.textAlign = 'start';
        }

        ctx.restore();
    }

    function drawHandle(hx, hy, isActive) {
        ctx.fillStyle = isActive ? '#ffd700' : '#333';
        ctx.beginPath();
        ctx.arc(hx, hy, 2.5, 0, Math.PI*2);
        ctx.fill();
    }
/* ── Kolikko ──────────────────────────────────── */
    function drawCoin() {
        const cx = coin.x, cy = coin.y;
        // Hehku
        const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, 4.5);
        g.addColorStop(0, 'rgba(255,215,0,0.5)');
        g.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.ellipse(cx, cy, 4.5, 2, 0, 0, Math.PI*2); ctx.fill();
        // Kolikon pinta (litistetty perspektiivi)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.ellipse(cx, cy, 4 + Math.sin(coin.sparkle) * 0.3, 1.5, 0, 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#cc9900'; ctx.lineWidth = 0.5;
        ctx.stroke();
        // $ -merkki
        ctx.fillStyle = '#aa7700';
        ctx.font = 'bold 3px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('$', cx, cy + 1);
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    }

    /* ── Kukkaruukku ──────────────────────────────── */
    function drawFlowerPot() {
        const fp = flowerPot;
        ctx.save(); ctx.translate(fp.x, fp.y); ctx.rotate(fp.rotation);
        ctx.fillStyle = '#8B4513'; ctx.beginPath(); ctx.moveTo(-6,3); ctx.lineTo(-8,-5); ctx.lineTo(8,-5); ctx.lineTo(6,3); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#5a2d0c'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#3d2817'; ctx.fillRect(-6,-5,12,2);
        ctx.fillStyle = '#2d8a2d'; ctx.beginPath(); ctx.ellipse(2,-7,4,2.5,0.3,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(-3,-6,3,2,-0.4,0,Math.PI*2); ctx.fill();
        ctx.restore();
    }

    /* ── Potkusta pudonnut kolikko ────────────────── */
    function drawKickCoin() {
        const kx = kickCoin.x, ky = kickCoin.y;
        const spin = kickCoin.landed ? 0 : Math.sin(Date.now() / 55) * 0.5;
        // Hehku
        const g = ctx.createRadialGradient(kx, ky, 1, kx, ky, 6);
        g.addColorStop(0, 'rgba(255,215,0,0.6)');
        g.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(kx, ky, 6, 0, Math.PI * 2); ctx.fill();
        // Kolikon pinta
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.ellipse(kx, ky, 5 + spin, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#cc9900'; ctx.lineWidth = 0.5; ctx.stroke();
        ctx.fillStyle = '#aa7700';
        ctx.font = 'bold 4px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('$', kx, ky + 1);
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    }

    /* ── Katueläin ───────────────────────────────── */
    function drawAnimal() {
        const a = groundAnimal; if (!a) return;
        const ax = Math.round(a.x), ay = Math.round(a.y + a.hopY + (a.type === 'rabbit' ? 25 : 0)), dir = a.direction;
        const t = a.animTimer;
        ctx.save();
        if (a.type === 'mouse') {
            const bob = Math.sin(t*0.25)*0.8;
            ctx.fillStyle = '#999aaa'; ctx.fillRect(ax+1, ay+bob, 10, 4);
            const hx = dir>0?ax+9:ax-3;
            ctx.fillStyle = '#aaaabb'; ctx.fillRect(hx, ay-1+bob, 5, 5);
            ctx.fillStyle = '#111'; ctx.fillRect(hx+(dir>0?3:1), ay+bob, 1.5, 1.5);
            ctx.fillStyle = '#cc9999'; ctx.beginPath(); ctx.arc(hx+2, ay-3+bob+Math.sin(t*0.3)*1, 2, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#777788'; const lp = t*0.5;
            for (let l=0;l<4;l++) { const lx=ax+2+l*2.5; ctx.fillRect(lx, ay+3+bob, 1.5, 2+Math.sin(lp+l*1.5)*1.5); }
            ctx.strokeStyle = '#8877aa'; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(dir>0?ax:ax+10, ay+2+bob);
            ctx.quadraticCurveTo(dir>0?ax-5:ax+15, ay+Math.sin(t*0.35)*4+bob, dir>0?ax-10:ax+20, ay-1+Math.sin(t*0.35)*4+bob); ctx.stroke();
        } else if (a.type === 'rat') {
            const bob = Math.sin(t*0.2)*0.6;
            ctx.fillStyle = '#776655'; ctx.fillRect(ax+1, ay+1+bob, 16, 5);
            const hx = dir>0?ax+14:ax-5;
            ctx.fillStyle = '#887766'; ctx.fillRect(hx, ay-2+bob, 6, 6);
            ctx.fillStyle = '#330000'; ctx.fillRect(hx+(dir>0?4:1), ay-1+bob, 2, 2);
            ctx.fillStyle = '#aa8877'; ctx.beginPath(); ctx.arc(hx+2, ay-4+bob+Math.sin(t*0.25)*0.8, 2.5, 0, Math.PI); ctx.fill();
            ctx.fillStyle = '#554433'; const lp = t*0.4;
            for (let l=0;l<4;l++) { const lx=ax+3+l*3.5; ctx.fillRect(lx, ay+5+bob, 1.5, 2.5+Math.sin(lp+l*1.4)*1.8); }
            ctx.strokeStyle = '#aa9988'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(dir>0?ax:ax+16, ay+3+bob);
            ctx.bezierCurveTo(dir>0?ax-6:ax+22, ay+Math.sin(t*0.22)*5+bob, dir>0?ax-12:ax+28, ay+Math.sin(t*0.28+1.5)*4+bob, dir>0?ax-18:ax+34, ay-2+bob); ctx.stroke();
        } else {
            const bodyY = ay;
            ctx.fillStyle = '#b0a090'; ctx.fillRect(ax+2, bodyY+2, 10, 7);
            ctx.fillStyle = '#c0b0a0'; ctx.fillRect(ax+(dir>0?8:0), bodyY-3+Math.sin(t*0.15)*1.2, 5, 5);
            ctx.fillStyle = '#111'; ctx.fillRect(ax+(dir>0?11:1), bodyY-1+Math.sin(t*0.15)*1.2, 1.5, 1.5);
            const ew = Math.sin(t*0.25)*2;
            ctx.fillStyle = '#c0b0a0'; ctx.fillRect(ax+(dir>0?9:3), bodyY-9+ew, 2, 6); ctx.fillRect(ax+(dir>0?11:5), bodyY-8-ew, 2, 6);
            ctx.fillStyle = '#e0c0c0'; ctx.fillRect(ax+(dir>0?10:4), bodyY-8+ew, 1, 3); ctx.fillRect(ax+(dir>0?12:6), bodyY-7-ew, 1, 3);
            ctx.fillStyle = '#f0f0f0'; ctx.beginPath(); ctx.arc(dir>0?ax+1:ax+11, bodyY+5+Math.sin(t*0.3)*1.5, 3, 0, Math.PI*2); ctx.fill();
            if (a.hopY >= -1) { ctx.fillStyle = '#a09080'; ctx.fillRect(ax+(dir>0?6:0), bodyY+7, 2, 2); ctx.fillRect(ax+(dir>0?9:3), bodyY+7, 2, 2); }
        }
        ctx.restore();
    }

    /* ── Ajoneuvo ──────────────────────────────────── */
    function drawVehicle(v) {
        if (!v) return;
        const vx = Math.round(v.x), vy = Math.round(v.y), dir = v.direction;
        // Ajovalot himmenevät päivällä (v4.35) – sama liuku kuin katuvaloissa.
        // Takavalot ja ambulanssin kattovilkku eivät muutu (eivät ole ajovaloja).
        const headlightDim = 1 - VEHICLE_HEADLIGHT_DIM * dayT;
        const headlightOn  = v.hasHeadlight !== false && headlightDim > 0.01;
        ctx.save();
        if (dir === -1) { ctx.translate(vx + v.w / 2, 0); ctx.scale(-1, 1); ctx.translate(-(vx + v.w / 2), 0); }

        if (v.type === 'car') {
            const cx = vx, cy = vy;
            ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(cx + 3, cy + v.h - 4, v.w - 6, 6);
            ctx.fillStyle = '#9a9a9a'; ctx.fillRect(cx + 2, cy + 2, v.w - 4, v.h - 10);
            ctx.fillStyle = '#7a7a7a'; ctx.fillRect(cx + 10, cy, v.w - 20, v.h - 14);
            ctx.fillStyle = '#6ab8c8'; ctx.fillRect(cx + v.w - 20, cy + 3, 8, v.h - 18);
            ctx.fillStyle = '#558899'; ctx.fillRect(cx + 8, cy + 3, 7, v.h - 18);
            ctx.fillStyle = '#558899'; ctx.fillRect(cx + 26, cy + 3, 12, v.h - 18);
            ctx.fillStyle = '#cccccc'; ctx.fillRect(cx + v.w - 6, cy + v.h - 18, 6, 8);
            ctx.fillStyle = '#aaaaaa'; ctx.fillRect(cx, cy + v.h - 18, 5, 8);
            if (headlightDim > 0.01) {               // ajovalo + hehku (pois päivällä, v4.35)
                ctx.globalAlpha = headlightDim;
                ctx.fillStyle = '#ffee88'; ctx.fillRect(cx + v.w - 4, cy + 6, 5, 4);
                ctx.fillStyle = 'rgba(255,240,150,0.4)'; ctx.fillRect(cx + v.w + 1, cy + 5, 3, 6);
                ctx.globalAlpha = 1;
            }
            ctx.fillStyle = '#cc3333'; ctx.fillRect(cx - 1, cy + 6, 4, 3);
            const wr = 5;
            ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx + 14, cy + v.h - 4, wr, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + v.w - 14, cy + v.h - 4, wr, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(cx + 14, cy + v.h - 4, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + v.w - 14, cy + v.h - 4, 2.5, 0, Math.PI * 2); ctx.fill();
        } else if (v.type === 'ambulance') {
            const cx = vx, cy = vy;
            // Varjo
            ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(cx + 3, cy + v.h - 4, v.w - 6, 6);
            // Valkoinen kori
            ctx.fillStyle = '#e8e8e8'; ctx.fillRect(cx + 2, cy + 4, v.w - 4, v.h - 14);
            // Katto
            ctx.fillStyle = '#f4f4f4'; ctx.fillRect(cx + 6, cy + 1, v.w - 12, v.h - 15);
            // Tumma alareuna
            ctx.fillStyle = '#555'; ctx.fillRect(cx + 4, cy + v.h - 12, v.w - 8, 2);
            // Punainen risti kyljessä
            const rcx = cx + v.w / 2, rcy = cy + 14;
            ctx.fillStyle = '#cc0000';
            ctx.fillRect(rcx - 12, rcy - 2, 24, 4);
            ctx.fillRect(rcx - 2, rcy - 12, 4, 24);
            // Etuikkuna
            ctx.fillStyle = '#6ab8c8'; ctx.fillRect(cx + v.w - 18, cy + 5, 10, v.h - 21);
            // Takaikkuna
            ctx.fillStyle = '#558899'; ctx.fillRect(cx + 4, cy + 5, 6, v.h - 21);
            // Keltainen vilkkuvalo katolla + hehku (vilkkuva)
            const flashOn = Math.sin(Date.now() * 0.012) > -0.3;
            if (flashOn) {
                ctx.fillStyle = '#ffcc00'; ctx.fillRect(cx + v.w/2 - 4, cy - 3, 8, 4);
                ctx.fillStyle = 'rgba(255,240,100,0.45)'; ctx.fillRect(cx + v.w/2 - 2, cy - 5, 4, 3);
                ctx.fillRect(cx + v.w/2 - 6, cy - 2, 12, 2);
            }
            // Renkaat
            const wr = 5;
            ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx + 14, cy + v.h - 4, wr, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + v.w - 14, cy + v.h - 4, wr, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(cx + 14, cy + v.h - 4, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + v.w - 14, cy + v.h - 4, 2.5, 0, Math.PI * 2); ctx.fill();
            // Takavalo
            ctx.fillStyle = '#cc3333'; ctx.fillRect(cx - 1, cy + v.h - 16, 4, 3);
        } else {
            // ── Mopo + kuski (kerrokset: runko → kuski → etukate/tanko) ──
            const cx = vx, cy = vy;

            // 1. Maavarjo
            ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(cx + 2, cy + v.h - 2, v.w - 4, 4);

            // 2. Renkaat (takana + edessä)
            const wr = 5;
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(cx + 7, cy + v.h - 5, wr, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + v.w - 7, cy + v.h - 5, wr, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#555';
            ctx.beginPath(); ctx.arc(cx + 7, cy + v.h - 5, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + v.w - 7, cy + v.h - 5, 2, 0, Math.PI * 2); ctx.fill();

            // 3. Runko + penkki (taainnaisena)
            ctx.fillStyle = '#B71C1C';                       // astinlauta
            ctx.fillRect(cx + 15, cy + 15, 14, 3);
            ctx.fillStyle = '#D32F2F';                       // moottorin kate (punainen runko)
            ctx.fillRect(cx + 3, cy + 8, 15, 9);
            ctx.fillStyle = '#222222';                       // penkki
            ctx.fillRect(cx + 3, cy + 4, 12, 4);

            // 4. Kuski (istuu penkillä, pelaajan värit)
            ctx.fillStyle = '#3366cc';                       // vartalo (sininen paita)
            ctx.fillRect(cx + 4, cy - 8, 9, 12);
            ctx.fillStyle = '#16265c';                       // jalat (housut)
            ctx.fillRect(cx + 8, cy + 4, 7, 4);              //   reisi eteen
            ctx.fillRect(cx + 13, cy + 8, 3, 8);             //   sääri astinlaudalle
            ctx.fillStyle = '#ffcc99';                       // pää (iho)
            ctx.fillRect(cx + 4, cy - 16, 8, 9);
            ctx.fillStyle = '#553300';                       // hiukset (otsatukka)
            ctx.fillRect(cx + 10, cy - 15, 2, 2);
            ctx.fillStyle = '#2b2118';                       // silmä (katse eteen)
            ctx.fillRect(cx + 10, cy - 12, 2, 2);
            ctx.fillStyle = '#3366cc';                       // lippis (kupu)
            ctx.fillRect(cx + 3, cy - 19, 11, 4);
            ctx.fillStyle = '#224488';                       // lippis (lippa eteen)
            ctx.fillRect(cx + 11, cy - 17, 6, 3);
            ctx.fillStyle = '#3366cc';                       // käsi ojennettuna tankoon
            ctx.beginPath();
            ctx.moveTo(cx + 10, cy - 5);                     //   olkapää
            ctx.lineTo(cx + 21, cy - 2);                     //   ranne
            ctx.lineTo(cx + 20, cy + 1);                     //   ranteen alaosa
            ctx.lineTo(cx + 9, cy - 1);                      //   kainalo
            ctx.fill();
            ctx.fillStyle = '#ffcc99';                       // sormet tangolla
            ctx.fillRect(cx + 20, cy - 3, 3, 4);

            // 5. Etukate + ohjaustanko (kuskin päälle → syvyys)
            ctx.fillStyle = '#D32F2F';
            ctx.beginPath();
            ctx.moveTo(cx + 29, cy + 17);
            ctx.lineTo(cx + 25, cy + 3);
            ctx.lineTo(cx + 33, cy + 3);
            ctx.lineTo(cx + 37, cy + 17);
            ctx.fill();
            ctx.fillStyle = '#555555';                       // tanko + mittaristo
            ctx.fillRect(cx + 20, cy, 12, 3);

            // 6. Valot
            ctx.fillStyle = '#cc3333';                       // takavalo (jää palamaan)
            ctx.fillRect(cx + 1, cy + 8, 2, 4);
            if (headlightDim > 0.01) {                       // etuvalo pois päivällä (v4.35)
                ctx.globalAlpha = headlightDim;
                ctx.fillStyle = '#ffee88';                   // etuvalo
                ctx.fillRect(cx + 34, cy + 3, 3, 4);
                ctx.fillStyle = 'rgba(255,240,150,0.4)';     // etuvalon hehku
                ctx.fillRect(cx + 37, cy + 3, 2, 4);
                ctx.globalAlpha = 1;
            }
        }

        // ── Ajovalot eteenpäin (kaikille ajoneuvotyypeille) ──
        //    Himmenevät päivällä (v4.35); kun kartio on kokonaan himmennyt,
        //    sitä ei piirretä lainkaan.
        if (headlightOn) {
            ctx.globalAlpha = headlightDim;
            const beamY = v.type === 'motorcycle' ? vy + v.h * 0.3 : vy + v.h - 12;
            const beamLen = v.type === 'ambulance' ? 140 : v.type === 'car' ? 105 : 70;
            const beamSpread = 10;
            const beamGrad = ctx.createLinearGradient(vx + v.w, beamY, vx + v.w + beamLen, beamY);
            beamGrad.addColorStop(0, 'rgba(255,250,220,0.32)');
            beamGrad.addColorStop(0.4, 'rgba(255,250,220,0.12)');
            beamGrad.addColorStop(1, 'rgba(255,250,220,0)');
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(vx + v.w, beamY - 3);
            ctx.lineTo(vx + v.w + beamLen, beamY - beamSpread);
            ctx.lineTo(vx + v.w + beamLen, beamY + beamSpread);
            ctx.lineTo(vx + v.w, beamY + 3);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    /* ── Oviukko (Avenger) – pelaajan kaksonen, astuu ovesta ──
       Sama blokkityyli kuin drawPlayer, mutta tunnisteväri (tummanpunainen paita)
       – erottuu pelaajasta ilman tekstiä. Skaalautuu talon buildingScale()-arvolla. */
    function drawAvenger() {
        const a = avenger;
        if (!a) return;
        const s = a.scale || 1;
        const px = Math.round(a.x), py = Math.round(a.y);
        const pw = a.w, ph = a.h;
        // Ulostulo: liukuu esiin kynnykseltä (alpha + pieni nousu)
        const emerge = a.phase === 'emerge'
            ? 1 - Math.max(0, Math.min(1, a.timer / AVENGER_TELEGRAPH)) : 1;
        const top = py + (1 - emerge) * 10;
        const bobY = (Math.floor(a.walkTimer / 6) % 2) * 1;   // 2-frame kävelysykli

        ctx.save();
        // Peilaus kulkusuunnan mukaan + talon syvyysskaalaus (pohjan keskipiste)
        ctx.translate(px + pw / 2, GROUND_Y);
        ctx.scale(s * (a.facing === -1 ? -1 : 1), s);
        ctx.translate(-(px + pw / 2), -GROUND_Y);
        ctx.globalAlpha = 0.35 + 0.65 * emerge;

        // Maakosketusvarjo (2 kerrosta, kuten pelaajalla)
        const feetX = px + pw / 2, feetY = py + ph - 1;
        ctx.fillStyle = 'rgba(0,0,0,0.30)';
        ctx.beginPath(); ctx.ellipse(feetX, feetY, 10, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath(); ctx.ellipse(feetX, feetY, 6, 1.8, 0, 0, Math.PI * 2); ctx.fill();

        // Housut + kengät
        ctx.fillStyle = '#16265c';
        ctx.fillRect(px + 4, top + 21 + bobY, pw - 8, 8);
        ctx.fillStyle = '#221008';
        ctx.fillRect(px + 4, top + 29, pw - 8, 2);
        // Vartalo – tunnisteväri: tummanpunainen paita (pelaaja #3366cc)
        ctx.fillStyle = '#a03030';
        ctx.fillRect(px + 4, top + 10 + bobY, pw - 8, ph - 18);
        // Kylkivarjostus + etureunan valokaista
        ctx.fillStyle = '#7a2020';
        ctx.fillRect(px + 4, top + 10 + bobY, 2, ph - 18);
        ctx.fillStyle = '#c05050';
        ctx.fillRect(px + pw - 5, top + 10 + bobY, 1, ph - 18);
        // Vyötärön raja
        ctx.fillStyle = 'rgba(0,0,0,0.20)';
        ctx.fillRect(px + 4, top + 21 + bobY, pw - 8, 1);
        // Kädet (lepoasento, seuraa bobY:tä) + kädet hihan päissä
        const backArmX = px + 3, frontArmX = px + pw - 6, armY = top + 12 + bobY;
        ctx.fillStyle = '#7a2020';
        ctx.fillRect(backArmX, armY, 3, 8);
        ctx.fillRect(frontArmX, armY, 3, 8);
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(backArmX, armY + 8, 3, 2);
        ctx.fillRect(frontArmX, armY + 8, 3, 2);
        // Pää + hiukset
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath(); ctx.arc(px + pw / 2, top + 6 + bobY, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#553300';
        ctx.beginPath(); ctx.arc(px + pw / 2, top + 3 + bobY, 7, Math.PI, 0); ctx.fill();
        // Kasvojen takaosan varjo + lipan varjo
        ctx.fillStyle = 'rgba(0,0,0,0.10)';
        ctx.fillRect(px + 4, top + 6 + bobY, 2, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(px + 5, top + 5 + bobY, 11, 1);
        // Silmä (kulkusuunnan puoleinen)
        ctx.fillStyle = '#2b2118';
        ctx.fillRect(px + 13, top + 7 + bobY, 2, 2);
        // Jäädytyksen aikana käsi ojennettuna kohti pelaajaa (isku kiinni)
        if (a.phase === 'hold') {
            ctx.fillStyle = '#7a2020';
            ctx.fillRect(frontArmX + 3, armY + 1, 7, 3);
            ctx.fillStyle = '#ffcc99';
            ctx.fillRect(frontArmX + 10, armY + 1, 3, 3);
        }
        // Lippis (tunnisteväri)
        ctx.fillStyle = '#a03030';
        ctx.fillRect(px + pw / 2 - 6, top, 14, 5);
        ctx.fillStyle = '#7a2020';
        ctx.fillRect(px + pw / 2 + 2, top + 1, 7, 3);

        ctx.restore();
    }

    /* ── Pelaaja ────────────────────────────────── */
    /* ── Syvyysskaalaus: pelaaja pienenee kauas (Y pieni), kasvaa lähelle ── */
    const PLAYER_DEPTH_MID    = 315;            // liikeradan keskikohta 280…350 = nykyinen koko (1.00)
    const PLAYER_DEPTH_MAX_Y  = WORLD_H - 50;   // sama kuin update()in PLAYER_Y_MAX (350)
    const PLAYER_DEPTH_AMOUNT = 0.10;           // ±10 % → 0.90 kauas / 1.10 lähelle
    function playerDepthScale() {
        const t = (player.y - PLAYER_DEPTH_MID) / (PLAYER_DEPTH_MAX_Y - PLAYER_DEPTH_MID);
        return 1 + Math.max(-1, Math.min(1, t)) * PLAYER_DEPTH_AMOUNT;
    }

    function drawPlayer() {
        const px = Math.round(player.x), py = Math.round(player.y);
        const pw = player.w, ph = player.h;
        // Syvyysskaalaus: koko riippuu Y-syvyydestä, ankkuri = jalkojen kosketuspiste
        const depthScale = playerDepthScale();
        const ax = px + pw / 2, ay = py + ph - 1;

        if (player.knockedDown) {
            ctx.save();
            const cx = px + pw/2, gy = py + ph;
            ctx.translate(cx, gy);
            ctx.scale(depthScale, depthScale);   // tainnutusasento skaalautuu jalkapisteestä
            if (player.facing === -1) ctx.scale(-1, 1);
            // Keho (lähellä päätä, ei 20px irti)
            ctx.fillStyle = '#3366cc'; ctx.fillRect(-8, -16, 16, 14);
            // Kädet sivuille (maassa)
            ctx.fillStyle = '#3355aa'; ctx.fillRect(-16, -12, 8, 4); ctx.fillRect(8, -12, 8, 4);
            // Pää
            ctx.fillStyle = '#ffcc99'; ctx.beginPath(); ctx.arc(0, -5, 6, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#553300'; ctx.beginPath(); ctx.arc(0, -8, 6, Math.PI, 0); ctx.fill();
            // Tähdet pään ympärillä
            const t = Date.now()*0.005;
            ctx.strokeStyle = '#ffdd44'; ctx.lineWidth = 1;
            for (let s=0;s<3;s++) { const ang=t+s*2.1; ctx.beginPath(); ctx.moveTo(Math.cos(ang)*14-2, -12+Math.sin(ang)*10-2); ctx.lineTo(Math.cos(ang)*14+2, -12+Math.sin(ang)*10+2); ctx.moveTo(Math.cos(ang)*14+2, -12+Math.sin(ang)*10-2); ctx.lineTo(Math.cos(ang)*14-2, -12+Math.sin(ang)*10+2); ctx.stroke(); }
            ctx.restore();
            return;
        }

        ctx.save();
        // Syvyysskaalaus jalan kosketuspisteestä (myös maakosketusvarjo skaalautuu)
        ctx.translate(ax, ay);
        ctx.scale(depthScale, depthScale);
        ctx.translate(-ax, -ay);
        // Maakosketusvarjo – ankkuroi hahmon maahan (symmetrinen, piirretään ennen peilausta)
        const feetX = px + pw / 2, feetY = py + ph - 1;
        const shadowW = player.walking ? 11 : 10;
        ctx.fillStyle = 'rgba(0,0,0,0.30)';
        ctx.beginPath(); ctx.ellipse(feetX, feetY, shadowW, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.beginPath(); ctx.ellipse(feetX, feetY, shadowW - 4, 1.8, 0, 0, Math.PI * 2); ctx.fill();
        if (player.facing === -1) {
            ctx.translate(px+pw/2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(px+pw/2), 0);
        }
        // Kävelyn kevennys + paikallaan hengitys (ylävartalo 1 px, ~2,4 s sykli)
        const breathe = (!player.walking && !player.kicking)
            ? (Math.floor(animClock / 36) % 4 >= 2 ? 1 : 0) : 0;
        const bobY = breathe + (player.walking ? (player.walkFrame % 2) * 1 : 0);
        // Potkun aikana ylävartalo nojaa: ennakossa taakse, osumassa eteen
        const kickKp = player.kicking ? (player.kickFrame / KICK_DURATION) : 0;
        const kickLean = player.kicking
            ? (kickKp < 0.2 ? -1 : Math.round(Math.sin(((kickKp - 0.2) / 0.8) * Math.PI)))
            : 0;
        ctx.save();
        ctx.translate(kickLean, 0);   // koko ylävartalo nojaa potkun tahdissa
        // Vartalo (paita) – kylkivarjostus tuo pyöreyttä
        ctx.fillStyle = '#3366cc';
        ctx.fillRect(px+4, py+10 + bobY, pw-8, ph-18);
        // Selän varjokaista (takaosa) + etureunan valokaista
        ctx.fillStyle = '#2b57ab';
        ctx.fillRect(px+4, py+10 + bobY, 2, ph-18);
        ctx.fillStyle = '#4a7de0';
        ctx.fillRect(px+pw-5, py+10 + bobY, 1, ph-18);
        // Leuan varjo + niskavarjo paidan yläosassa (kaulan illuusio)
        // Pään ympyrä peittää paidan yläreunan → varjo vasta pään alareunan tasolle
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(px+5, py+12 + bobY, pw-10, 2);
        // Vyötärön raja (erottaa paidan housuista)
        ctx.fillStyle = 'rgba(0,0,0,0.20)';
        ctx.fillRect(px+4, py+21 + bobY, pw-8, 1);
        // Kädet – lepoasennossa, seuraavat vain vartalon bobY:tä (ei heiluntaa)
        const backArmX  = px + 3,      backArmY  = py + 12 + bobY;
        const frontArmX = px + pw - 6, frontArmY = backArmY;
        ctx.fillStyle = '#3355aa';
        ctx.fillRect(backArmX, backArmY, 3, 8);
        ctx.fillRect(frontArmX, frontArmY, 3, 8);
        // Hihansuut + kädet (iho) hihan päissä
        ctx.fillStyle = '#254a9c';
        ctx.fillRect(backArmX, backArmY + 7, 3, 1);
        ctx.fillRect(frontArmX, frontArmY + 7, 3, 1);
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(backArmX, backArmY + 8, 3, 2);
        ctx.fillRect(frontArmX, frontArmY + 8, 3, 2);
        ctx.fillStyle = '#e8b487';
        ctx.fillRect(backArmX, backArmY + 9, 3, 1);
        ctx.fillRect(frontArmX, frontArmY + 9, 3, 1);
        // Pää
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath(); ctx.arc(px+pw/2, py+6 + bobY, 7, 0, Math.PI*2); ctx.fill();
        // Hiukset (otsatukka)
        ctx.fillStyle = '#553300';
        ctx.beginPath(); ctx.arc(px+pw/2, py+3 + bobY, 7, Math.PI, 0); ctx.fill();
        // Kasvojen takaosan varjo + lipan varjo (syvyys)
        ctx.fillStyle = 'rgba(0,0,0,0.10)';
        ctx.fillRect(px+4, py+6 + bobY, 2, 4);
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(px+5, py+5 + bobY, 11, 1);
        // Silmä (kulkusuunnan puoleinen) – vilkahtaa ~100 ms / 3,6 s (kello)
        const eyeY = py+7 + bobY + (player.lookY || 0);
        const blink = (Math.floor(animClock) % 216) >= 210;
        ctx.fillStyle = '#2b2118';
        if (blink) ctx.fillRect(px+13, eyeY + 1, 2, 1);
        else       ctx.fillRect(px+13, eyeY, 2, 2);
        // Lippis – lippa kulkusuuntaan
        ctx.fillStyle = '#3366cc';
        ctx.fillRect(px+pw/2 - 6, py, 14, 5);
        ctx.fillStyle = '#224488';
        ctx.fillRect(px+pw/2 + 2, py + 1, 7, 3);   // lippa sirompi (12→7)
        ctx.fillRect(px+pw/2 + 4, py + 4, 6, 1);
        // Dynaaminen valo: lähin palava lamppu antaa ohuen lämpimän reunavalon
        // (lasketaan lokaalikoordinaateissa → kääntyy peilauksen mukana)
        let rimA = 0, rimSide = 0;
        for (const lamp of lamps) {
            if (!lamp.lit) continue;
            const d = Math.abs(lamp.x - (px + pw / 2));
            if (d < 70) {
                const a = (1 - d / 70) * 0.35;
                if (a > rimA) { rimA = a; rimSide = (lamp.x > px + pw / 2) ? 1 : -1; }
            }
        }
        if (rimA > 0.04) {
            const localSide = rimSide * player.facing;
            const torsoX = localSide > 0 ? px + pw - 5 : px + 4;
            const headX  = localSide > 0 ? px + 16 : px + 4;
            ctx.fillStyle = 'rgba(255,221,136,' + rimA.toFixed(3) + ')';
            ctx.fillRect(torsoX, py + 10 + bobY, 1, ph - 19);
            ctx.fillRect(headX, py + 7 + bobY, 1, 3);
        }
        ctx.restore();   // potkun nojaus päättyy
        // Jalat – housut (tumma laivastonsininen erottuu paidasta)
        ctx.fillStyle = '#16265c';
        if (player.kicking) {
            const kp = player.kickFrame / KICK_DURATION; // 0..1
            // Ennakointi: 20 % ajasta jalka vedetään taakse, sitten heilahdus 0→1→0
            const ANTICIP = 0.2;
            const swing = kp < ANTICIP
                ? -0.35 * (kp / ANTICIP)
                : Math.sin(((kp - ANTICIP) / (1 - ANTICIP)) * Math.PI);
            // Tukijalka
            ctx.fillRect(px + 3, py + ph - 8, 4, 8);
            // Potkiva jalka – pyörähtää eteen
            ctx.save();
            ctx.translate(px + pw - 10, py + ph - 6);
            ctx.rotate(-swing * 1.1);
            ctx.fillRect(0, -2, 4, 14);
            ctx.restore();
            // Kenkä potkivassa jalassa (+ valojuova)
            const shoeX = px + pw - 8 + swing * 20;
            const shoeY = py + ph - 6 - swing * 12;
            ctx.fillStyle = '#221008';
            ctx.fillRect(shoeX - 3, shoeY + 2, 8, 3);
            ctx.fillStyle = '#3a2a1c';
            ctx.fillRect(shoeX - 3, shoeY + 2, 8, 1);
        } else {
            // Kävelyanimaatio: jalat heiluvat walkFramen mukaan (0-3)
            const wf = player.walking ? player.walkFrame : 0;
            const legSwing = player.walking ? ((wf === 1 || wf === 3) ? 4 : 0) : 0;
            const leftOffset  = (wf === 1) ? -legSwing : (wf === 3) ? legSwing : 0;
            const rightOffset = (wf === 1) ? legSwing : (wf === 3) ? -legSwing : 0;
            // Vasen jalka
            ctx.fillRect(px + 5 + leftOffset, py + ph - 8, 4, 8 + Math.abs(leftOffset) * 0.5);
            // Oikea jalka
            ctx.fillRect(px + pw - 9 + rightOffset, py + ph - 8, 4, 8 + Math.abs(rightOffset) * 0.5);
            // Kengät (+ valojuova)
            ctx.fillStyle = '#221008';
            ctx.fillRect(px + 4 + leftOffset, py + ph - 2 + Math.abs(leftOffset) * 0.5, 6, 2);
            ctx.fillRect(px + pw - 10 + rightOffset, py + ph - 2 + Math.abs(rightOffset) * 0.5, 6, 2);
            ctx.fillStyle = '#3a2a1c';
            ctx.fillRect(px + 4 + leftOffset, py + ph - 2 + Math.abs(leftOffset) * 0.5, 6, 1);
            ctx.fillRect(px + pw - 10 + rightOffset, py + ph - 2 + Math.abs(rightOffset) * 0.5, 6, 1);
        }
        ctx.restore();
    }

    /* SKAALAUS */
    function resize() {
        const wrapper = document.getElementById('game-wrapper');
        if (!wrapper) return;

        const hud = document.getElementById('hud-bar');
        const hudH = hud ? hud.offsetHeight + 8 : 0;   // HUD + pieni väli
        const maxW = wrapper.clientWidth - 16;

        if (!isTouchDevice) {
            // PC: koko katu näkyvissä (ei kameraa, ei scrollausta)
            viewW = WORLD_W;
            camX = 0;
            const maxH = wrapper.clientHeight - hudH;
            const scale = Math.min(maxW / WORLD_W, maxH / WORLD_H);
            canvas.width = WORLD_W;
            canvas.height = WORLD_H;
            canvas.style.width = Math.floor(WORLD_W * scale) + 'px';
            canvas.style.height = Math.floor(WORLD_H * scale) + 'px';
            return;
        }

        // Mobiili: vaakakamera. Vaakamoodissa koko katu mahtuu (ei scrollausta);
        // pystymoodissa zoomataan täyttämään korkeus ja kamera seuraa pelaajaa.
        const isLandscape = window.innerWidth > window.innerHeight;
        const CONTROL_RESERVE = isLandscape ? 0 : 185;   // D-padin korkeus + marginaali
        const availH = Math.max(200, wrapper.clientHeight - hudH - CONTROL_RESERVE);

        // Tavoite: täytä käytettävissä oleva korkeus (maksimaalinen vertikaalitila)
        const scaleH = availH / WORLD_H;
        viewW = Math.max(VIEWW_MIN, Math.min(WORLD_W, maxW / scaleH));
        // Varmista ettei canvas ylitä näytön leveyttä
        const scale = Math.min(scaleH, maxW / viewW);

        canvas.width = Math.round(viewW);
        canvas.height = WORLD_H;
        canvas.style.width = Math.floor(viewW * scale) + 'px';
        canvas.style.height = Math.floor(WORLD_H * scale) + 'px';
        // Clampaa kamera uuteen viewW:hen (älä näytä maailman ulkopuolelle)
        camX = Math.max(0, Math.min(WORLD_W - viewW, camX));
    }

    return { init, resize, closeGame };
})();

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    if (canvas) Street.init(canvas);
});
window.addEventListener('resize', () => { if (Street.resize) Street.resize(); });
