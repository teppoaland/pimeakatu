/* ═══════════════════════════════════════════════════════════
   audio.js – Commando C64 -proseduraaliset äänet
   Web Audio API: kivääri, kranaatti, räjähdys, kuolema
   ═══════════════════════════════════════════════════════════ */
const AudioFX = (() => {
    let ctx = null;

    function init() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (ctx.state === 'suspended') ctx.resume();
    }

    document.addEventListener('touchstart', init, { once: true, passive: true });
    document.addEventListener('mousedown', init, { once: true });
    document.addEventListener('keydown', init, { once: true });

    /* ── Kivääri (nopea poksahdus) ──────────────────── */
    function playGun() {
        try {
            init();
            const now = ctx.currentTime;
            const dur = 0.06;
            const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.006));
            }
            const src = ctx.createBufferSource(); src.buffer = buf;
            const hp = ctx.createBiquadFilter();
            hp.type = 'highpass'; hp.frequency.value = 2500;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            src.connect(hp).connect(gain).connect(ctx.destination);
            src.start(now); src.stop(now + dur);
        } catch(e) {}
    }

    /* ── Kranaatin heitto (vihellys) ────────────────── */
    function playGrenadeThrow() {
        try {
            init();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.5);
        } catch(e) {}
    }

    /* ── Räjähdys (matala jyrähdys + kohina) ────────── */
    function playExplosion() {
        try {
            init();
            const now = ctx.currentTime;
            const dur = 0.4;
            const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
            }
            const src = ctx.createBufferSource(); src.buffer = buf;
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass'; lp.frequency.value = 400;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            src.connect(lp).connect(gain).connect(ctx.destination);
            src.start(now); src.stop(now + dur);

            // Bassoboost
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(80, now);
            osc.frequency.exponentialRampToValueAtTime(20, now + dur);
            const bgain = ctx.createGain();
            bgain.gain.setValueAtTime(0.15, now);
            bgain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            osc.connect(bgain).connect(ctx.destination);
            osc.start(now); osc.stop(now + dur);
        } catch(e) {}
    }

    /* ── Pelaajan kuolema (dramaattinen) ─────────────── */
    function playDeath() {
        try {
            init();
            const now = ctx.currentTime;
            const dur = 0.6;
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + dur);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now); osc.stop(now + dur);
        } catch(e) {}
    }

    /* ── Voittofanfaari ──────────────────────────────── */
    function playWin() {
        try {
            init();
            const now = ctx.currentTime;
            [523, 659, 784, 1047].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'square';
                osc.frequency.value = freq;
                const gain = ctx.createGain();
                const t = now + i * 0.15;
                gain.gain.setValueAtTime(0, t);
                gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
                osc.connect(gain).connect(ctx.destination);
                osc.start(t); osc.stop(t + 0.3);
            });
        } catch(e) {}
    }

    return { init, playGun, playGrenadeThrow, playExplosion, playDeath, playWin };
})();