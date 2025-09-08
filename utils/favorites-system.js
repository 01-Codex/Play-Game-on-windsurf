// Système de favoris pour jeux
class FavoritesSystem {
    constructor() {
        this.favorites = this.loadFavorites();
        this.init();
    }

    init() {
        this.createFavoritesInterface();
        this.setupEventListeners();
        this.updateGameCards();
    }

    loadFavorites() {
        try {
            const saved = localStorage.getItem('arcade_favorites');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveFavorites() {
        try {
            localStorage.setItem('arcade_favorites', JSON.stringify(this.favorites));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des favoris:', error);
            if (window.notifications) {
                window.notifications.error('Erreur de sauvegarde des favoris');
            }
        }
    }

    toggleFavorite(gameId) {
        if (!gameId) {
            console.warn('ID de jeu manquant pour toggle favoris');
            return;
        }
        
        const index = this.favorites.indexOf(gameId);
        if (index === -1) {
            this.favorites.push(gameId);
            if (window.notifications) {
                window.notifications.success('❤️ Ajouté aux favoris!');
            }
        } else {
            this.favorites.splice(index, 1);
            if (window.notifications) {
                window.notifications.info('💔 Retiré des favoris');
            }
        }
        
        this.saveFavorites();
        this.updateGameCards();
        this.updateFavoritesView();
    }

    isFavorite(gameId) {
        return this.favorites.includes(gameId);
    }

    createFavoritesInterface() {
        // Bouton favoris
        const favoritesButton = document.createElement('button');
        favoritesButton.id = 'favorites-toggle';
        favoritesButton.innerHTML = '❤️';
        favoritesButton.title = 'Mes jeux favoris';
        favoritesButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 560px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(233, 30, 99, 0.3);
        `;

        document.body.appendChild(favoritesButton);
        favoritesButton.addEventListener('click', () => this.showFavoritesModal());

        // Ajouter le filtre favoris à la barre de recherche
        this.addFavoritesFilter();
    }

    addFavoritesFilter() {
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            const favoritesFilter = document.createElement('button');
            favoritesFilter.id = 'favorites-filter';
            favoritesFilter.innerHTML = '❤️ Favoris';
            favoritesFilter.className = 'favorites-filter-btn';
            favoritesFilter.style.cssText = `
                margin-left: 1rem;
                padding: 0.75rem 1rem;
                background: transparent;
                border: 2px solid #e91e63;
                color: #e91e63;
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: bold;
            `;

            favoritesFilter.addEventListener('click', () => this.toggleFavoritesFilter());
            searchContainer.appendChild(favoritesFilter);
        }
    }

    toggleFavoritesFilter() {
        const filterBtn = document.getElementById('favorites-filter');
        const isActive = filterBtn.classList.contains('active');
        
        if (isActive) {
            // Désactiver le filtre
            filterBtn.classList.remove('active');
            filterBtn.style.background = 'transparent';
            filterBtn.style.color = '#e91e63';
            this.showAllGames();
        } else {
            // Activer le filtre
            filterBtn.classList.add('active');
            filterBtn.style.background = '#e91e63';
            filterBtn.style.color = 'white';
            this.showOnlyFavorites();
        }
    }

    showOnlyFavorites() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            const gameId = card.getAttribute('data-game-id');
            if (this.isFavorite(gameId)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        if (this.favorites.length === 0) {
            this.showNoFavoritesMessage();
        }
    }

    showAllGames() {
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            card.style.display = 'block';
        });
        this.hideNoFavoritesMessage();
    }

    showNoFavoritesMessage() {
        let message = document.getElementById('no-favorites-message');
        if (!message) {
            message = document.createElement('div');
            message.id = 'no-favorites-message';
            message.style.cssText = `
                text-align: center;
                padding: 3rem;
                color: var(--text-secondary);
                grid-column: 1 / -1;
            `;
            message.innerHTML = `
                <div style="font-size: 4rem; margin-bottom: 1rem;">💔</div>
                <h3 style="color: var(--text-color); margin-bottom: 1rem;">Aucun jeu favori</h3>
                <p>Cliquez sur ❤️ sur vos jeux préférés pour les ajouter ici!</p>
            `;
            
            const gamesGrid = document.querySelector('.games-grid');
            if (gamesGrid) {
                gamesGrid.appendChild(message);
            }
        }
        message.style.display = 'block';
    }

    hideNoFavoritesMessage() {
        const message = document.getElementById('no-favorites-message');
        if (message) {
            message.style.display = 'none';
        }
    }

    updateGameCards() {
        // Mettre à jour les boutons favoris sur les cartes de jeux
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            const gameId = parseInt(card.dataset.gameId);
            if (isNaN(gameId)) {
                console.warn('ID de jeu invalide sur la carte:', card.dataset.gameId);
                return;
            }
            
            const favoriteBtn = card.querySelector('.favorite-btn');
            
            if (!favoriteBtn) {
                // Créer le bouton favori s'il n'existe pas
                const btn = document.createElement('button');
                btn.className = 'favorite-btn';
                btn.innerHTML = this.isFavorite(gameId) ? '❤️' : '🤍';
                btn.title = this.isFavorite(gameId) ? 'Retirer des favoris' : 'Ajouter aux favoris';
                btn.onclick = (e) => {
                    e.stopPropagation();
                    this.toggleFavorite(gameId);
                };
                
                card.appendChild(btn);
            } else {
                // Mettre à jour le bouton existant
                favoriteBtn.innerHTML = this.isFavorite(gameId) ? '❤️' : '🤍';
                favoriteBtn.title = this.isFavorite(gameId) ? 'Retirer des favoris' : 'Ajouter aux favoris';
            }
        });
    }

    showFavoritesModal() {
        const modal = document.createElement('div');
        modal.id = 'favoritesModal';
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
                        max-width: 800px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--text-color); margin: 0;">❤️ Mes Jeux Favoris</h3>
                    <button onclick="document.getElementById('favoritesModal').remove()" 
                            style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color);">×</button>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;">
                        <button onclick="window.favoritesSystem.clearAllFavorites()" 
                                style="padding: 0.5rem 1rem; background: #e74c3c; color: white; 
                                       border: none; border-radius: 8px; cursor: pointer;">
                            💔 Tout supprimer
                        </button>
                        <button onclick="window.favoritesSystem.exportFavorites()" 
                                style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; 
                                       border: none; border-radius: 8px; cursor: pointer;">
                            📤 Exporter
                        </button>
                        <span style="color: var(--text-secondary); font-size: 0.9rem;">
                            ${this.favorites.length} jeu${this.favorites.length > 1 ? 'x' : ''} favori${this.favorites.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
                
                <div id="favorites-list">
                    ${this.renderFavoritesList()}
                </div>
                
                <div style="margin-top: 2rem; text-align: center;">
                    <button onclick="window.favoritesSystem.playRandomFavorite()" 
                            style="padding: 1rem 2rem; background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%); 
                                   color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1rem;">
                        🎲 Jeu Favori Aléatoire
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    renderFavoritesList() {
        if (this.favorites.length === 0) {
            return `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">💔</div>
                    <p>Aucun jeu favori</p>
                    <p style="font-size: 0.9rem;">Ajoutez vos jeux préférés en cliquant sur ❤️ sur les cartes de jeux!</p>
                </div>
            `;
        }

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
                ${this.favorites.map(gameId => {
                    const game = this.getGameInfo(gameId);
                    return `
                        <div style="background: var(--border-color); padding: 1rem; border-radius: 10px; 
                                    display: flex; align-items: center; gap: 1rem; position: relative;">
                            <div style="font-size: 2rem;">${game.emoji}</div>
                            <div style="flex: 1;">
                                <h4 style="color: var(--text-color); margin: 0 0 0.5rem 0;">${game.name}</h4>
                                <div style="color: var(--text-secondary); font-size: 0.9rem;">
                                    ${this.getFavoriteStats(gameId)}
                                </div>
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="window.favoritesSystem.playFavorite('${gameId}')" 
                                        style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; 
                                               border: none; border-radius: 8px; cursor: pointer;">
                                    ▶️ Jouer
                                </button>
                                <button onclick="window.favoritesSystem.toggleFavorite('${gameId}')" 
                                        style="padding: 0.5rem; background: #e74c3c; color: white; 
                                               border: none; border-radius: 8px; cursor: pointer;">
                                    💔
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    getGameInfo(gameId) {
        const games = {
            1: { name: 'Pac-Man', emoji: '👻' },
            2: { name: 'Space Invaders', emoji: '👾' },
            3: { name: 'Donkey Kong', emoji: '🦍' },
            4: { name: 'Tetris', emoji: '🧩' },
            5: { name: 'Street Fighter', emoji: '👊' },
            6: { name: 'Galaga', emoji: '🚀' },
            7: { name: 'Frogger', emoji: '🐸' },
            8: { name: 'Centipede', emoji: '🐛' },
            9: { name: 'Asteroids', emoji: '☄️' },
            10: { name: 'Ms. Pac-Man', emoji: '👻' },
            16: { name: 'Breakout', emoji: '🧱' },
            19: { name: 'Snake', emoji: '🐍' },
            23: { name: 'Snake', emoji: '🐍' }
        };
        return games[gameId] || { name: `Jeu ${gameId}`, emoji: '🎮' };
    }

    getFavoriteStats(gameId) {
        // Récupérer les stats du jeu depuis le système de statistiques
        if (window.statisticsSystem && window.statisticsSystem.stats.gameStats[gameId]) {
            const stats = window.statisticsSystem.stats.gameStats[gameId];
            return `Joué ${stats.played} fois • Meilleur: ${stats.bestScore.toLocaleString()}`;
        }
        return 'Aucune statistique';
    }

    playFavorite(gameId) {
        // Fermer la modale des favoris
        const modal = document.getElementById('favoritesModal');
        if (modal) {
            modal.remove();
        }
        
        // Démarrer le jeu
        if (window.gameManager && typeof window.gameManager.startGame === 'function') {
            window.gameManager.startGame(gameId);
        } else {
            console.error('GameManager non disponible');
            if (window.notifications) {
                window.notifications.error('Impossible de lancer le jeu');
            }
            return;
        }
        
        if (window.notifications) {
            window.notifications.info('🎲 Jeu favori lancé!');
        }
    }

    playRandomFavorite() {
        if (this.favorites.length === 0) {
            if (window.notifications) {
                window.notifications.warning('Aucun jeu favori disponible');
            }
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * this.favorites.length);
        const gameId = this.favorites[randomIndex];
        
        if (!gameId) {
            console.warn('ID de jeu favori invalide');
            return;
        }
        
        // Fermer la modale des favoris
        const modal = document.getElementById('favoritesModal');
        if (modal) {
            modal.remove();
        }
        
        // Lancer le jeu
        if (window.gameManager && typeof window.gameManager.startGame === 'function') {
            window.gameManager.startGame(gameId);
        } else {
            console.error('GameManager non disponible');
            if (window.notifications) {
                window.notifications.error('Impossible de lancer le jeu');
            }
            return;
        }
        
        if (window.notifications) {
            window.notifications.info('🎲 Jeu favori aléatoire lancé!');
        }
    }

    clearAllFavorites() {
        if (confirm('Supprimer tous les jeux favoris ?')) {
            this.favorites = [];
            this.saveFavorites();
            this.updateGameCards();
            
            // Rafraîchir la liste
            const list = document.getElementById('favorites-list');
            if (list) {
                list.innerHTML = this.renderFavoritesList();
            }
            
            if (window.notifications) {
                window.notifications.info('💔 Tous les favoris supprimés');
            }
        }
    }

    exportFavorites() {
        if (this.favorites.length === 0) {
            if (window.notifications) {
                window.notifications.warning('Aucun favori à exporter');
            }
            return;
        }
        
        try {
            const data = {
                favorites: this.favorites,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `favorites_export_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            if (window.notifications) {
                window.notifications.success(`💾 ${this.favorites.length} favoris exportés`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'export des favoris:', error);
            if (window.notifications) {
                window.notifications.error('Erreur lors de l\'export');
            }
        }
    }

    updateFavoritesView() {
        const list = document.getElementById('favorites-list');
        if (list) {
            list.innerHTML = this.renderFavoritesList();
        }

        // Mettre à jour le compteur
        const counter = document.querySelector('#favorites-dialog span');
        if (counter) {
            counter.textContent = `${this.favorites.length} jeu${this.favorites.length > 1 ? 'x' : ''} favori${this.favorites.length > 1 ? 's' : ''}`;
        }
    }

    setupEventListeners() {
        // Observer les changements dans la grille de jeux pour mettre à jour les boutons favoris
        const observer = new MutationObserver(() => {
            this.updateGameCards();
        });

        const gamesGrid = document.querySelector('.games-grid');
        if (gamesGrid) {
            observer.observe(gamesGrid, { childList: true, subtree: true });
        }

        // Mettre à jour les cartes après le chargement initial
        setTimeout(() => {
            this.updateGameCards();
        }, 1000);
    }
}

// Instance globale
window.favoritesSystem = new FavoritesSystem();
