// Jeu Pac-Man simplifié
class PacManGame extends GameEngine {
    constructor(canvasId) {
        super(canvasId, 800, 600);
        
        this.tileSize = 20;
        this.cols = Math.floor(this.canvas.width / this.tileSize);
        this.rows = Math.floor(this.canvas.height / this.tileSize);
        
        this.pacman = {
            x: 1,
            y: 1,
            direction: 'right',
            nextDirection: 'right'
        };
        
        this.ghosts = [
            { x: 18, y: 10, direction: 'left', color: '#ff0000' },
            { x: 20, y: 10, direction: 'right', color: '#ffb8ff' },
            { x: 19, y: 12, direction: 'up', color: '#00ffff' }
        ];
        
        this.dots = [];
        this.walls = [];
        this.powerPellets = [];
        this.powerMode = false;
        this.powerModeTimer = 0;
        
        this.generateMaze();
        this.generateDots();
    }

    generateMaze() {
        // Murs du périmètre
        for (let x = 0; x < this.cols; x++) {
            this.walls.push({ x, y: 0 });
            this.walls.push({ x, y: this.rows - 1 });
        }
        for (let y = 0; y < this.rows; y++) {
            this.walls.push({ x: 0, y });
            this.walls.push({ x: this.cols - 1, y });
        }

        // Murs intérieurs (pattern simple)
        const wallPattern = [
            { x: 5, y: 3, width: 3, height: 1 },
            { x: 10, y: 3, width: 1, height: 5 },
            { x: 15, y: 3, width: 3, height: 1 },
            { x: 25, y: 3, width: 3, height: 1 },
            { x: 30, y: 3, width: 1, height: 5 },
            { x: 35, y: 3, width: 3, height: 1 },
            
            { x: 5, y: 10, width: 1, height: 5 },
            { x: 15, y: 10, width: 8, height: 1 },
            { x: 30, y: 10, width: 1, height: 5 },
            { x: 35, y: 10, width: 3, height: 1 },
            
            { x: 10, y: 20, width: 5, height: 1 },
            { x: 20, y: 20, width: 5, height: 1 },
            { x: 30, y: 20, width: 5, height: 1 }
        ];

        wallPattern.forEach(pattern => {
            for (let x = 0; x < pattern.width; x++) {
                for (let y = 0; y < pattern.height; y++) {
                    if (pattern.x + x < this.cols && pattern.y + y < this.rows) {
                        this.walls.push({ x: pattern.x + x, y: pattern.y + y });
                    }
                }
            }
        });
    }

    generateDots() {
        for (let x = 1; x < this.cols - 1; x++) {
            for (let y = 1; y < this.rows - 1; y++) {
                if (!this.isWall(x, y) && !this.isNearPacman(x, y) && !this.isNearGhost(x, y)) {
                    this.dots.push({ x, y });
                }
            }
        }

        // Ajouter quelques power pellets
        this.powerPellets = [
            { x: 2, y: 2 },
            { x: this.cols - 3, y: 2 },
            { x: 2, y: this.rows - 3 },
            { x: this.cols - 3, y: this.rows - 3 }
        ];
    }

    isWall(x, y) {
        return this.walls.some(wall => wall.x === x && wall.y === y);
    }

    isNearPacman(x, y) {
        return Math.abs(x - this.pacman.x) <= 1 && Math.abs(y - this.pacman.y) <= 1;
    }

    isNearGhost(x, y) {
        return this.ghosts.some(ghost => 
            Math.abs(x - ghost.x) <= 1 && Math.abs(y - ghost.y) <= 1
        );
    }

    update(deltaTime) {
        if (this.gameOver) return;

        this.handleInput();
        this.movePacman();
        this.moveGhosts();
        this.checkCollisions();
        this.updatePowerMode(deltaTime);
        
        // Vérifier victoire
        if (this.dots.length === 0 && this.powerPellets.length === 0) {
            this.gameOver = true;
            this.gameManager.showGameOver(this.score);
        }
    }

    handleInput() {
        if (this.keys['ArrowUp']) this.pacman.nextDirection = 'up';
        if (this.keys['ArrowDown']) this.pacman.nextDirection = 'down';
        if (this.keys['ArrowLeft']) this.pacman.nextDirection = 'left';
        if (this.keys['ArrowRight']) this.pacman.nextDirection = 'right';
    }

    handleTouch(x, y, type) {
        if (type === 'start') {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            const dx = x - centerX;
            const dy = y - centerY;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                this.pacman.nextDirection = dx > 0 ? 'right' : 'left';
            } else {
                this.pacman.nextDirection = dy > 0 ? 'down' : 'up';
            }
        }
    }

    movePacman() {
        const directions = {
            up: { x: 0, y: -1 },
            down: { x: 0, y: 1 },
            left: { x: -1, y: 0 },
            right: { x: 1, y: 0 }
        };

        // Essayer de changer de direction
        const nextDir = directions[this.pacman.nextDirection];
        const nextX = this.pacman.x + nextDir.x;
        const nextY = this.pacman.y + nextDir.y;

        if (!this.isWall(nextX, nextY)) {
            this.pacman.direction = this.pacman.nextDirection;
        }

        // Bouger dans la direction actuelle
        const currentDir = directions[this.pacman.direction];
        const newX = this.pacman.x + currentDir.x;
        const newY = this.pacman.y + currentDir.y;

        if (!this.isWall(newX, newY)) {
            this.pacman.x = newX;
            this.pacman.y = newY;

            // Téléportation sur les bords
            if (this.pacman.x < 0) this.pacman.x = this.cols - 1;
            if (this.pacman.x >= this.cols) this.pacman.x = 0;
        }
    }

    moveGhosts() {
        this.ghosts.forEach(ghost => {
            const directions = ['up', 'down', 'left', 'right'];
            const directionVectors = {
                up: { x: 0, y: -1 },
                down: { x: 0, y: 1 },
                left: { x: -1, y: 0 },
                right: { x: 1, y: 0 }
            };

            // Changer de direction aléatoirement parfois
            if (Math.random() < 0.1) {
                ghost.direction = directions[Math.floor(Math.random() * directions.length)];
            }

            const dir = directionVectors[ghost.direction];
            const newX = ghost.x + dir.x;
            const newY = ghost.y + dir.y;

            if (!this.isWall(newX, newY)) {
                ghost.x = newX;
                ghost.y = newY;
            } else {
                // Changer de direction si on touche un mur
                ghost.direction = directions[Math.floor(Math.random() * directions.length)];
            }

            // Téléportation sur les bords
            if (ghost.x < 0) ghost.x = this.cols - 1;
            if (ghost.x >= this.cols) ghost.x = 0;
        });
    }

    checkCollisions() {
        // Collision avec les dots
        this.dots = this.dots.filter(dot => {
            if (dot.x === this.pacman.x && dot.y === this.pacman.y) {
                this.score += 10;
                this.gameManager.updateScore(this.score);
                return false;
            }
            return true;
        });

        // Collision avec les power pellets
        this.powerPellets = this.powerPellets.filter(pellet => {
            if (pellet.x === this.pacman.x && pellet.y === this.pacman.y) {
                this.score += 50;
                this.powerMode = true;
                this.powerModeTimer = 5000; // 5 secondes
                this.gameManager.updateScore(this.score);
                return false;
            }
            return true;
        });

        // Collision avec les fantômes
        this.ghosts.forEach(ghost => {
            if (ghost.x === this.pacman.x && ghost.y === this.pacman.y) {
                if (this.powerMode) {
                    this.score += 200;
                    this.gameManager.updateScore(this.score);
                    // Réinitialiser la position du fantôme
                    ghost.x = 18 + Math.floor(Math.random() * 4);
                    ghost.y = 10;
                } else {
                    this.gameOver = true;
                    this.gameManager.showGameOver(this.score);
                }
            }
        });
    }

    updatePowerMode(deltaTime) {
        if (this.powerMode) {
            this.powerModeTimer -= deltaTime;
            if (this.powerModeTimer <= 0) {
                this.powerMode = false;
            }
        }
    }

    render() {
        super.render();

        // Fond
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, '#000000');

        // Murs
        this.ctx.fillStyle = '#0000ff';
        this.walls.forEach(wall => {
            this.drawRect(
                wall.x * this.tileSize,
                wall.y * this.tileSize,
                this.tileSize,
                this.tileSize,
                '#0000ff'
            );
        });

        // Dots
        this.ctx.fillStyle = '#ffff00';
        this.dots.forEach(dot => {
            this.drawCircle(
                dot.x * this.tileSize + this.tileSize / 2,
                dot.y * this.tileSize + this.tileSize / 2,
                2,
                '#ffff00'
            );
        });

        // Power pellets
        this.powerPellets.forEach(pellet => {
            const size = Math.sin(Date.now() * 0.01) * 2 + 6;
            this.drawCircle(
                pellet.x * this.tileSize + this.tileSize / 2,
                pellet.y * this.tileSize + this.tileSize / 2,
                size,
                '#ffff00'
            );
        });

        // Pac-Man
        const pacmanColor = this.powerMode ? '#ff00ff' : '#ffff00';
        this.drawCircle(
            this.pacman.x * this.tileSize + this.tileSize / 2,
            this.pacman.y * this.tileSize + this.tileSize / 2,
            this.tileSize / 2 - 2,
            pacmanColor
        );

        // Bouche de Pac-Man
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        const centerX = this.pacman.x * this.tileSize + this.tileSize / 2;
        const centerY = this.pacman.y * this.tileSize + this.tileSize / 2;
        const radius = this.tileSize / 2 - 2;
        
        let startAngle, endAngle;
        switch (this.pacman.direction) {
            case 'right':
                startAngle = 0.2 * Math.PI;
                endAngle = 1.8 * Math.PI;
                break;
            case 'left':
                startAngle = 1.2 * Math.PI;
                endAngle = 0.8 * Math.PI;
                break;
            case 'up':
                startAngle = 1.7 * Math.PI;
                endAngle = 1.3 * Math.PI;
                break;
            case 'down':
                startAngle = 0.7 * Math.PI;
                endAngle = 0.3 * Math.PI;
                break;
        }
        
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.lineTo(centerX, centerY);
        this.ctx.fill();

        // Fantômes
        this.ghosts.forEach(ghost => {
            const ghostColor = this.powerMode ? '#0000ff' : ghost.color;
            
            // Corps du fantôme
            this.drawRect(
                ghost.x * this.tileSize + 2,
                ghost.y * this.tileSize + 2,
                this.tileSize - 4,
                this.tileSize - 4,
                ghostColor
            );
            
            // Partie arrondie du haut
            this.drawCircle(
                ghost.x * this.tileSize + this.tileSize / 2,
                ghost.y * this.tileSize + this.tileSize / 2,
                this.tileSize / 2 - 2,
                ghostColor
            );

            // Yeux
            this.drawCircle(
                ghost.x * this.tileSize + 6,
                ghost.y * this.tileSize + 6,
                2,
                '#ffffff'
            );
            this.drawCircle(
                ghost.x * this.tileSize + this.tileSize - 6,
                ghost.y * this.tileSize + 6,
                2,
                '#ffffff'
            );
        });

        // Indicateur de power mode
        if (this.powerMode) {
            this.drawText(
                `POWER MODE: ${Math.ceil(this.powerModeTimer / 1000)}s`,
                10,
                30,
                16,
                '#ff00ff'
            );
        }

        // Affichage du score
        this.drawText(`Score: ${this.score}`, 10, this.canvas.height - 10, 16, '#ffffff');
    }

    reset() {
        super.reset();
        this.pacman = { x: 1, y: 1, direction: 'right', nextDirection: 'right' };
        this.ghosts = [
            { x: 18, y: 10, direction: 'left', color: '#ff0000' },
            { x: 20, y: 10, direction: 'right', color: '#ffb8ff' },
            { x: 19, y: 12, direction: 'up', color: '#00ffff' }
        ];
        this.powerMode = false;
        this.powerModeTimer = 0;
        this.dots = [];
        this.powerPellets = [];
        this.generateDots();
    }
}
