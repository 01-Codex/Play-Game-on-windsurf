// Jeu Donkey Kong - Plateforme avec Mario et barils
class DonkeyKongGame extends GameEngine {
    constructor(canvasId) {
        super(canvasId, 800, 600);
        
        this.mario = {
            x: 50,
            y: this.canvas.height - 80,
            width: 20,
            height: 30,
            speed: 3,
            jumpSpeed: 12,
            velocityY: 0,
            onGround: false,
            direction: 1
        };
        
        this.donkeyKong = {
            x: this.canvas.width - 100,
            y: 50,
            width: 60,
            height: 60
        };
        
        this.pauline = {
            x: this.canvas.width - 50,
            y: 30,
            width: 20,
            height: 30
        };
        
        this.platforms = [
            // Plateformes principales
            { x: 0, y: this.canvas.height - 50, width: this.canvas.width, height: 20 },
            { x: 100, y: this.canvas.height - 150, width: this.canvas.width - 200, height: 20 },
            { x: 0, y: this.canvas.height - 250, width: this.canvas.width - 100, height: 20 },
            { x: 100, y: this.canvas.height - 350, width: this.canvas.width - 200, height: 20 },
            { x: 0, y: this.canvas.height - 450, width: this.canvas.width - 100, height: 20 },
            { x: this.canvas.width - 150, y: 80, width: 150, height: 20 }
        ];
        
        this.ladders = [
            { x: 150, y: this.canvas.height - 150, width: 20, height: 100 },
            { x: this.canvas.width - 150, y: this.canvas.height - 250, width: 20, height: 100 },
            { x: 200, y: this.canvas.height - 350, width: 20, height: 100 },
            { x: this.canvas.width - 200, y: this.canvas.height - 450, width: 20, height: 100 },
            { x: this.canvas.width - 100, y: 80, width: 20, height: 370 }
        ];
        
        this.barrels = [];
        this.barrelTimer = 0;
        this.barrelInterval = 2000;
        this.gravity = 0.5;
        this.level = 1;
        this.lives = 3;
        this.onLadder = false;
    }

    update(deltaTime) {
        if (this.gameOver) return;

        this.handleInput();
        this.updateMario(deltaTime);
        this.updateBarrels(deltaTime);
        this.spawnBarrels(deltaTime);
        this.checkCollisions();
        this.checkWinCondition();
    }

    handleInput() {
        if (this.keys['ArrowLeft']) {
            this.mario.x -= this.mario.speed;
            this.mario.direction = -1;
        }
        if (this.keys['ArrowRight']) {
            this.mario.x += this.mario.speed;
            this.mario.direction = 1;
        }
        if (this.keys['ArrowUp']) {
            this.climbLadder();
        }
        if (this.keys['ArrowDown']) {
            this.descendLadder();
        }
        if (this.keys['Space'] && this.mario.onGround) {
            this.mario.velocityY = -this.mario.jumpSpeed;
            this.mario.onGround = false;
        }
    }

    handleTouch(x, y, type) {
        if (type === 'start') {
            const marioScreenX = this.mario.x;
            const marioScreenY = this.mario.y;
            
            if (x < marioScreenX - 50) {
                this.mario.x -= this.mario.speed * 2;
                this.mario.direction = -1;
            } else if (x > marioScreenX + 50) {
                this.mario.x += this.mario.speed * 2;
                this.mario.direction = 1;
            } else if (y < marioScreenY - 50) {
                if (this.mario.onGround) {
                    this.mario.velocityY = -this.mario.jumpSpeed;
                    this.mario.onGround = false;
                } else {
                    this.climbLadder();
                }
            } else if (y > marioScreenY + 50) {
                this.descendLadder();
            }
        }
    }

    climbLadder() {
        const ladder = this.ladders.find(l => 
            this.mario.x + this.mario.width > l.x && 
            this.mario.x < l.x + l.width &&
            this.mario.y + this.mario.height > l.y &&
            this.mario.y < l.y + l.height
        );
        
        if (ladder) {
            this.mario.y -= this.mario.speed;
            this.mario.velocityY = 0;
            this.onLadder = true;
        }
    }

    descendLadder() {
        const ladder = this.ladders.find(l => 
            this.mario.x + this.mario.width > l.x && 
            this.mario.x < l.x + l.width &&
            this.mario.y + this.mario.height > l.y &&
            this.mario.y < l.y + l.height + 50
        );
        
        if (ladder) {
            this.mario.y += this.mario.speed;
            this.mario.velocityY = 0;
            this.onLadder = true;
        }
    }

    updateMario(deltaTime) {
        // Gravité
        if (!this.onLadder) {
            this.mario.velocityY += this.gravity;
            this.mario.y += this.mario.velocityY;
        }
        
        this.onLadder = false;
        
        // Collision avec les plateformes
        this.mario.onGround = false;
        this.platforms.forEach(platform => {
            if (this.mario.x + this.mario.width > platform.x &&
                this.mario.x < platform.x + platform.width &&
                this.mario.y + this.mario.height > platform.y &&
                this.mario.y + this.mario.height < platform.y + platform.height + 10 &&
                this.mario.velocityY >= 0) {
                
                this.mario.y = platform.y - this.mario.height;
                this.mario.velocityY = 0;
                this.mario.onGround = true;
            }
        });
        
        // Limites de l'écran
        this.mario.x = Math.max(0, Math.min(this.canvas.width - this.mario.width, this.mario.x));
        
        // Mort si Mario tombe
        if (this.mario.y > this.canvas.height) {
            this.loseLife();
        }
    }

    spawnBarrels(deltaTime) {
        this.barrelTimer += deltaTime;
        if (this.barrelTimer >= this.barrelInterval) {
            this.barrels.push({
                x: this.donkeyKong.x + 30,
                y: this.donkeyKong.y + 60,
                width: 15,
                height: 15,
                velocityX: 2,
                velocityY: 0,
                onPlatform: false
            });
            this.barrelTimer = 0;
            
            // Accélérer la génération avec le temps
            this.barrelInterval = Math.max(1000, this.barrelInterval - 50);
        }
    }

    updateBarrels(deltaTime) {
        this.barrels.forEach((barrel, index) => {
            // Gravité pour les barils
            barrel.velocityY += this.gravity;
            barrel.x += barrel.velocityX;
            barrel.y += barrel.velocityY;
            
            // Collision avec les plateformes
            barrel.onPlatform = false;
            this.platforms.forEach(platform => {
                if (barrel.x + barrel.width > platform.x &&
                    barrel.x < platform.x + platform.width &&
                    barrel.y + barrel.height > platform.y &&
                    barrel.y + barrel.height < platform.y + platform.height + 10 &&
                    barrel.velocityY >= 0) {
                    
                    barrel.y = platform.y - barrel.height;
                    barrel.velocityY = 0;
                    barrel.onPlatform = true;
                    
                    // Rebond aléatoire
                    if (Math.random() < 0.3) {
                        barrel.velocityY = -5;
                    }
                }
            });
            
            // Retirer les barils qui sortent de l'écran
            if (barrel.y > this.canvas.height || barrel.x > this.canvas.width) {
                this.barrels.splice(index, 1);
            }
        });
    }

    checkCollisions() {
        // Collision Mario vs barils
        this.barrels.forEach((barrel, index) => {
            if (this.mario.x + this.mario.width > barrel.x &&
                this.mario.x < barrel.x + barrel.width &&
                this.mario.y + this.mario.height > barrel.y &&
                this.mario.y < barrel.y + barrel.height) {
                
                this.loseLife();
                this.barrels.splice(index, 1);
            }
        });
    }

    checkWinCondition() {
        // Victoire si Mario atteint Pauline
        if (this.mario.x + this.mario.width > this.pauline.x &&
            this.mario.x < this.pauline.x + this.pauline.width &&
            this.mario.y + this.mario.height > this.pauline.y &&
            this.mario.y < this.pauline.y + this.pauline.height) {
            
            this.score += 1000 * this.level;
            this.level++;
            this.gameManager.updateScore(this.score);
            this.resetLevel();
        }
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver = true;
            this.gameManager.showGameOver(this.score);
        } else {
            this.resetMario();
        }
    }

    resetMario() {
        this.mario.x = 50;
        this.mario.y = this.canvas.height - 80;
        this.mario.velocityY = 0;
        this.mario.onGround = false;
    }

    resetLevel() {
        this.resetMario();
        this.barrels = [];
        this.barrelTimer = 0;
        this.barrelInterval = Math.max(800, 2000 - this.level * 200);
    }

    render() {
        super.render();

        // Fond
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, '#87CEEB');

        // Plateformes
        this.platforms.forEach(platform => {
            this.drawRect(platform.x, platform.y, platform.width, platform.height, '#8B4513');
            // Rivets sur les plateformes
            for (let x = platform.x + 20; x < platform.x + platform.width - 20; x += 40) {
                this.drawCircle(x, platform.y + 10, 3, '#FFD700');
            }
        });

        // Échelles
        this.ladders.forEach(ladder => {
            this.drawRect(ladder.x, ladder.y, ladder.width, ladder.height, '#8B4513');
            // Barreaux
            for (let y = ladder.y; y < ladder.y + ladder.height; y += 15) {
                this.drawRect(ladder.x, y, ladder.width, 3, '#654321');
            }
        });

        // Donkey Kong
        this.drawRect(this.donkeyKong.x, this.donkeyKong.y, this.donkeyKong.width, this.donkeyKong.height, '#8B4513');
        // Yeux de DK
        this.drawCircle(this.donkeyKong.x + 15, this.donkeyKong.y + 15, 5, '#FFFFFF');
        this.drawCircle(this.donkeyKong.x + 45, this.donkeyKong.y + 15, 5, '#FFFFFF');
        this.drawCircle(this.donkeyKong.x + 17, this.donkeyKong.y + 15, 3, '#000000');
        this.drawCircle(this.donkeyKong.x + 47, this.donkeyKong.y + 15, 3, '#000000');

        // Pauline
        this.drawRect(this.pauline.x, this.pauline.y, this.pauline.width, this.pauline.height, '#FF69B4');
        // Cheveux de Pauline
        this.drawRect(this.pauline.x - 2, this.pauline.y - 5, this.pauline.width + 4, 8, '#FFD700');

        // Mario
        const marioColor = '#FF0000';
        this.drawRect(this.mario.x, this.mario.y, this.mario.width, this.mario.height, marioColor);
        
        // Casquette de Mario
        this.drawRect(this.mario.x - 2, this.mario.y - 5, this.mario.width + 4, 8, marioColor);
        
        // Moustache
        this.drawRect(this.mario.x + 5, this.mario.y + 8, 10, 3, '#000000');

        // Barils
        this.barrels.forEach(barrel => {
            this.drawRect(barrel.x, barrel.y, barrel.width, barrel.height, '#8B4513');
            // Cercles sur les barils
            this.drawCircle(barrel.x + barrel.width/2, barrel.y + 3, 2, '#654321');
            this.drawCircle(barrel.x + barrel.width/2, barrel.y + barrel.height - 3, 2, '#654321');
        });

        // Interface
        this.drawText(`Score: ${this.score}`, 10, 30, 20, '#000000');
        this.drawText(`Vies: ${this.lives}`, 10, 55, 16, '#000000');
        this.drawText(`Niveau: ${this.level}`, 10, 75, 16, '#000000');
        
        // Instructions
        if (this.score === 0) {
            this.drawText('Sauvez Pauline!', this.canvas.width / 2, 30, 20, '#FF0000', 'center');
            this.drawText('Évitez les barils', this.canvas.width / 2, 55, 16, '#000000', 'center');
        }
    }

    reset() {
        super.reset();
        this.level = 1;
        this.lives = 3;
        this.barrels = [];
        this.barrelTimer = 0;
        this.barrelInterval = 2000;
        this.resetMario();
    }
}
