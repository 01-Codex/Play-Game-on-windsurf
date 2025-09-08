// Gestionnaire du menu pause
window.PauseMenu = class PauseMenu {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.isVisible = false;
        this.menuElement = null;
        this.init();
    }

    init() {
        // Créer l'élément du menu pause
        this.menuElement = document.createElement('div');
        this.menuElement.className = 'pause-menu';
        this.menuElement.innerHTML = `
            <div class="pause-menu-content">
                <h2>PAUSE</h2>
                <div class="pause-menu-buttons">
                    <button id="resumeBtn" class="pause-menu-btn pulse">
                        <i class="fas fa-play"></i> Reprendre
                    </button>
                    <button id="restartBtn" class="pause-menu-btn secondary">
                        <i class="fas fa-redo"></i> Recommencer
                    </button>
                    <button id="soundBtn" class="pause-menu-btn secondary">
                        <i class="fas fa-volume-up"></i> Son: Activé
                    </button>
                    <button id="exitBtn" class="pause-menu-btn danger">
                        <i class="fas fa-sign-out-alt"></i> Quitter
                    </button>
                </div>
            </div>
        `;

        // Ajouter au body
        document.body.appendChild(this.menuElement);

        // Initialiser les événements
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Bouton Reprendre
        this.menuElement.querySelector('#resumeBtn').addEventListener('click', () => this.resumeGame());
        
        // Bouton Recommencer
        this.menuElement.querySelector('#restartBtn').addEventListener('click', () => this.restartGame());
        
        // Bouton Son
        this.menuElement.querySelector('#soundBtn').addEventListener('click', () => this.toggleSound());
        
        // Bouton Quitter
        this.menuElement.querySelector('#exitBtn').addEventListener('click', () => this.exitToMenu());
        
        // Touche Échap pour mettre en pause/reprendre
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isVisible) {
                    this.resumeGame();
                } else if (this.gameManager.currentGame && this.gameManager.currentGame.isRunning) {
                    this.pauseGame();
                }
            }
        });
    }

    pauseGame() {
        if (!this.isVisible && this.gameManager.currentGame) {
            // Mettre le jeu en pause
            if (this.gameManager.currentGame.pause) {
                this.gameManager.currentGame.pause();
            } else {
                this.gameManager.currentGame.stop();
            }
            
            // Mettre à jour l'interface
            this.isVisible = true;
            this.menuElement.classList.add('visible');
            document.getElementById('pauseBtn').textContent = '▶️';
            
            // Mettre à jour le bouton de son
            this.updateSoundButton();
            
            // Jouer le son de pause
            if (window.soundManager) {
                window.soundManager.playSound('click');
            }
        }
    }

    resumeGame() {
        if (this.isVisible) {
            // Reprendre le jeu
            if (this.gameManager.currentGame.resume) {
                this.gameManager.currentGame.resume();
            } else if (this.gameManager.currentGame.start) {
                this.gameManager.currentGame.start();
            }
            
            // Mettre à jour l'interface
            this.isVisible = false;
            this.menuElement.classList.remove('visible');
            document.getElementById('pauseBtn').textContent = '⏸️';
            
            // Jouer le son de reprise
            if (window.soundManager) {
                window.soundManager.playSound('click');
                window.soundManager.playMusic();
            }
        }
    }

    restartGame() {
        if (window.soundManager) {
            window.soundManager.playSound('click');
        }
        
        // Cacher le menu pause
        this.isVisible = false;
        this.menuElement.classList.remove('visible');
        
        // Redémarrer le jeu
        if (this.gameManager.restartGame) {
            this.gameManager.restartGame();
        } else if (this.gameManager.currentGame && this.gameManager.currentGame.reset) {
            this.gameManager.currentGame.reset();
            this.gameManager.currentGame.start();
        }
        
        // Mettre à jour le bouton de pause
        document.getElementById('pauseBtn').textContent = '⏸️';
        
        // Reprendre la musique
        if (window.soundManager) {
            window.soundManager.playMusic();
        }
    }

    toggleSound() {
        if (window.soundManager) {
            const isMuted = window.soundManager.toggleMute();
            this.updateSoundButton(isMuted);
            window.soundManager.playSound('click');
        }
    }

    updateSoundButton() {
        const soundBtn = this.menuElement.querySelector('#soundBtn');
        if (window.soundManager) {
            const icon = soundBtn.querySelector('i');
            if (window.soundManager.isMuted) {
                soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i> Son: Désactivé';
            } else {
                soundBtn.innerHTML = '<i class="fas fa-volume-up"></i> Son: Activé';
            }
        }
    }

    exitToMenu() {
        if (window.soundManager) {
            window.soundManager.playSound('click');
        }
        
        // Cacher le menu pause
        this.isVisible = false;
        this.menuElement.classList.remove('visible');
        
        // Retourner au menu principal
        if (this.gameManager.closeGame) {
            this.gameManager.closeGame();
        }
    }
}

// L'export n'est plus nécessaire car la classe est disponible globalement
