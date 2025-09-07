// Jeu Tetris simplifié
class TetrisGame extends GameEngine {
    constructor(canvasId) {
        super(canvasId, 400, 600);
        
        this.blockSize = 30;
        this.cols = 10;
        this.rows = 20;
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropTimer = 0;
        this.dropInterval = 500; // ms
        this.level = 1;
        this.linesCleared = 0;
        
        this.pieces = [
            // I piece
            {
                shape: [[1, 1, 1, 1]],
                color: '#00ffff'
            },
            // O piece
            {
                shape: [[1, 1], [1, 1]],
                color: '#ffff00'
            },
            // T piece
            {
                shape: [[0, 1, 0], [1, 1, 1]],
                color: '#800080'
            },
            // S piece
            {
                shape: [[0, 1, 1], [1, 1, 0]],
                color: '#00ff00'
            },
            // Z piece
            {
                shape: [[1, 1, 0], [0, 1, 1]],
                color: '#ff0000'
            },
            // J piece
            {
                shape: [[1, 0, 0], [1, 1, 1]],
                color: '#0000ff'
            },
            // L piece
            {
                shape: [[0, 0, 1], [1, 1, 1]],
                color: '#ffa500'
            }
        ];
        
        this.initBoard();
        this.spawnPiece();
    }

    initBoard() {
        this.board = [];
        for (let row = 0; row < this.rows; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.board[row][col] = 0;
            }
        }
    }

    spawnPiece() {
        if (this.nextPiece) {
            this.currentPiece = this.nextPiece;
        } else {
            this.currentPiece = this.getRandomPiece();
        }
        
        this.nextPiece = this.getRandomPiece();
        
        this.currentPiece.x = Math.floor(this.cols / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
        this.currentPiece.y = 0;
        
        // Vérifier game over
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            this.gameOver = true;
            this.gameManager.showGameOver(this.score);
        }
    }

    getRandomPiece() {
        const pieceTemplate = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        return {
            shape: pieceTemplate.shape.map(row => [...row]),
            color: pieceTemplate.color,
            x: 0,
            y: 0
        };
    }

    update(deltaTime) {
        if (this.gameOver) return;

        this.handleInput();
        
        this.dropTimer += deltaTime;
        if (this.dropTimer >= this.dropInterval) {
            this.dropPiece();
            this.dropTimer = 0;
        }
    }

    handleInput() {
        if (this.keys['ArrowLeft']) {
            this.movePiece(-1, 0);
            this.keys['ArrowLeft'] = false;
        }
        if (this.keys['ArrowRight']) {
            this.movePiece(1, 0);
            this.keys['ArrowRight'] = false;
        }
        if (this.keys['ArrowDown']) {
            this.dropPiece();
            this.keys['ArrowDown'] = false;
        }
        if (this.keys['ArrowUp']) {
            this.rotatePiece();
            this.keys['ArrowUp'] = false;
        }
    }

    handleTouch(x, y, type) {
        if (type === 'start') {
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            
            if (y < centerY / 2) {
                // Haut de l'écran - rotation
                this.rotatePiece();
            } else if (x < centerX / 2) {
                // Gauche
                this.movePiece(-1, 0);
            } else if (x > centerX * 1.5) {
                // Droite
                this.movePiece(1, 0);
            } else {
                // Centre - descendre
                this.dropPiece();
            }
        }
    }

    movePiece(dx, dy) {
        if (!this.checkCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
        }
    }

    dropPiece() {
        if (!this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        } else {
            this.placePiece();
            this.clearLines();
            this.spawnPiece();
        }
    }

    rotatePiece() {
        const rotated = this.rotateMatrix(this.currentPiece.shape);
        const originalShape = this.currentPiece.shape;
        
        this.currentPiece.shape = rotated;
        
        if (this.checkCollision(this.currentPiece, 0, 0)) {
            // Essayer de décaler si la rotation ne fonctionne pas
            if (!this.checkCollision(this.currentPiece, -1, 0)) {
                this.currentPiece.x--;
            } else if (!this.checkCollision(this.currentPiece, 1, 0)) {
                this.currentPiece.x++;
            } else {
                // Annuler la rotation
                this.currentPiece.shape = originalShape;
            }
        }
    }

    rotateMatrix(matrix) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const rotated = [];
        
        for (let col = 0; col < cols; col++) {
            rotated[col] = [];
            for (let row = rows - 1; row >= 0; row--) {
                rotated[col][rows - 1 - row] = matrix[row][col];
            }
        }
        
        return rotated;
    }

    checkCollision(piece, dx, dy) {
        const newX = piece.x + dx;
        const newY = piece.y + dy;
        
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const boardX = newX + col;
                    const boardY = newY + row;
                    
                    if (boardX < 0 || boardX >= this.cols || 
                        boardY >= this.rows || 
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    placePiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const boardX = this.currentPiece.x + col;
                    const boardY = this.currentPiece.y + row;
                    
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(new Array(this.cols).fill(0));
                linesCleared++;
                row++; // Vérifier à nouveau la même ligne
            }
        }
        
        if (linesCleared > 0) {
            this.linesCleared += linesCleared;
            const points = [0, 40, 100, 300, 1200][linesCleared] * this.level;
            this.score += points;
            this.gameManager.updateScore(this.score);
            
            // Augmenter le niveau tous les 10 lignes
            this.level = Math.floor(this.linesCleared / 10) + 1;
            this.dropInterval = Math.max(50, 500 - (this.level - 1) * 50);
        }
    }

    render() {
        super.render();

        // Fond
        this.drawRect(0, 0, this.canvas.width, this.canvas.height, '#000000');

        // Grille de jeu
        const boardWidth = this.cols * this.blockSize;
        const boardHeight = this.rows * this.blockSize;
        const offsetX = (this.canvas.width - boardWidth) / 2;
        const offsetY = 50;

        // Bordure
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(offsetX - 2, offsetY - 2, boardWidth + 4, boardHeight + 4);

        // Dessiner le plateau
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col]) {
                    this.drawRect(
                        offsetX + col * this.blockSize,
                        offsetY + row * this.blockSize,
                        this.blockSize - 1,
                        this.blockSize - 1,
                        this.board[row][col]
                    );
                }
            }
        }

        // Dessiner la pièce actuelle
        if (this.currentPiece) {
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) {
                        this.drawRect(
                            offsetX + (this.currentPiece.x + col) * this.blockSize,
                            offsetY + (this.currentPiece.y + row) * this.blockSize,
                            this.blockSize - 1,
                            this.blockSize - 1,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }

        // Dessiner la pièce suivante
        if (this.nextPiece) {
            this.drawText('SUIVANT:', offsetX + boardWidth + 20, offsetY + 30, 16, '#ffffff');
            
            for (let row = 0; row < this.nextPiece.shape.length; row++) {
                for (let col = 0; col < this.nextPiece.shape[row].length; col++) {
                    if (this.nextPiece.shape[row][col]) {
                        this.drawRect(
                            offsetX + boardWidth + 20 + col * 20,
                            offsetY + 50 + row * 20,
                            19,
                            19,
                            this.nextPiece.color
                        );
                    }
                }
            }
        }

        // Informations de jeu
        this.drawText(`Score: ${this.score}`, 10, 30, 16, '#ffffff');
        this.drawText(`Niveau: ${this.level}`, 10, 50, 16, '#ffffff');
        this.drawText(`Lignes: ${this.linesCleared}`, 10, 70, 16, '#ffffff');

        // Grille de fond
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        for (let row = 0; row <= this.rows; row++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, offsetY + row * this.blockSize);
            this.ctx.lineTo(offsetX + boardWidth, offsetY + row * this.blockSize);
            this.ctx.stroke();
        }
        for (let col = 0; col <= this.cols; col++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX + col * this.blockSize, offsetY);
            this.ctx.lineTo(offsetX + col * this.blockSize, offsetY + boardHeight);
            this.ctx.stroke();
        }
    }

    reset() {
        super.reset();
        this.level = 1;
        this.linesCleared = 0;
        this.dropTimer = 0;
        this.dropInterval = 500;
        this.initBoard();
        this.currentPiece = null;
        this.nextPiece = null;
        this.spawnPiece();
    }
}
