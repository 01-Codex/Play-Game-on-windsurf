// Système de replay et enregistrement des parties
class ReplaySystem {
    constructor() {
        this.isRecording = false;
        this.isReplaying = false;
        this.currentRecording = null;
        this.recordings = this.loadRecordings();
        this.replayData = null;
        this.replayIndex = 0;
        this.replaySpeed = 1;
        this.init();
    }

    init() {
        this.createReplayInterface();
        this.setupEventListeners();
    }

    loadRecordings() {
        try {
            const saved = localStorage.getItem('arcade_replays');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveRecordings() {
        try {
            // Garder seulement les 50 derniers replays pour éviter de surcharger le localStorage
            const limited = this.recordings.slice(-50);
            localStorage.setItem('arcade_replays', JSON.stringify(limited));
            this.recordings = limited;
        } catch (e) {
            console.warn('Impossible de sauvegarder les replays:', e);
        }
    }

    startRecording(gameId, gameName) {
        if (this.isReplaying || !gameId) {
            console.warn('Impossible de démarrer l\'enregistrement');
            return;
        }
        
        this.isRecording = true;
        this.currentRecording = {
            id: Date.now(),
            gameId: gameId,
            gameName: gameName || 'Jeu inconnu',
            startTime: Date.now(),
            duration: 0,
            inputs: [],
            gameStates: [],
            finalScore: 0,
            won: false
        };
        
        console.log(' Enregistrement démarré pour:', gameName);
        
        if (window.notifications) {
            window.notifications.info(' Enregistrement de la partie démarré');
        }
    }

    stopRecording(gameEndData) {
        if (!this.isRecording || !this.currentRecording) {
            console.warn('Aucun enregistrement en cours à arrêter');
            return;
        }
        
        if (!gameEndData) {
            console.warn('Données de fin de jeu manquantes');
            gameEndData = { score: 0, won: false };
        }
        
        this.currentRecording.duration = Date.now() - this.currentRecording.startTime;
        this.currentRecording.finalScore = gameEndData.score || 0;
        this.currentRecording.won = gameEndData.won || false;
        
        // Ajouter l'enregistrement à la liste
        this.recordings.push(this.currentRecording);
        this.saveRecordings();
        
        console.log(' Enregistrement terminé:', this.currentRecording.gameName);
        
        if (window.notifications) {
            window.notifications.success(` Partie enregistrée: ${this.formatDuration(this.currentRecording.duration)}`);
        }
        
        this.isRecording = false;
        this.currentRecording = null;
    }

    recordInput(type, data, timestamp = Date.now()) {
        if (!this.isRecording || !this.currentRecording) return;
        
        this.currentRecording.inputs.push({
            type: type, 
            data: data, 
            timestamp: timestamp - this.currentRecording.startTime
        });
    }

    recordGameState(state, timestamp = Date.now()) {
        if (!this.isRecording || !this.currentRecording) return;

        // Enregistrer l'état du jeu à intervalles réguliers
        this.currentRecording.gameStates.push({
            state: JSON.parse(JSON.stringify(state)), 
            timestamp: timestamp - this.currentRecording.startTime
        });
    }

    playReplay(replayId) {
        const replay = this.recordings.find(r => r.id === replayId);
        if (!replay) {
            console.error('Replay non trouvé:', replayId);
            if (window.notifications) {
                window.notifications.error('Replay introuvable');
            }
            return;
        }
        
        this.isReplaying = true;
        this.replayData = replay;
        this.replayIndex = 0;
        
        // Fermer la modale de replay
        const replayModal = document.getElementById('replayModal');
        if (replayModal) {
            replayModal.style.display = 'none';
        }
        
        // Démarrer le jeu en mode replay
        if (window.gameManager && typeof window.gameManager.startGame === 'function') {
            window.gameManager.startGame(replay.gameId, true);
        } else {
            console.error('GameManager non disponible');
            this.isReplaying = false;
            return;
        }
        
        // Commencer la lecture des inputs
        this.startReplayPlayback();
        
        if (window.notifications) {
            window.notifications.info(` Lecture du replay: ${replay.gameName}`);
        }
    }

    deleteReplay(replayId) {
        if (!replayId) {
            console.warn('ID de replay manquant pour la suppression');
            return;
        }
        
        const initialLength = this.recordings.length;
        this.recordings = this.recordings.filter(r => r.id !== replayId);
        
        if (this.recordings.length < initialLength) {
            this.saveRecordings();
            this.updateReplayList();
            
            if (window.notifications) {
                window.notifications.info(' Replay supprimé');
            }
        } else {
            console.warn('Replay non trouvé pour suppression:', replayId);
        }
    }

    getNextReplayInput() {
        if (!this.isReplaying || !this.replayData) return null;

        const currentTime = (Date.now() - this.replayStartTime) * this.replaySpeed;
        const inputs = this.replayData.inputs;

        while (this.replayIndex < inputs.length) {
            const input = inputs[this.replayIndex];
            if (input.timestamp <= currentTime) {
                this.replayIndex++;
                return input;
            } else {
                break;
            }
        }

        // Vérifier si le replay est terminé
        if (this.replayIndex >= inputs.length) {
            setTimeout(() => this.stopReplay(), 1000);
        }

        return null;
    }

    createReplayInterface() {
        // Bouton principal de replay
        const replayButton = document.createElement('button');
        replayButton.id = 'replay-toggle';
        replayButton.innerHTML = '';
        replayButton.title = 'Replays et enregistrements';
        replayButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 380px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
        `;

        document.body.appendChild(replayButton);
        replayButton.addEventListener('click', () => this.showReplayModal());

        // Bouton d'enregistrement dans les contrôles de jeu
        this.addRecordingButton();
    }

    addRecordingButton() {
        // Ajouter le bouton d'enregistrement aux contrôles de jeu
        const style = document.createElement('style');
        style.textContent = `
            .recording-btn {
                background: #e74c3c;
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-left: 10px;
            }
            .recording-btn:hover {
                background: #c0392b;
                transform: scale(1.1);
            }
            .recording-btn.recording {
                animation: pulse 1s infinite;
                background: #e74c3c;
            }
            @keyframes pulse {
                0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
                70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
                100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
            }
        `;
        document.head.appendChild(style);
    }

    updateRecordingButton() {
        const btn = document.getElementById('recordBtn');
        if (btn) {
            if (this.isRecording) {
                btn.innerHTML = '';
                btn.title = 'Arrêter l\'enregistrement';
                btn.classList.add('recording');
            } else {
                btn.innerHTML = '';
                btn.title = 'Démarrer l\'enregistrement';
                btn.classList.remove('recording');
            }
        }
    }

    updateReplayControls() {
        const controls = document.getElementById('replay-controls');
        if (controls) {
            controls.style.display = this.isReplaying ? 'flex' : 'none';
        }
    }

    showReplayModal() {
        const modal = document.createElement('div');
        modal.id = 'replayModal';
        modal.style.cssText = `
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

        modal.innerHTML = `
            <div style="background: var(--surface-color); padding: 2rem; border-radius: 15px; 
                        max-width: 900px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--text-color); margin: 0;"> Replays Sauvegardés</h3>
                    <button onclick="document.getElementById('replayModal').remove()" 
                            style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color);">×</button>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                        <button onclick="window.replaySystem.deleteAllReplays()" 
                                style="padding: 0.5rem 1rem; background: #e74c3c; color: white; 
                                       border: none; border-radius: 8px; cursor: pointer;">
                            Tout supprimer
                        </button>
                        <button onclick="window.replaySystem.exportReplays()" 
                                style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; 
                                       border: none; border-radius: 8px; cursor: pointer;">
                            Exporter
                        </button>
                        <span style="color: var(--text-secondary); font-size: 0.9rem;">
                            ${this.recordings.length} replays sauvegardés
                        </span>
                    </div>
                </div>
                
                <div id="replays-list">
                    ${this.renderReplaysList()}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    renderReplaysList() {
        if (this.recordings.length === 0) {
            return `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;"></div>
                    <p>Aucun replay sauvegardé</p>
                    <p style="font-size: 0.9rem;">Lancez un jeu et cliquez sur  pour commencer à enregistrer!</p>
                </div>
            `;
        }

        return this.recordings
            .sort((a, b) => b.startTime - a.startTime)
            .map(replay => `
                <div style="background: var(--border-color); padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <div>
                            <h4 style="color: var(--text-color); margin: 0 0 0.25rem 0;">${replay.gameName}</h4>
                            <div style="color: var(--text-secondary); font-size: 0.9rem;">
                                ${new Date(replay.startTime).toLocaleString('fr-FR')} • 
                                ${this.formatDuration(replay.duration)} • 
                                Score: ${replay.finalScore?.toLocaleString() || 'N/A'} •
                                ${replay.won ? ' Victoire' : ' Défaite'}
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="window.replaySystem.playReplay(${replay.id})" 
                                    style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; 
                                           border: none; border-radius: 8px; cursor: pointer;">
                                Lire
                            </button>
                            <button onclick="window.replaySystem.deleteReplay(${replay.id})" 
                                    style="padding: 0.5rem 1rem; background: #e74c3c; color: white; 
                                           border: none; border-radius: 8px; cursor: pointer;">
                                
                            </button>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; font-size: 0.8rem;">
                        <div>
                            <div style="color: var(--text-secondary);">Inputs</div>
                            <div style="color: var(--text-color);">${replay.inputs?.length || 0}</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary);">États</div>
                            <div style="color: var(--text-color);">${replay.gameStates?.length || 0}</div>
                        </div>
                        <div>
                            <div style="color: var(--text-secondary);">Taille</div>
                            <div style="color: var(--text-color);">${this.formatFileSize(JSON.stringify(replay).length)}</div>
                        </div>
                    </div>
                </div>
            `).join('');
    }

    exportReplay(replayId) {
        const replay = this.recordings.find(r => r.id === replayId);
        if (!replay) {
            console.warn('Replay non trouvé pour export:', replayId);
            return;
        }
        
        try {
            const dataStr = JSON.stringify(replay, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `replay_${replay.gameName}_${new Date(replay.startTime).toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            if (window.notifications) {
                window.notifications.success(' Replay exporté');
            }
        } catch (error) {
            console.error('Erreur lors de l\'export du replay:', error);
            if (window.notifications) {
                window.notifications.error('Erreur lors de l\'export');
            }
        }
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        }
        return `${seconds}s`;
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
        return Math.round(bytes / (1024 * 1024)) + ' MB';
    }

    setupEventListeners() {
        // Écouter les événements de jeu
        document.addEventListener('gameStarted', (e) => {
            if (!this.isReplaying && e.detail) {
                this.startRecording(e.detail.gameId, e.detail.gameName);
            }
        });

        document.addEventListener('gameEnded', (e) => {
            if (this.isRecording && e.detail) {
                this.stopRecording(e.detail);
            }
        });

        // Écouter les inputs pour l'enregistrement
        document.addEventListener('keydown', (e) => {
            if (this.isRecording && e.code) {
                this.recordInput('keydown', e.code, Date.now());
            }
        });

        document.addEventListener('keyup', (e) => {
            if (this.isRecording && e.code) {
                this.recordInput('keyup', e.code, Date.now());
            }
        });

        // Bouton replay
        const replayBtn = document.getElementById('replayBtn');
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                this.showReplayModal();
            });
        }
    }
}

// Instance globale
window.replaySystem = new ReplaySystem();
