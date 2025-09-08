// Système de galerie de screenshots automatiques
class ScreenshotSystem {
    constructor() {
        this.screenshots = this.loadScreenshots();
        this.autoCapture = true;
        this.captureInterval = null;
        this.lastCaptureTime = 0;
        this.captureDelay = 5000; // 5 secondes entre les captures automatiques
        this.init();
    }

    init() {
        this.createScreenshotInterface();
        this.setupEventListeners();
        this.startAutoCapture();
    }

    loadScreenshots() {
        try {
            const saved = localStorage.getItem('arcade_screenshots');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveScreenshots() {
        try {
            // Limiter à 100 screenshots pour éviter de surcharger le localStorage
            const limited = this.screenshots.slice(-100);
            localStorage.setItem('arcade_screenshots', JSON.stringify(limited));
            this.screenshots = limited;
        } catch (e) {
            console.warn('Impossible de sauvegarder les screenshots:', e);
            // Si le localStorage est plein, supprimer les plus anciens
            this.screenshots = this.screenshots.slice(-50);
            try {
                localStorage.setItem('arcade_screenshots', JSON.stringify(this.screenshots));
            } catch (e2) {
                console.error('Erreur critique de stockage:', e2);
            }
        }
    }

    captureScreenshot(gameId, gameName, manual = false) {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.warn('Canvas de jeu non trouvé pour la capture');
            return null;
        }

        try {
            const dataURL = canvas.toDataURL('image/png');
            const screenshot = {
                id: Date.now(),
                gameId: gameId || this.currentGameId || 'unknown',
                gameName: gameName || this.currentGameName || 'Jeu inconnu',
                timestamp: Date.now(),
                dataURL: dataURL,
                manual: manual,
                size: dataURL.length
            };

            this.screenshots.push(screenshot);
            this.saveScreenshots();

            if (manual && window.notifications) {
                window.notifications.success('📷 Screenshot capturé!');
            }

            return screenshot;
        } catch (error) {
            console.error('Erreur lors de la capture:', error);
            if (manual && window.notifications) {
                window.notifications.error('Erreur lors de la capture');
            }
            return null;
        }
    }

    startAutoCapture() {
        if (this.captureInterval) {
            clearInterval(this.captureInterval);
        }

        this.captureInterval = setInterval(() => {
            if (this.autoCapture && this.currentGameId) {
                
                const now = Date.now();
                if (now - this.lastCaptureTime >= this.captureFrequency) {
                    this.captureScreenshot(
                        this.currentGameId,
                        this.currentGameName,
                        false
                    );
                    this.lastCaptureTime = now;
                }
            }
        }, 5000); // Vérifier toutes les 5 secondes pour réduire la charge CPU
    }

    createScreenshotInterface() {
        // Bouton principal de galerie
        const galleryButton = document.createElement('button');
        galleryButton.id = 'gallery-toggle';
        galleryButton.innerHTML = '📸';
        galleryButton.title = 'Galerie de screenshots';
        galleryButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 440px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%);
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(155, 89, 182, 0.3);
        `;

        document.body.appendChild(galleryButton);
        galleryButton.addEventListener('click', () => this.showGalleryDialog());

        // Ajouter le bouton de capture manuelle aux contrôles de jeu
        this.addCaptureButton();
    }

    addCaptureButton() {
        const style = document.createElement('style');
        style.textContent = `
            .capture-btn {
                background: #9b59b6;
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
            .capture-btn:hover {
                background: #8e44ad;
                transform: scale(1.1);
            }
            .capture-btn:active {
                transform: scale(0.95);
                animation: flash 0.3s ease;
            }
            @keyframes flash {
                0% { background: #9b59b6; }
                50% { background: #ffffff; }
                100% { background: #9b59b6; }
            }
        `;
        document.head.appendChild(style);
    }

    showGalleryDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'gallery-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;

        dialog.innerHTML = `
            <div style="background: var(--surface-color); padding: 2rem; border-radius: 15px; 
                        max-width: 1200px; width: 95%; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--text-color); margin: 0;">📸 Galerie de Screenshots</h3>
                    <button onclick="document.getElementById('gallery-dialog').remove()" 
                            style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color);">×</button>
                </div>
                
                <div style="display: flex; gap: 1rem; align-items: center; flex-wrap: wrap; margin-bottom: 1.5rem;">
                    <button onclick="window.screenshotSystem.toggleAutoCapture()" 
                            style="padding: 0.5rem 1rem; background: ${this.autoCapture ? '#27ae60' : '#95a5a6'}; color: white; 
                                   border: none; border-radius: 8px; cursor: pointer;">
                        ${this.autoCapture ? '🟢 Auto ON' : '🔴 Auto OFF'}
                    </button>
                    <button onclick="window.screenshotSystem.manualCapture()" 
                            style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; 
                                   border: none; border-radius: 8px; cursor: pointer;">
                        📸 Capturer maintenant
                    </button>
                    <button onclick="window.screenshotSystem.deleteAllScreenshots()" 
                            style="padding: 0.5rem 1rem; background: #e74c3c; color: white; 
                                   border: none; border-radius: 8px; cursor: pointer;">
                        🗑️ Tout supprimer
                    </button>
                    <button onclick="window.screenshotSystem.downloadAll()" 
                            style="padding: 0.5rem 1rem; background: #f39c12; color: white; 
                                   border: none; border-radius: 8px; cursor: pointer;">
                        📥 Télécharger tout
                    </button>
                    <span style="color: var(--text-secondary); font-size: 0.9rem;">
                        ${this.screenshots.length} screenshots • ${this.getTotalSize()}
                    </span>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                    <select id="game-filter" onchange="window.screenshotSystem.filterGallery()" 
                            style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--surface-color); color: var(--text-color);">
                        <option value="">Tous les jeux</option>
                        ${this.getGameOptions()}
                    </select>
                    <select id="sort-filter" onchange="window.screenshotSystem.filterGallery()" 
                            style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 8px; background: var(--surface-color); color: var(--text-color);">
                        <option value="newest">Plus récent</option>
                        <option value="oldest">Plus ancien</option>
                        <option value="game">Par jeu</option>
                        <option value="manual">Manuels d'abord</option>
                    </select>
                </div>
                
                <div id="screenshots-grid">
                    ${this.renderScreenshotsGrid()}
                </div>
            </div>
        `;

        document.body.appendChild(dialog);
    }

    getGameOptions() {
        const games = [...new Set(this.screenshots.map(s => s.gameName))];
        return games.map(game => `<option value="${game}">${game}</option>`).join('');
    }

    getTotalSize() {
        const totalBytes = this.screenshots.reduce((sum, s) => sum + (s.size || 0), 0);
        if (totalBytes < 1024 * 1024) {
            return Math.round(totalBytes / 1024) + ' KB';
        }
        return Math.round(totalBytes / (1024 * 1024)) + ' MB';
    }

    renderScreenshotsGrid(filtered = null) {
        const screenshots = filtered || this.screenshots;
        
        if (screenshots.length === 0) {
            return `
                <div style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📸</div>
                    <p>Aucun screenshot</p>
                    <p style="font-size: 0.9rem;">Lancez un jeu pour commencer la capture automatique!</p>
                </div>
            `;
        }

        return `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                ${screenshots.map(screenshot => `
                    <div style="background: var(--border-color); border-radius: 10px; overflow: hidden; position: relative;">
                        <img src="${screenshot.dataURL}" 
                             style="width: 100%; height: 150px; object-fit: cover; cursor: pointer;"
                             onclick="window.screenshotSystem.viewFullscreen('${screenshot.id}')"
                             alt="Screenshot ${screenshot.gameName}">
                        <div style="padding: 0.75rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <h4 style="color: var(--text-color); margin: 0; font-size: 0.9rem;">${screenshot.gameName}</h4>
                                <span style="background: ${screenshot.manual ? '#f39c12' : '#95a5a6'}; color: white; 
                                           padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.7rem;">
                                    ${screenshot.manual ? '📸 Manuel' : '🤖 Auto'}
                                </span>
                            </div>
                            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 0.5rem;">
                                ${new Date(screenshot.timestamp).toLocaleString('fr-FR')}
                            </div>
                            <div style="display: flex; gap: 0.5rem;">
                                <button onclick="window.screenshotSystem.downloadScreenshot('${screenshot.id}')" 
                                        style="flex: 1; padding: 0.4rem; background: var(--primary-color); color: white; 
                                               border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">
                                    📥 Télécharger
                                </button>
                                <button onclick="window.screenshotSystem.deleteScreenshot('${screenshot.id}')" 
                                        style="padding: 0.4rem 0.6rem; background: #e74c3c; color: white; 
                                               border: none; border-radius: 6px; cursor: pointer; font-size: 0.8rem;">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    filterGallery() {
        const gameFilter = document.getElementById('game-filter')?.value || '';
        const sortFilter = document.getElementById('sort-filter')?.value || 'newest';
        
        let filtered = [...this.screenshots];
        
        // Filtrer par jeu
        if (gameFilter) {
            filtered = filtered.filter(s => s.gameName === gameFilter);
        }
        
        // Trier
        switch (sortFilter) {
            case 'oldest':
                filtered.sort((a, b) => a.timestamp - b.timestamp);
                break;
            case 'game':
                filtered.sort((a, b) => a.gameName.localeCompare(b.gameName));
                break;
            case 'manual':
                filtered.sort((a, b) => (b.manual ? 1 : 0) - (a.manual ? 1 : 0));
                break;
            default: // newest
                filtered.sort((a, b) => b.timestamp - a.timestamp);
        }
        
        const grid = document.getElementById('screenshots-grid');
        if (grid) {
            grid.innerHTML = this.renderScreenshotsGrid(filtered);
        }
    }

    viewFullscreen(screenshotId) {
        const screenshot = this.screenshots.find(s => s.id == screenshotId);
        if (!screenshot) return;

        const fullscreenDiv = document.createElement('div');
        fullscreenDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 20000;
            cursor: pointer;
        `;

        fullscreenDiv.innerHTML = `
            <img src="${screenshot.dataURL}" 
                 style="max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 10px;">
            <div style="position: absolute; top: 20px; right: 20px; color: white; font-size: 24px; cursor: pointer;">×</div>
            <div style="position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); 
                        color: white; text-align: center; background: rgba(0,0,0,0.7); padding: 1rem; border-radius: 10px;">
                <div style="font-weight: bold; margin-bottom: 0.5rem;">${screenshot.gameName}</div>
                <div style="font-size: 0.9rem;">${new Date(screenshot.timestamp).toLocaleString('fr-FR')}</div>
            </div>
        `;

        fullscreenDiv.addEventListener('click', () => {
            document.body.removeChild(fullscreenDiv);
        });

        document.body.appendChild(fullscreenDiv);
    }

    downloadScreenshot(screenshotId) {
        const screenshot = this.screenshots.find(s => s.id === screenshotId);
        if (!screenshot) {
            console.warn('Screenshot non trouvé pour téléchargement:', screenshotId);
            return;
        }
        
        try {
            const link = document.createElement('a');
            link.href = screenshot.dataURL;
            link.download = `screenshot_${screenshot.gameName}_${new Date(screenshot.timestamp).toISOString().split('T')[0]}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            if (window.notifications) {
                window.notifications.success('💾 Screenshot téléchargé');
            }
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            if (window.notifications) {
                window.notifications.error('Erreur lors du téléchargement');
            }
        }
    }

    downloadAll() {
        if (this.screenshots.length === 0) {
            if (window.notifications) {
                window.notifications.error('❌ Aucun screenshot à télécharger');
            }
            return;
        }

        // Créer un zip virtuel avec JSZip serait idéal, mais pour simplifier on télécharge un par un
        this.screenshots.forEach((screenshot, index) => {
            setTimeout(() => {
                this.downloadScreenshot(screenshot.id);
            }, index * 500); // Délai pour éviter de surcharger le navigateur
        });

        if (window.notifications) {
            window.notifications.success(`📥 Téléchargement de ${this.screenshots.length} screenshots démarré!`);
        }
    }

    deleteScreenshot(screenshotId) {
        if (!screenshotId) {
            console.warn('ID de screenshot manquant pour la suppression');
            return;
        }
        
        const initialLength = this.screenshots.length;
        this.screenshots = this.screenshots.filter(s => s.id !== screenshotId);
        
        if (this.screenshots.length < initialLength) {
            this.saveScreenshots();
            this.updateGalleryDisplay();
            
            if (window.notifications) {
                window.notifications.info('🗑️ Screenshot supprimé');
            }
        } else {
            console.warn('Screenshot non trouvé pour suppression:', screenshotId);
        }
    }

    deleteAllScreenshots() {
        if (this.screenshots.length === 0) {
            if (window.notifications) {
                window.notifications.info('Aucun screenshot à supprimer');
            }
            return;
        }
        
        if (confirm('Supprimer tous les screenshots? Cette action est irréversible.')) {
            this.screenshots = [];
            this.saveScreenshots();
            this.updateGalleryDisplay();
            
            if (window.notifications) {
                window.notifications.info('🗑️ Tous les screenshots supprimés');
            }
        }
    }

    toggleAutoCapture() {
        this.autoCapture = !this.autoCapture;
        
        const button = event.target;
        if (button) {
            button.style.background = this.autoCapture ? '#27ae60' : '#95a5a6';
            button.textContent = this.autoCapture ? '🟢 Auto ON' : '🔴 Auto OFF';
        }
        
        if (window.notifications) {
            window.notifications.info(`📸 Capture automatique ${this.autoCapture ? 'activée' : 'désactivée'}`);
        }
    }

    manualCapture() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            if (window.notifications) {
                window.notifications.warning('Aucun jeu en cours pour la capture');
            }
            return;
        }
        
        this.captureScreenshot(this.currentGameId, this.currentGameName, true);
    }

    setupEventListeners() {
        // Écouter les événements de jeu
        document.addEventListener('gameStarted', (e) => {
            if (e.detail) {
                this.currentGameId = e.detail.gameId;
                this.currentGameName = e.detail.gameName;
            }
        });

        // Capture manuelle avec raccourci clavier
        document.addEventListener('keydown', (e) => {
            if (e.code === 'F12' && window.gameManager?.currentGame) {
                e.preventDefault();
                this.captureManual();
            }
        });
    }
}

// Instance globale
window.screenshotSystem = new ScreenshotSystem();
