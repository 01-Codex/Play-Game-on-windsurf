// Jeu Space Invaders simplifié
class SpaceInvadersGame extends GameEngine {
    constructor(canvasId) {
        super(canvasId, 800, 600);
        
        this.player = {
            x: this.canvas.width / 2 - 25,
            y: this.canvas.height - 60,
            width: 50,
            height: 30,
            speed: 5
        };
        
        this.bullets = [];
        this.enemyBullets = [];
        this.enemies = [];
        this.barriers = [];
        
        this.enemySpeed = 1;
        this.enemyDirection = 1;
        this.enemyDropDistance = 20;
        this.shootCooldown = 0;
        this.enemyShootTimer = 0;
        
        this.initEnemies();
        this.initBarriers();
    }

    initEnemies() {
        this.enemies = [];
        const rows = 5;
        const cols = 10;
        const enemyWidth = 40;
        const enemyHeight = 30;
        const spacing = 10;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.enemies.push({
                    x: col * (enemyWidth + spacing) + 100,
                    y: row * (enemyHeight + spacing) + 50,
                    width: enemyWidth,
                    height: enemyHeight,
                    type: row < 2 ? 'small' : row < 4 ? 'medium' : 'large',
                    alive: true
                });
            }
        }
    }

    initBarriers() {
        this.barriers = [];
        const barrierCount = 4;
        const barrierWidth = 80;
        const barrierHeight = 60;
        const spacing = (this.canvas.width - barrierCount * barrierWidth) / (barrierCount + 1);
        
        for (let i = 0; i < barrierCount; i++) {
            const barrier = {
                x: spacing + i * (barrierWidth + spacing),
                y: this.canvas.height - 200,
                width: barrierWidth,
                height: barrierHeight,
                blocks: []
            };
            
            // Créer la structure du barrier (forme simple)
            for (let row = 0; row < 6; row++) {
                barrier.blocks[row] = [];
                for (let col = 0; col < 8; col++) {
                    // Forme de barrier avec ouverture au milieu en bas
                    if (row < 4 || (col < 2 || col > 5)) {
                        barrier.blocks[row][col] = true;
                    } else {
                        barrier.blocks[row][col] = false;
                    }
                }
            }
            
            this.barriers.push(barrier);
        }
    }

    update(deltaTime) {
        if (this.gameOver) return;

        this.handleInput();
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies(deltaTime);
        this.updateEnemyBullets();
        this.checkCollisions();
        
        this.shootCooldown = Math.max(0, this.shootCooldown - deltaTime);
        this.enemyShootTimer += deltaTime;
        
        // Tir des ennemis
        if (this.enemyShootTimer > 1000) {
            this.enemyShoot();
            this.enemyShootTimer = 0;
        }
        
        // Vérifier victoire
        if (this.enemies.filter(e => e.alive).length === 0) {
            this.score += 1000;
            this.gameManager.updateScore(this.score);
            this.initEnemies();
            this.enemySpeed += 0.5;
        }
        
        // Vérifier défaite
        const lowestEnemy = this.enemies.filter(e => e.alive)
            .reduce((lowest, enemy) => enemy.y > lowest ? enemy.y : lowest, 0);
        if (lowestEnemy > this.player.y - 50) {
            this.gameOver = true;
            this.gameManager.showGameOver(this.score);
        }
    }

    handleInput() {
        if (this.keys['ArrowLeft']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, 
                                   this.player.x + this.player.speed);
        }
        if (this.keys['Space'] && this.shootCooldown <= 0) {
            this.shoot();
            this.shootCooldown = 200;
        }
    }

    handleTouch(x, y, type) {
        if (type === 'start') {
            const centerX = this.canvas.width / 2;
            
            if (x < centerX - 100) {
                // Gauche
                this.player.x = Math.max(0, this.player.x - this.player.speed * 3);
            } else if (x > centerX + 100) {
                // Droite
                this.player.x = Math.min(this.canvas.width - this.player.width, 
                                       this.player.x + this.player.speed * 3);
            } else if (this.shootCooldown <= 0) {
                // Centre - tirer
                this.shoot();
                this.shootCooldown = 200;
            }
        }
    }

    updatePlayer() {
        // Le joueur est déjà mis à jour dans handleInput
    }

    shoot() {
        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 8
        });
    }

    enemyShoot() {
        const aliveEnemies = this.enemies.filter(e => e.alive);
        if (aliveEnemies.length > 0) {
            const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            this.enemyBullets.push({
                x: shooter.x + shooter.width / 2 - 2,
                y: shooter.y + shooter.height,
                width: 4,
                height: 10,
                speed: 4
            });
        }
    }

    updateBullets() {
        // Balles du joueur
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
    }

    updateEnemyBullets() {
        // Balles des ennemis
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < this.canvas.height;
        });
    }

    updateEnemies(deltaTime) {
        const aliveEnemies = this.enemies.filter(e => e.alive);
        if (aliveEnemies.length === 0) return;
        
        // Vérifier si on doit changer de direction
        let changeDirection = false;
        aliveEnemies.forEach(enemy => {
            if ((enemy.x <= 0 && this.enemyDirection < 0) || 
                (enemy.x + enemy.width >= this.canvas.width && this.enemyDirection > 0)) {
                changeDirection = true;
            }
        });
        
        if (changeDirection) {
            this.enemyDirection *= -1;
            aliveEnemies.forEach(enemy => {
                enemy.y += this.enemyDropDistance;
            });
        } else {
            aliveEnemies.forEach(enemy => {
                enemy.x += this.enemySpeed * this.enemyDirection;
            });
        }
    }

    checkCollisions() {
        // Collision balles joueur vs ennemis
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (enemy.alive && this.checkCollision(bullet, enemy)) {
                    enemy.alive = false;
                    this.bullets.splice(bulletIndex, 1);
                    
                    // Points selon le type d'ennemi
                    const points = enemy.type === 'small' ? 30 : 
                                 enemy.type === 'medium' ? 20 : 10;
                    this.score += points;
                    this.gameManager.updateScore(this.score);
                }
            });
        });
        
        // Collision balles joueur vs barriers
        this.bullets.forEach((bullet, bulletIndex) => {
            this.barriers.forEach(barrier => {
                if (this.checkBulletBarrierCollision(bullet, barrier)) {
                    this.bullets.splice(bulletIndex, 1);
                }
            });
        });
        
        // Collision balles ennemis vs joueur
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (this.checkCollision(bullet, this.player)) {
                this.gameOver = true;
                this.gameManager.showGameOver(this.score);
            }
        });
        
        // Collision balles ennemis vs barriers
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            this.barriers.forEach(barrier => {
                if (this.checkBulletBarrierCollision(bullet, barrier)) {
                    this.enemyBullets.splice(bulletIndex, 1);
                }
            });
        });
    }

    checkBulletBarrierCollision(bullet, barrier) {
        if (!this.checkCollision(bullet, barrier)) return false;
        
        // Calculer quelle partie du barrier est touchée
        const relativeX = Math.floor((bullet.x - barrier.x) / 10);
        const relativeY = Math.floor((bullet.y - barrier.y) / 10);
        
        if (relativeX >= 0 && relativeX < 8 && relativeY >= 0 && relativeY < 6) {
            if (barrier.blocks[relativeY] && barrier.blocks[relativeY][relativeX]) {
                barrier.blocks[relativeY][relativeX] = false;
                return true;
            }
        }
        
        return false;
    }

    render() {
        super.render();

        // Fond étoilé
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, '#000011');
        
        // Étoiles
        for (let i = 0; i < 50; i++) {
            const x = (i * 137) % this.canvas.width;
            const y = (i * 211) % this.canvas.height;
            this.drawCircle(x, y, 1, '#ffffff');
        }

        // Joueur
        this.drawRect(this.player.x, this.player.y, this.player.width, this.player.height, '#00ff00');
        
        // Canon du joueur
        this.drawRect(
            this.player.x + this.player.width / 2 - 3,
            this.player.y - 10,
            6,
            10,
            '#00ff00'
        );

        // Ennemis
        this.enemies.forEach(enemy => {
            if (enemy.alive) {
                let color = '#ff0000';
                if (enemy.type === 'medium') color = '#ffff00';
                if (enemy.type === 'small') color = '#ff00ff';
                
                this.drawRect(enemy.x, enemy.y, enemy.width, enemy.height, color);
                
                // Détails de l'ennemi
                this.drawRect(enemy.x + 5, enemy.y + 5, 10, 10, '#ffffff');
                this.drawRect(enemy.x + enemy.width - 15, enemy.y + 5, 10, 10, '#ffffff');
            }
        });

        // Barriers
        this.barriers.forEach(barrier => {
            for (let row = 0; row < barrier.blocks.length; row++) {
                for (let col = 0; col < barrier.blocks[row].length; col++) {
                    if (barrier.blocks[row][col]) {
                        this.drawRect(
                            barrier.x + col * 10,
                            barrier.y + row * 10,
                            10,
                            10,
                            '#00ff00'
                        );
                    }
                }
            }
        });

        // Balles du joueur
        this.bullets.forEach(bullet => {
            this.drawRect(bullet.x, bullet.y, bullet.width, bullet.height, '#ffff00');
        });

        // Balles des ennemis
        this.enemyBullets.forEach(bullet => {
            this.drawRect(bullet.x, bullet.y, bullet.width, bullet.height, '#ff0000');
        });

        // Interface
        this.drawText(`Score: ${this.score}`, 10, 30, 20, '#ffffff');
        this.drawText(`Ennemis: ${this.enemies.filter(e => e.alive).length}`, 10, 55, 16, '#ffffff');
        
        // Instructions
        if (this.score === 0) {
            this.drawText('ESPACE pour tirer', this.canvas.width / 2, this.canvas.height - 30, 16, '#ffffff', 'center');
        }
    }

    reset() {
        super.reset();
        this.player.x = this.canvas.width / 2 - 25;
        this.bullets = [];
        this.enemyBullets = [];
        this.enemySpeed = 1;
        this.enemyDirection = 1;
        this.shootCooldown = 0;
        this.enemyShootTimer = 0;
        this.initEnemies();
        this.initBarriers();
    }
}
