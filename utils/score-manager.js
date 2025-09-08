// Gestionnaire de scores pour les jeux
window.ScoreManager = class ScoreManager {
    constructor() {
        this.storageKey = 'arcade_high_scores';
        this.scores = this.loadScores();
    }

    // Charger les scores depuis le localStorage
    loadScores() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Erreur lors du chargement des scores:', e);
            return {};
        }
    }

    // Sauvegarder les scores dans le localStorage
    saveScores() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
        } catch (e) {
            console.error('Erreur lors de la sauvegarde des scores:', e);
        }
    }

    // Obtenir le meilleur score pour un jeu spécifique
    getHighScore(gameId) {
        return this.scores[gameId] ? Math.max(...this.scores[gameId].map(s => s.score)) : 0;
    }

    // Obtenir tous les scores pour un jeu spécifique
    getGameScores(gameId, limit = 10) {
        if (!this.scores[gameId]) return [];
        return [...this.scores[gameId]]
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    // Ajouter un nouveau score
    addScore(gameId, playerName, score, gameData = {}) {
        if (!gameId || !playerName || typeof score !== 'number') {
            console.error('Paramètres invalides pour addScore');
            return false;
        }

        // Initialiser le tableau des scores pour ce jeu s'il n'existe pas
        if (!this.scores[gameId]) {
            this.scores[gameId] = [];
        }

        // Créer un nouvel enregistrement de score
        const newScore = {
            playerName,
            score,
            date: new Date().toISOString(),
            ...gameData // Données supplémentaires spécifiques au jeu
        };

        // Ajouter le score et trier
        this.scores[gameId].push(newScore);
        this.scores[gameId].sort((a, b) => b.score - a.score);

        // Limiter le nombre de scores enregistrés par jeu
        if (this.scores[gameId].length > 100) {
            this.scores[gameId] = this.scores[gameId].slice(0, 100);
        }

        // Sauvegarder les scores mis à jour
        this.saveScores();

        // Vérifier s'il s'agit d'un nouveau record
        const isNewHighScore = this.scores[gameId][0] === newScore;
        
        return {
            position: this.scores[gameId].indexOf(newScore) + 1,
            isNewHighScore,
            totalScores: this.scores[gameId].length
        };
    }

    // Réinitialiser tous les scores (pour les tests)
    resetScores() {
        this.scores = {};
        this.saveScores();
    }

    // Formater un score avec des séparateurs de milliers
    static formatScore(score) {
        return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Formater une date lisible
    static formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
}

// Créer une instance globale
window.scoreManager = new ScoreManager();

// Exemple d'utilisation :
// import { scoreManager } from './utils/score-manager.js';
// 
// // Ajouter un score
// const result = scoreManager.addScore('pacman', 'Joueur1', 1500);
// 
// // Obtenir les meilleurs scores
// const highScores = scoreManager.getGameScores('pacman', 10);
// 
// // Obtenir le meilleur score
// const highScore = scoreManager.getHighScore('pacman');
