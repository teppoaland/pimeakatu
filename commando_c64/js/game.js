/* ═══════════════════════════════════════════════════════════
   game.js – Commando C64 -pelimoottori v1.0 MVP
   Ylhäältä kuvattu, pystysuunnassa vierivä sotapeli
   ═══════════════════════════════════════════════════════════ */
const Commando = (() => {
    const CW = 400, CH = 600;
    const PW = 16, PH = 20, PS = 180, SS = 60, BS = 350;
    const ESB = 1.2, GM = 6, GS = 250, GF = 1.2, GR = 50, INV = 2, WIN = 2000;

    let canvas, ctx, livesEl, grenadeEl, scoreEl, progressEl;
    let overlay, overlayTitle, overlayMsg, overlayBtn;
    const ST = { INTRO: 0, PLAY: 1, DEATH: 2, OVER: 3, WIN: 4 };
    let state = ST.INTRO, score = 0, scrollY = 0, deathTimer = 0;
    let pl = { x: 0, y: 0, w: PW, h: PH, lives: 3, grenades: GM, invTimer: 0, dirX: 0, dirY: -1 };
    let enemies = [], pBullets = [], eBullets = [], grenades = [], explosions = [], obstacles = [], particles = [];
    let eSpawnT = 0, gunCD = 0, genUpTo = 0;
    const keys = {};
    let tDir = { x: 0, y: 0 }, tGren = false, tActive = false;
    let lastT = 0, gkDown = false, gtWas = false;

    /* ── INIT ─────────────────────────────────────────── */
    function init(c) {
        canvas = c; ctx = canvas.getContext('2d'); rs();
        livesEl = document.getElementById('lives-display');
        grenadeEl = document.getElementById('grenade-display');
        scoreEl = document.getElementById('score-display');
        progressEl = document.getElementById('progress-display');
        overlay = document.getElementById('overlay');
        overlayTitle = document.getElementById('overlay-title');
        overlayMsg = document.getElementById('overlay-message');
        overlayBtn = document.getElementById('overlay-button');
        overlayBtn.addEventListener('click', startGame);
        overlayBtn.addEventListener('touchend', e => { e.preventDefault(); startGame(); });
        setupInput(); updateHUD(); requestAnimationFrame(loop);
    }

    function rs() {
        const maxW = window.innerWidth - 20, maxH = window.innerHeight - 180;
        const s = Math.min(maxW / CW, maxH / CH, 1);
        canvas.width = CW; canvas.height = CH;
        canvas.style.width = (CW * s) + 'px'; canvas.style.height = (CH * s) + 'px';
    }

    /* ── INPUT ────────────────────────────────────────── */
    function setupInput() {
        window.addEventListener('keydown', e => { keys[e.code] = true; e.preventDefault(); });
        window.addEventListener('keyup', e => { keys[e.code] = false; e.preventDefault(); });
        document.querySelectorAll('.touch-btn[data-dir]').forEach(btn => {
            btn.addEventListener('touchstart', e => { e.preventDefault(); tActive = true; setTDir(btn.dataset.dir, true); });
            btn.addEventListener('touchend', e => { e.preventDefault(); tActive = true; rebuildTDir(); });
            btn.addEventListener('mousedown', e => { if (tActive) return; e.preventDefault(); setTDir(btn.dataset.dir, true); });
            btn.addEventListener('mouseup', e => { if (tActive) return; e.preventDefault(); rebuildTDir(); });
        });
        const gb = document.getElementById('grenade-btn');
        if (gb) {
            gb.addEventListener('touchstart', e => { e.preventDefault(); tActive = true; tGren = true; });
            gb.addEventListener('touchend', e => { e.preventDefault(); tGren = false; });
            gb.addEventListener('mousedown', e => { if (!tActive) { e.preventDefault(); tGren = true; } });
            gb.addEventListener('mouseup', e => { if (!tActive) { e.preventDefault(); tGren = false; } });
        }
    }

    function setTDir(dir, on) {
        if (on) {
            if (dir === 'up') tDir.y = -1; else if (dir === 'down') tDir.y = 1;
            else if (dir === 'left') tDir.x = -1; else if (dir === 'right') tDir.x = 1;
        }
    }

    function rebuildTDir() {
        tDir.x = 0; tDir.y = 0;
        document.querySelectorAll('.touch-btn[data-dir]').forEach(b => {
            if (b.matches(':active')) setTDir(b.dataset.dir, true);
        });
    }

    function getInput() {
        let dx = 0, dy = 0;
        if (keys['ArrowLeft'] || keys['KeyA']) dx = -1;
        if (keys['ArrowRight'] || keys['KeyD']) dx = 1;
        if (keys['ArrowUp'] || keys['KeyW']) dy = -1;
        if (keys['ArrowDown'] || keys['KeyS']) dy = 1;
        if (tDir.x !== 0 || tDir.y !== 0) { dx = tDir.x; dy = tDir.y; }
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 1) { dx /= len; dy /= len; }
        return { x: dx, y: dy };
    }

    /* ── GAME START ───────────────────────────────────── */
    function startGame() {
        AudioFX.init();
        score = 0; scrollY = 0; genUpTo = CH;
        pl.x = CW / 2; pl.y = CH - 80;
        pl.lives = 3; pl.grenades = GM; pl.invTimer = INV; pl.dirX = 0; pl.dirY = -1;
        enemies = []; pBullets = []; eBullets = []; grenades = []; explosions = []; obstacles = []; particles = [];
        eSpawnT = 0; gunCD = 0; deathTimer = 0;
        genObs(0); state = ST.PLAY;
        overlay.classList.add('hidden'); updateHUD();
    }

    /* ── OBSTACLE GEN ─────────────────────────────────── */
    function genObs(fromY) {
        const toY = fromY + 500; let y = Math.max(fromY, genUpTo);
        while (y < toY) {
            y += 80 + Math.random() * 140;
            if (Math.random() < 0.25) {
                const ox = 20 + Math.random() * (CW - 120);
                obstacles.push({ x: ox, wy: y, w: 50, h: 28, type: 'bunker' });
            } else {
                const ox = 30 + Math.random() * (CW - 100);
                obstacles.push({ x: ox, wy: y, w: 40, h: 12, type: 'sandbag' });
            }
        }
        genUpTo = toY;
    }
/* ── LOOP ─────────────────────────────────────────── */
    function loop(ts) {
        requestAnimationFrame(loop);
        if (!lastT) lastT = ts;
        let dt = (ts - lastT) / 1000;
        if (dt > 0.1) dt = 0.1;
        lastT = ts;
        update(dt); render();
    }

    function update(dt) {
        if (state === ST.INTRO || state === ST.OVER || state === ST.WIN) return;
        if (state === ST.DEATH) {
            deathTimer -= dt;
            updateParticles(dt);
            if (deathTimer <= 0) {
                if (pl.lives <= 0) { state = ST.OVER; showOverlay('GAME OVER', 'Viholliset voittivat...', 'Yritä uudestaan'); }
                else respawn();
            }
            return;
        }
        updatePlayer(dt); updateAutoFire(dt);
        updateEnemies(dt); updatePBullets(dt); updateEBullets(dt);
        updateGrenades(dt); updateExplosions(dt); updateParticles(dt);
        checkCollisions(); updateScroll(dt); updateHUD();
    }

    /* ── PLAYER ───────────────────────────────────────── */
    function updatePlayer(dt) {
        if (pl.invTimer > 0) pl.invTimer -= dt;
        const inp = getInput();
        pl.dirX = inp.x; pl.dirY = inp.y;
        if (inp.y !== 0) pl.dirY = inp.y;
        pl.x += inp.x * PS * dt;
        pl.y += inp.y * PS * dt;
        pl.x = Math.max(PW / 2, Math.min(CW - PW / 2, pl.x));
        pl.y = Math.max(PH / 2 + 40, Math.min(CH - PH / 2 - 10, pl.y));
        for (const o of obstacles) {
            const oy = o.wy - scrollY;
            if (oy < -50 || oy > CH + 50) continue;
            if (rc(pl.x - PW/2, pl.y - PH/2, PW, PH, o.x, oy, o.w, o.h)) {
                const pCx = pl.x, pCy = pl.y, oCx = o.x + o.w/2, oCy = oy + o.h/2;
                const dx = pCx - oCx, dy = pCy - oCy;
                const ox = (PW + o.w)/2 - Math.abs(dx), oy2 = (PH + o.h)/2 - Math.abs(dy);
                if (ox < oy2) pl.x += Math.sign(dx) * ox;
                else pl.y += Math.sign(dy) * oy2;
            }
        }
    }

    function updateAutoFire(dt) {
        const inp = getInput();
        const moving = inp.x !== 0 || inp.y !== 0;
        gunCD -= dt;
        if (moving && gunCD <= 0) {
            gunCD = 0.15;
            pBullets.push({ x: pl.x, y: pl.y - PH/2, vx: 0, vy: -BS, life: 1.5 });
            AudioFX.playGun();
        }
    }

    /* ── GRENADES ─────────────────────────────────────── */
    function throwGrenade() {
        if (pl.grenades <= 0) return;
        pl.grenades--;
        const inp = getInput();
        let dx = inp.x, dy = inp.y;
        if (dx === 0 && dy === 0) { dx = 0; dy = -1; }
        const len = Math.sqrt(dx*dx + dy*dy); dx /= len; dy /= len;
        grenades.push({ x: pl.x, y: pl.y - PH/2, vx: dx*GS, vy: dy*GS, fuse: GF });
        AudioFX.playGrenadeThrow(); updateHUD();
    }

    function updateGrenades(dt) {
        for (let i = grenades.length - 1; i >= 0; i--) {
            const g = grenades[i];
            g.x += g.vx * dt; g.y += g.vy * dt; g.fuse -= dt;
            if (g.fuse <= 0) {
                explosions.push({ x: g.x, y: g.y, life: 0.3 });
                spawnParticles(g.x, g.y, 12, '#f60');
                AudioFX.playExplosion();
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    if (dist(e.x, e.y, g.x, g.y) < GR) { spawnParticles(e.x, e.y, 6, '#a64'); enemies.splice(j, 1); score += 100; }
                }
                for (let j = obstacles.length - 1; j >= 0; j--) {
                    const o = obstacles[j];
                    if (o.type !== 'bunker') continue;
                    const oy = o.wy - scrollY;
                    if (dist(o.x + o.w/2, oy + o.h/2, g.x, g.y) < GR + 20) { spawnParticles(o.x+o.w/2, oy+o.h/2, 8, '#555'); obstacles.splice(j, 1); score += 200; }
                }
                grenades.splice(i, 1);
            }
            if (g.x < -50 || g.x > CW+50 || g.y < -50 || g.y > CH+50) grenades.splice(i, 1);
        }
    }
/* ── ENEMIES ──────────────────────────────────────── */
    function updateEnemies(dt) {
        eSpawnT -= dt;
        if (eSpawnT <= 0) { eSpawnT = ESB + Math.random() * 0.6; spawnEnemy(); }
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];
            e.y += e.vy * dt;
            e.x += Math.sin(e._w + scrollY * 0.01) * 40 * dt;
            e._st -= dt;
            if (e._st <= 0 && e.y > 20 && e.y < CH - 40) {
                e._st = 1.5 + Math.random() * 2;
                eBullets.push({ x: e.x, y: e.y + 10, vx: (pl.x - e.x) * 0.3, vy: 150 + Math.random() * 50, life: 2.5 });
            }
            if (e.y > CH + 30) enemies.splice(i, 1);
        }
    }

    function spawnEnemy() {
        enemies.push({ x: 20 + Math.random()*(CW-40), y: -20, w: 12, h: 16, vy: 50 + Math.random()*70, _w: Math.random()*Math.PI*2, _st: 2 + Math.random()*2 });
    }

    /* ── BULLETS ──────────────────────────────────────── */
    function updatePBullets(dt) {
        for (let i = pBullets.length - 1; i >= 0; i--) {
            const b = pBullets[i]; b.x += b.vx*dt; b.y += b.vy*dt; b.life -= dt;
            if (b.life <= 0 || b.x < -20 || b.x > CW+20 || b.y < -20 || b.y > CH+20) pBullets.splice(i, 1);
        }
    }

    function updateEBullets(dt) {
        for (let i = eBullets.length - 1; i >= 0; i--) {
            const b = eBullets[i]; b.x += b.vx*dt; b.y += b.vy*dt; b.life -= dt;
            if (b.life <= 0 || b.x < -20 || b.x > CW+20 || b.y < -20 || b.y > CH+20) eBullets.splice(i, 1);
        }
    }

    /* ── EFFECTS ──────────────────────────────────────── */
    function updateExplosions(dt) {
        for (let i = explosions.length - 1; i >= 0; i--) {
            explosions[i].life -= dt;
            if (explosions[i].life <= 0) explosions.splice(i, 1);
        }
    }

    function spawnParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            const a = Math.random()*Math.PI*2, s = 60 + Math.random()*120;
            particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 0.3+Math.random()*0.5, color });
        }
    }

    function updateParticles(dt) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i]; p.x += p.vx*dt; p.y += p.vy*dt; p.life -= dt;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    /* ── COLLISIONS ───────────────────────────────────── */
    function checkCollisions() {
        for (let i = pBullets.length - 1; i >= 0; i--) {
            const b = pBullets[i];
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];
                if (ptR(b.x, b.y, e.x - e.w/2, e.y - e.h/2, e.w, e.h)) { spawnParticles(e.x, e.y, 4, '#a64'); enemies.splice(j, 1); pBullets.splice(i, 1); score += 50; break; }
            }
        }
        if (pl.invTimer <= 0) {
            for (let i = eBullets.length - 1; i >= 0; i--) {
                if (ptR(eBullets[i].x, eBullets[i].y, pl.x-PW/2, pl.y-PH/2, PW, PH)) { eBullets.splice(i, 1); playerHit(); return; }
            }
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                if (rc(pl.x-PW/2, pl.y-PH/2, PW, PH, e.x-e.w/2, e.y-e.h/2, e.w, e.h)) { enemies.splice(i, 1); spawnParticles(e.x, e.y, 4, '#a64'); playerHit(); return; }
            }
        }
    }

    function playerHit() {
        pl.lives--; spawnParticles(pl.x, pl.y, 15, '#f60'); AudioFX.playDeath();
        state = ST.DEATH; deathTimer = pl.lives <= 0 ? 1.5 : 1.0; updateHUD();
    }

    /* ── RENDER ────────────────────────────────────────── */
    function render() {
        ctx.fillStyle = '#484'; ctx.fillRect(0, 0, CW, CH);
        // Ruudukko
        ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 1;
        const gs = 40, oy = scrollY % gs;
        for (let y = -gs + oy; y < CH; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }
        for (let x = 0; x < CW; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CH); ctx.stroke(); }

        // Esteet
        for (const o of obstacles) {
            const oy = o.wy - scrollY;
            if (oy < -40 || oy > CH + 40) continue;
            if (o.type === 'sandbag') {
                ctx.fillStyle = '#964'; ctx.fillRect(o.x, oy, o.w, o.h);
                ctx.strokeStyle = '#642'; ctx.lineWidth = 1; ctx.strokeRect(o.x, oy, o.w, o.h);
                ctx.strokeStyle = '#753'; ctx.beginPath(); ctx.moveTo(o.x, oy + o.h/2); ctx.lineTo(o.x + o.w, oy + o.h/2); ctx.stroke();
            } else {
                ctx.fillStyle = '#555'; ctx.fillRect(o.x, oy, o.w, o.h);
                ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.strokeRect(o.x, oy, o.w, o.h);
                ctx.fillStyle = '#222'; ctx.fillRect(o.x + o.w/2 - 6, oy + 2, 12, 6);
            }
        }

        // Viholliset
        for (const e of enemies) {
            if (e.y < -30 || e.y > CH + 30) continue;
            ctx.fillStyle = '#a64'; ctx.fillRect(e.x - e.w/2, e.y - e.h/2, e.w, e.h);
            ctx.fillStyle = '#fa8'; ctx.fillRect(e.x - 4, e.y - e.h/2 - 5, 8, 6);
            ctx.fillStyle = '#333'; ctx.fillRect(e.x - 5, e.y + e.h/2 - 2, 5, 4); ctx.fillRect(e.x + 1, e.y + e.h/2 - 2, 5, 4);
            ctx.fillStyle = '#333'; ctx.fillRect(e.x + e.w/2 - 2, e.y - 2, 3, 8);
        }

        // Luodit
        for (const b of pBullets) { ctx.fillStyle = '#ff0'; ctx.fillRect(b.x - 1, b.y - 3, 2, 6); }
        for (const b of eBullets) { ctx.fillStyle = '#f44'; ctx.fillRect(b.x - 1, b.y - 1, 3, 3); }

        // Kranaatit
        for (const g of grenades) {
            ctx.fillStyle = '#6a6'; ctx.beginPath(); ctx.arc(g.x, g.y, 3, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#4a4'; ctx.lineWidth = 1; ctx.stroke();
            if (g.fuse < 0.3 && Math.floor(g.fuse * 20) % 2 === 0) { ctx.fillStyle = '#f60'; ctx.beginPath(); ctx.arc(g.x, g.y, 4, 0, Math.PI*2); ctx.fill(); }
        }

        // Räjähdykset
        for (const e of explosions) {
            const a = e.life / 0.3, r = GR * (1 - e.life / 0.3) + 10;
            const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r);
            g.addColorStop(0, 'rgba(255,255,200,' + a + ')');
            g.addColorStop(0.4, 'rgba(255,150,0,' + a*0.7 + ')');
            g.addColorStop(1, 'rgba(255,50,0,0)');
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(e.x, e.y, r, 0, Math.PI*2); ctx.fill();
        }

        // Partikkelit
        for (const p of particles) {
            ctx.globalAlpha = Math.max(0, p.life / 0.5);
            ctx.fillStyle = p.color; ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
        }
        ctx.globalAlpha = 1;

        // Pelaaja
        if (state !== ST.DEATH && (pl.invTimer <= 0 || Math.floor(pl.invTimer * 10) % 2 === 0)) {
            const px = pl.x - PW/2, py = pl.y - PH/2;
            ctx.fillStyle = '#4a8'; ctx.fillRect(px, py, PW, PH);
            ctx.fillStyle = '#362'; ctx.fillRect(px, py + PH*0.6, PW, 3);
            ctx.fillStyle = '#fa8'; ctx.fillRect(pl.x - 5, py - 7, 10, 8);
            ctx.fillStyle = '#5a6'; ctx.fillRect(pl.x - 6, py - 9, 12, 4);
            ctx.fillStyle = '#362'; ctx.fillRect(px + 2, py + PH, 5, 5); ctx.fillRect(px + PW - 7, py + PH, 5, 5);
            ctx.beginPath(); ctx.moveTo(pl.x, py);
            ctx.lineTo(pl.x + pl.dirX * 16, py + pl.dirY * 16);
            ctx.lineWidth = 2; ctx.strokeStyle = '#333'; ctx.stroke(); ctx.lineWidth = 1;
        }

        // Vierityspalkki
        const pct = Math.min(1, scrollY / WIN);
        ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(CW - 8, 0, 8, CH);
        ctx.fillStyle = '#0f0'; ctx.fillRect(CW - 8, CH * (1 - pct), 8, CH * pct);
    }
    function respawn() {
        pl.x = CW/2; pl.y = CH-80; pl.invTimer = INV;
        pl.grenades = Math.min(pl.grenades + 2, GM); state = ST.PLAY; eBullets = []; updateHUD();
    }

    /* ── SCROLL ───────────────────────────────────────── */
    function updateScroll(dt) {
        // Camera follows player upward: when player is in upper third, scroll up
        const upperZone = CH * 0.35;
        const lowerZone = CH * 0.75;
        if (pl.y < upperZone) {
            scrollY += (upperZone - pl.y) * 3 * dt;
        } else if (pl.y > lowerZone && scrollY > 0) {
            scrollY = Math.max(0, scrollY - (pl.y - lowerZone) * 3 * dt);
        }
        genObs(scrollY + CH);
        for (let i = obstacles.length - 1; i >= 0; i--) { if (obstacles[i].wy < scrollY - 100) obstacles.splice(i, 1); }
        if (scrollY >= WIN) { state = ST.WIN; AudioFX.playWin(); showOverlay('🏆 MISSION COMPLETE!', 'Super Joe voitti!', 'Pelaa uudestaan');
            try { window.parent.postMessage({ type: 'commandoKeyCollected', value: true }, '*'); } catch(e) {} }
    }
/* ── HUD ──────────────────────────────────────────── */
    function updateHUD() {
        if (livesEl) livesEl.textContent = '❤️ ' + pl.lives;
        if (grenadeEl) grenadeEl.textContent = '💣 ' + pl.grenades;
        if (scoreEl) scoreEl.textContent = '⭐ ' + score;
        if (progressEl) progressEl.textContent = '📏 ' + Math.floor(scrollY) + 'm';
    }

    function showOverlay(title, msg, btn) {
        overlayTitle.textContent = title; overlayMsg.textContent = msg; overlayBtn.textContent = btn;
        overlay.classList.remove('hidden');
    }

    /* ── HELPERS ─────────────────────────────────────── */
    function rc(x1, y1, w1, h1, x2, y2, w2, h2) { return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2; }
    function ptR(px, py, rx, ry, rw, rh) { return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh; }
    function dist(x1, y1, x2, y2) { const dx = x1 - x2, dy = y1 - y2; return Math.sqrt(dx*dx + dy*dy); }

    /* ── GRENADE KEY EVENTS ──────────────────────────── */
    window.addEventListener('keydown', e => {
        if (e.code === 'KeyB' && !gkDown && state === ST.PLAY) { gkDown = true; throwGrenade(); }
        if (e.code === 'Enter' && (state === ST.INTRO || state === ST.OVER || state === ST.WIN)) startGame();
    });
    window.addEventListener('keyup', e => { if (e.code === 'KeyB') gkDown = false; });

    // Touch grenade: kerran per 300ms
    setInterval(() => { if (tGren && !gtWas && state === ST.PLAY) throwGrenade(); gtWas = tGren; }, 300);

    return { init, rs };
})();