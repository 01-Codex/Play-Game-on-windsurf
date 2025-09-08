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
window.GameManager = class GameManager {
    constructor() {
        this.currentGame = null;
        this.gameContainer = null;
        this.currentGameId = null;
        this.currentGameTitle = '';
        this.isPaused = false;
        this.pauseMenu = null;
        this.visualEffects = visualEffects; // Référence au gestionnaire d'effets visuels
        this.setupGameContainer();
        this.initPauseMenu();
        this.initVisualEffects();
        soundManager.playMusic();
    }

    initPauseMenu() {
        // Initialiser le menu pause
        this.pauseMenu = new PauseMenu(this);
    }
    
    /**
     * Initialise les éléments pour les effets visuels
     */
    initVisualEffects() {
        // Créer l'élément pour le flash d'écran
        this.screenFlash = document.createElement('div');
        this.screenFlash.className = 'screen-flash';
        document.body.appendChild(this.screenFlash);
        
        // Créer l'élément pour la transition entre les écrans
        this.screenTransition = document.createElement('div');
        this.screenTransition.className = 'screen-transition';
        document.body.appendChild(this.screenTransition);
        
        // Initialiser les écouteurs d'événements pour les boutons
        this.setupButtonEffects();
    }
    
    /**
     * Configure les effets pour les boutons
     */
    setupButtonEffects() {
        // Effet de particules au survol des boutons
        document.addEventListener('mouseover', (e) => {
            const button = e.target.closest('button');
            if (button && !button.classList.contains('no-particle-effect')) {
                this.addButtonHoverEffect(button);
            }
        });
        
        // Effet de clic sur les boutons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (button) {
                this.addButtonClickEffect(button);
            }
        });
    }
    
    /**
     * Ajoute un effet de survol à un bouton
     * @param {HTMLElement} button - L'élément bouton
     */
    addButtonHoverEffect(button) {
        // Empêcher les effets multiples
        if (button.classList.contains('button-hover-effect')) return;
        
        button.classList.add('button-hover-effect');
        
        // Créer un conteneur pour les particules
        const particles = document.createElement('div');
        particles.className = 'button-particles';
        button.appendChild(particles);
        
        // Créer des particules autour du bouton
        const particleCount = 8;
        const rect = button.getBoundingClientRect();
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const distance = Math.random() * 20 + 10;
            const x = Math.cos(angle) * distance + rect.width / 2;
            const y = Math.sin(angle) * distance + rect.height / 2;
            
            this.visualEffects.createParticles(
                rect.left + x,
                rect.top + y,
                {
                    count: 2,
                    color: '#00D1B2',
                    minSpeed: 0.5,
                    maxSpeed: 1.5,
                    size: 2,
                    life: 1,
                    spread: 180,
                    gravity: 0.1
                }
            );
        }
        
        // Supprimer la classe après l'animation
        setTimeout(() => {
            button.classList.remove('button-hover-effect');
            if (particles.parentNode === button) {
                button.removeChild(particles);
            }
        }, 500);
    }
    
    /**
     * Ajoute un effet de clic à un bouton
     * @param {HTMLElement} button - L'élément bouton
     */
    addButtonClickEffect(button) {
        // Empêcher les effets multiples
        if (button.classList.contains('button-click-effect')) return;
        
        button.classList.add('button-click-effect');
        
        // Créer un effet de vague
        const rect = button.getBoundingClientRect();
        this.visualEffects.createParticles(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            {
                count: 10,
                color: '#FFFFFF',
                minSpeed: 1,
                maxSpeed: 3,
                size: 3,
                life: 0.8,
                spread: 360,
                gravity: 0.2,
                fade: true
            }
        );
        
        // Ajouter une classe pour l'animation de clic
        button.classList.add('clicked');
        
        // Supprimer la classe après l'animation
        setTimeout(() => {
            button.classList.remove('button-click-effect', 'clicked');
        }, 300);
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
                    <div class="game-canvas-container">
                        <canvas id="gameCanvas"></canvas>
                        <div id="gameUI" class="game-ui">
                            <div class="score">Score: <span id="scoreDisplay">0</span></div>
                            <div id="gameInstructions" class="instructions"></div>
                        </div>
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
                margin: 1% auto;
                padding: 0;
                border-radius: 15px;
                width: 98%;
                max-width: 1200px;
                height: 98vh;
                max-height: 100%;
                display: flex;
                flex-direction: column;
                color: white;
                overflow: hidden;
                position: relative;
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
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: auto;
                padding: 10px;
            }

            .game-canvas-container {
                position: relative;
                max-width: 100%;
                max-height: 100%;
                aspect-ratio: 4/3;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            #gameCanvas {
                background-color: #000;
                display: block;
                max-width: 100%;
                max-height: 100%;
                width: auto !important;
                height: auto !important;
                object-fit: contain;
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
            soundManager.playSound('click');
            this.closeGame();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            soundManager.playSound('click');
            if (this.currentGame) {
                if (this.currentGame.isRunning) {
                    this.currentGame.stop();
                    document.getElementById('pauseBtn').textContent = '▶️';
                } else {
                    this.currentGame.start();
                    document.getElementById('pauseBtn').textContent = '⏸️';
                }
            }
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            soundManager.playSound('click');
            if (this.currentGame) {
                this.restartGame();
            }
        });

        document.getElementById('playAgainBtn').addEventListener('click', () => {
            soundManager.playSound('click');
            if (this.currentGame) {
                this.restartGame();
            }
        });
    }

    openGame(gameId, gameTitle) {
        soundManager.playSound('select');
        this.currentGameId = gameId;
        this.currentGameTitle = gameTitle;

        // Mettre à jour le titre du jeu
        document.getElementById('gameTitle').textContent = gameTitle;

        // Afficher le conteneur de jeu
        this.gameContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';

        // Redimensionner le canevas avant d'initialiser le jeu
        this.resizeGameCanvas();
        window.addEventListener('resize', this.resizeGameCanvas.bind(this));

        // Initialiser le jeu spécifique
        this.initializeGame(gameId);

        // Cacher l'écran de fin de jeu s'il est visible
        document.getElementById('gameOverScreen').classList.add('hidden');

        // Mettre à jour le bouton de pause
        document.getElementById('pauseBtn').textContent = '⏸️';
        this.isPaused = false;

        // Afficher le meilleur score
        this.updateHighScoreDisplay();
    }

    resizeGameCanvas() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;

        const container = canvas.closest('.game-canvas-container');
        if (!container) return;

        // Taille maximale disponible dans le conteneur
        const maxWidth = container.clientWidth;
        const maxHeight = container.clientHeight;

        // Calculer le ratio d'aspect du jeu (par défaut 4:3)
        const gameAspectRatio = 4 / 3;
        const containerAspectRatio = maxWidth / maxHeight;

        let width, height;

        if (containerAspectRatio > gameAspectRatio) {
            // Conteneur plus large que le jeu
            height = maxHeight;
            width = height * gameAspectRatio;
        } else {
            // Conteneur plus haut que le jeu
            width = maxWidth;
            height = width / gameAspectRatio;
        }

        // Appliquer les dimensions au canevas
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Mettre à jour la taille interne du canevas pour le rendu
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;

        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);

        // Notifier le jeu du redimensionnement si nécessaire
        if (this.currentGame && typeof this.currentGame.onResize === 'function') {
            this.currentGame.onResize(width, height);
        }
    }

    closeGame() {
        soundManager.playSound('click');
        if (this.currentGame) {
            this.currentGame.stop();
            this.currentGame = null;
        }
        this.gameContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
        window.removeEventListener('resize', this.resizeGameCanvas.bind(this));
        this.isPaused = false;
    }

    togglePause() {
        if (this.currentGame) {
            if (this.isPaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
        }
    }

    pauseGame() {
        if (this.currentGame && !this.isPaused) {
            if (this.currentGame.pause) {
                this.currentGame.pause();
            } else {
                this.currentGame.stop();
            }
            this.isPaused = true;
            this.pauseMenu.pauseGame();
        }
    }

    resumeGame() {
        if (this.currentGame && this.isPaused) {
            if (this.currentGame.resume) {
                this.currentGame.resume();
            } else if (this.currentGame.start) {
                this.currentGame.start();
            }
            this.isPaused = false;
            this.pauseMenu.resumeGame();
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
        switch (gameId) {
            case 1: // Pac-Man
                this.currentGame = new PacManGame('gameCanvas');
                this.setInstructions('🕹️ Utilisez les flèches pour vous déplacer<br>🟡 Mangez tous les points<br>👻 Évitez les fantômes');
                break;
            case 2: // Space Invaders
                this.currentGame = new SpaceInvadersGame('gameCanvas');
                this.setInstructions('⬅️➡️ Flèches pour déplacer<br>ESPACE pour tirer<br>🛸 Détruisez tous les aliens');
                break;
            case 3: // Tetris
                this.currentGame = new TetrisGame('gameCanvas');
                this.setInstructions('⬅️➡️ Flèches pour déplacer<br>⬇️ Flèche bas pour accélérer<br>⬆️ Flèche haut pour tourner');
                break;
            case 4: // Snake
                this.currentGame = new SnakeGame('gameCanvas');
                this.setInstructions('🐍 Flèches pour diriger<br>🍎 Mangez les pommes<br>❌ Évitez les murs et vous-même');
                break;
            case 5: // Pong
                this.currentGame = new PongGame('gameCanvas');
                this.setInstructions('🏓 Flèches pour bouger la raquette<br>⬆️⬇️ Premier à 5 points gagne');
                break;
            case 6: // Breakout
                this.currentGame = new BreakoutGame('gameCanvas');
                this.setInstructions('🕹️ Souris ou flèches pour bouger<br>ESPACE pour lancer la balle<br>💥 Cassez toutes les briques');
                break;
            default:
                console.error('Jeu non trouvé avec l\'ID:', gameId);
                return;
        }
        
        if (this.currentGame) {
            this.currentGame.gameManager = this;
            this.currentGame.start();
        }
    }
}

// Attendre que le DOM soit chargé avant de créer l'instance du gestionnaire de jeux
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Vérifier que toutes les dépendances sont chargées
        if (window.visualEffects && window.soundManager && window.PauseMenu) {
            window.gameManager = new GameManager();
        } else {
            console.error('Erreur: Toutes les dépendances ne sont pas chargées');
        }
    });
} else {
    // Le DOM est déjà chargé
    if (window.visualEffects && window.soundManager && window.PauseMenu) {
        window.gameManager = new GameManager();
    } else {
        console.error('Erreur: Toutes les dépendances ne sont pas chargées');
    }
}
