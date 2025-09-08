// Système de multijoueur local
class MultiplayerSystem {
    constructor() {
        this.isMultiplayerMode = false;
        this.players = [];
        this.currentTurn = 0;
        this.gameMode = 'versus'; // 'versus', 'coop', 'turns'
        this.scores = {};
        this.multiplayerGames = ['pong', 'street-fighter', 'breakout', 'asteroids'];
        this.init();
    }

    init() {
        this.createMultiplayerInterface();
        this.setupEventListeners();
        this.setupPlayerControls();
    }

    createMultiplayerInterface() {
        // Bouton multijoueur
        const multiplayerButton = document.createElement('button');
        multiplayerButton.id = 'multiplayer-toggle';
        multiplayerButton.innerHTML = '👥';
        multiplayerButton.title = 'Mode multijoueur';
        multiplayerButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 500px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);
        `;

        document.body.appendChild(multiplayerButton);
        multiplayerButton.addEventListener('click', () => this.showMultiplayerDialog());
    }

    setupPlayerControls() {
        this.playerControls = {
            player1: {
                up: 'KeyW',
                down: 'KeyS',
                left: 'KeyA',
                right: 'KeyD',
                action1: 'Space',
                action2: 'KeyF'
            },
            player2: {
                up: 'ArrowUp',
                down: 'ArrowDown',
                left: 'ArrowLeft',
                right: 'ArrowRight',
                action1: 'Enter',
                action2: 'ShiftRight'
            }
        };
    }

    showMultiplayerDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'multiplayer-dialog';
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

        dialog.innerHTML = `
            <div style="background: var(--surface-color); padding: 2rem; border-radius: 15px; 
                        max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--text-color); margin: 0;">👥 Mode Multijoueur Local</h3>
                    <button onclick="document.getElementById('multiplayer-dialog').remove()" 
                            style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color);">×</button>
                </div>
                
                <div style="margin-bottom: 2rem;">
                    <h4 style="color: var(--text-color); margin-bottom: 1rem;">🎮 Configuration des Joueurs</h4>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem;">
                        <div style="background: var(--border-color); padding: 1.5rem; border-radius: 10px;">
                            <h5 style="color: var(--primary-color); margin: 0 0 1rem 0;">🔵 Joueur 1</h5>
                            <div style="margin-bottom: 1rem;">
                                <input type="text" id="player1-name" placeholder="Nom du joueur 1" value="Joueur 1"
                                       style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); 
                                              border-radius: 8px; background: var(--surface-color); color: var(--text-color);">
                            </div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">
                                <div><strong>Contrôles:</strong></div>
                                <div>↑ W | ↓ S | ← A | → D</div>
                                <div>Action: ESPACE | Action 2: F</div>
                            </div>
                        </div>
                        
                        <div style="background: var(--border-color); padding: 1.5rem; border-radius: 10px;">
                            <h5 style="color: #e74c3c; margin: 0 0 1rem 0;">🔴 Joueur 2</h5>
                            <div style="margin-bottom: 1rem;">
                                <input type="text" id="player2-name" placeholder="Nom du joueur 2" value="Joueur 2"
                                       style="width: 100%; padding: 0.5rem; border: 1px solid var(--border-color); 
                                              border-radius: 8px; background: var(--surface-color); color: var(--text-color);">
                            </div>
                            <div style="font-size: 0.9rem; color: var(--text-secondary);">
                                <div><strong>Contrôles:</strong></div>
                                <div>↑ ↑ | ↓ ↓ | ← ← | → →</div>
                                <div>Action: ENTRÉE | Action 2: SHIFT</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--text-color); margin-bottom: 1rem;">🎯 Mode de Jeu</h4>
                        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-color); cursor: pointer;">
                                <input type="radio" name="gameMode" value="versus" checked onchange="window.multiplayerSystem.setGameMode('versus')">
                                ⚔️ Versus (Compétitif)
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-color); cursor: pointer;">
                                <input type="radio" name="gameMode" value="coop" onchange="window.multiplayerSystem.setGameMode('coop')">
                                🤝 Coopératif
                            </label>
                            <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-color); cursor: pointer;">
                                <input type="radio" name="gameMode" value="turns" onchange="window.multiplayerSystem.setGameMode('turns')">
                                🔄 Tour par tour
                            </label>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 2rem;">
                        <h4 style="color: var(--text-color); margin-bottom: 1rem;">🎮 Jeux Compatibles</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                            ${this.renderCompatibleGames()}
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="window.multiplayerSystem.startMultiplayer()" 
                                style="padding: 1rem 2rem; background: var(--primary-color); color: white; 
                                       border: none; border-radius: 10px; cursor: pointer; font-size: 1rem;">
                            🚀 Démarrer le Multijoueur
                        </button>
                        <button onclick="window.multiplayerSystem.stopMultiplayer()" 
                                style="padding: 1rem 2rem; background: #e74c3c; color: white; 
                                       border: none; border-radius: 10px; cursor: pointer; font-size: 1rem;">
                            🛑 Mode Solo
                        </button>
                    </div>
                </div>
                
                ${this.isMultiplayerMode ? this.renderMultiplayerStatus() : ''}
            </div>
        `;

        document.body.appendChild(dialog);
    }

    renderCompatibleGames() {
        const gameNames = {
            'pong': '🏓 Pong',
            'street-fighter': '👊 Street Fighter',
            'breakout': '🧱 Breakout',
            'asteroids': '🚀 Asteroids'
        };

        return this.multiplayerGames.map(gameId => `
            <div style="background: var(--surface-color); padding: 1rem; border-radius: 8px; text-align: center; 
                        border: 2px solid var(--border-color); cursor: pointer; transition: all 0.3s ease;"
                 onclick="window.multiplayerSystem.startMultiplayerGame('${gameId}')"
                 onmouseover="this.style.borderColor='var(--primary-color)'"
                 onmouseout="this.style.borderColor='var(--border-color)'">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">${gameNames[gameId]?.split(' ')[0] || '🎮'}</div>
                <div style="color: var(--text-color); font-weight: bold;">${gameNames[gameId]?.substring(2) || gameId}</div>
                <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">
                    ${this.getGameModeDescription(gameId)}
                </div>
            </div>
        `).join('');
    }

    getGameModeDescription(gameId) {
        const descriptions = {
            'pong': '2 joueurs face à face',
            'street-fighter': 'Combat 1v1',
            'breakout': 'Score le plus élevé',
            'asteroids': 'Survie coopérative'
        };
        return descriptions[gameId] || 'Multijoueur supporté';
    }

    renderMultiplayerStatus() {
        if (!this.isMultiplayerMode) return '';

        return `
            <div style="margin-top: 2rem; padding: 1.5rem; background: var(--border-color); border-radius: 10px;">
                <h4 style="color: var(--primary-color); margin: 0 0 1rem 0;">🎮 Session Multijoueur Active</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 1rem;">
                    ${this.players.map((player, index) => `
                        <div style="text-align: center;">
                            <div style="color: ${index === 0 ? 'var(--primary-color)' : '#e74c3c'}; font-size: 1.2rem; font-weight: bold;">
                                ${index === 0 ? '🔵' : '🔴'} ${player.name}
                            </div>
                            <div style="color: var(--text-color); font-size: 1.5rem; margin: 0.5rem 0;">
                                Score: ${this.scores[player.id] || 0}
                            </div>
                            ${this.gameMode === 'turns' && this.currentTurn === index ? 
                                '<div style="color: var(--primary-color); font-weight: bold;">🎯 À son tour</div>' : ''}
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; color: var(--text-secondary);">
                    Mode: ${this.getGameModeLabel()} | 
                    ${this.gameMode === 'turns' ? `Tour ${Math.floor(Object.values(this.scores).reduce((a, b) => a + b, 0) / this.players.length) + 1}` : 'Temps réel'}
                </div>
            </div>
        `;
    }

    getGameModeLabel() {
        const labels = {
            'versus': '⚔️ Versus',
            'coop': '🤝 Coopératif',
            'turns': '🔄 Tour par tour'
        };
        return labels[this.gameMode] || this.gameMode;
    }

    setGameMode(mode) {
        this.gameMode = mode;
    }

    startMultiplayer() {
        const player1Name = document.getElementById('player1-name')?.value || 'Joueur 1';
        const player2Name = document.getElementById('player2-name')?.value || 'Joueur 2';

        this.players = [
            { id: 'player1', name: player1Name, controls: this.playerControls.player1 },
            { id: 'player2', name: player2Name, controls: this.playerControls.player2 }
        ];

        this.scores = {
            player1: 0,
            player2: 0
        };

        this.isMultiplayerMode = true;
        this.currentTurn = 0;

        // Fermer le dialog
        document.getElementById('multiplayer-dialog')?.remove();

        // Mettre à jour l'interface
        this.updateMultiplayerUI();

        if (window.notifications) {
            window.notifications.success(`👥 Mode multijoueur activé: ${player1Name} vs ${player2Name}`);
        }
    }

    stopMultiplayer() {
        this.isMultiplayerMode = false;
        this.players = [];
        this.scores = {};
        this.currentTurn = 0;

        // Fermer le dialog
        document.getElementById('multiplayer-dialog')?.remove();

        // Mettre à jour l'interface
        this.updateMultiplayerUI();

        if (window.notifications) {
            window.notifications.info('👤 Retour au mode solo');
        }
    }

    startMultiplayerGame(gameId) {
        if (!this.isMultiplayerMode) {
            this.startMultiplayer();
        }

        // Fermer le dialog
        document.getElementById('multiplayer-dialog')?.remove();

        // Démarrer le jeu
        setTimeout(() => {
            if (window.gameManager) {
                window.gameManager.startGame(gameId);
            }
        }, 500);
    }

    updateMultiplayerUI() {
        // Mettre à jour le bouton multijoueur
        const button = document.getElementById('multiplayer-toggle');
        if (button) {
            if (this.isMultiplayerMode) {
                button.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
                button.innerHTML = '👥✓';
                button.title = 'Mode multijoueur actif';
            } else {
                button.style.background = 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)';
                button.innerHTML = '👥';
                button.title = 'Mode multijoueur';
            }
        }

        // Ajouter l'affichage des scores en jeu si nécessaire
        this.updateInGameUI();
    }

    updateInGameUI() {
        if (!this.isMultiplayerMode || !window.gameManager?.currentGame) return;

        let multiplayerUI = document.getElementById('multiplayer-ui');
        if (!multiplayerUI) {
            multiplayerUI = document.createElement('div');
            multiplayerUI.id = 'multiplayer-ui';
            multiplayerUI.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 1rem;
                border-radius: 10px;
                font-family: 'Courier New', monospace;
                font-size: 0.9rem;
                z-index: 100;
            `;
            document.getElementById('gameUI')?.appendChild(multiplayerUI);
        }

        multiplayerUI.innerHTML = `
            <div style="text-align: center; margin-bottom: 0.5rem; font-weight: bold;">
                ${this.getGameModeLabel()}
            </div>
            ${this.players.map((player, index) => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem; 
                           color: ${index === 0 ? '#3498db' : '#e74c3c'};">
                    <span>${index === 0 ? '🔵' : '🔴'} ${player.name}:</span>
                    <span>${this.scores[player.id] || 0}</span>
                    ${this.gameMode === 'turns' && this.currentTurn === index ? ' 🎯' : ''}
                </div>
            `).join('')}
        `;
    }

    initializeMultiplayerGame(gameId) {
        if (!gameId) {
            console.warn('ID de jeu manquant pour l\'initialisation multijoueur');
            return;
        }
        
        // Initialiser les scores
        this.scores = {
            player1: 0,
            player2: 0
        };
        
        // Créer l'interface multijoueur
        this.createGameUI();
        
        // Configurer les contrôles spécifiques au jeu
        this.configureGameControls(gameId);
        
        if (window.notifications) {
            window.notifications.info(`👥 Mode multijoueur activé - ${this.gameMode}`);
        }
    }

    updateTurnIndicator() {
        const indicator = document.getElementById('turn-indicator');
        if (indicator) {
            const currentPlayer = this.getCurrentPlayer();
            const playerName = currentPlayer === 'player1' ? 'Joueur 1' : 'Joueur 2';
            indicator.textContent = `Tour: ${playerName}`;
        }
    }

    updateScoreDisplay() {
        const scoreDisplay = document.getElementById('multiplayer-scores');
        if (scoreDisplay && this.scores) {
            scoreDisplay.innerHTML = `
                <div>Joueur 1: ${this.scores.player1 || 0}</div>
                <div>Joueur 2: ${this.scores.player2 || 0}</div>
            `;
        }
    }

    handleInput(event, playerId = null) {
        if (!this.isMultiplayerMode) return false;

        // Déterminer quel joueur a effectué l'input
        if (!playerId) {
            playerId = this.getPlayerFromInput(event.code);
        }

        if (!playerId) return false;

        // En mode tour par tour, vérifier si c'est le bon joueur
        if (this.gameMode === 'turns') {
            const playerIndex = this.players.findIndex(p => p.id === playerId);
            if (playerIndex !== this.currentTurn) {
                return false; // Pas le tour de ce joueur
            }
        }

        return true; // Input autorisé
    }

    getPlayerFromInput(keyCode) {
        for (const player of this.players) {
            const controls = player.controls;
            if (Object.values(controls).includes(keyCode)) {
                return player.id;
            }
        }
        return null;
    }

    handleGameEnd(gameData) {
        if (!gameData) {
            console.warn('Données de fin de jeu manquantes en multijoueur');
            return;
        }
        
        // Mettre à jour les scores finaux
        if (gameData.score) {
            const currentPlayer = this.getCurrentPlayer();
            if (currentPlayer && this.scores.hasOwnProperty(currentPlayer)) {
                this.scores[currentPlayer] = gameData.score;
            }
        }
        
        // Afficher les résultats
        this.showGameResults();
        
        // Passer au joueur suivant en mode tour par tour
        if (this.gameMode === 'turns') {
            this.nextTurn();
        }
    }

    nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % 2;
        this.updateTurnIndicator();
        
        if (window.notifications) {
            const currentPlayer = this.getCurrentPlayer();
            const playerName = currentPlayer === 'player1' ? 'Joueur 1' : 'Joueur 2';
            window.notifications.info(`🎯 Tour du ${playerName}`);
        }
    }

    getWinner() {
        if (!this.isMultiplayerMode) return null;

        const scores = Object.entries(this.scores);
        if (scores.length === 0) return null;

        const maxScore = Math.max(...scores.map(([_, score]) => score));
        const winners = scores.filter(([_, score]) => score === maxScore);

        if (winners.length === 1) {
            const winnerId = winners[0][0];
            const winner = this.players.find(p => p.id === winnerId);
            return winner;
        }

        return null; // Égalité
    }

    endMultiplayerGame() {
        if (!this.isMultiplayerMode) return;

        const winner = this.getWinner();
        
        setTimeout(() => {
            if (winner) {
                if (window.notifications) {
                    window.notifications.success(`🏆 ${winner.name} remporte la partie!`);
                }
            } else {
                if (window.notifications) {
                    window.notifications.info('🤝 Égalité parfaite!');
                }
            }

            // Réinitialiser les scores pour la prochaine partie
            Object.keys(this.scores).forEach(key => {
                this.scores[key] = 0;
            });
            this.currentTurn = 0;
        }, 1000);
    }

    setupEventListeners() {
        // Écouter les événements de jeu
        document.addEventListener('gameStarted', (e) => {
            if (this.isMultiplayerMode && e.detail) {
                this.initializeMultiplayerGame(e.detail.gameId);
            }
        });

        document.addEventListener('gameEnded', (e) => {
            if (this.isMultiplayerMode && e.detail) {
                this.handleGameEnd(e.detail);
            }
        });

        // Bouton multijoueur
        const multiplayerBtn = document.getElementById('multiplayerBtn');
        if (multiplayerBtn) {
            multiplayerBtn.addEventListener('click', () => {
                this.showMultiplayerDialog();
            });
        }
    }
}

// Instance globale
window.multiplayerSystem = new MultiplayerSystem();
