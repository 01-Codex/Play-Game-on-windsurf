// Système de succès et achievements
class AchievementSystem {
    constructor() {
        this.achievements = this.initializeAchievements();
        this.unlockedAchievements = this.loadUnlockedAchievements();
        this.stats = this.loadStats();
        this.init();
    }

    init() {
        this.createAchievementPanel();
        this.setupEventListeners();
    }

    initializeAchievements() {
        return {
            // Achievements généraux
            'first_game': {
                id: 'first_game',
                title: '🎮 Premier Jeu',
                description: 'Jouer votre premier jeu',
                icon: '🎮',
                rarity: 'common',
                condition: (stats) => stats.gamesPlayed >= 1
            },
            'game_master': {
                id: 'game_master',
                title: '🎯 Maître du Jeu',
                description: 'Jouer à tous les jeux disponibles',
                icon: '🎯',
                rarity: 'rare',
                condition: (stats) => stats.uniqueGamesPlayed >= 8
            },
            'high_scorer': {
                id: 'high_scorer',
                title: '🏆 Chasseur de Score',
                description: 'Atteindre 10,000 points dans un jeu',
                icon: '🏆',
                rarity: 'epic',
                condition: (stats) => stats.highestScore >= 10000
            },
            'marathon_player': {
                id: 'marathon_player',
                title: '⏰ Marathonien',
                description: 'Jouer pendant plus de 30 minutes',
                icon: '⏰',
                rarity: 'uncommon',
                condition: (stats) => stats.totalPlayTime >= 1800000 // 30 min en ms
            },
            'persistent': {
                id: 'persistent',
                title: '🔄 Persévérant',
                description: 'Recommencer un jeu 10 fois',
                icon: '🔄',
                rarity: 'common',
                condition: (stats) => stats.gamesRestarted >= 10
            },
            'perfectionist': {
                id: 'perfectionist',
                title: '✨ Perfectionniste',
                description: 'Finir un niveau sans perdre de vie',
                icon: '✨',
                rarity: 'legendary',
                condition: (stats) => stats.perfectRuns >= 1
            },
            'speed_demon': {
                id: 'speed_demon',
                title: '⚡ Démon de Vitesse',
                description: 'Finir un niveau en moins de 60 secondes',
                icon: '⚡',
                rarity: 'epic',
                condition: (stats) => stats.fastestLevel <= 60000
            },
            'collector': {
                id: 'collector',
                title: '💎 Collectionneur',
                description: 'Débloquer 5 achievements',
                icon: '💎',
                rarity: 'rare',
                condition: (stats) => Object.keys(this.unlockedAchievements).length >= 5
            },
            'night_owl': {
                id: 'night_owl',
                title: '🦉 Oiseau de Nuit',
                description: 'Jouer en mode sombre',
                icon: '🦉',
                rarity: 'common',
                condition: (stats) => stats.darkModeUsed === true
            },
            'social_player': {
                id: 'social_player',
                title: '👥 Joueur Social',
                description: 'Partager un score',
                icon: '👥',
                rarity: 'uncommon',
                condition: (stats) => stats.scoresShared >= 1
            }
        };
    }

    loadUnlockedAchievements() {
        try {
            return JSON.parse(localStorage.getItem('arcade_achievements') || '{}');
        } catch (e) {
            return {};
        }
    }

    saveUnlockedAchievements() {
        localStorage.setItem('arcade_achievements', JSON.stringify(this.unlockedAchievements));
    }

    loadStats() {
        try {
            return JSON.parse(localStorage.getItem('arcade_stats') || JSON.stringify({
                gamesPlayed: 0,
                uniqueGamesPlayed: 0,
                totalPlayTime: 0,
                highestScore: 0,
                gamesRestarted: 0,
                perfectRuns: 0,
                fastestLevel: Infinity,
                darkModeUsed: false,
                scoresShared: 0,
                playedGames: new Set()
            }));
        } catch (e) {
            return {
                gamesPlayed: 0,
                uniqueGamesPlayed: 0,
                totalPlayTime: 0,
                highestScore: 0,
                gamesRestarted: 0,
                perfectRuns: 0,
                fastestLevel: Infinity,
                darkModeUsed: false,
                scoresShared: 0,
                playedGames: new Set()
            };
        }
    }

    saveStats() {
        // Convertir Set en Array pour la sérialisation
        const statsToSave = { ...this.stats };
        if (statsToSave.playedGames instanceof Set) {
            statsToSave.playedGames = Array.from(statsToSave.playedGames);
        }
        localStorage.setItem('arcade_stats', JSON.stringify(statsToSave));
    }

    updateStat(statName, value, operation = 'set') {
        if (operation === 'increment') {
            this.stats[statName] = (this.stats[statName] || 0) + value;
        } else if (operation === 'add') {
            if (!this.stats[statName]) this.stats[statName] = new Set();
            this.stats[statName].add(value);
        } else {
            this.stats[statName] = value;
        }
        this.saveStats();
        this.checkAchievements();
    }

    checkAchievements() {
        Object.values(this.achievements).forEach(achievement => {
            if (!this.unlockedAchievements[achievement.id] && achievement.condition(this.stats)) {
                this.unlockAchievement(achievement);
            }
        });
    }

    unlockAchievement(achievement) {
        this.unlockedAchievements[achievement.id] = {
            ...achievement,
            unlockedAt: new Date().toISOString()
        };
        this.saveUnlockedAchievements();
        this.showAchievementNotification(achievement);
        
        // Vérifier l'achievement collectionneur
        this.checkAchievements();
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-text">
                    <div class="achievement-title">Succès débloqué!</div>
                    <div class="achievement-name">${achievement.title}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                </div>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #333;
            padding: 1rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
            z-index: 10000;
            animation: achievementSlideIn 0.5s ease, achievementPulse 2s ease 0.5s;
            max-width: 300px;
            border: 2px solid #ffa000;
        `;

        document.body.appendChild(notification);

        // Son de succès
        if (window.gameManager && window.gameManager.currentGame) {
            window.gameManager.currentGame.playSound(523, 0.2, 'sine', 0.1); // C5
            setTimeout(() => window.gameManager.currentGame.playSound(659, 0.2, 'sine', 0.1), 200); // E5
            setTimeout(() => window.gameManager.currentGame.playSound(784, 0.3, 'sine', 0.1), 400); // G5
        }

        setTimeout(() => {
            notification.style.animation = 'achievementSlideOut 0.5s ease';
            setTimeout(() => notification.remove(), 500);
        }, 4000);

        // Ajouter les styles d'animation
        this.addAchievementStyles();
    }

    addAchievementStyles() {
        if (document.getElementById('achievement-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'achievement-styles';
        style.textContent = `
            @keyframes achievementSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes achievementSlideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes achievementPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            .achievement-content {
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            .achievement-icon {
                font-size: 2rem;
                flex-shrink: 0;
            }
            .achievement-title {
                font-weight: bold;
                font-size: 0.9rem;
                margin-bottom: 0.25rem;
            }
            .achievement-name {
                font-weight: bold;
                font-size: 1rem;
                margin-bottom: 0.25rem;
            }
            .achievement-desc {
                font-size: 0.8rem;
                opacity: 0.8;
            }
        `;
        document.head.appendChild(style);
    }

    createAchievementPanel() {
        const button = document.createElement('button');
        button.id = 'achievements-toggle';
        button.innerHTML = '🏆';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 140px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            color: #333;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        `;

        document.body.appendChild(button);
        button.addEventListener('click', () => this.toggleAchievementPanel());
    }

    toggleAchievementPanel() {
        let panel = document.getElementById('achievement-panel');
        
        if (!panel) {
            panel = this.createAchievementPanelElement();
            document.body.appendChild(panel);
        }
        
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }

    createAchievementPanelElement() {
        const panel = document.createElement('div');
        panel.id = 'achievement-panel';
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 400px;
            max-height: 500px;
            background: var(--surface-color);
            border: 2px solid var(--border-color);
            border-radius: 15px;
            padding: 1rem;
            z-index: 9999;
            overflow-y: auto;
            box-shadow: 0 10px 30px var(--shadow-color);
            display: none;
        `;

        const unlockedCount = Object.keys(this.unlockedAchievements).length;
        const totalCount = Object.keys(this.achievements).length;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3 style="color: var(--text-color);">🏆 Succès (${unlockedCount}/${totalCount})</h3>
                <button onclick="document.getElementById('achievement-panel').style.display='none'" 
                        style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-color);">×</button>
            </div>
            <div class="achievements-grid">
                ${Object.values(this.achievements).map(achievement => this.renderAchievement(achievement)).join('')}
            </div>
        `;

        return panel;
    }

    renderAchievement(achievement) {
        const isUnlocked = this.unlockedAchievements[achievement.id];
        const rarityColors = {
            common: '#95a5a6',
            uncommon: '#3498db',
            rare: '#9b59b6',
            epic: '#e74c3c',
            legendary: '#f39c12'
        };

        return `
            <div class="achievement-item ${isUnlocked ? 'unlocked' : 'locked'}" 
                 style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; 
                        border-radius: 10px; margin-bottom: 0.5rem;
                        background: ${isUnlocked ? 'var(--primary-color)' : 'var(--border-color)'};
                        opacity: ${isUnlocked ? '1' : '0.5'};
                        border-left: 4px solid ${rarityColors[achievement.rarity]};">
                <div style="font-size: 1.5rem; flex-shrink: 0;">
                    ${isUnlocked ? achievement.icon : '🔒'}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: ${isUnlocked ? 'white' : 'var(--text-secondary)'};">
                        ${achievement.title}
                    </div>
                    <div style="font-size: 0.8rem; color: ${isUnlocked ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)'};">
                        ${achievement.description}
                    </div>
                    ${isUnlocked ? `<div style="font-size: 0.7rem; color: rgba(255,255,255,0.6);">
                        Débloqué le ${new Date(isUnlocked.unlockedAt).toLocaleDateString()}
                    </div>` : ''}
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Écouter les événements de jeu
        document.addEventListener('gameStarted', (e) => {
            this.updateStat('gamesPlayed', 1, 'increment');
            this.updateStat('playedGames', e.detail.gameId, 'add');
            this.updateStat('uniqueGamesPlayed', this.stats.playedGames.size);
        });

        document.addEventListener('gameRestarted', () => {
            this.updateStat('gamesRestarted', 1, 'increment');
        });

        document.addEventListener('scoreUpdated', (e) => {
            if (e.detail.score > this.stats.highestScore) {
                this.updateStat('highestScore', e.detail.score);
            }
        });

        document.addEventListener('themeChanged', (e) => {
            if (e.detail.theme === 'dark') {
                this.updateStat('darkModeUsed', true);
            }
        });
    }

    // Méthodes publiques pour les jeux
    recordPerfectRun() {
        this.updateStat('perfectRuns', 1, 'increment');
    }

    recordFastLevel(time) {
        if (time < this.stats.fastestLevel) {
            this.updateStat('fastestLevel', time);
        }
    }

    recordPlayTime(time) {
        this.updateStat('totalPlayTime', time, 'increment');
    }

    shareScore() {
        this.updateStat('scoresShared', 1, 'increment');
    }
}

// Instance globale
window.achievementSystem = new AchievementSystem();
