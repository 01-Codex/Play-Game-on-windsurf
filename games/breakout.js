// Breakout/Arkanoid - Jeu de casse-briques compact
class BreakoutGame extends GameEngine {
    constructor(canvasId) {
        super(canvasId, 800, 600);
        this.paddle = {x: 350, y: 550, w: 100, h: 15, speed: 8, glow: 0};
        this.ball = {x: 400, y: 300, vx: 4, vy: -4, r: 8, trail: [], glowFrame: 0};
        this.bricks = [];
        this.particles = [];
        this.powerUps = [];
        this.lives = 3;
        this.level = 1;
        this.initBricks();
    }

    initBricks() {
        this.bricks = [];
        const colors = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF'];
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 14; col++) {
                this.bricks.push({
                    x: col * 55 + 30,
                    y: row * 25 + 50,
                    w: 50,
                    h: 20,
                    color: colors[row],
                    hit: false,
                    points: (6 - row) * 10,
                    crack: 0,
                    shimmer: Math.random() * Math.PI * 2
                });
            }
        }
    }

    update(dt) {
        if (this.gameOver) return;
        this.handleInput();
        this.updateBall();
        this.checkCollisions();
        this.checkWinLose();
    }

    handleInput() {
        if (this.keys['ArrowLeft'] && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys['ArrowRight'] && this.paddle.x < this.canvas.width - this.paddle.w) {
            this.paddle.x += this.paddle.speed;
        }
        if (this.keys['Space'] && this.ball.vy === 0) {
            this.ball.vy = -4;
        }
    }

    handleTouch(x, y, type) {
        if (type === 'start' || type === 'move') {
            const centerX = this.canvas.width / 2;
            if (x < centerX - 50) {
                // Gauche
                if (this.paddle.x > 0) this.paddle.x -= this.paddle.speed;
            } else if (x > centerX + 50) {
                // Droite
                if (this.paddle.x < this.canvas.width - this.paddle.w) this.paddle.x += this.paddle.speed;
            } else if (this.ball.vy === 0) {
                // Centre - lancer la balle
                this.ball.vy = -4;
            }
        }
    }

    updateBall() {
        if (this.ball.vy === 0) {
            // Balle collée à la raquette
            this.ball.x = this.paddle.x + this.paddle.w / 2;
            return;
        }

        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Rebonds sur les murs
        if (this.ball.x <= this.ball.r || this.ball.x >= this.canvas.width - this.ball.r) {
            this.ball.vx = -this.ball.vx;
        }
        if (this.ball.y <= this.ball.r) {
            this.ball.vy = -this.ball.vy;
        }

        // Balle perdue
        if (this.ball.y > this.canvas.height) {
            this.lives--;
            if (this.lives > 0) {
                this.resetBall();
            }
        }
    }

    checkCollisions() {
        // Collision avec la raquette
        if (this.ball.y + this.ball.r >= this.paddle.y &&
            this.ball.y - this.ball.r <= this.paddle.y + this.paddle.h &&
            this.ball.x >= this.paddle.x &&
            this.ball.x <= this.paddle.x + this.paddle.w) {
            
            this.ball.vy = -Math.abs(this.ball.vy);
            
            // Effet selon la position sur la raquette
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.w;
            this.ball.vx = (hitPos - 0.5) * 8;
        }

        // Collision avec les briques
        this.bricks.forEach(brick => {
            if (!brick.hit &&
                this.ball.x + this.ball.r >= brick.x &&
                this.ball.x - this.ball.r <= brick.x + brick.w &&
                this.ball.y + this.ball.r >= brick.y &&
                this.ball.y - this.ball.r <= brick.y + brick.h) {
                
                brick.hit = true;
                this.score += brick.points;
                this.gameManager.updateScore(this.score);
                
                // Déterminer le côté de collision
                const ballCenterX = this.ball.x;
                const ballCenterY = this.ball.y;
                const brickCenterX = brick.x + brick.w / 2;
                const brickCenterY = brick.y + brick.h / 2;
                
                const dx = ballCenterX - brickCenterX;
                const dy = ballCenterY - brickCenterY;
                
                if (Math.abs(dx / brick.w) > Math.abs(dy / brick.h)) {
                    this.ball.vx = -this.ball.vx;
                } else {
                    this.ball.vy = -this.ball.vy;
                }
            }
        });
    }

    checkWinLose() {
        // Victoire - toutes les briques détruites
        if (this.bricks.every(brick => brick.hit)) {
            this.level++;
            this.score += 1000;
            this.gameManager.updateScore(this.score);
            this.initBricks();
            this.resetBall();
            // Augmenter la vitesse
            const speed = Math.min(6, 3 + this.level * 0.5);
            this.ball.vx = this.ball.vx > 0 ? speed : -speed;
            this.ball.vy = -speed;
        }

        // Défaite - plus de vies
        if (this.lives <= 0) {
            this.gameOver = true;
            this.gameManager.showGameOver(this.score);
        }
    }

    resetBall() {
        this.ball.x = this.paddle.x + this.paddle.w / 2;
        this.ball.y = this.paddle.y - this.ball.r - 5;
        this.ball.vx = 0;
        this.ball.vy = 0;
    }

    addParticle(x, y, vx, vy, color, life) {
        this.particles.push({ x, y, vx, vy, color, life, maxLife: life });
    }

    render() {
        super.render();

        // Fond spatial avec dégradé
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#000044');
        gradient.addColorStop(0.5, '#000022');
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Étoiles de fond
        for (let i = 0; i < 50; i++) {
            const x = (i * 137) % this.canvas.width;
            const y = (i * 211) % this.canvas.height;
            const twinkle = Math.sin(Date.now() * 0.003 + i) * 0.3 + 0.7;
            this.drawCircle(x, y, 1, `rgba(255,255,255,${twinkle})`);
        }

        // Briques avec effets 3D et shimmer
        this.bricks.forEach(brick => {
            if (!brick.hit) {
                brick.shimmer += 0.05;
                
                // Gradient 3D pour la brique
                const brickGradient = this.ctx.createLinearGradient(
                    brick.x, brick.y, brick.x + brick.w, brick.y + brick.h
                );
                brickGradient.addColorStop(0, this.lightenColor(brick.color));
                brickGradient.addColorStop(0.5, brick.color);
                brickGradient.addColorStop(1, this.darkenColor(brick.color));
                
                // Corps de la brique
                this.ctx.fillStyle = brickGradient;
                this.ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
                
                // Bordure brillante
                this.ctx.strokeStyle = this.lightenColor(brick.color);
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(brick.x, brick.y, brick.w, brick.h);
                
                // Effet shimmer
                const shimmerAlpha = Math.sin(brick.shimmer) * 0.3 + 0.3;
                this.ctx.fillStyle = `rgba(255,255,255,${shimmerAlpha})`;
                this.ctx.fillRect(brick.x + 2, brick.y + 2, brick.w - 4, 3);
                
                // Ombre portée
                this.ctx.fillStyle = 'rgba(0,0,0,0.3)';
                this.ctx.fillRect(brick.x + 2, brick.y + brick.h, brick.w, 3);
            }
        });

        // Particules
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2; // Gravité
            particle.life--;
            
            const alpha = particle.life / particle.maxLife;
            this.drawCircle(particle.x, particle.y, 3, `rgba(${particle.color}, ${alpha})`);
            
            if (particle.life <= 0) {
                this.particles.splice(index, 1);
            }
        });
        
        // Raquette avec dégradé et glow
        this.paddle.glow = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        
        const paddleGradient = this.ctx.createLinearGradient(
            this.paddle.x, this.paddle.y,
            this.paddle.x, this.paddle.y + this.paddle.h
        );
        paddleGradient.addColorStop(0, '#FFFFFF');
        paddleGradient.addColorStop(0.5, '#CCCCCC');
        paddleGradient.addColorStop(1, '#888888');
        
        // Effet glow
        this.ctx.shadowColor = '#00AAFF';
        this.ctx.shadowBlur = this.paddle.glow * 10;
        this.ctx.fillStyle = paddleGradient;
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h);
        this.ctx.shadowBlur = 0;
        
        // Détails de la raquette
        this.ctx.fillStyle = '#00AAFF';
        this.ctx.fillRect(this.paddle.x + 5, this.paddle.y + 2, this.paddle.w - 10, 3);
        this.ctx.fillRect(this.paddle.x + this.paddle.w/2 - 2, this.paddle.y, 4, this.paddle.h);

        // Traînée de la balle
        this.ball.trail.push({ x: this.ball.x, y: this.ball.y, life: 10 });
        if (this.ball.trail.length > 8) this.ball.trail.shift();
        
        this.ball.trail.forEach((point, index) => {
            point.life--;
            const alpha = point.life / 10;
            const size = (index / this.ball.trail.length) * this.ball.r;
            this.drawCircle(point.x, point.y, size, `rgba(255,255,0,${alpha})`);
        });
        
        // Balle avec effet plasma
        this.ball.glowFrame += 0.2;
        const ballGlow = Math.sin(this.ball.glowFrame) * 0.5 + 0.5;
        
        this.ctx.shadowColor = '#FFFF00';
        this.ctx.shadowBlur = 15 + ballGlow * 10;
        this.drawCircle(this.ball.x, this.ball.y, this.ball.r, '#FFFFFF');
        this.ctx.shadowBlur = 0;
        
        // Cœur de la balle
        const ballGradient = this.ctx.createRadialGradient(
            this.ball.x - 2, this.ball.y - 2, 0,
            this.ball.x, this.ball.y, this.ball.r
        );
        ballGradient.addColorStop(0, '#FFFFFF');
        ballGradient.addColorStop(0.7, '#FFFF00');
        ballGradient.addColorStop(1, '#FF8800');
        
        this.ctx.fillStyle = ballGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.r - 1, 0, Math.PI * 2);
        this.ctx.fill();

        // Interface stylée
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 250, 70);
        this.drawText(`Score: ${this.score}`, 20, 35, 18, '#00FFFF');
        this.drawText(`Vies: ${this.lives}`, 20, 55, 16, '#00FF00');
        this.drawText(`Niveau: ${this.level}`, 20, 75, 16, '#FFFF00');
        
        // Barre de progression des briques
        const totalBricks = 84;
        const remainingBricks = this.bricks.filter(b => !b.hit).length;
        const progress = (totalBricks - remainingBricks) / totalBricks;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(this.canvas.width - 220, 10, 200, 30);
        this.ctx.fillStyle = '#333333';
        this.ctx.fillRect(this.canvas.width - 210, 20, 180, 10);
        this.ctx.fillStyle = '#00FF00';
        this.ctx.fillRect(this.canvas.width - 210, 20, 180 * progress, 10);
        this.drawText('Progression', this.canvas.width - 110, 18, 12, '#FFFFFF', 'center');

        // Instructions
        if (this.ball.vy === 0 && this.score === 0) {
            this.drawText('ESPACE ou TAP pour lancer', this.canvas.width / 2, 400, 24, '#FFFF00', 'center');
            this.drawText('Flèches ou SWIPE pour déplacer', this.canvas.width / 2, 430, 18, '#FFFFFF', 'center');
        }

    }
    
    lightenColor(color) {
        const hex = color.replace('#', '');
        const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + 60);
        const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + 60);
        const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + 60);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    darkenColor(color) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 60);
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 60);
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 60);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    reset() {
        super.reset();
        this.paddle.x = 350;
        this.lives = 3;
        this.level = 1;
        this.initBricks();
        this.resetBall();
    }
}
