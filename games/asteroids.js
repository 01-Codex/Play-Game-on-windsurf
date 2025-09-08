// Asteroids - Version compacte
class AsteroidsGame extends GameEngine {
    constructor(canvasId) {
        super(canvasId, 800, 600);
        this.ship = {
            x: 400, y: 300, angle: 0, vx: 0, vy: 0, w: 15, h: 15, 
            thrust: false, thrusterFrame: 0, invulnerable: 0
        };
        this.bullets = [];
        this.asteroids = [];
        this.particles = [];
        this.lives = 3;
        this.level = 1;
        this.stars = this.generateStars();
        this.initLevel();
    }

    initLevel() {
        this.bullets = [];
        this.asteroids = [];
        
        for (let i = 0; i < 4 + this.level; i++) {
            this.asteroids.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: 3,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.1,
                vertices: this.generateAsteroidVertices()
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;
        this.handleInput();
        this.updateShip();
        this.updateBullets();
        this.updateAsteroids();
        this.checkCollisions();
        this.checkWinLose();
    }

    handleInput() {
        if (this.keys['ArrowLeft']) this.ship.angle -= 0.15;
        if (this.keys['ArrowRight']) this.ship.angle += 0.15;
        if (this.keys['ArrowUp']) {
            this.ship.thrust = true;
            this.ship.vx += Math.cos(this.ship.angle) * 0.3;
            this.ship.vy += Math.sin(this.ship.angle) * 0.3;
        } else {
            this.ship.thrust = false;
        }
        if (this.keys['Space'] && this.bullets.length < 4) {
            this.bullets.push({
                x: this.ship.x + Math.cos(this.ship.angle) * 15,
                y: this.ship.y + Math.sin(this.ship.angle) * 15,
                vx: Math.cos(this.ship.angle) * 8,
                vy: Math.sin(this.ship.angle) * 8,
                life: 60
            });
        }
    }

    handleTouch(x, y, type) {
        if (type === 'start') {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            if (x < centerX - 100) {
                this.ship.angle -= 0.15;
            } else if (x > centerX + 100) {
                this.ship.angle += 0.15;
            } else if (y < centerY) {
                this.ship.thrust = true;
                this.ship.vx += Math.cos(this.ship.angle) * 0.3;
                this.ship.vy += Math.sin(this.ship.angle) * 0.3;
            } else if (this.bullets.length < 4) {
                this.bullets.push({
                    x: this.ship.x + Math.cos(this.ship.angle) * 15,
                    y: this.ship.y + Math.sin(this.ship.angle) * 15,
                    vx: Math.cos(this.ship.angle) * 8,
                    vy: Math.sin(this.ship.angle) * 8,
                    life: 60
                });
            }
        }
    }

    updateShip() {
        this.ship.x += this.ship.vx;
        this.ship.y += this.ship.vy;
        this.ship.vx *= 0.99;
        this.ship.vy *= 0.99;
        
        // Wrap around screen
        if (this.ship.x < 0) this.ship.x = 800;
        if (this.ship.x > 800) this.ship.x = 0;
        if (this.ship.y < 0) this.ship.y = 600;
        if (this.ship.y > 600) this.ship.y = 0;
    }

    updateBullets() {
        this.bullets.forEach((b, i) => {
            b.x += b.vx;
            b.y += b.vy;
            b.life--;
            
            // Wrap around
            if (b.x < 0) b.x = 800;
            if (b.x > 800) b.x = 0;
            if (b.y < 0) b.y = 600;
            if (b.y > 600) b.y = 0;
            
            if (b.life <= 0) this.bullets.splice(i, 1);
        });
    }

    updateAsteroids() {
        this.asteroids.forEach(a => {
            a.x += a.vx;
            a.y += a.vy;
            a.angle += a.spin;
            
            // Wrap around
            if (a.x < 0) a.x = 800;
            if (a.x > 800) a.x = 0;
            if (a.y < 0) a.y = 600;
            if (a.y > 600) a.y = 0;
        });
    }

    checkCollisions() {
        // Bullets vs asteroids
        this.bullets.forEach((b, bi) => {
            this.asteroids.forEach((a, ai) => {
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < a.size * 8) {
                    this.bullets.splice(bi, 1);
                    const points = (4 - a.size) * 20;
                    this.score += points;
                    this.gameManager.updateScore(this.score);
                    
                    // Split asteroid
                    if (a.size > 1) {
                        for (let i = 0; i < 2; i++) {
                            this.asteroids.push({
                                x: a.x,
                                y: a.y,
                                vx: (Math.random() - 0.5) * 6,
                                vy: (Math.random() - 0.5) * 6,
                                size: a.size - 1,
                                angle: Math.random() * Math.PI * 2,
                                spin: (Math.random() - 0.5) * 0.2
                            });
                        }
                    }
                    
                    this.asteroids.splice(ai, 1);
                }
            });
        });
        
        // Ship vs asteroids
        this.asteroids.forEach(a => {
            const dx = this.ship.x - a.x;
            const dy = this.ship.y - a.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < a.size * 8 + 8) {
                this.lives--;
                this.ship.x = 400;
                this.ship.y = 300;
                this.ship.vx = 0;
                this.ship.vy = 0;
                this.ship.angle = 0;
            }
        });
    }

    checkWinLose() {
        if (this.asteroids.length === 0) {
            this.level++;
            this.score += 1000;
            this.gameManager.updateScore(this.score);
            this.initLevel();
        }
        
        if (this.lives <= 0) {
            this.gameOver = true;
            this.gameManager.showGameOver(this.score);
        }
    }

    generateStars() {
        const stars = [];
        for (let i = 0; i < 150; i++) {
            stars.push({
                x: Math.random() * 800,
                y: Math.random() * 600,
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2
            });
        }
        return stars;
    }
    
    generateAsteroidVertices() {
        const vertices = [];
        const numVertices = 8 + Math.floor(Math.random() * 4);
        for (let i = 0; i < numVertices; i++) {
            const angle = (i / numVertices) * Math.PI * 2;
            const radius = 20 + Math.random() * 15;
            vertices.push({ angle, radius });
        }
        return vertices;
    }
    
    addParticle(x, y, vx, vy, color, life) {
        this.particles.push({ x, y, vx, vy, color, life, maxLife: life });
    }

    render() {
        super.render();
        
        // Fond spatial avec dégradé
        const gradient = this.ctx.createRadialGradient(400, 300, 0, 400, 300, 500);
        gradient.addColorStop(0, '#001122');
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 800, 600);
        
        // Étoiles animées
        this.stars.forEach(star => {
            star.twinkle += 0.05;
            const alpha = Math.sin(star.twinkle) * 0.3 + 0.7;
            this.drawCircle(star.x, star.y, star.size, `rgba(255,255,255,${alpha})`);
        });
        
        // Particules
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            
            const alpha = particle.life / particle.maxLife;
            this.drawCircle(particle.x, particle.y, 2, `rgba(${particle.color}, ${alpha})`);
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        // Vaisseau avec effet de clignotement si invulnérable
        if (this.ship.invulnerable > 0) {
            this.ship.invulnerable--;
            if (Math.floor(this.ship.invulnerable / 5) % 2 === 0) return; // Clignotement
        }
        
        const x = this.ship.x;
        const y = this.ship.y;
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(this.ship.angle);
        
        // Corps du vaisseau avec dégradé
        const shipGradient = this.ctx.createLinearGradient(-10, -8, 15, 0);
        shipGradient.addColorStop(0, '#00AAFF');
        shipGradient.addColorStop(1, '#FFFFFF');
        
        this.ctx.strokeStyle = shipGradient;
        this.ctx.fillStyle = 'rgba(0, 170, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(15, 0);
        this.ctx.lineTo(-10, -8);
        this.ctx.lineTo(-5, 0);
        this.ctx.lineTo(-10, 8);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        // Cockpit
        this.ctx.fillStyle = '#44AAFF';
        this.ctx.beginPath();
        this.ctx.arc(5, 0, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Flamme de propulsion animée
        if (this.ship.thrust) {
            this.ship.thrusterFrame += 0.3;
            const flameLength = Math.sin(this.ship.thrusterFrame) * 5 + 10;
            const flameGradient = this.ctx.createLinearGradient(-5, 0, -15, 0);
            flameGradient.addColorStop(0, '#FF6600');
            flameGradient.addColorStop(0.5, '#FF0000');
            flameGradient.addColorStop(1, '#FFAA00');
            
            this.ctx.strokeStyle = flameGradient;
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(-5, 0);
            this.ctx.lineTo(-5 - flameLength, Math.sin(this.ship.thrusterFrame * 2) * 2);
            this.ctx.stroke();
            
            // Particules de propulsion
            if (Math.random() < 0.7) {
                const px = x + Math.cos(this.ship.angle + Math.PI) * 15;
                const py = y + Math.sin(this.ship.angle + Math.PI) * 15;
                this.addParticle(px, py, 
                    Math.cos(this.ship.angle + Math.PI) * 3 + (Math.random() - 0.5) * 2,
                    Math.sin(this.ship.angle + Math.PI) * 3 + (Math.random() - 0.5) * 2,
                    '255,100,0', 20);
            }
        }
        this.ctx.restore();
        
        // Astéroïdes avec formes irrégulières
        this.asteroids.forEach(a => {
            this.ctx.save();
            this.ctx.translate(a.x, a.y);
            this.ctx.rotate(a.angle);
            
            // Dégradé pour l'astéroïde
            const asteroidGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, a.size * 10);
            asteroidGradient.addColorStop(0, '#AAAAAA');
            asteroidGradient.addColorStop(1, '#666666');
            
            this.ctx.strokeStyle = asteroidGradient;
            this.ctx.fillStyle = 'rgba(100, 100, 100, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            
            // Dessiner la forme irrégulière
            a.vertices.forEach((vertex, index) => {
                const x = Math.cos(vertex.angle) * vertex.radius * a.size / 3;
                const y = Math.sin(vertex.angle) * vertex.radius * a.size / 3;
                if (index === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            });
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Détails de surface
            this.ctx.strokeStyle = '#999999';
            this.ctx.lineWidth = 1;
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2;
                const x1 = Math.cos(angle) * (a.size * 2);
                const y1 = Math.sin(angle) * (a.size * 2);
                const x2 = Math.cos(angle) * (a.size * 4);
                const y2 = Math.sin(angle) * (a.size * 4);
                this.ctx.beginPath();
                this.ctx.moveTo(x1, y1);
                this.ctx.lineTo(x2, y2);
                this.ctx.stroke();
            }
            
            this.ctx.restore();
        });
        
        // Balles avec traînées
        this.bullets.forEach(bullet => {
            this.ctx.shadowColor = '#00FFFF';
            this.ctx.shadowBlur = 10;
            this.drawCircle(bullet.x, bullet.y, 3, '#00FFFF');
            this.ctx.shadowBlur = 0;
            this.drawCircle(bullet.x, bullet.y, 1, '#FFFFFF');
        });
        
        // Interface améliorée
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 200, 80);
        this.drawText(`Score: ${this.score}`, 20, 30, 16, '#00FFFF');
        this.drawText(`Vies: ${this.lives}`, 20, 50, 16, '#00FF00');
        this.drawText(`Niveau: ${this.level}`, 20, 70, 16, '#FFFF00');
        
        // Instructions
        if (this.score === 0) {
            this.drawText('Flèches: Tourner/Accélérer, Espace: Tirer', 400, 550, 14, '#FFFFFF', 'center');
        }
    }

    reset() {
        super.reset();
        this.ship = {x: 400, y: 300, angle: 0, vx: 0, vy: 0, w: 15, h: 15, thrust: false};
        this.lives = 3;
        this.level = 1;
        this.initLevel();
    }
}
