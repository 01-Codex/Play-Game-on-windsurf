// Moteur de jeu principal pour tous les mini-jeux
class GameEngine {
    constructor(canvasId, width = 800, height = 600) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.isRunning = false;
        this.lastTime = 0;
        this.keys = {};
        this.score = 0;
        this.gameOver = false;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Gestion du clavier
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });

        // Gestion tactile pour mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.handleTouch(touch.clientX - rect.left, touch.clientY - rect.top, 'start');
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.handleTouch(touch.clientX - rect.left, touch.clientY - rect.top, 'move');
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleTouch(0, 0, 'end');
        });
    }

    handleTouch(x, y, type) {
        // À implémenter dans chaque jeu spécifique
    }

    start() {
        this.isRunning = true;
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // À implémenter dans chaque jeu spécifique
    }

    render() {
        // Effacer le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // À implémenter dans chaque jeu spécifique
    }

    drawText(text, x, y, size = 20, color = 'white', align = 'left') {
        this.ctx.font = `${size}px Arial`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.fillText(text, x, y);
    }

    drawRect(x, y, width, height, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, width, height);
    }

    drawCircle(x, y, radius, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    reset() {
        this.score = 0;
        this.gameOver = false;
    }
}

// Gestionnaire de jeux
class GameManager {
    constructor() {
        this.currentGame = null;
        this.gameContainer = null;
        this.setupGameContainer();
    }

    setupGameContainer() {
        // Créer le conteneur de jeu modal
        const gameModal = document.createElement('div');
        gameModal.id = 'gamePlayModal';
        gameModal.className = 'game-modal';
        gameModal.innerHTML = `
            <div class="game-modal-content">
                <div class="game-header">
                    <h2 id="gameTitle">Jeu</h2>
                    <div class="game-controls">
                        <button id="pauseBtn" class="game-btn">⏸️</button>
                        <button id="restartBtn" class="game-btn">🔄</button>
                        <button id="closeGameBtn" class="game-btn">❌</button>
                    </div>
                </div>
                <div class="game-area">
                    <canvas id="gameCanvas"></canvas>
                    <div id="gameUI" class="game-ui">
                        <div class="score">Score: <span id="scoreDisplay">0</span></div>
                        <div id="gameInstructions" class="instructions"></div>
                    </div>
                </div>
                <div id="gameOverScreen" class="game-over hidden">
                    <h3>Game Over!</h3>
                    <p>Score final: <span id="finalScore">0</span></p>
                    <button id="playAgainBtn" class="play-again-btn">Rejouer</button>
                </div>
            </div>
        `;

        document.body.appendChild(gameModal);
        this.gameContainer = gameModal;

        // Styles CSS pour le modal de jeu
        const gameStyles = document.createElement('style');
        gameStyles.textContent = `
            .game-modal {
                display: none;
                position: fixed;
                z-index: 2000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(5px);
            }

            .game-modal-content {
                background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                margin: 2% auto;
                padding: 0;
                border-radius: 15px;
                width: 95%;
                max-width: 900px;
                height: 90vh;
                display: flex;
                flex-direction: column;
                color: white;
                overflow: hidden;
            }

            .game-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem 2rem;
                border-bottom: 2px solid rgba(255,255,255,0.2);
            }

            .game-header h2 {
                margin: 0;
                font-family: 'Orbitron', monospace;
            }

            .game-controls {
                display: flex;
                gap: 0.5rem;
            }

            .game-btn {
                background: rgba(255,255,255,0.2);
                border: none;
                padding: 0.5rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1.2rem;
                transition: background 0.3s ease;
            }

            .game-btn:hover {
                background: rgba(255,255,255,0.3);
            }

            .game-area {
                flex: 1;
                display: flex;
                padding: 1rem;
                gap: 1rem;
                align-items: center;
                justify-content: center;
            }

            #gameCanvas {
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 10px;
                background: #000;
                max-width: 100%;
                max-height: 100%;
            }

            .game-ui {
                display: flex;
                flex-direction: column;
                gap: 1rem;
                min-width: 200px;
            }

            .score {
                background: rgba(255,255,255,0.1);
                padding: 1rem;
                border-radius: 10px;
                text-align: center;
                font-size: 1.2rem;
                font-weight: bold;
            }

            .instructions {
                background: rgba(255,255,255,0.1);
                padding: 1rem;
                border-radius: 10px;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .game-over {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0,0,0,0.9);
                padding: 2rem;
                border-radius: 15px;
                text-align: center;
                border: 2px solid #ffd700;
            }

            .play-again-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 1rem 2rem;
                border-radius: 25px;
                font-size: 1.1rem;
                cursor: pointer;
                margin-top: 1rem;
                transition: transform 0.3s ease;
            }

            .play-again-btn:hover {
                transform: translateY(-2px);
            }

            .hidden {
                display: none !important;
            }

            @media (max-width: 768px) {
                .game-modal-content {
                    width: 98%;
                    height: 95vh;
                    margin: 1% auto;
                }

                .game-area {
                    flex-direction: column;
                    padding: 0.5rem;
                    gap: 0.5rem;
                }

                .game-ui {
                    flex-direction: row;
                    min-width: auto;
                    width: 100%;
                    justify-content: space-between;
                }

                #gameCanvas {
                    width: 100%;
                    height: auto;
                    max-height: 60vh;
                }

                .game-header {
                    padding: 0.75rem 1rem;
                }

                .game-header h2 {
                    font-size: 1.2rem;
                }

                .score, .instructions {
                    padding: 0.5rem;
                    font-size: 0.9rem;
                }
            }
        `;
        document.head.appendChild(gameStyles);

        this.setupGameControls();
    }

    setupGameControls() {
        document.getElementById('closeGameBtn').addEventListener('click', () => {
            this.closeGame();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }

    openGame(gameId, gameTitle) {
        document.getElementById('gameTitle').textContent = gameTitle;
        this.gameContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Initialiser le jeu spécifique
        this.initializeGame(gameId);
    }

    closeGame() {
        if (this.currentGame) {
            this.currentGame.stop();
            this.currentGame = null;
        }
        this.gameContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('gameOverScreen').classList.add('hidden');
    }

    togglePause() {
        if (this.currentGame) {
            if (this.currentGame.isRunning) {
                this.currentGame.stop();
                document.getElementById('pauseBtn').textContent = '▶️';
            } else {
                this.currentGame.start();
                document.getElementById('pauseBtn').textContent = '⏸️';
            }
        }
    }

    restartGame() {
        if (this.currentGame) {
            this.currentGame.reset();
            this.currentGame.start();
            document.getElementById('gameOverScreen').classList.add('hidden');
            document.getElementById('pauseBtn').textContent = '⏸️';
        }
    }

    updateScore(score) {
        document.getElementById('scoreDisplay').textContent = score;
    }

    showGameOver(finalScore) {
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }

    setInstructions(instructions) {
        document.getElementById('gameInstructions').innerHTML = instructions;
    }

    initializeGame(gameId) {
        // Mapping des jeux avec leurs implémentations
        switch(gameId) {
            case 1: // Pac-Man
                this.currentGame = new PacManGame('gameCanvas');
                this.setInstructions('🕹️ Utilisez les flèches pour vous déplacer<br>🟡 Mangez tous les points<br>👻 Évitez les fantômes');
                break;
            case 2: // Space Invaders
                this.currentGame = new SpaceInvadersGame('gameCanvas');
                this.setInstructions('⬅️➡️ Flèches pour déplacer<br>ESPACE pour tirer<br>🛸 Détruisez tous les aliens');
                break;
            case 3: // Donkey Kong -> Snake (temporaire)
                this.currentGame = new SnakeGame('gameCanvas');
                this.setInstructions('🐍 Version simplifiée - Flèches pour diriger<br>🍎 Mangez les pommes<br>❌ Évitez les murs');
                break;
            case 4: // Tetris
                this.currentGame = new TetrisGame('gameCanvas');
                this.setInstructions('⬅️➡️ Flèches pour déplacer<br>⬇️ Flèche bas pour accélérer<br>⬆️ Flèche haut pour tourner');
                break;
            case 5: // Street Fighter II -> Pong
                this.currentGame = new PongGame('gameCanvas');
                this.setInstructions('🥊 Version combat simplifié<br>⬆️⬇️ Flèches pour contrôler<br>🏓 Premier à 5 points gagne');
                break;
            case 6: // Galaga -> Space Invaders
                this.currentGame = new SpaceInvadersGame('gameCanvas');
                this.setInstructions('🚀 Version Galaga simplifiée<br>⬅️➡️ Flèches + ESPACE<br>🛸 Détruisez les aliens');
                break;
            case 7: // Frogger -> Snake
                this.currentGame = new SnakeGame('gameCanvas');
                this.setInstructions('🐸 Version grenouille simplifiée<br>🕹️ Flèches pour naviguer<br>🎯 Évitez les obstacles');
                break;
            case 8: // Centipede -> Space Invaders
                this.currentGame = new SpaceInvadersGame('gameCanvas');
                this.setInstructions('🐛 Version Centipede<br>⬅️➡️ Déplacement + ESPACE<br>🎯 Visez le mille-pattes');
                break;
            case 9: // Asteroids -> Space Invaders
                this.currentGame = new SpaceInvadersGame('gameCanvas');
                this.setInstructions('🪨 Version Asteroids<br>⬅️➡️ Navigation + ESPACE<br>💥 Détruisez les astéroïdes');
                break;
            case 10: // Ms. Pac-Man
                this.currentGame = new PacManGame('gameCanvas');
                this.setInstructions('👩 Version Ms. Pac-Man<br>🕹️ Flèches pour bouger<br>🟡 Mangez tous les points');
                break;
            case 16: // Pole Position -> Snake (course simplifiée)
                this.currentGame = new SnakeGame('gameCanvas');
                this.setInstructions('🏎️ Course simplifiée<br>⬅️➡️ Dirigez votre véhicule<br>🏁 Évitez les obstacles');
                break;
            case 19: // Spy Hunter -> Snake
                this.currentGame = new SnakeGame('gameCanvas');
                this.setInstructions('🕵️ Mission d\'espion<br>🚗 Flèches pour conduire<br>🎯 Évitez les ennemis');
                break;
            case 23: // Out Run -> Snake
                this.currentGame = new SnakeGame('gameCanvas');
                this.setInstructions('🏎️ Course Out Run<br>⬅️➡️ Conduisez votre bolide<br>🌴 Évitez les obstacles');
                break;
            default:
                // Tous les autres jeux utilisent Snake par défaut
                this.currentGame = new SnakeGame('gameCanvas');
                this.setInstructions('🐍 Version simplifiée du jeu<br>🕹️ Flèches pour diriger<br>🍎 Collectez les objets');
        }
        
        if (this.currentGame) {
            this.currentGame.gameManager = this;
            this.currentGame.start();
        }
    }
}

// Instance globale du gestionnaire de jeux
window.gameManager = new GameManager();
