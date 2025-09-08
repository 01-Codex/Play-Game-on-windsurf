// Application principale pour le catalogue de jeux d'arcade
class ArcadeGamesCatalog {
    constructor() {
        this.games = gamesData;
        this.filteredGames = [...this.games];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.currentGameId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderGames();
        this.showLoadingSpinner(false);
    }

    setupEventListeners() {
        // Recherche
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.filterAndRenderGames();
        });
        
        // Recherche en temps réel avec debounce
        let searchTimeout;
        searchInput.addEventListener('keyup', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterAndRenderGames();
            }, 300);
        });

        // Filtres par genre
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Retirer la classe active de tous les boutons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                
                // Ajouter la classe active au bouton cliqué
                e.target.classList.add('active');
                
                this.currentFilter = e.target.dataset.filter;
                this.filterAndRenderGames();
            });
        });

        // Fermeture de modal avec Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });

        // Fermeture de modal avec le bouton X
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // Fermeture de modal en cliquant sur l'arrière-plan
        document.getElementById('gameModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('gameModal')) {
                this.closeModal();
            }
        });

        // Bouton jouer dans la modal
        document.querySelector('.play-btn').addEventListener('click', () => {
            this.playGame();
        });
    }

    filterAndRenderGames() {
        this.filteredGames = this.games.filter(game => {
            const matchesSearch = this.searchTerm === '' || 
                                game.title.toLowerCase().includes(this.searchTerm) ||
                                game.description.toLowerCase().includes(this.searchTerm) ||
                                game.genre.toLowerCase().includes(this.searchTerm);
            const matchesFilter = this.currentFilter === 'all' || game.genre === this.currentFilter;
            
            return matchesSearch && matchesFilter;
        });

        this.renderGames();
        
        // Debug pour vérifier la recherche
        console.log(`Recherche: "${this.searchTerm}", Filtre: "${this.currentFilter}", Résultats: ${this.filteredGames.length}`);
    }

    renderGames() {
        const gamesGrid = document.getElementById('gamesGrid');
        
        if (this.filteredGames.length === 0) {
            gamesGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>Aucun jeu trouvé</h3>
                    <p>Essayez de modifier vos critères de recherche</p>
                </div>
            `;
            return;
        }

        gamesGrid.innerHTML = this.filteredGames.map(game => `
            <div class="game-card" data-game-id="${game.id}" onclick="catalog.openGameModal(${game.id})">
                <div class="game-rating">
                    ${game.rating}
                    <i class="fas fa-star"></i>
                </div>
                <img src="${game.image}" alt="${game.title}" class="game-image" loading="lazy">
                <div class="game-content">
                    <h3 class="game-title">${game.title}</h3>
                    <div class="game-meta">
                        <span class="game-genre">${this.getGenreLabel(game.genre)}</span>
                        <span class="game-year">${game.year}</span>
                    </div>
                    <p class="game-description">${game.description}</p>
                </div>
            </div>
        `).join('');

        // Ajouter les animations d'apparition
        this.animateGameCards();
    }

    animateGameCards() {
        const cards = document.querySelectorAll('.game-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }

    getGenreLabel(genre) {
        const genreLabels = {
            'action': 'Action',
            'puzzle': 'Puzzle',
            'platformer': 'Plateforme',
            'shooter': 'Shooter',
            'racing': 'Course'
        };
        return genreLabels[genre] || genre;
    }

    openGameModal(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game) return;

        // Récupérer la référence à la modal
        const modal = document.getElementById('gameModal');
        
        // Remplir les données de la modal
        document.getElementById('modalGameImage').src = game.image;
        document.getElementById('modalGameImage').alt = game.title;
        document.getElementById('modalGameTitle').textContent = game.title;
        document.getElementById('modalGameGenre').textContent = this.getGenreLabel(game.genre);
        document.getElementById('modalGameYear').textContent = game.year;
        document.getElementById('modalGameRating').textContent = game.rating;
        document.getElementById('modalGameDescription').textContent = game.description;
        document.getElementById('modalGamePlayers').textContent = game.players;
        document.getElementById('modalGameDuration').textContent = game.duration;
        document.getElementById('modalGameDifficulty').textContent = game.difficulty;

        // Stocker l'ID du jeu actuel
        this.currentGameId = gameId;
        
        // Bloquer le défilement de la page de fond
        document.body.classList.add('modal-open');
        
        // Afficher la modal
        if (modal) {
            modal.style.display = 'block';
            // Forcer un reflow pour l'animation
            void modal.offsetHeight;
            // Activer l'animation
            modal.classList.add('open');
        }
    }

    closeModal() {
        const modal = document.getElementById('gameModal');
        
        // Démarrer l'animation de fermeture
        if (modal) {
            modal.classList.remove('open');
            modal.classList.add('closing');
            
            // Masquer la modal après l'animation
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('closing');
                
                // Restaurer le défilement du body
                document.body.classList.remove('modal-open');
                
                // Réinitialiser l'ID du jeu actuel
                this.currentGameId = null;
            }, 300); // Correspond à la durée de l'animation CSS
        }
    }

    playGame() {
        const game = this.games.find(g => g.id === this.currentGameId);
        if (!game) {
            this.showNotification('Jeu non trouvé', 'error');
            return;
        }

        // Vérifier que le gestionnaire de jeux est disponible
        if (!window.gameManager) {
            this.showNotification('Le gestionnaire de jeux n\'est pas encore prêt. Veuillez réessayer.', 'error');
            console.error('Erreur: gameManager non disponible');
            return;
        }

        try {
            // Fermer la modal
            this.closeModal();
            
            // Lancer le jeu
            window.gameManager.openGame(game.id, game.title);
            
            // Jouer un son de démarrage
            if (window.soundManager) {
                window.soundManager.playSound('select');
            }
        } catch (error) {
            console.error('Erreur lors du lancement du jeu:', error);
            this.showNotification('Une erreur est survenue lors du lancement du jeu', 'error');
        }
    }

    // Méthodes utilitaires manquantes
    getRandomGame() {
        if (this.games.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.games.length);
        return this.games[randomIndex];
    }

    getTopRatedGames(limit = 5) {
        return [...this.games]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }

    showNotification(message, type = 'info') {
        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Ajouter les styles si pas encore fait
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 1rem 1.5rem;
                    border-radius: 10px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    z-index: 1001;
                    animation: slideInRight 0.3s ease;
                }
                .notification-success {
                    border-left: 4px solid #4CAF50;
                    color: #4CAF50;
                }
                .notification-info {
                    border-left: 4px solid #2196F3;
                    color: #2196F3;
                }
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Retirer la notification après 3 secondes
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showLoadingSpinner(show = true) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.remove('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }

    // Méthodes utilitaires
    getGamesByGenre(genre) {
        return this.games.filter(game => game.genre === genre);
    }

    getTopRatedGames(limit = 5) {
        return [...this.games]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }

    getRandomGame() {
        const randomIndex = Math.floor(Math.random() * this.games.length);
        return this.games[randomIndex];
    }

    // Statistiques
    getStats() {
        const stats = {
            totalGames: this.games.length,
            genres: {},
            averageRating: 0,
            newestGame: null,
            oldestGame: null
        };

        // Compter les genres
        this.games.forEach(game => {
            stats.genres[game.genre] = (stats.genres[game.genre] || 0) + 1;
        });

        // Calculer la note moyenne
        const totalRating = this.games.reduce((sum, game) => sum + game.rating, 0);
        stats.averageRating = (totalRating / this.games.length).toFixed(1);

        // Trouver le jeu le plus récent et le plus ancien
        const sortedByYear = [...this.games].sort((a, b) => b.year - a.year);
        stats.newestGame = sortedByYear[0];
        stats.oldestGame = sortedByYear[sortedByYear.length - 1];

        return stats;
    }
}

// Initialiser l'application quand le DOM est chargé
function initApp() {
    // Afficher le spinner de chargement
    document.getElementById('loadingSpinner').classList.remove('hidden');
    
    // Vérifier si le gestionnaire de jeux est prêt
    const checkGameManager = () => {
        if (window.gameManager) {
            // Le gestionnaire de jeux est prêt, cacher le spinner de chargement
            document.getElementById('loadingSpinner')?.classList.add('hidden');
        } else {
            // Réessayer après un court délai
            setTimeout(checkGameManager, 100);
        }
    };
    
    // Démarrer la vérification
    checkGameManager();
}

// Initialiser l'application
const initApplication = () => {
    // Créer une seule instance du catalogue
    const catalogInstance = new ArcadeGamesCatalog();
    
    // Exposer l'instance via window.catalog et window.arcadeApp
    window.catalog = catalogInstance;
    window.arcadeApp = catalogInstance;
    
    // Initialiser l'application
    initApp();
};

// Attendre que le DOM soit chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApplication);
} else {
    // Si le DOM est déjà chargé, initialiser immédiatement
    initApplication();
}

// Fonctions utilitaires globales
window.showGameStats = () => {
    const stats = catalog.getStats();
    catalog.showNotification(`${stats.totalGames} jeux • Note moyenne: ${stats.averageRating}⭐`, 'info');
};

window.showRandomGame = () => {
    const randomGame = catalog.getRandomGame();
    catalog.openGameModal(randomGame.id);
};

// Gestion des erreurs d'images
document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
        e.target.src = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop';
        e.target.alt = 'Image non disponible';
    }
}, true);

// Service Worker pour le cache (optionnel)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
