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

    /* ── Tila ────────────────────────────────────────── */
    let state;
    let animFrameId;
    let lastTime = 0;
    let particles = [];
    let notifTimer = 0;
    let stars = [];

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
            btn.addEventListener('pointerdown', e => {
                e.preventDefault();
                if (id === 'action-btn' && !actionPressed) actionJustPressed = true;
                if (id === 'action-btn') actionPressed = true;
                keys[key] = true;
            });
            btn.addEventListener('pointerup', e => {
                e.preventDefault();
                keys[key] = false;
                if (id === 'action-btn') actionPressed = false;
            });
            btn.addEventListener('pointerleave', () => {
                keys[key] = false;
                if (id === 'action-btn') actionPressed = false;
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
                    if (lamp.gameUrl) { enterGame(lamp.gameUrl); }
                    else { showNotification('🚧 Tämä peli ei ole\nvielä valmis...'); }
                } else {
                    showNotification('💡 Ovi on lukossa.\nSytytä lamppu ensin!');
                }
                return;
            }
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
                    // 5 potkua putkeen → ylikuumenee 20 sekunniksi
                    lamps[i].lit = false;
                    lamps[i].overheat = true;
                    lamps[i].overheatTimer = 1200; // 20s @ ~60fps
                    state.litLamps[i] = false;
                    GameState.save(state);
                    showNotification('⚡ Lamppu ylikuumeni!\n20s jäähtymisaika...');
                    spawnParticles(lamp.x, GROUND_Y - LAMP_POST_H - 10, '#ff4400', 20);
                    return;
                }

                GameState.save(state);
                if (lamps[i].lit) {
                    showNotification('💡 Lamppu syttyi! (' + lamps[i].kickCount + '/5)');
                    spawnParticles(lamp.x, GROUND_Y - LAMP_POST_H - 10, '#ffff88', 8);
                } else {
                    showNotification('🌑 Lamppu sammui. (' + lamps[i].kickCount + '/5)');
                }
                return;
            }
        }
    }

    function enterGame(url) {
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
        player.x = 40; player.y = GROUND_Y - 30;
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

        // Tähdet
        for (const s of stars) {
            const a = 0.4 + 0.4 * Math.sin(Date.now()/2000 + s.blink);
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
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
            // Runko
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
            // Ikkunat
            for (let wy = GROUND_Y - b.h + 25; wy < GROUND_Y - 35; wy += 32) {
                for (let wx = b.x + 10; wx < b.x + b.w - 15; wx += 24) {
                    if (wx + 10 > b.x + b.w - 6) continue;
                    const lit = Math.sin(b.x * 13 + wy * 7) > 0.2;
                    ctx.fillStyle = lit ? 'rgba(255,200,80,0.12)' : '#0a0a15';
                    ctx.fillRect(wx, wy, 10, 14);
                    ctx.strokeStyle = '#2a2a3e'; ctx.lineWidth = 1;
                    ctx.strokeRect(wx, wy, 10, 14);
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
        const maxH = wrapper.clientHeight - 80;
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