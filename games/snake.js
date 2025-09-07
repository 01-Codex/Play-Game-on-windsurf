// Jeu Snake simplifié
class SnakeGame extends GameEngine {
    constructor(canvasId) {
        super(canvasId, 600, 600);
        
        this.tileSize = 20;
        this.cols = this.canvas.width / this.tileSize;
        this.rows = this.canvas.height / this.tileSize;
        
        this.snake = [
            { x: 10, y: 10 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = this.generateFood();
        this.moveTimer = 0;
        this.moveInterval = 150;
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }

    update(deltaTime) {
        if (this.gameOver) return;

        this.handleInput();
        
        this.moveTimer += deltaTime;
        if (this.moveTimer >= this.moveInterval) {
            this.moveSnake();
            this.moveTimer = 0;
        }
    }

    handleInput() {
        if (this.keys['ArrowUp'] && this.direction.y !== 1) {
            this.nextDirection = { x: 0, y: -1 };
        }
        if (this.keys['ArrowDown'] && this.direction.y !== -1) {
            this.nextDirection = { x: 0, y: 1 };
        }
        if (this.keys['ArrowLeft'] && this.direction.x !== 1) {
            this.nextDirection = { x: -1, y: 0 };
        }
        if (this.keys['ArrowRight'] && this.direction.x !== -1) {
            this.nextDirection = { x: 1, y: 0 };
        }
    }

    handleTouch(x, y, type) {
        if (type === 'start') {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            const dx = x - centerX;
            const dy = y - centerY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0 && this.direction.x !== -1) {
                    this.nextDirection = { x: 1, y: 0 };
                } else if (dx < 0 && this.direction.x !== 1) {
                    this.nextDirection = { x: -1, y: 0 };
                }
            } else {
                if (dy > 0 && this.direction.y !== -1) {
                    this.nextDirection = { x: 0, y: 1 };
                } else if (dy < 0 && this.direction.y !== 1) {
                    this.nextDirection = { x: 0, y: -1 };
                }
            }
        }
    }

    moveSnake() {
        this.direction = this.nextDirection;
        
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Vérifier collision avec les murs
        if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
            this.gameOver = true;
            this.gameManager.showGameOver(this.score);
            return;
        }
        
        // Vérifier collision avec soi-même
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver = true;
            this.gameManager.showGameOver(this.score);
            return;
        }
        
        this.snake.unshift(head);
        
        // Vérifier si on mange la nourriture
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.gameManager.updateScore(this.score);
            this.food = this.generateFood();
            
            // Accélérer légèrement
            this.moveInterval = Math.max(80, this.moveInterval - 2);
        } else {
            this.snake.pop();
        }
    }

    render() {
        super.render();

        // Fond
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, '#001100');

        // Grille
        this.ctx.strokeStyle = '#003300';
        this.ctx.lineWidth = 1;
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.tileSize, 0);
            this.ctx.lineTo(x * this.tileSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.tileSize);
            this.ctx.lineTo(this.canvas.width, y * this.tileSize);
            this.ctx.stroke();
        }

        // Serpent
        this.snake.forEach((segment, index) => {
            const color = index === 0 ? '#00ff00' : '#00cc00';
            this.drawRect(
                segment.x * this.tileSize + 1,
                segment.y * this.tileSize + 1,
                this.tileSize - 2,
                this.tileSize - 2,
                color
            );
            
            // Yeux pour la tête
            if (index === 0) {
                this.drawCircle(
                    segment.x * this.tileSize + 6,
                    segment.y * this.tileSize + 6,
                    2,
                    '#ffffff'
                );
                this.drawCircle(
                    segment.x * this.tileSize + this.tileSize - 6,
                    segment.y * this.tileSize + 6,
                    2,
                    '#ffffff'
                );
            }
        });

        // Nourriture
        this.drawCircle(
            this.food.x * this.tileSize + this.tileSize / 2,
            this.food.y * this.tileSize + this.tileSize / 2,
            this.tileSize / 2 - 2,
            '#ff0000'
        );

        // Score et longueur
        this.drawText(`Score: ${this.score}`, 10, 25, 16, '#ffffff');
        this.drawText(`Longueur: ${this.snake.length}`, 10, 45, 16, '#ffffff');
    }

    reset() {
        super.reset();
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = this.generateFood();
        this.moveTimer = 0;
        this.moveInterval = 150;
    }
}
