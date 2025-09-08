// Système de contrôles personnalisables
class ControlsSystem {
    constructor() {
        this.defaultControls = {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight',
            action: 'Space',
            action2: 'KeyG',
            pause: 'KeyP',
            restart: 'KeyR'
        };
        this.customControls = this.loadControls();
        this.isRecording = false;
        this.recordingKey = null;
        this.init();
    }

    init() {
        this.createControlsInterface();
        this.setupEventListeners();
    }

    loadControls() {
        try {
            const saved = localStorage.getItem('arcade_controls');
            return saved ? { ...this.defaultControls, ...JSON.parse(saved) } : { ...this.defaultControls };
        } catch (e) {
            return { ...this.defaultControls };
        }
    }

    saveControls() {
        localStorage.setItem('arcade_controls', JSON.stringify(this.customControls));
    }

    createControlsInterface() {
        const button = document.createElement('button');
        button.id = 'controls-toggle';
        button.innerHTML = '⌨️';
        button.title = 'Personnaliser les contrôles';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 260px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #9c27b0 0%, #673ab7 100%);
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
        `;

        document.body.appendChild(button);
        button.addEventListener('click', () => this.showControlsDialog());
    }

    showControlsDialog() {
        const dialog = document.createElement('div');
        dialog.id = 'controls-dialog';
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
                        max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="color: var(--text-color); margin: 0;">⌨️ Configuration des Contrôles</h3>
                    <button onclick="document.getElementById('controls-dialog').remove()" 
                            style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-color);">×</button>
                </div>
                
                <div style="margin-bottom: 1.5rem;">
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">
                        Cliquez sur un bouton pour redéfinir la touche correspondante.
                    </p>
                    
                    <div class="controls-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        ${Object.entries(this.customControls).map(([action, key]) => `
                            <div class="control-item" style="display: flex; justify-content: space-between; align-items: center; 
                                                           padding: 1rem; background: var(--border-color); border-radius: 10px;">
                                <span style="color: var(--text-color); font-weight: bold;">
                                    ${this.getActionLabel(action)}
                                </span>
                                <button class="key-button" data-action="${action}" 
                                        style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; 
                                               border: none; border-radius: 5px; cursor: pointer; min-width: 80px;">
                                    ${this.getKeyLabel(key)}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="window.controlsSystem.resetControls()" 
                            style="padding: 1rem 2rem; background: #e74c3c; color: white; 
                                   border: none; border-radius: 10px; cursor: pointer;">
                        🔄 Réinitialiser
                    </button>
                    <button onclick="window.controlsSystem.testControls()" 
                            style="padding: 1rem 2rem; background: var(--secondary-color); color: white; 
                                   border: none; border-radius: 10px; cursor: pointer;">
                        🎮 Tester
                    </button>
                </div>
                
                ${this.isRecording ? `
                    <div id="recording-indicator" style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                                                        background: #ff9800; color: white; padding: 1rem 2rem; 
                                                        border-radius: 10px; z-index: 10001; text-align: center;">
                        <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">🎯 Enregistrement en cours</div>
                        <div>Appuyez sur une touche pour "${this.getActionLabel(this.recordingKey)}"</div>
                        <div style="font-size: 0.8rem; margin-top: 0.5rem;">Échap pour annuler</div>
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(dialog);
        this.setupDialogEventListeners();
    }

    setupDialogEventListeners() {
        const keyButtons = document.querySelectorAll('.key-button');
        keyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-action');
                this.startRecording(action);
            });
        });
    }

    startRecording(action) {
        this.isRecording = true;
        this.recordingKey = action;
        
        // Mettre à jour l'affichage
        const dialog = document.getElementById('controls-dialog');
        if (dialog) {
            dialog.innerHTML = dialog.innerHTML; // Force refresh
            this.showControlsDialog();
        }
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (this.isRecording) {
                e.preventDefault();
                
                if (e.code === 'Escape') {
                    this.cancelRecording();
                    return;
                }
                
                this.recordKey(e.code);
            }
        });
    }

    recordKey(keyCode) {
        if (!this.recordingKey) return;
        
        // Vérifier si la touche n'est pas déjà utilisée
        const existingAction = Object.entries(this.customControls).find(([action, key]) => 
            key === keyCode && action !== this.recordingKey
        );
        
        if (existingAction) {
            if (window.notifications) {
                window.notifications.warning(`⚠️ Touche déjà utilisée pour "${this.getActionLabel(existingAction[0])}"`);
            }
            this.cancelRecording();
            return;
        }
        
        this.customControls[this.recordingKey] = keyCode;
        this.saveControls();
        
        if (window.notifications) {
            window.notifications.success(`✅ ${this.getActionLabel(this.recordingKey)} → ${this.getKeyLabel(keyCode)}`);
        }
        
        this.cancelRecording();
        this.refreshControlsDialog();
    }

    cancelRecording() {
        this.isRecording = false;
        this.recordingKey = null;
        this.refreshControlsDialog();
    }

    refreshControlsDialog() {
        const dialog = document.getElementById('controls-dialog');
        if (dialog) {
            dialog.remove();
            this.showControlsDialog();
        }
    }

    resetControls() {
        this.customControls = { ...this.defaultControls };
        this.saveControls();
        
        if (window.notifications) {
            window.notifications.info('🔄 Contrôles réinitialisés');
        }
        
        this.refreshControlsDialog();
    }

    testControls() {
        const testDialog = document.createElement('div');
        testDialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--surface-color);
            padding: 2rem;
            border-radius: 15px;
            z-index: 10002;
            text-align: center;
            border: 2px solid var(--primary-color);
        `;
        
        testDialog.innerHTML = `
            <h3 style="color: var(--text-color); margin-bottom: 1rem;">🎮 Test des Contrôles</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1rem;">Appuyez sur vos touches pour les tester</p>
            <div id="test-display" style="font-size: 2rem; margin: 1rem 0; min-height: 60px; 
                                         display: flex; align-items: center; justify-content: center;
                                         background: var(--border-color); border-radius: 10px; color: var(--text-color);">
                Appuyez sur une touche...
            </div>
            <button onclick="this.parentElement.remove()" 
                    style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; 
                           border: none; border-radius: 5px; cursor: pointer;">
                Fermer
            </button>
        `;
        
        document.body.appendChild(testDialog);
        
        const testHandler = (e) => {
            const display = document.getElementById('test-display');
            if (display) {
                const action = Object.entries(this.customControls).find(([_, key]) => key === e.code);
                if (action) {
                    display.textContent = `${this.getActionLabel(action[0])} (${this.getKeyLabel(e.code)})`;
                    display.style.background = 'var(--primary-color)';
                    display.style.color = 'white';
                    
                    setTimeout(() => {
                        if (display) {
                            display.style.background = 'var(--border-color)';
                            display.style.color = 'var(--text-color)';
                        }
                    }, 200);
                } else {
                    display.textContent = `Touche non assignée (${this.getKeyLabel(e.code)})`;
                }
            }
        };
        
        document.addEventListener('keydown', testHandler);
        
        // Nettoyer l'event listener quand le dialog est fermé
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.removedNodes.forEach((node) => {
                    if (node === testDialog) {
                        document.removeEventListener('keydown', testHandler);
                        observer.disconnect();
                    }
                });
            });
        });
        
        observer.observe(document.body, { childList: true });
    }

    getActionLabel(action) {
        const labels = {
            up: '⬆️ Haut',
            down: '⬇️ Bas',
            left: '⬅️ Gauche',
            right: '➡️ Droite',
            action: '🔥 Action',
            action2: '⚡ Action 2',
            pause: '⏸️ Pause',
            restart: '🔄 Restart'
        };
        return labels[action] || action;
    }

    getKeyLabel(keyCode) {
        const labels = {
            'ArrowUp': '↑',
            'ArrowDown': '↓',
            'ArrowLeft': '←',
            'ArrowRight': '→',
            'Space': 'Espace',
            'Enter': 'Entrée',
            'Escape': 'Échap',
            'ShiftLeft': 'Shift G',
            'ShiftRight': 'Shift D',
            'ControlLeft': 'Ctrl G',
            'ControlRight': 'Ctrl D'
        };
        
        if (labels[keyCode]) return labels[keyCode];
        if (keyCode.startsWith('Key')) return keyCode.replace('Key', '');
        if (keyCode.startsWith('Digit')) return keyCode.replace('Digit', '');
        return keyCode;
    }

    // Méthode pour vérifier si une touche correspond à une action
    isKeyPressed(action, pressedKeys) {
        const keyCode = this.customControls[action];
        return pressedKeys[keyCode] || false;
    }

    // Méthode pour obtenir le code de touche d'une action
    getKeyCode(action) {
        return this.customControls[action];
    }

    // Exporter la configuration
    exportControls() {
        const data = {
            controls: this.customControls,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'arcade_controls.json';
        a.click();
        
        URL.revokeObjectURL(url);
        
        if (window.notifications) {
            window.notifications.success('📤 Configuration exportée!');
        }
    }
}

// Instance globale
window.controlsSystem = new ControlsSystem();
