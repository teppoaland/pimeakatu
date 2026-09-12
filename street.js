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
        x: 40, y: GROUND_Y - 30, w: 20, h: 30,
        vx: 0, vy: 0, facing: 1, walking: false,
        walkFrame: 0, walkTimer: 0,
        kicking: false, kickFrame: 0
    };
    const PLAYER_SPEED = 2.5;
    const GRAVITY = 0.4;
    const JUMP_VEL = -7;
    const KICK_DURATION = 10; // frameä @ ~60fps ≈ 170ms

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

    /* ── Lamput (talojen väleissä) ──────────────────── */
    const lamps = [
        { x: 85,  bldgIdx: 1, lit: false, label: 'DIG\nGAME',    gameUrl: 'digGame1/dig_game.html' },
        { x: 255, bldgIdx: 3, lit: false, label: 'BOULDER\nDASH', gameUrl: 'digGame2/boulder_dash.html' },
        { x: 445, bldgIdx: 5, lit: false, label: 'BLUE\nMAX',     gameUrl: 'bluemax_c64/game_main.html' },
        { x: 625, bldgIdx: 7, lit: false, label: 'COM-\nMANDO',   gameUrl: null },
        { x: 720, bldgIdx: 8, lit: false, label: '???',           gameUrl: null }
    ];

    const LAMP_POST_H = 75;
    const DOOR_W = 32;
    const DOOR_H = 40;
    const DOOR_RADIUS = 24;
/* ── Kolikko ─────────────────────────────────────── */
    const coin = { x: 590, y: GROUND_Y - 8, collected: false, sparkle: 0 };

    /* ── Avain (Dig Gamesta) ───────────────────────── */
    let digKeyCollected = false;
    let boulderKeyCollected = false;
    let bmKeyCollected = false;
    let darkRoom = false;
    let firstHouseWindowsLit = false;
    let firstHouseKickCount = 0;
    let firstHouseKickTarget = 0;    // random 3-6, arvotaan ekan potkun yhteydessä
    let firstHouseWindowTimer = 0;   // 20s laskuri, nollautuu joka potkusta

    let savedPlayerX = 40;
    let savedPlayerY = GROUND_Y - 30;

    /* ── Tila ────────────────────────────────────────── */
    let state;
    let animFrameId;
    let lastTime = 0;
    let particles = [];
    let notifTimer = 0;
    let stars = [];
    let shootingStar = null;   // Tähdenlento
    let satellite = null;      // Satelliitti

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
        state = GameState.load();
        for (let i = 0; i < lamps.length; i++) {
            lamps[i].lit = state.litLamps[i];
            lamps[i].kickCount = lamps[i].kickCount || 0;
            lamps[i].overheat = lamps[i].overheat || false;
            lamps[i].overheatTimer = lamps[i].overheatTimer || 0;
        }
        coin.collected = state.inventory.coin;
        if (coin.collected) { coin.x = -100; coin.y = -100; }
        digKeyCollected = state.digKeyCollected || false;
        boulderKeyCollected = state.boulderKeyCollected || false;
        bmKeyCollected = state.bmKeyCollected || false;
        stars = [];
        for (let i = 0; i < 80; i++) {
            stars.push({
                x: Math.random() * WORLD_W,
                y: Math.random() * (GROUND_Y - 30),
                r: Math.random() * 1.5 + 0.5,
                blink: Math.random() * Math.PI * 2
            });
        }
        setupInput();
        resize();
        lastTime = performance.now();
        loop(lastTime);
    }

    /* ═══════════════════════════════════════════════════
       SYÖTTEET
       ═══════════════════════════════════════════════════ */
    function setupInput() {
        // ⚡ Pakota D-pad näkyviin kaikilla kosketuslaitteilla
        //    (varmempi kuin pelkkä CSS @media, toimii myös HTTPS/Pagesissa)
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
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
        update(dt);
        render();
        actionJustPressed = false;
    }
    const LAMP_RADIUS = 30;
/* ═══════════════════════════════════════════════════
       PÄIVITYS
       ═══════════════════════════════════════════════════ */
    function update(dt) {
        // Dark room – pysäytä kaikki, vain Exit
        if (darkRoom) {
            if (actionJustPressed) { darkRoom = false; actionJustPressed = false; }
            return;
        }

        // ── Liike ──────────────────────────────────
        let moveX = 0;
        if (keys['ArrowLeft'] || keys['a'] || keys['A'])  moveX = -1;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) moveX = 1;
        player.vx = moveX * PLAYER_SPEED;

        const onGround = player.y + player.h >= GROUND_Y;
        if ((keys['ArrowUp'] || keys['w'] || keys['W']) && onGround) {
            player.vy = JUMP_VEL;
        }
        player.vy += GRAVITY * dt;
        player.y += player.vy * dt;
        player.x += player.vx * dt;

        if (player.y + player.h >= GROUND_Y) {
            player.y = GROUND_Y - player.h;
            player.vy = 0;
        }
        player.x = Math.max(0, Math.min(WORLD_W - player.w, player.x));

        // Päivitä kävelyanimaatio
        if (moveX !== 0) {
            player.facing = moveX;
            player.walking = true;
            player.walkTimer += dt;
            if (player.walkTimer > 8) {
                player.walkFrame = (player.walkFrame + 1) % 4;
                player.walkTimer = 0;
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
                coin.collected = true;
                state.inventory.coin = true;
                GameState.save(state);
                coin.x = -100; coin.y = -100;
                showNotification('💰 Löysit kolikon!');
                spawnParticles(cx, cy, '#ffd700', 12);
                updateHUD();
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
        if (notifTimer > 0) {
            notifTimer -= dt;
            if (notifTimer <= 0) {
                const el = document.getElementById('notification');
                if (el) el.textContent = '';
            }
        }
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

        // ── Tähdenlento ─────────────────────────────
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

        // ── Satelliitti ─────────────────────────────
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
/* ── Toimintopainikkeen käsittely ──────────────── */
    function handleAction() {
        const px = player.x + player.w / 2;
        const py = player.y + player.h / 2;

        // 1. OVET ENSIN – ei potkua, kävellään suoraan sisään
        for (let i = 0; i < lamps.length; i++) {
            const lamp = lamps[i];
            const dc = doorCenter(buildings[lamp.bldgIdx]);
            const dx = px - dc.x, dy = py - dc.y;
            if (Math.sqrt(dx*dx + dy*dy) < DOOR_RADIUS) {
                if (lamp.lit) {
                    // Boulder Dash vaatii Dig Gamesta kerätyn avaimen
                    if (lamp.gameUrl && lamp.gameUrl.includes('boulder_dash') && !digKeyCollected) {
                        showNotification('🔑 Avain puuttuu.\nLäpäise Dig Game ensin!');
                        return;
                    }
                    // Blue Max vaatii Boulder Dashista kerätyn avaimen
                    if (lamp.gameUrl && lamp.gameUrl.includes('bluemax') && !boulderKeyCollected) {
                        showNotification('🔑 Avain puuttuu.\nLäpäise Boulder Dash ensin!');
                        return;
                    }
                    if (lamp.gameUrl) { enterGame(lamp.gameUrl); }
                    else {
                        if (i === 3 && bmKeyCollected) { darkRoom = true; }
                        else { showNotification('🚧 Tämä peli ei ole\nvielä valmis...'); }
                    }
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
            player.kicking = true;
            player.kickFrame = 0;
            if (firstHouseKickTarget === 0) {
                firstHouseKickTarget = 3 + Math.floor(Math.random() * 4); // 3-6
            }
            firstHouseKickCount++;
            firstHouseWindowTimer = 1200; // 20s
            if (firstHouseKickCount >= firstHouseKickTarget && !firstHouseWindowsLit) {
                firstHouseWindowsLit = true;
                spawnParticles(dc0.x, dc0.y, '#ffdd88', 10);
            }
            return;
        }
        for (let i = 0; i < buildings.length; i++) {
            if (lamps.some(l => l.bldgIdx === i)) continue;
            const dc = doorCenter(buildings[i]);
            const dx = px - dc.x, dy = py - dc.y;
            if (Math.sqrt(dx*dx + dy*dy) < DOOR_RADIUS) {
                showNotification('🔒 Tämä ovi on\npysyvästi lukossa.');
                return;
            }
        }

        // 2. Ei oven lähellä → POTKU!
        player.kicking = true;
        player.kickFrame = 0;

        // Tarkista osuuko potku lamppuun
        for (let i = 0; i < lamps.length; i++) {
            const lamp = lamps[i];
            const dx = px - lamp.x, dy = py - GROUND_Y;
            if (Math.sqrt(dx*dx + dy*dy) < LAMP_RADIUS + 10) {
                // Jos lamppu on ylikuumentunut, älä tee mitään
                if (lamp.overheat) {
                    showNotification('🔥 Lamppu on\nylikuumentunut! Odota...');
                    return;
                }
                // Toggle ON/OFF
                lamps[i].lit = !lamps[i].lit;
                state.litLamps[i] = lamps[i].lit;
                // Laske potkut
                lamps[i].kickCount = (lamps[i].kickCount || 0) + 1;

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
                    showNotification('⚡ Lamppu ylikuumeni!\n20s jäähtymisaika...');
                    spawnParticles(lamp.x, GROUND_Y - LAMP_POST_H - 10, '#ff4400', 20);
                    }
                    return;
                }

                GameState.save(state);
                if (lamps[i].lit) {
                    showNotification('💡 Lamppu syttyi!');
                    spawnParticles(lamp.x, GROUND_Y - LAMP_POST_H - 10, '#ffff88', 8);
                } else {
                    showNotification('🌑 Lamppu sammui.');
                }
                return;
            }
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
        iframe.onload = () => {
            try { iframe.contentWindow.focus(); } catch(e) {}
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
        state = GameState.load();
        for (let i = 0; i < lamps.length; i++) {
            lamps[i].lit = state.litLamps[i];
            lamps[i].kickCount = 0;
            lamps[i].overheat = false;
            lamps[i].overheatTimer = 0;
        }
        coin.collected = state.inventory.coin;
        if (coin.collected) { coin.x = -100; coin.y = -100; }
        digKeyCollected = state.digKeyCollected || false;
        boulderKeyCollected = state.boulderKeyCollected || false;
        bmKeyCollected = state.bmKeyCollected || false;
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

    function showNotification(text) {
        notifTimer = 150;
        const el = document.getElementById('notification');
        el.textContent = text;
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = 'popIn 0.3s ease-out, fadeOut 0.5s 2.5s forwards';
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
    }
/* ═══════════════════════════════════════════════════
       PIIRTO – tausta, talot, maa
       ═══════════════════════════════════════════════════ */
    function render() {
        ctx.clearRect(0, 0, WORLD_W, WORLD_H);

        if (darkRoom) { drawDarkRoom(); return; }

        // Taivas
        const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        skyGrad.addColorStop(0, '#0a0a1e');
        skyGrad.addColorStop(0.6, '#111133');
        skyGrad.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, WORLD_W, GROUND_Y);

        // Kuu
        ctx.fillStyle = '#ddd';
        ctx.beginPath(); ctx.arc(680, 70, 30, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#0a0a1e';
        ctx.beginPath(); ctx.arc(692, 64, 26, 0, Math.PI*2); ctx.fill();

        // Tähdet (jokaisella oma random twinkle)
        for (const s of stars) {
            const freq = 800 + s.blink * 3000;
            const twinkle = Math.sin(Date.now() / freq + s.blink) * 0.5 + 0.5;
            const a = 0.15 + twinkle * 0.7;
            ctx.fillStyle = 'rgba(255,255,' + Math.floor(200 + twinkle * 55) + ',' + a + ')';
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
            // Kirkas pilkahdus
            if (twinkle > 0.92) {
                ctx.fillStyle = 'rgba(255,255,255,' + (a * 1.5) + ')';
                ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 0.5, 0, Math.PI*2); ctx.fill();
            }
        }

        // Tähdenlento
        if (shootingStar && shootingStar.active) {
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

        // Satelliitti (pieni vilkkuva piste)
        if (satellite && satellite.active) {
            const blink = Math.sin(satellite.blinkPhase) * 0.5 + 0.5;
            const alpha = 0.25 + blink * 0.65;
            ctx.fillStyle = 'rgba(255,255,255,' + alpha + ')';
            ctx.beginPath(); ctx.arc(satellite.x, satellite.y, 1.5, 0, Math.PI*2); ctx.fill();
        }

        drawBuildings();
        drawGround();

        // Lamput
        for (const lamp of lamps) drawLampPost(lamp);

        // Ovet – kaikkiin taloihin
        for (const bldg of buildings) drawDoor(bldg);

        // Kolikko
        if (!coin.collected) drawCoin();

        // Pelaaja
        drawPlayer();

        // Partikkelit
        for (const p of particles) {
            ctx.globalAlpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x-2, p.y-2, 4, 4);
        }
        ctx.globalAlpha = 1;
    }

    function drawBuildings() {
        for (const b of buildings) {
            const idx = buildings.indexOf(b);
            // Runko
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
            // Ikkunat
            const houseLit = idx === 0 && firstHouseWindowsLit;
            for (let wy = GROUND_Y - b.h + 25; wy < GROUND_Y - 35; wy += 32) {
                for (let wx = b.x + 10; wx < b.x + b.w - 15; wx += 24) {
                    if (wx + 10 > b.x + b.w - 6) continue;
                    if (houseLit) {
                        // Kaikki ikkunat kirkkaina + lämmin hehku
                        const flicker = 0.85 + Math.sin(Date.now() * 0.005 + wx * 0.1 + wy * 0.07) * 0.15;
                        ctx.fillStyle = 'rgba(255,220,120,' + (0.7 * flicker) + ')';
                        ctx.fillRect(wx, wy, 10, 14);
                        ctx.strokeStyle = 'rgba(255,200,100,0.6)'; ctx.lineWidth = 1;
                        ctx.strokeRect(wx, wy, 10, 14);
                        // Pieni hehku ikkunan ympärille
                        const glow = ctx.createRadialGradient(wx + 5, wy + 7, 1, wx + 5, wy + 7, 12);
                        glow.addColorStop(0, 'rgba(255,200,80,0.25)');
                        glow.addColorStop(1, 'rgba(255,200,80,0)');
                        ctx.fillStyle = glow;
                        ctx.fillRect(wx - 6, wy - 5, 22, 24);
                    } else {
                        const lit = Math.sin(b.x * 13 + wy * 7) > 0.2;
                        ctx.fillStyle = lit ? 'rgba(255,200,80,0.12)' : '#0a0a15';
                        ctx.fillRect(wx, wy, 10, 14);
                        ctx.strokeStyle = '#2a2a3e'; ctx.lineWidth = 1;
                        ctx.strokeRect(wx, wy, 10, 14);
                    }
                }
            }
            // Yläreuna
            ctx.fillStyle = '#2a2a3e';
            ctx.fillRect(b.x - 2, GROUND_Y - b.h - 3, b.w + 4, 5);
        }
    }

    function drawGround() {
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, GROUND_Y, WORLD_W, WORLD_H - GROUND_Y);
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, GROUND_Y, WORLD_W, 3);
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(0, GROUND_Y - 2, WORLD_W, 2);
    }

    /* ── Pimeä huone (COMMANDO + BM-avain) ──────── */
    function drawDarkRoom() {
        // Täysin pimeä tausta
        ctx.fillStyle = '#050508';
        ctx.fillRect(0, 0, WORLD_W, WORLD_H);

        // Pieni valokeila katosta
        const g = ctx.createRadialGradient(400, 30, 10, 400, 120, 220);
        g.addColorStop(0, 'rgba(255,240,200,0.15)');
        g.addColorStop(0.6, 'rgba(255,200,100,0.04)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(200, 0, 400, 300);

        // Pöytä
        const tx = 350, ty = 280, tw = 100, th = 12;
        ctx.fillStyle = '#3a2010';
        ctx.fillRect(tx - 2, ty, tw + 4, th);
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(tx, ty - 2, tw, th + 2);
        // Pöydän jalat
        ctx.fillStyle = '#2a1808';
        ctx.fillRect(tx + 5, ty + th, 8, 60);
        ctx.fillRect(tx + tw - 13, ty + th, 8, 60);

        // Kultainen pokaali pöydällä
        const cx = tx + tw / 2, cy = ty - 5;
        // Jalusta
        ctx.fillStyle = '#b8860b';
        ctx.fillRect(cx - 12, cy, 24, 6);
        ctx.fillStyle = '#daa520';
        ctx.fillRect(cx - 8, cy - 4, 16, 4);
        // Varsi
        ctx.fillStyle = '#daa520';
        ctx.fillRect(cx - 3, cy - 30, 6, 26);
        // Malja
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(cx - 18, cy - 30);
        ctx.lineTo(cx - 14, cy - 55);
        ctx.quadraticCurveTo(cx, cy - 62, cx + 14, cy - 55);
        ctx.lineTo(cx + 18, cy - 30);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#daa520';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Pokaalin kahvat
        ctx.strokeStyle = '#daa520';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx - 16, cy - 42, 7, -0.5, 1.8);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 16, cy - 42, 7, 1.3, -1.8, true);
        ctx.stroke();

        // Kiilto pokaalissa
        const gg = ctx.createRadialGradient(cx - 5, cy - 48, 2, cx, cy - 40, 20);
        gg.addColorStop(0, 'rgba(255,255,255,0.5)');
        gg.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 45, 10, 0, Math.PI * 2);
        ctx.fill();

        // "To be continued..."
        ctx.fillStyle = '#ccaa44';
        ctx.font = 'italic 16px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('To be continued...', 400, 370);

        // Poistumisvihje
        const pulse = Math.sin(Date.now() / 800) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255,255,255,${pulse})`;
        ctx.font = '10px Arial, sans-serif';
        ctx.fillText('Paina Space poistuaksesi', 400, 390);
        ctx.textAlign = 'start';
    }

/* ── Lampputolppa ─────────────────────────────── */
    function drawLampPost(lamp) {
        const bx = lamp.x;                    // tolpan juuri (x)
        const by = GROUND_Y;                   // tolpan juuri (y = maanpinta)
        const poleTop = by - LAMP_POST_H + 15; // tolpan yläpää
        const bulbY = poleTop - 22;            // lampun kupu
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

        // Valokeila (jos palaa)
        if (lamp.lit) {
            const g = ctx.createRadialGradient(bx, bulbY + 10, 4, bx, bulbY + 10, 90);
            g.addColorStop(0, 'rgba(255,240,150,0.7)');
            g.addColorStop(0.5, 'rgba(255,200,50,0.15)');
            g.addColorStop(1, 'rgba(255,200,50,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(bx, bulbY + 10, 90, 0, Math.PI*2); ctx.fill();
        }

        // Tolpan varsi (puinen/rautainen)
        ctx.fillStyle = '#4a3820';
        ctx.fillRect(bx - 3, poleTop, 6, by - poleTop);

        // Tolpan jalusta
        ctx.fillStyle = '#555';
        ctx.fillRect(bx - 7, by - 6, 14, 6);

        // Poikkipalkki lampun alla
        ctx.fillStyle = '#4a3820';
        ctx.fillRect(bx - 10, poleTop - 4, 20, 4);

        // Lampun kupu
        ctx.fillStyle = lamp.overheat
            ? 'rgba(255,' + Math.round(60 + (Math.sin(Date.now() * 0.025) * 0.3 + 0.7) * 40) + ',10,0.8)'
            : (lamp.lit ? '#ffffaa' : '#2a2a2a');
        ctx.beginPath();
        ctx.arc(bx, bulbY + 6, 9, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = lamp.overheat ? '#882200' : '#555'; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bx, bulbY + 6, 9, Math.PI, 0);
        ctx.stroke();

        // Kuvun "hattu"
        ctx.fillStyle = lamp.overheat ? '#662200' : '#555';
        ctx.fillRect(bx - 9, bulbY - 3, 18, 4);

        // Pieni valopilkku kuvun sisällä
        if (lamp.lit) {
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(bx, bulbY + 4, 4, 0, Math.PI*2);
            ctx.fill();
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

        // Ovikaari / syvennys
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(dx - 2, dy - 2, DOOR_W + 4, DOOR_H + 2);

        // Ovi
        // Etsi lamppu joka kuuluu tähän taloon
        const ownerLamp = lamps.find(l => l.bldgIdx === buildings.indexOf(bldg));
        const isActive = ownerLamp && ownerLamp.lit;
        ctx.fillStyle = isActive ? '#5a3a20' : '#1a1010';
        ctx.fillRect(dx, dy, DOOR_W, DOOR_H);

        // Ovipaneelit
        ctx.strokeStyle = isActive ? '#7a4a30' : '#2a1a1a';
        ctx.lineWidth = 1;
        ctx.strokeRect(dx + 3, dy + 3, Math.floor(DOOR_W/2) - 6, DOOR_H - 10);
        ctx.strokeRect(dx + DOOR_W/2 + 2, dy + 3, Math.floor(DOOR_W/2) - 6, DOOR_H - 10);

        // Ovenkahva
        ctx.fillStyle = (ownerLamp && ownerLamp.lit) ? '#ffd700' : '#333';
        ctx.beginPath();
        ctx.arc(dx + DOOR_W - 6, dy + DOOR_H/2, 2.5, 0, Math.PI*2);
        ctx.fill();

        // Merkkivalo oven yllä
        if (ownerLamp) {
            ctx.fillStyle = ownerLamp.lit ? '#ffd700' : '#222';
            if (ownerLamp.lit) { ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 6; }
            ctx.fillRect(dx + DOOR_W/2 - 5, dy - 7, 10, 3);
            ctx.shadowBlur = 0;
        }
    }
/* ── Kolikko ──────────────────────────────────── */
    function drawCoin() {
        const cx = coin.x, cy = coin.y;
        const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 18);
        g.addColorStop(0, 'rgba(255,215,0,0.5)');
        g.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.arc(cx, cy, 7+Math.sin(coin.sparkle), 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#cc9900'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#aa7700';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('$', cx, cy+1);
        ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    }

    /* ── Pelaaja ────────────────────────────────── */
    function drawPlayer() {
        const px = Math.round(player.x), py = Math.round(player.y);
        const pw = player.w, ph = player.h;
        ctx.save();
        if (player.facing === -1) {
            ctx.translate(px+pw/2, 0);
            ctx.scale(-1, 1);
            ctx.translate(-(px+pw/2), 0);
        }
        ctx.fillStyle = '#3366cc';
        ctx.fillRect(px+4, py+10, pw-8, ph-18);
        ctx.fillStyle = '#ffcc99';
        ctx.beginPath(); ctx.arc(px+pw/2, py+6, 7, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#553300';
        ctx.beginPath(); ctx.arc(px+pw/2, py+3, 7, Math.PI, 0); ctx.fill();
        // Lippis – lippa kulkusuuntaan
        ctx.fillStyle = '#3366cc';
        ctx.fillRect(px+pw/2 - 6, py, 14, 5);
        ctx.fillStyle = '#224488';
        ctx.fillRect(px+pw/2 + 2, py + 1, 7, 3);
        ctx.fillRect(px+pw/2 + 3, py + 4, 4, 1);
        // Jalat + potku-animaatio
        ctx.fillStyle = '#224488';
        if (player.kicking) {
            const kp = player.kickFrame / KICK_DURATION; // 0..1
            const swing = Math.sin(kp * Math.PI);         // 0→1→0
            // Tukijalka
            ctx.fillRect(px + 3, py + ph - 8, 4, 8);
            // Potkiva jalka – pyörähtää eteen
            ctx.save();
            ctx.translate(px + pw - 10, py + ph - 6);
            ctx.rotate(-swing * 1.1);
            ctx.fillRect(0, -2, 4, 14);
            ctx.restore();
            // Kenkä potkivassa jalassa
            const shoeX = px + pw - 8 + swing * 20;
            const shoeY = py + ph - 6 - swing * 12;
            ctx.fillStyle = '#331100';
            ctx.fillRect(shoeX - 3, shoeY + 2, 8, 3);
        } else {
            ctx.fillRect(px + 5, py + ph - 8, 4, 8);
            ctx.fillRect(px + pw - 9, py + ph - 8, 4, 8);
            ctx.fillStyle = '#331100';
            ctx.fillRect(px + 4, py + ph - 2, 6, 2);
            ctx.fillRect(px + pw - 10, py + ph - 2, 6, 2);
        }
        ctx.restore();
    }

    /* SKAALAUS */
    function resize() {
        const wrapper = document.getElementById('game-wrapper');
        if (!wrapper) return;
        const maxW = wrapper.clientWidth - 16;
        // Vain HUD (~50px), ohjaimet overlayna → ei vie tilaa
        const maxH = wrapper.clientHeight - 60;
        const scale = Math.min(maxW / WORLD_W, maxH / WORLD_H);
        canvas.width = WORLD_W;
        canvas.height = WORLD_H;
        canvas.style.width = Math.floor(WORLD_W * scale) + 'px';
        canvas.style.height = Math.floor(WORLD_H * scale) + 'px';
    }

    return { init, resize, closeGame };
})();

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    if (canvas) Street.init(canvas);
});
window.addEventListener('resize', () => { if (Street.resize) Street.resize(); });