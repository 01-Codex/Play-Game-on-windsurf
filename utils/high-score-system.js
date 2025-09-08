// Système de high scores avec stockage local
class HighScoreSystem {
    constructor() {
        this.storageKey = 'arcade_games_scores';
        this.scores = this.loadScores();
    }

    loadScores() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.warn('Erreur lors du chargement des scores:', e);
            return {};
        }
    }

    saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
        } catch (e) {
            console.warn('Erreur lors de la sauvegarde des scores:', e);
        }
    }

    getHighScore(gameId) {
        return this.scores[gameId] || 0;
    }

    setHighScore(gameId, score, playerName = 'Joueur') {
        const currentHigh = this.getHighScore(gameId);
        if (score > currentHigh) {
            this.scores[gameId] = {
                score: score,
                player: playerName,
                date: new Date().toISOString()
            };
            this.saveScores();
            return true; // Nouveau record
        }
        return false;
    }

    getAllScores() {
        return this.scores;
    }

    getLeaderboard(gameId, limit = 10) {
        const gameScores = this.scores[gameId];
        if (!gameScores) return [];
        
        // Pour l'instant, on ne stocke qu'un score par jeu
        // Dans une version future, on pourrait stocker plusieurs scores
        return [{
            rank: 1,
            player: gameScores.player,
            score: gameScores.score,
            date: new Date(gameScores.date).toLocaleDateString()
        }];
    }

    resetScores(gameId = null) {
        if (gameId) {
            delete this.scores[gameId];
        } else {
            this.scores = {};
        }
        this.saveScores();
    }

    // Formatage du score pour l'affichage
    formatScore(score) {
        return score.toLocaleString();
    }

    // Vérification si c'est un nouveau record
    isNewRecord(gameId, score) {
        return score > this.getHighScore(gameId);
    }

    // Affichage du high score dans l'interface
    displayHighScore(gameId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const highScore = this.getHighScore(gameId);
        if (typeof highScore === 'object') {
            container.innerHTML = `
                <div class="high-score-display">
                    <h4>🏆 Meilleur Score</h4>
                    <div class="score-value">${this.formatScore(highScore.score)}</div>
                    <div class="score-player">par ${highScore.player}</div>
                    <div class="score-date">${new Date(highScore.date).toLocaleDateString()}</div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="high-score-display">
                    <h4>🏆 Meilleur Score</h4>
                    <div class="score-value">${this.formatScore(highScore)}</div>
                </div>
            `;
        }
    }

    // Animation pour nouveau record
    showNewRecordAnimation(score) {
        const animation = document.createElement('div');
        animation.className = 'new-record-animation';
        animation.innerHTML = `
            <div class="record-content">
                <h2>🎉 NOUVEAU RECORD! 🎉</h2>
                <div class="record-score">${this.formatScore(score)}</div>
                <p>Félicitations!</p>
            </div>
        `;
        
        animation.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: recordFadeIn 0.5s ease;
        `;

        document.body.appendChild(animation);

        // Supprimer après 3 secondes
        setTimeout(() => {
            animation.style.animation = 'recordFadeOut 0.5s ease';
            setTimeout(() => animation.remove(), 500);
        }, 3000);

        // Ajouter les styles d'animation
        if (!document.getElementById('record-animations')) {
            const style = document.createElement('style');
            style.id = 'record-animations';
            style.textContent = `
                @keyframes recordFadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes recordFadeOut {
                    from { opacity: 1; transform: scale(1); }
                    to { opacity: 0; transform: scale(0.8); }
                }
                .record-content {
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                    color: #333;
                    padding: 2rem;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    animation: bounce 0.6s ease;
                }
                .record-content h2 {
                    margin: 0 0 1rem 0;
                    font-size: 2rem;
                    font-weight: bold;
                }
                .record-score {
                    font-size: 3rem;
                    font-weight: bold;
                    margin: 1rem 0;
                    color: #d4af37;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                }
                @keyframes bounce {
                    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-20px); }
                    60% { transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Instance globale
window.highScores = new HighScoreSystem();
