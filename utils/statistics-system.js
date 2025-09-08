// Système de statistiques détaillées
class StatisticsSystem {
    constructor() {
        this.stats = this.loadStats();
        this.sessionStats = this.initSessionStats();
        this.startTime = Date.now();
        this.init();
    }

    init() {
        this.createStatsInterface();
        this.setupEventListeners();
        this.startSessionTracking();
    }

    loadStats() {
        try {
            const defaultStats = {
                totalGamesPlayed: 0,
                totalPlayTime: 0,
                totalScore: 0,
                averageScore: 0,
                bestScore: 0,
                gamesWon: 0,
                gamesLost: 0,
                winRate: 0,
                favoriteGame: null,
                longestSession: 0,
                totalClicks: 0,
                totalKeyPresses: 0,
                achievementsUnlocked: 0,
                gameStats: {},
                dailyStats: {},
                weeklyStats: {},
                monthlyStats: {}
            };
            
            const saved = localStorage.getItem('arcade_detailed_stats');
            return saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
        } catch (e) {
            return this.getDefaultStats();
        }
    }

    getDefaultStats() {
        return {
            totalGamesPlayed: 0,
            totalPlayTime: 0,
            totalScore: 0,
            averageScore: 0,
            bestScore: 0,
            gamesWon: 0,
            gamesLost: 0,
            winRate: 0,
            favoriteGame: null,
            longestSession: 0,
            totalClicks: 0,
            totalKeyPresses: 0,
            achievementsUnlocked: 0,
            gameStats: {},
            dailyStats: {},
            weeklyStats: {},
            monthlyStats: {}
        };
    }

    initSessionStats() {
        return {
            gamesPlayed: 0,
            playTime: 0,
            score: 0,
            clicks: 0,
            keyPresses: 0,
            startTime: Date.now()
        };
    }

    saveStats() {
        try {
            localStorage.setItem('arcade_detailed_stats', JSON.stringify(this.stats));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des statistiques:', error);
            if (window.notifications) {
                window.notifications.error('Erreur de sauvegarde des statistiques');
            }
        }
    }

    updateStat(category, value, operation = 'increment') {
        if (operation === 'increment') {
            this.stats[category] = (this.stats[category] || 0) + value;
        } else if (operation === 'set') {
            this.stats[category] = value;
        } else if (operation === 'max') {
            this.stats[category] = Math.max(this.stats[category] || 0, value);
        }
        
        // Mettre à jour les moyennes
        if (category === 'totalScore' || category === 'totalGamesPlayed') {
            this.stats.averageScore = this.stats.totalGamesPlayed > 0 ? 
                Math.round(this.stats.totalScore / this.stats.totalGamesPlayed) : 0;
        }
        
        if (category === 'gamesWon' || category === 'gamesLost') {
            const totalGames = this.stats.gamesWon + this.stats.gamesLost;
            this.stats.winRate = totalGames > 0 ? 
                Math.round((this.stats.gamesWon / totalGames) * 100) : 0;
        }
        
        this.saveStats();
    }

    onGameStarted(detail) {
        if (!detail || !detail.gameId) {
            console.warn('Détails de jeu manquants lors du démarrage');
            return;
        }
        
        this.currentGameStart = Date.now();
        this.currentGameId = detail.gameId;
        this.sessionStats.gamesPlayed++;
        
        // Initialiser les stats du jeu si nécessaire
        if (!this.stats.gameStats[detail.gameId]) {
            this.stats.gameStats[detail.gameId] = {
                played: 0,
                won: 0,
                totalScore: 0,
                bestScore: 0,
                totalTime: 0,
                averageScore: 0
            };
        }
        
        this.stats.gameStats[detail.gameId].played++;
        this.saveStats();
    }

    onGameEnded(detail) {
        if (!detail || !detail.gameId || !detail.score || !detail.won) {
            console.warn('Détails de jeu manquants lors de la fin');
            return;
        }
        
        const playTime = Date.now() - this.currentGameStart;
        this.updateStat('totalPlayTime', playTime);
        this.updateStat('totalScore', detail.score);
        this.updateStat('bestScore', detail.score, 'max');
        
        if (detail.won) {
            this.updateStat('gamesWon', 1);
            this.stats.gameStats[detail.gameId].won++;
        } else {
            this.updateStat('gamesLost', 1);
            this.stats.gameStats[detail.gameId].lost++;
        }
        
        // Statistiques par jeu
        this.stats.gameStats[detail.gameId].totalScore += detail.score;
        this.stats.gameStats[detail.gameId].bestScore = Math.max(this.stats.gameStats[detail.gameId].bestScore, detail.score);
        this.stats.gameStats[detail.gameId].totalTime += playTime;
        this.stats.gameStats[detail.gameId].averageScore = Math.round(
            this.stats.gameStats[detail.gameId].totalScore / this.stats.gameStats[detail.gameId].played
        );
        
        // Jeu favori
        this.updateFavoriteGame();
        
        // Statistiques quotidiennes
        this.updateDailyStats('totalScore', detail.score);
        this.updateDailyStats('playTime', playTime);
        
        this.saveStats();
    }

    onScoreUpdated(detail) {
        if (!detail || !detail.score) {
            console.warn('Détails de score manquants lors de la mise à jour');
            return;
        }
        
        this.updateStat('totalScore', detail.score);
        this.updateStat('bestScore', detail.score, 'max');
        
        // Statistiques par jeu
        this.stats.gameStats[this.currentGameId].totalScore += detail.score;
        this.stats.gameStats[this.currentGameId].bestScore = Math.max(this.stats.gameStats[this.currentGameId].bestScore, detail.score);
        
        this.saveStats();
    }

    updateFavoriteGame() {
        let maxPlayed = 0;
        let favorite = null;
        
        Object.entries(this.stats.gameStats).forEach(([gameId, stats]) => {
            if (stats.played > maxPlayed) {
                maxPlayed = stats.played;
                favorite = gameId;
            }
        });
        
        this.stats.favoriteGame = favorite;
    }

    updateDailyStats(category, value) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.stats.dailyStats[today]) {
            this.stats.dailyStats[today] = {
                gamesPlayed: 0,
                totalScore: 0,
                playTime: 0
            };
        }
        
        this.stats.dailyStats[today][category] = (this.stats.dailyStats[today][category] || 0) + value;
    }

    recordInteraction(type) {
        if (type === 'click') {
            this.updateStat('totalClicks', 1);
            this.sessionStats.clicks++;
        } else if (type === 'keypress') {
            this.updateStat('totalKeyPresses', 1);
            this.sessionStats.keyPresses++;
        }
    }

    startSessionTracking() {
        // Enregistrer les clics
        document.addEventListener('click', () => {
            this.recordInteraction('click');
        });
        
        // Enregistrer les touches
        document.addEventListener('keydown', () => {
            this.recordInteraction('keypress');
        });
        
        // Mettre à jour le temps de session (optimisé)
        setInterval(() => {
            const sessionTime = Date.now() - this.sessionStats.startTime;
            this.sessionStats.playTime = sessionTime;
            this.updateStat('longestSession', sessionTime, 'max');
        }, 10000); // Mettre à jour toutes les 10 secondes pour réduire la charge
    }

    createStatsInterface() {
        const button = document.createElement('button');
        button.id = 'stats-toggle';
        button.innerHTML = '📊';
        button.title = 'Voir les statistiques';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 320px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
        `;

        document.body.appendChild(button);
        button.addEventListener('click', () => this.showStatsDialog());
    }

    showStatsDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'stats-dialog';
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
                    <h3 style="color: var(--text-color); margin: 0;">📊 Statistiques Détaillées</h3>
                    <button onclick="document.getElementById('stats-dialog').remove()" 
                            style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color);">×</button>
                </div>
                
                <div class="stats-tabs" style="display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 2px solid var(--border-color);">
                    <button class="stats-tab active" data-tab="general" onclick="window.statisticsSystem.switchTab('general')"
                            style="padding: 0.75rem 1.5rem; background: none; border: none; cursor: pointer; color: var(--text-color); border-bottom: 2px solid var(--primary-color);">
                        📈 Général
                    </button>
                    <button class="stats-tab" data-tab="games" onclick="window.statisticsSystem.switchTab('games')"
                            style="padding: 0.75rem 1.5rem; background: none; border: none; cursor: pointer; color: var(--text-secondary); border-bottom: 2px solid transparent;">
                        🎮 Par Jeu
                    </button>
                    <button class="stats-tab" data-tab="session" onclick="window.statisticsSystem.switchTab('session')"
                            style="padding: 0.75rem 1.5rem; background: none; border: none; cursor: pointer; color: var(--text-secondary); border-bottom: 2px solid transparent;">
                        ⏱️ Session
                    </button>
                </div>
                
                <div id="stats-content">
                    ${this.renderGeneralStats()}
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                    <button onclick="window.statisticsSystem.exportStats()" 
                            style="padding: 0.75rem 1.5rem; background: var(--primary-color); color: white; 
                                   border: none; border-radius: 10px; cursor: pointer;">
                        📤 Exporter
                    </button>
                    <button onclick="window.statisticsSystem.resetStats()" 
                            style="padding: 0.75rem 1.5rem; background: #e74c3c; color: white; 
                                   border: none; border-radius: 10px; cursor: pointer;">
                        🗑️ Réinitialiser
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
    }

    switchTab(tab) {
        // Mettre à jour les onglets
        document.querySelectorAll('.stats-tab').forEach(t => {
            t.style.color = 'var(--text-secondary)';
            t.style.borderBottomColor = 'transparent';
        });
        
        const activeTab = document.querySelector(`[data-tab="${tab}"]`);
        activeTab.style.color = 'var(--text-color)';
        activeTab.style.borderBottomColor = 'var(--primary-color)';
        
        // Mettre à jour le contenu
        const content = document.getElementById('stats-content');
        switch(tab) {
            case 'general':
                content.innerHTML = this.renderGeneralStats();
                break;
            case 'games':
                content.innerHTML = this.renderGameStats();
                break;
            case 'session':
                content.innerHTML = this.renderSessionStats();
                break;
        }
    }

    renderGeneralStats() {
        return `
            <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                <div class="stat-card" style="background: var(--border-color); padding: 1rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; color: var(--primary-color);">🎮</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-color);">${this.stats.totalGamesPlayed}</div>
                    <div style="color: var(--text-secondary);">Jeux Joués</div>
                </div>
                
                <div class="stat-card" style="background: var(--border-color); padding: 1rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; color: var(--primary-color);">⏱️</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-color);">${this.formatTime(this.stats.totalPlayTime)}</div>
                    <div style="color: var(--text-secondary);">Temps Total</div>
                </div>
                
                <div class="stat-card" style="background: var(--border-color); padding: 1rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; color: var(--primary-color);">🏆</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-color);">${this.stats.bestScore.toLocaleString()}</div>
                    <div style="color: var(--text-secondary);">Meilleur Score</div>
                </div>
                
                <div class="stat-card" style="background: var(--border-color); padding: 1rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; color: var(--primary-color);">📊</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-color);">${this.stats.averageScore.toLocaleString()}</div>
                    <div style="color: var(--text-secondary);">Score Moyen</div>
                </div>
                
                <div class="stat-card" style="background: var(--border-color); padding: 1rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; color: var(--primary-color);">✅</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-color);">${this.stats.winRate}%</div>
                    <div style="color: var(--text-secondary);">Taux de Victoire</div>
                </div>
                
                <div class="stat-card" style="background: var(--border-color); padding: 1rem; border-radius: 10px; text-align: center;">
                    <div style="font-size: 2rem; color: var(--primary-color);">❤️</div>
                    <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-color);">${this.getGameName(this.stats.favoriteGame) || 'Aucun'}</div>
                    <div style="color: var(--text-secondary);">Jeu Favori</div>
                </div>
            </div>
            
            <div style="margin-top: 2rem;">
                <h4 style="color: var(--text-color); margin-bottom: 1rem;">📈 Activité des 7 derniers jours</h4>
                <div style="background: var(--border-color); padding: 1rem; border-radius: 10px;">
                    ${this.renderWeeklyChart()}
                </div>
            </div>
        `;
    }

    renderGameStats() {
        const gameEntries = Object.entries(this.stats.gameStats).sort((a, b) => b[1].played - a[1].played);
        
        return `
            <div class="game-stats-list">
                ${gameEntries.map(([gameId, stats]) => `
                    <div style="background: var(--border-color); padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <h4 style="color: var(--text-color); margin: 0;">${this.getGameName(gameId)}</h4>
                            <span style="color: var(--text-secondary);">${stats.played} parties</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; font-size: 0.9rem;">
                            <div>
                                <div style="color: var(--text-secondary);">Victoires</div>
                                <div style="color: var(--text-color); font-weight: bold;">${stats.won}</div>
                            </div>
                            <div>
                                <div style="color: var(--text-secondary);">Défaites</div>
                                <div style="color: var(--text-color); font-weight: bold;">${stats.lost}</div>
                            </div>
                            <div>
                                <div style="color: var(--text-secondary);">Meilleur Score</div>
                                <div style="color: var(--text-color); font-weight: bold;">${stats.bestScore.toLocaleString()}</div>
                            </div>
                            <div>
                                <div style="color: var(--text-secondary);">Score Moyen</div>
                                <div style="color: var(--text-color); font-weight: bold;">${stats.averageScore.toLocaleString()}</div>
                            </div>
                            <div>
                                <div style="color: var(--text-secondary);">Temps Total</div>
                                <div style="color: var(--text-color); font-weight: bold;">${this.formatTime(stats.totalTime)}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderSessionStats() {
        const sessionTime = Date.now() - this.sessionStats.startTime;
        
        return `
            <div class="session-stats">
                <div class="stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                    <div class="stat-card" style="background: var(--border-color); padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="font-size: 2rem; color: var(--primary-color);">🎮</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-color);">${this.sessionStats.gamesPlayed}</div>
                        <div style="color: var(--text-secondary);">Jeux cette session</div>
                    </div>
                    
                    <div class="stat-card" style="background: var(--border-color); padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="font-size: 2rem; color: var(--primary-color);">⏱️</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-color);">${this.formatTime(sessionTime)}</div>
                        <div style="color: var(--text-secondary);">Temps de session</div>
                    </div>
                    
                    <div class="stat-card" style="background: var(--border-color); padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="font-size: 2rem; color: var(--primary-color);">🖱️</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-color);">${this.sessionStats.clicks}</div>
                        <div style="color: var(--text-secondary);">Clics</div>
                    </div>
                    
                    <div class="stat-card" style="background: var(--border-color); padding: 1rem; border-radius: 10px; text-align: center;">
                        <div style="font-size: 2rem; color: var(--primary-color);">⌨️</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: var(--text-color);">${this.sessionStats.keyPresses}</div>
                        <div style="color: var(--text-secondary);">Touches</div>
                    </div>
                </div>
                
                <div style="background: var(--border-color); padding: 1rem; border-radius: 10px;">
                    <h4 style="color: var(--text-color); margin-bottom: 1rem;">📊 Comparaison avec les records</h4>
                    <div style="display: grid; gap: 0.5rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Session la plus longue:</span>
                            <span style="color: var(--text-color);">${this.formatTime(this.stats.longestSession)}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Total des clics:</span>
                            <span style="color: var(--text-color);">${this.stats.totalClicks.toLocaleString()}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Total des touches:</span>
                            <span style="color: var(--text-color);">${this.stats.totalKeyPresses.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderWeeklyChart() {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push({
                date: dateStr,
                label: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                games: this.stats.dailyStats[dateStr]?.gamesPlayed || 0
            });
        }
        
        const maxGames = Math.max(...last7Days.map(d => d.games), 1);
        
        return `
            <div style="display: flex; align-items: end; gap: 0.5rem; height: 100px;">
                ${last7Days.map(day => `
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                        <div style="width: 100%; background: var(--primary-color); 
                                    height: ${(day.games / maxGames) * 80}px; 
                                    border-radius: 4px 4px 0 0; margin-bottom: 0.5rem;
                                    opacity: ${day.games > 0 ? 1 : 0.3};"></div>
                        <div style="font-size: 0.8rem; color: var(--text-secondary);">${day.label}</div>
                        <div style="font-size: 0.7rem; color: var(--text-color);">${day.games}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }

    getGameName(gameId) {
        const names = {
            1: 'Pac-Man',
            2: 'Space Invaders',
            3: 'Donkey Kong',
            4: 'Tetris',
            5: 'Street Fighter',
            6: 'Galaga',
            7: 'Frogger',
            8: 'Centipede',
            9: 'Asteroids',
            10: 'Ms. Pac-Man',
            16: 'Breakout',
            19: 'Snake',
            23: 'Snake'
        };
        return names[gameId] || `Jeu ${gameId}`;
    }

    exportStats() {
        const data = {
            stats: this.stats,
            sessionStats: this.sessionStats,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `arcade_stats_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        if (window.notifications) {
            window.notifications.success('📤 Statistiques exportées!');
        }
    }

    resetStats() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les statistiques ?')) {
            this.stats = this.getDefaultStats();
            this.sessionStats = this.initSessionStats();
            this.saveStats();
            
            if (window.notifications) {
                window.notifications.info('🗑️ Statistiques réinitialisées');
            }
            
            // Rafraîchir la dialog
            document.getElementById('stats-dialog').remove();
            this.showStatsDialog();
        }
    }

    setupEventListeners() {
        // Écouter les événements de jeu
        document.addEventListener('gameStarted', (e) => {
            this.recordGameStart(e.detail.gameId);
        });

        document.addEventListener('gameEnded', (e) => {
            this.recordGameEnd(e.detail.gameId, e.detail.score, e.detail.won, e.detail.playTime);
        });
    }
}

// Instance globale
window.statisticsSystem = new StatisticsSystem();
