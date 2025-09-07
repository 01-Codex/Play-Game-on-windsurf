// Jeu Pong simplifié
class PongGame extends GameEngine {
    constructor(canvasId) {
        super(canvasId, 800, 400);
        
        this.paddleWidth = 15;
        this.paddleHeight = 80;
        this.ballSize = 15;
        
        this.leftPaddle = {
            x: 20,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: 5
        };
        
        this.rightPaddle = {
            x: this.canvas.width - 35,
            y: this.canvas.height / 2 - this.paddleHeight / 2,
            width: this.paddleWidth,
            height: this.paddleHeight,
            speed: 5
        };
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            width: this.ballSize,
            height: this.ballSize,
            speedX: 4,
            speedY: 3
        };
        
        this.leftScore = 0;
        this.rightScore = 0;
        this.maxScore = 5;
    }

    update(deltaTime) {
        if (this.gameOver) return;

        this.handleInput();
        this.updateBall();
        this.updateAI();
        this.checkCollisions();
        this.checkScore();
    }

    handleInput() {
        // Joueur gauche (flèches ou WASD)
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.leftPaddle.y = Math.max(0, this.leftPaddle.y - this.leftPaddle.speed);
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.leftPaddle.y = Math.min(this.canvas.height - this.leftPaddle.height, 
                                       this.leftPaddle.y + this.leftPaddle.speed);
        }
    }

    handleTouch(x, y, type) {
        if (type === 'start' || type === 'move') {
            // Contrôle tactile pour le paddle gauche
            if (x < this.canvas.width / 2) {
                this.leftPaddle.y = y - this.leftPaddle.height / 2;
                this.leftPaddle.y = Math.max(0, Math.min(this.canvas.height - this.leftPaddle.height, this.leftPaddle.y));
            }
        }
    }

    updateBall() {
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Rebond sur les murs haut et bas
        if (this.ball.y <= 0 || this.ball.y + this.ball.height >= this.canvas.height) {
            this.ball.speedY = -this.ball.speedY;
        }
    }

    updateAI() {
        // IA simple pour le paddle droit
        const ballCenterY = this.ball.y + this.ball.height / 2;
        const paddleCenterY = this.rightPaddle.y + this.rightPaddle.height / 2;
        
        if (ballCenterY < paddleCenterY - 10) {
            this.rightPaddle.y = Math.max(0, this.rightPaddle.y - this.rightPaddle.speed * 0.8);
        } else if (ballCenterY > paddleCenterY + 10) {
            this.rightPaddle.y = Math.min(this.canvas.height - this.rightPaddle.height, 
                                        this.rightPaddle.y + this.rightPaddle.speed * 0.8);
        }
    }

    checkCollisions() {
        // Collision avec le paddle gauche
        if (this.checkCollision(this.ball, this.leftPaddle)) {
            this.ball.speedX = Math.abs(this.ball.speedX);
            this.ball.x = this.leftPaddle.x + this.leftPaddle.width;
            
            // Modifier l'angle selon où la balle touche le paddle
            const hitPos = (this.ball.y + this.ball.height / 2 - this.leftPaddle.y) / this.leftPaddle.height;
            this.ball.speedY = (hitPos - 0.5) * 8;
        }
        
        // Collision avec le paddle droit
        if (this.checkCollision(this.ball, this.rightPaddle)) {
            this.ball.speedX = -Math.abs(this.ball.speedX);
            this.ball.x = this.rightPaddle.x - this.ball.width;
            
            // Modifier l'angle selon où la balle touche le paddle
            const hitPos = (this.ball.y + this.ball.height / 2 - this.rightPaddle.y) / this.rightPaddle.height;
            this.ball.speedY = (hitPos - 0.5) * 8;
        }
    }

    checkScore() {
        // Balle sort à gauche
        if (this.ball.x < 0) {
            this.rightScore++;
            this.resetBall();
        }
        
        // Balle sort à droite
        if (this.ball.x > this.canvas.width) {
            this.leftScore++;
            this.resetBall();
        }
        
        // Vérifier victoire
        if (this.leftScore >= this.maxScore || this.rightScore >= this.maxScore) {
            this.gameOver = true;
            this.score = this.leftScore >= this.maxScore ? this.leftScore * 100 : this.rightScore * 50;
            this.gameManager.showGameOver(this.score);
        }
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.speedX = this.ball.speedX > 0 ? -4 : 4;
        this.ball.speedY = (Math.random() - 0.5) * 6;
    }

    render() {
        super.render();

        // Fond
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, '#000000');

        // Ligne centrale
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Paddles
        this.drawRect(this.leftPaddle.x, this.leftPaddle.y, this.leftPaddle.width, this.leftPaddle.height, '#ffffff');
        this.drawRect(this.rightPaddle.x, this.rightPaddle.y, this.rightPaddle.width, this.rightPaddle.height, '#ffffff');

        // Balle
        this.drawRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height, '#ffffff');

        // Scores
        this.drawText(this.leftScore.toString(), this.canvas.width / 4, 50, 48, '#ffffff', 'center');
        this.drawText(this.rightScore.toString(), (this.canvas.width * 3) / 4, 50, 48, '#ffffff', 'center');

        // Instructions
        this.drawText('Joueur', this.canvas.width / 4, this.canvas.height - 30, 16, '#ffffff', 'center');
        this.drawText('IA', (this.canvas.width * 3) / 4, this.canvas.height - 30, 16, '#ffffff', 'center');
        
        if (this.leftScore === 0 && this.rightScore === 0) {
            this.drawText('Flèches ↑↓ ou tactile', this.canvas.width / 2, this.canvas.height - 10, 14, '#ffffff', 'center');
        }
    }

    reset() {
        super.reset();
        this.leftScore = 0;
        this.rightScore = 0;
        this.leftPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.rightPaddle.y = this.canvas.height / 2 - this.paddleHeight / 2;
        this.resetBall();
    }
}
