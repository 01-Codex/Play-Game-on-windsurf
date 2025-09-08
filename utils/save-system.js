// Système de sauvegarde de progression
class SaveSystem {
    constructor() {
        this.saveKey = 'arcade_game_saves';
        this.saves = this.loadSaves();
        this.autoSaveInterval = null;
        this.init();
    }

    init() {
        this.createSaveInterface();
        this.setupAutoSave();
    }

    loadSaves() {
        try {
            return JSON.parse(localStorage.getItem(this.saveKey) || '{}');
        } catch (e) {
            console.warn('Erreur lors du chargement des sauvegardes:', e);
            return {};
        }
    }

    savesToStorage() {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(this.saves));
        } catch (e) {
            console.warn('Erreur lors de la sauvegarde:', e);
        }
    }

    saveGame(gameId, gameState, isAutoSave = false) {
        const saveData = {
            gameId: gameId,
            gameState: gameState,
            timestamp: new Date().toISOString(),
            isAutoSave: isAutoSave,
            version: '1.0'
        };

        if (!this.saves[gameId]) {
            this.saves[gameId] = {};
        }

        if (isAutoSave) {
            this.saves[gameId].autoSave = saveData;
        } else {
            const saveSlot = `manual_${Date.now()}`;
            this.saves[gameId][saveSlot] = saveData;
        }

        this.savesToStorage();

        if (window.notifications && !isAutoSave) {
            window.notifications.success('💾 Partie sauvegardée!');
        }

        return saveData;
    }

    loadGame(gameId, saveSlot = 'autoSave') {
        if (!this.saves[gameId] || !this.saves[gameId][saveSlot]) {
            return null;
        }

        const saveData = this.saves[gameId][saveSlot];
        
        if (window.notifications) {
            window.notifications.info('📂 Partie chargée!');
        }

        return saveData.gameState;
    }

    getSaves(gameId) {
        return this.saves[gameId] || {};
    }

    deleteSave(gameId, saveSlot) {
        if (this.saves[gameId] && this.saves[gameId][saveSlot]) {
            delete this.saves[gameId][saveSlot];
            this.savesToStorage();
            
            if (window.notifications) {
                window.notifications.info('🗑️ Sauvegarde supprimée');
            }
        }
    }

    setupAutoSave() {
        // Auto-sauvegarde toutes les 60 secondes (optimisé)
        this.autoSaveInterval = setInterval(() => {
            if (window.gameManager && window.gameManager.currentGame && !window.gameManager.currentGame.gameOver) {
                this.autoSaveCurrentGame();
            }
        }, 60000);
    }

    autoSaveCurrentGame() {
        const gameManager = window.gameManager;
        if (!gameManager || !gameManager.currentGame || !gameManager.currentGameId) return;

        const gameState = this.extractGameState(gameManager.currentGame);
        if (gameState) {
            this.saveGame(gameManager.currentGameId, gameState, true);
        }
    }

    extractGameState(game) {
        // Extraire l'état du jeu de manière générique
        const state = {
            score: game.score || 0,
            level: game.level || 1,
            lives: game.lives || 3,
            gameTime: game.gameTime || 0,
            gameSpecificData: {}
        };

        // Données spécifiques par jeu
        if (game.constructor.name === 'SpaceInvadersGame') {
            state.gameSpecificData = {
                player: game.player,
                enemies: game.enemies,
                bullets: game.bullets,
                enemyBullets: game.enemyBullets,
                barriers: game.barriers
            };
        } else if (game.constructor.name === 'SnakeGame') {
            state.gameSpecificData = {
                snake: game.snake,
                food: game.food,
                direction: game.direction
            };
        } else if (game.constructor.name === 'BreakoutGame') {
            state.gameSpecificData = {
                paddle: game.paddle,
                ball: game.ball,
                bricks: game.bricks
            };
        }

        return state;
    }

    restoreGameState(game, state) {
        if (!state) return false;

        // Restaurer l'état général
        game.score = state.score || 0;
        game.level = state.level || 1;
        game.lives = state.lives || 3;
        game.gameTime = state.gameTime || 0;

        // Restaurer les données spécifiques
        if (state.gameSpecificData) {
            const data = state.gameSpecificData;
            
            if (game.constructor.name === 'SpaceInvadersGame' && data.player) {
                game.player = data.player;
                game.enemies = data.enemies || [];
                game.bullets = data.bullets || [];
                game.enemyBullets = data.enemyBullets || [];
                game.barriers = data.barriers || [];
            } else if (game.constructor.name === 'SnakeGame' && data.snake) {
                game.snake = data.snake;
                game.food = data.food;
                game.direction = data.direction;
            } else if (game.constructor.name === 'BreakoutGame' && data.paddle) {
                game.paddle = data.paddle;
                game.ball = data.ball;
                game.bricks = data.bricks || [];
            }
        }

        return true;
    }

    createSaveInterface() {
        // Bouton de sauvegarde dans l'interface de jeu
        const saveButton = document.createElement('button');
        saveButton.id = 'save-game-btn';
        saveButton.innerHTML = '💾';
        saveButton.title = 'Sauvegarder la partie';
        saveButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 200px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            display: none;
        `;

        document.body.appendChild(saveButton);

        saveButton.addEventListener('click', () => {
            if (window.gameManager && window.gameManager.currentGame) {
                this.showSaveDialog();
            }
        });

        // Afficher le bouton quand un jeu est actif
        document.addEventListener('gameStarted', () => {
            saveButton.style.display = 'block';
        });

        document.addEventListener('gameClosed', () => {
            saveButton.style.display = 'none';
        });
    }

    showSaveDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'save-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        const gameId = window.gameManager.currentGameId;
        const saves = this.getSaves(gameId);

        dialog.innerHTML = `
            <div style="background: var(--surface-color); padding: 2rem; border-radius: 15px; 
                        max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--text-color); margin: 0;">💾 Sauvegardes</h3>
                    <button onclick="document.getElementById('save-dialog').remove()" 
                            style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color);">×</button>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <button onclick="window.saveSystem.saveCurrentGame()" 
                            style="width: 100%; padding: 1rem; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); 
                                   color: white; border: none; border-radius: 10px; font-size: 1rem; cursor: pointer; margin-bottom: 1rem;">
                        💾 Nouvelle Sauvegarde
                    </button>
                    
                    ${saves.autoSave ? `
                        <div style="background: var(--border-color); padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: bold; color: var(--text-color);">🔄 Sauvegarde Auto</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">
                                        ${new Date(saves.autoSave.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                <button onclick="window.saveSystem.loadGameFromDialog('${gameId}', 'autoSave')" 
                                        style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; 
                                               border: none; border-radius: 5px; cursor: pointer;">
                                    📂 Charger
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div>
                    <h4 style="color: var(--text-color); margin-bottom: 1rem;">Sauvegardes Manuelles</h4>
                    ${Object.entries(saves).filter(([key]) => key !== 'autoSave').map(([key, save]) => `
                        <div style="background: var(--border-color); padding: 1rem; border-radius: 10px; margin-bottom: 0.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: bold; color: var(--text-color);">
                                        💾 ${new Date(save.timestamp).toLocaleDateString()}
                                    </div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">
                                        Score: ${save.gameState.score || 0} | Niveau: ${save.gameState.level || 1}
                                    </div>
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <button onclick="window.saveSystem.loadGameFromDialog('${gameId}', '${key}')" 
                                            style="padding: 0.5rem; background: var(--primary-color); color: white; 
                                                   border: none; border-radius: 5px; cursor: pointer;">📂</button>
                                    <button onclick="window.saveSystem.deleteGameFromDialog('${gameId}', '${key}')" 
                                            style="padding: 0.5rem; background: #e74c3c; color: white; 
                                                   border: none; border-radius: 5px; cursor: pointer;">🗑️</button>
                                </div>
                            </div>
                        </div>
                    `).join('') || '<p style="color: var(--text-secondary); text-align: center;">Aucune sauvegarde manuelle</p>'}
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
    }

    saveCurrentGame() {
        if (window.gameManager && window.gameManager.currentGame) {
            const gameState = this.extractGameState(window.gameManager.currentGame);
            this.saveGame(window.gameManager.currentGameId, gameState, false);
            document.getElementById('save-dialog').remove();
        }
    }

    loadGameFromDialog(gameId, saveSlot) {
        const gameState = this.loadGame(gameId, saveSlot);
        if (gameState && window.gameManager && window.gameManager.currentGame) {
            this.restoreGameState(window.gameManager.currentGame, gameState);
            window.gameManager.updateScore(gameState.score || 0);
        }
        document.getElementById('save-dialog').remove();
    }

    deleteGameFromDialog(gameId, saveSlot) {
        this.deleteSave(gameId, saveSlot);
        // Rafraîchir la dialog
        document.getElementById('save-dialog').remove();
        this.showSaveDialog();
    }

    // Méthode pour exporter les sauvegardes
    exportSaves() {
        const data = {
            saves: this.saves,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `arcade_saves_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        if (window.notifications) {
            window.notifications.success('📤 Sauvegardes exportées!');
        }
    }

    // Méthode pour importer les sauvegardes
    importSaves(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.saves) {
                    this.saves = { ...this.saves, ...data.saves };
                    this.savesToStorage();
                    
                    if (window.notifications) {
                        window.notifications.success('📥 Sauvegardes importées!');
                    }
                }
            } catch (error) {
                if (window.notifications) {
                    window.notifications.error('❌ Erreur lors de l\'importation');
                }
            }
        };
        reader.readAsText(file);
    }
}

// Instance globale
window.saveSystem = new SaveSystem();
