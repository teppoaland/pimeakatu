/* ═══════════════════════════════════════════════════════════
   audio.js – Blue Max C64 -proseduraaliset äänet
   Web Audio API: moottori, kk, pommit, räjähdykset, Rule Britannia
   ═══════════════════════════════════════════════════════════ */
const AudioFX = (() => {
    let ctx = null;
    let engineOsc = null;
    let engineGain = null;
    let engineRunning = false;

    function init() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (ctx.state === 'suspended') ctx.resume();
    }

    document.addEventListener('touchstart', init, { once: true, passive: true });
    document.addEventListener('touchend', init, { once: true, passive: true });
    document.addEventListener('mousedown', init, { once: true });
    document.addEventListener('keydown', init, { once: true });
/* ── Moottorin hurina (jatkuva) ──────────────────── */
    function startEngine() {
        if (engineRunning) return;
        try {
            init();
            const now = ctx.currentTime;
            engineOsc = ctx.createOscillator();
            engineOsc.type = 'sawtooth';
            engineOsc.frequency.setValueAtTime(55, now);
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, now);
            engineGain = ctx.createGain();
            engineGain.gain.setValueAtTime(0, now);
            engineGain.gain.linearRampToValueAtTime(0.03, now + 0.5);
            const osc2 = ctx.createOscillator();
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(110, now);
            const gain2 = ctx.createGain();
            gain2.gain.setValueAtTime(0, now);
            gain2.gain.linearRampToValueAtTime(0.01, now + 0.5);
            engineOsc.connect(filter).connect(engineGain).connect(ctx.destination);
            osc2.connect(gain2).connect(ctx.destination);
            engineOsc.start(now);
            osc2.start(now);
            engineOsc._osc2 = osc2;
            engineOsc._gain2 = gain2;
            engineRunning = true;
        } catch(e) {}
    }

    function stopEngine() {
        try {
            const now = ctx.currentTime;
            if(engineGain){engineGain.gain.cancelScheduledValues(now);engineGain.gain.linearRampToValueAtTime(0,now+0.2);}
            if(engineOsc&&engineOsc._gain2){engineOsc._gain2.gain.cancelScheduledValues(now);engineOsc._gain2.gain.linearRampToValueAtTime(0,now+0.2);}
            setTimeout(()=>{
                try{if(engineOsc){engineOsc.stop();if(engineOsc._osc2)engineOsc._osc2.stop();}}catch(e){}
                engineOsc=null;engineGain=null;
            },300);
            engineRunning=false;
        } catch(e) { engineRunning = false; engineOsc = null; engineGain = null; }
    }

    /* ── Konekivääri ──────────────────────────────────── */
    function playGun() {
        try {
            init();
            const now = ctx.currentTime;
            const dur = 0.05;
            const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
            }
            const src = ctx.createBufferSource(); src.buffer = buf;
            const hp = ctx.createBiquadFilter();
            hp.type = 'highpass'; hp.frequency.value = 3000;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            src.connect(hp).connect(gain).connect(ctx.destination);
            src.start(now); src.stop(now + dur);
        } catch(e) {}
    }
/* ── Pommin pudotus (vihellys) ────────────────────── */
    function playBombDrop() {
        try {
            init();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(200, now + 0.6);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.6);
        } catch(e) {}
    }

    /* ── Räjähdys ─────────────────────────────────────── */
    function playExplosion() {
        try {
            init();
            const now = ctx.currentTime;
            const dur = 1.2;
            const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.15));
            }
            const src = ctx.createBufferSource(); src.buffer = buf;
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass';
            lp.frequency.setValueAtTime(600, now);
            lp.frequency.exponentialRampToValueAtTime(80, now + dur);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            src.connect(lp).connect(gain).connect(ctx.destination);
            src.start(now); src.stop(now + dur);
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(50, now);
            osc.frequency.exponentialRampToValueAtTime(15, now + dur);
            const gain2 = ctx.createGain();
            gain2.gain.setValueAtTime(0.20, now);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + dur);
            osc.connect(gain2).connect(ctx.destination);
            osc.start(now); osc.stop(now + dur);
        } catch(e) {}
    }

/* ── Ilmatorjunnan räjähdys ───────────────────────── */
    function playFlak() {
        try {
            init();
            const now = ctx.currentTime;
            const dur = 0.15;
            const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
            }
            const src = ctx.createBufferSource(); src.buffer = buf;
            const bp = ctx.createBiquadFilter();
            bp.type = 'bandpass'; bp.frequency.value = 2500; bp.Q.value = 2;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            src.connect(bp).connect(gain).connect(ctx.destination);
            src.start(now); src.stop(now + dur);
        } catch(e) {}
    }

    /* ── Osumaääni ────────────────────────────────────── */
    function playHit() {
        try {
            init();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.10, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
osc.connect(gain).connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.2);
        } catch(e) {}
    }

/* ── Rule Britannia -melodia (lyhyt intro) ────────── */
    function playRuleBritannia() {
        try {
            init();
            const now = ctx.currentTime;
            const notes = [
                { freq: 392, dur: 0.3 }, { freq: 392, dur: 0.15 },
                { freq: 440, dur: 0.15 }, { freq: 494, dur: 0.3 },
                { freq: 523, dur: 0.3 }, { freq: 494, dur: 0.15 },
                { freq: 440, dur: 0.15 }, { freq: 392, dur: 0.3 },
                { freq: 440, dur: 0.3 }, { freq: 392, dur: 0.4 },
                { freq: 349, dur: 0.2 }, { freq: 392, dur: 0.5 },
            ];
            let t = now;
            const gainNode = ctx.createGain();
            gainNode.gain.setValueAtTime(0.07, now);
            gainNode.connect(ctx.destination);
            for (const n of notes) {
                const osc = ctx.createOscillator();
                osc.type = 'square';
                osc.frequency.setValueAtTime(n.freq, t);
                const noteGain = ctx.createGain();
                noteGain.gain.setValueAtTime(0, t);
                noteGain.gain.linearRampToValueAtTime(0.07, t + 0.02);
                noteGain.gain.setValueAtTime(0.07, t + n.dur - 0.03);
                noteGain.gain.linearRampToValueAtTime(0, t + n.dur);
                osc.connect(noteGain).connect(gainNode);
                osc.start(t); osc.stop(t + n.dur + 0.05);
                t += n.dur;
            }
        } catch(e) {}
    }

    /* ── Laskeutumisääni ───────────────────────────────── */
    function playLanding() {
        try {
            init();
            const now = ctx.currentTime;
            const dur = 0.3;
            const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                const t = i / ctx.sampleRate;
                data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 8) * Math.sin(t * 400);
            }
            const src = ctx.createBufferSource(); src.buffer = buf;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
            src.connect(gain).connect(ctx.destination);
            src.start(now); src.stop(now + dur);
        } catch(e) {}
    }

    /* ── Tankkausääni ──────────────────────────────────── */
    function playRefuel() {
        try {
            init();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(500, now + 0.4);
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.5);
            osc.connect(gain).connect(ctx.destination);
            osc.start(now); osc.stop(now + 0.5);
        } catch(e) {}
    }

    /* ── Game Over -fanfaari (surullinen) ──────────────── */
    function playGameOver() {
        try {
            init();
            const now = ctx.currentTime;
            const notes = [
                { freq: 392, dur: 0.3 }, { freq: 349, dur: 0.25 },
                { freq: 311, dur: 0.25 }, { freq: 262, dur: 0.5 },
            ];
            let t = now;
            for (const n of notes) {
                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(n.freq, t);
                const g = ctx.createGain();
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.08, t + 0.03);
                g.gain.exponentialRampToValueAtTime(0.001, t + n.dur);
                osc.connect(g).connect(ctx.destination);
                osc.start(t); osc.stop(t + n.dur + 0.05);
                t += n.dur;
            }
        } catch(e) {}
    }

    return {
        init, startEngine, stopEngine,
        playGun, playBombDrop, playExplosion, playFlak,
        playHit, playRuleBritannia, playLanding,
        playRefuel, playGameOver
    };
})();