// renderer.js - Canvas-piirtäjä (kamera, pyöristetyt kaivureunat, hiukkaset)

class Renderer {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        this.animations = [];
        this.particles = [];
        this.flashAlpha = 0;
        
        this.lerpX = 0; 
        this.lerpY = 0;
        this.camLerpX = 0;
    }

    resize() {
        this.canvas.width = VIEW_COLS * CELL_SIZE;
        this.canvas.height = VIEW_ROWS * CELL_SIZE;
    }

    // Kamera seuraa pelaajaa vaakasuunnassa
    getCameraX() {
        const cx = this.game.player.x - Math.floor(VIEW_COLS / 2);
        return Math.max(0, Math.min(cx, this.game.cols - VIEW_COLS));
    }

    addExplosion(x, y) {
        this.animations.push({
            x: x * CELL_SIZE, y: y * CELL_SIZE,
            frame: 0, maxFrames: 6,
        });
    }

    addDeathExplosion(x, y) {
        this.animations.push({
            x: x * CELL_SIZE, y: y * CELL_SIZE,
            frame: 0, maxFrames: 20,
            type: 'death',
        });
        this.flashAlpha = 0.4;
    }

    // Murenemishiukkaset kaivamisen yhteydessä ("syöminen pala palalta")
    addCrumbs(x, y) {
        for (let i = 0; i < 60; i++) {
            const ang = (Math.random() - 0.5) * Math.PI;
            const speed = 1 + Math.random() * 4;
            this.particles.push({
                x: x * CELL_SIZE + CELL_SIZE / 2,
                y: y * CELL_SIZE + CELL_SIZE / 2,
                vx: Math.cos(ang) * speed,
                vy: Math.sin(ang) * speed - 2,
                life: 40 + Math.floor(Math.random() * 30),
                maxLife: 70,
                size: 1 + Math.random() * 2.5,
                color: Math.random() < 0.4 ? '#8a5520' : (Math.random() < 0.5 ? '#6B3410' : '#4a2008'),
            });
        }
    }

    updateAnimations() {
        this.animations = this.animations.filter(a => {
            a.frame++;
            return a.frame < a.maxFrames;
        });

        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;

            const gridX = Math.floor(p.x / CELL_SIZE);
            const gridY = Math.floor(p.y / CELL_SIZE);
            
            if (this.isSolidGround(gridX, gridY)) {
                p.y -= p.vy;
                p.vy *= -0.3;
                p.vx *= 0.5;
            }

            p.life--;
            return p.life > 0;
        });

        if (this.flashAlpha > 0) {
            this.flashAlpha = Math.max(0, this.flashAlpha - 0.015);
        }
    }

    // Onko ruutu "kiinteää maata" (ei kaivettua aukkoa) - käytetään
    // pyöristetyn kaivureunan laskentaan.
    isSolidGround(wx, wy) {
        if (wx < 0 || wx >= this.game.cols || wy < 0 || wy >= this.game.rows) return true;
        const t = this.game.grid[wy][wx];
        return t === TILE.DIRT || t === TILE.WALL || t === TILE.BOULDER ||
               t === TILE.GRASS || t === TILE.TREE || t === TILE.HOUSE || t === TILE.SKY;
    }

    render() {
        const ctx = this.ctx;
        const cs = CELL_SIZE;

        const targetX = this.game.player.x;
        const targetY = this.game.player.y;
        
        if (Math.abs(targetX - this.lerpX) > 3) this.lerpX = targetX;
        else this.lerpX += (targetX - this.lerpX) * 0.3;
        
        if (Math.abs(targetY - this.lerpY) > 3) this.lerpY = targetY;
        else this.lerpY += (targetY - this.lerpY) * 0.3;

        const targetCamX = Math.max(0, Math.min(targetX - Math.floor(VIEW_COLS / 2), this.game.cols - VIEW_COLS));
        if (Math.abs(targetCamX - this.camLerpX) > 10) this.camLerpX = targetCamX;
        else this.camLerpX += (targetCamX - this.camLerpX) * 0.15;

        const offsetX = this.camLerpX * cs;

        ctx.fillStyle = '#7ec8e3';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        const baseCamX = Math.floor(this.camLerpX);
        for (let y = 0; y < VIEW_ROWS; y++) {
            for (let x = -1; x <= VIEW_COLS + 1; x++) {
                const wx = baseCamX + x;
                const wy = y;
                if (wx < 0 || wx >= this.game.cols || wy < 0 || wy >= this.game.rows) continue;
                
                const drawX = (wx * cs) - offsetX;
                const drawY = wy * cs;
                this.drawTile(ctx, drawX, drawY, this.game.grid[wy][wx], wx, wy);
            }
        }

        if (!this.game.deathEnd) {
            const pDrawX = (this.lerpX * cs) - offsetX;
            const pDrawY = this.lerpY * cs;
            this.drawPlayer(ctx, pDrawX, pDrawY);
        }

        this.renderAnimations(ctx, offsetX);
        this.renderParticles(ctx, offsetX);
        this.drawGrid(ctx, VIEW_COLS, VIEW_ROWS, cs, offsetX);

        if (this.flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 30, 0, ${this.flashAlpha})`;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    drawTile(ctx, px, py, tile, wx, wy) {
        const cs = CELL_SIZE;
        switch (tile) {
            case TILE.EMPTY: break;
            case TILE.DIRT: this.drawDirt(ctx, px, py, wx, wy); break;
            case TILE.WALL: this.drawWall(ctx, px, py); break;
            case TILE.BOULDER: this.drawBoulder(ctx, px, py); break;
            case TILE.DIAMOND: this.drawDiamond(ctx, px, py); break;
            case TILE.EXIT: this.drawExit(ctx, px, py); break;
            case TILE.FIREFLY: this.drawEnemy(ctx, px, py, cs, '#F22', '#F80', '#FC0'); break;
            case TILE.BUTTERFLY: this.drawEnemy(ctx, px, py, cs, '#F60', '#FA0', '#FD4'); break;
            case TILE.SKY: this.drawSky(ctx, px, py, wx, wy); break;
            case TILE.GRASS: this.drawGrass(ctx, px, py, wx, wy); break;
            case TILE.TREE: this.drawTree(ctx, px, py, wx, wy); break;
            case TILE.HOUSE: this.drawHouse(ctx, px, py, wx, wy); break;
        }
    }

    // Piirrä pyöristetty suorakulmio annetuilla kulmasäteillä [vasYlä, oikYlä, oikAla, vasAla]
    roundedRectPath(ctx, x, y, w, h, radii) {
        const tl = radii[0], tr = radii[1], br = radii[2], bl = radii[3];
        ctx.beginPath();
        ctx.moveTo(x + tl, y);
        ctx.lineTo(x + w - tr, y);
        ctx.arcTo(x + w, y, x + w, y + tr, tr);
        ctx.lineTo(x + w, y + h - br);
        ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
        ctx.lineTo(x + bl, y + h);
        ctx.arcTo(x, y + h, x, y + h - bl, bl);
        ctx.lineTo(x, y + tl);
        ctx.arcTo(x, y, x + tl, y, tl);
        ctx.closePath();
    }

    // Maa, jonka kaivetut reunat pyöristyvät (raja ei ole enää suora []).
    drawDirt(ctx, px, py, wx, wy) {
        const cs = CELL_SIZE;
        const R = CORNER_RADIUS;
        const top = !this.isSolidGround(wx, wy - 1);
        const bottom = !this.isSolidGround(wx, wy + 1);
        const left = !this.isSolidGround(wx - 1, wy);
        const right = !this.isSolidGround(wx + 1, wy);
        const radii = [
            top && left ? R : 0,
            top && right ? R : 0,
            bottom && right ? R : 0,
            bottom && left ? R : 0,
        ];
        const x = px + 1, y = py + 1, w = cs - 2, h = cs - 2;

        this.roundedRectPath(ctx, x, y, w, h, radii);
        ctx.fillStyle = '#6B3410';
        ctx.fill();

        // Rakenne (sorapisteet) leikattuna pyöristettyyn muotoon
        ctx.save();
        this.roundedRectPath(ctx, x, y, w, h, radii);
        ctx.clip();
        ctx.fillStyle = '#7B4420';
        const seed = (wx * 31 + wy * 17) % 100;
        for (let i = 0; i < 5; i++) {
            const di = (seed + i * 7) % (cs - 8);
            const dj = (seed * 3 + i * 13) % (cs - 8);
            ctx.fillRect(px + 4 + di, py + 4 + dj, 2, 2);
        }
        ctx.restore();

        this.roundedRectPath(ctx, x, y, w, h, radii);
        ctx.strokeStyle = '#4a2008';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawWall(ctx, px, py) {
        const cs = CELL_SIZE, p = 1;
        ctx.fillStyle = '#555';
        ctx.fillRect(px + p, py + p, cs - p * 2, cs - p * 2);
        ctx.fillStyle = '#666';
        ctx.fillRect(px + p, py + p, cs - p * 2, (cs - p * 2) / 2);
        ctx.fillStyle = '#444';
        ctx.fillRect(px + p, py + p + (cs - p * 2) / 2, cs - p * 2, (cs - p * 2) / 2);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + p, py + p, cs - p * 2, cs - p * 2);
        ctx.beginPath();
        ctx.moveTo(px + p, py + cs / 2);
        ctx.lineTo(px + cs - p, py + cs / 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(px + cs / 2, py + p);
        ctx.lineTo(px + cs / 2, py + cs / 2);
        ctx.stroke();
    }

    drawBoulder(ctx, px, py) {
        const cs = CELL_SIZE;
        ctx.fillStyle = '#777';
        ctx.beginPath();
        ctx.arc(px + cs / 2, py + cs / 2, cs / 2 - 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#999';
        ctx.beginPath();
        ctx.arc(px + cs / 2 - 3, py + cs / 2 - 3, cs / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px + cs / 2, py + cs / 2, cs / 2 - 3, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawDiamond(ctx, px, py) {
        const cs = CELL_SIZE, p = 1;
        const s = Math.sin(Date.now() / 300 + px + py) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(0, 200, 255, ${s})`;
        ctx.beginPath();
        ctx.moveTo(px + cs / 2, py + p + 2);
        ctx.lineTo(px + cs - p - 2, py + cs / 2);
        ctx.lineTo(px + cs / 2, py + cs - p - 2);
        ctx.lineTo(px + p + 2, py + cs / 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#0AA';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(px + cs / 2 - 3, py + cs / 2 - 2, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawExit(ctx, px, py) {
        const cs = CELL_SIZE;
        ctx.fillStyle = '#0F0';
        ctx.fillRect(px + 3, py + 3, cs - 6, cs - 6);
        ctx.strokeStyle = '#0F4';
        ctx.lineWidth = 3;
        ctx.strokeRect(px + 3, py + 3, cs - 6, cs - 6);
        ctx.fillStyle = '#040';
        ctx.font = `${cs * 0.6}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚪', px + cs / 2, py + cs / 2 + 1);
    }

    drawEnemy(ctx, px, py, cs, c1, c2, c3) {
        const pulse = Math.sin(Date.now() / 150) * 2;
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.arc(px + cs / 2, py + cs / 2, cs / 2 - 2 + pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.arc(px + cs / 2 + 3, py + cs / 2 - 3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c3;
        ctx.beginPath();
        ctx.arc(px + cs / 2 - 3, py + cs / 2 - 3, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSky(ctx, px, py, wx, wy) {
        const cs = CELL_SIZE;
        ctx.fillStyle = '#7ec8e3';
        ctx.fillRect(px, py, cs, cs);
        const seed = (wx * 13 + wy * 7) % 100;
        if (seed < 30) {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(px + cs * 0.4, py + cs * 0.5, 5, 0, Math.PI * 2);
            ctx.arc(px + cs * 0.6, py + cs * 0.45, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawGrass(ctx, px, py, wx, wy) {
        const cs = CELL_SIZE;
        ctx.fillStyle = '#6B3410';
        ctx.fillRect(px, py + cs / 2, cs, cs / 2);
        ctx.fillStyle = '#4a8f29';
        ctx.fillRect(px, py + cs / 2 - 4, cs, 8);
        ctx.fillStyle = '#5faf33';
        const seed = (wx * 17 + wy * 11) % 100;
        for (let i = 0; i < 6; i++) {
            const gx = px + ((seed + i * 13) % cs);
            ctx.fillRect(gx, py + cs / 2 - 5, 2, 4 + (i % 3));
        }
    }

    drawTree(ctx, px, py, wx, wy) {
        const cs = CELL_SIZE;
        const onSurface = wy === SURFACE_ROW;
        // Maanpinnalle jää nurmi puun alle
        if (onSurface) this.drawGrass(ctx, px, py, wx, wy);
        const cx = px + cs / 2;
        // Puu on aina pystyssä — sama ulkonäkö myös pudotessaan monttuun.
        const baseY = onSurface ? (py + cs / 2 - 4) : (py + cs - 2);
        // runko (pysty)
        ctx.fillStyle = '#5a3d1f';
        ctx.fillRect(cx - 3, baseY - 14, 6, 14);
        // latvus
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.arc(cx, baseY - 19, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.arc(cx - 4, baseY - 22, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawHouse(ctx, px, py, wx, wy) {
        const cs = CELL_SIZE;
        if (wy === SURFACE_ROW) {
            // Talo seisoo maan pinnalla: nurmi jää alle, runko ja katto nousevat ylös
            this.drawGrass(ctx, px, py, wx, wy);
            const baseY = py + cs / 2 - 4; // nurmen yläreuna
            ctx.fillStyle = '#c96b4a';
            ctx.fillRect(px + 4, baseY - 14, cs - 8, 14);
            ctx.fillStyle = '#7d3b28';
            ctx.beginPath();
            ctx.moveTo(px + 2, baseY - 14);
            ctx.lineTo(px + cs / 2, baseY - 30);
            ctx.lineTo(px + cs - 2, baseY - 14);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#5a2d1f';
            ctx.fillRect(px + cs / 2 - 3, baseY - 10, 6, 10);
            ctx.fillStyle = '#ffe08a';
            ctx.fillRect(px + cs / 2 - 8, baseY - 12, 6, 6);
        } else {
            // Kaatunut talo maan alla: kompakti kasa
            ctx.fillStyle = '#c96b4a';
            ctx.fillRect(px + 4, py + cs / 2 - 4, cs - 8, 8);
            ctx.fillStyle = '#7d3b28';
            ctx.beginPath();
            ctx.moveTo(px + 2, py + cs / 2 - 4);
            ctx.lineTo(px + cs / 2, py + cs / 2 - 12);
            ctx.lineTo(px + cs - 2, py + cs / 2 - 4);
            ctx.closePath();
            ctx.fill();
        }
    }

    drawPlayer(ctx, px, py) {
        const cs = CELL_SIZE;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(px + cs / 2, py + cs / 2, cs / 2 - 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#CC8800';
        ctx.fillRect(px + cs / 4, py + 2, cs / 2, cs / 4);
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(px + cs / 2 - 5, py + cs / 2 - 4, 2.5, 0, Math.PI * 2);
        ctx.arc(px + cs / 2 + 5, py + cs / 2 - 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#960';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px + cs / 2, py + cs / 2, cs / 2 - 3, 0, Math.PI * 2);
        ctx.stroke();
    }

    renderAnimations(ctx, offsetX) {
        for (const a of this.animations) {
            const cx = a.x - offsetX + CELL_SIZE / 2;
            const cy = a.y + CELL_SIZE / 2;

            if (a.type === 'death') {
                const alpha = 1 - a.frame / a.maxFrames;
                ctx.strokeStyle = `rgba(255, ${Math.floor(120 * (1 - a.frame / a.maxFrames))}, 0, ${alpha})`;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(cx, cy, a.frame * 5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.strokeStyle = `rgba(255, 255, 150, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, a.frame * 3, 0, Math.PI * 2);
                ctx.stroke();
                ctx.fillStyle = `rgba(255, 200, 50, ${alpha})`;
                ctx.beginPath();
                ctx.arc(cx, cy, Math.max(2, 12 - a.frame), 0, Math.PI * 2);
                ctx.fill();
                const parts = 10;
                const seed = (a.x * 31 + a.y * 17) % 100;
                for (let i = 0; i < parts; i++) {
                    const angle = (i / parts) * Math.PI * 2 + seed * 0.01;
                    const dist = a.frame * 4;
                    ctx.fillStyle = `rgba(255, ${150 + Math.floor(100 * Math.random())}, 0, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                const alpha = 1 - a.frame / a.maxFrames;
                ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(cx, cy, a.frame * 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }

    renderParticles(ctx, offsetX) {
        for (const p of this.particles) {
            const alpha = p.life / p.maxLife;
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.fillRect(p.x - offsetX - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }
        ctx.globalAlpha = 1;
    }

    drawGrid(ctx, cols, rows, cs, offsetX) {
        const offX = offsetX ? (offsetX % cs) : 0;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= cols; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cs - offX, 0);
            ctx.lineTo(x * cs - offX, rows * cs);
            ctx.stroke();
        }
        for (let y = 0; y <= rows; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cs);
            ctx.lineTo(cols * cs, y * cs);
            ctx.stroke();
        }
    }
}


