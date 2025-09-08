// Système de thèmes sombre/clair
class ThemeSystem {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeToggle();
        this.setupEventListeners();
    }

    loadTheme() {
        return localStorage.getItem('arcade-theme') || 'light';
    }

    saveTheme(theme) {
        localStorage.setItem('arcade-theme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.saveTheme(theme);
        this.updateToggleIcon();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Animation de transition
        document.body.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);

        // Notification
        if (window.notifications) {
            const icon = newTheme === 'dark' ? '🌙' : '☀️';
            window.notifications.info(`${icon} Mode ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`);
        }
    }

    createThemeToggle() {
        const toggle = document.createElement('button');
        toggle.id = 'theme-toggle';
        toggle.className = 'theme-toggle';
        toggle.setAttribute('aria-label', 'Changer de thème');
        toggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
        
        // Styles du toggle
        toggle.style.cssText = `
            position: fixed;
            top: 20px;
            right: 80px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: none;
            background: var(--toggle-bg, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
            color: white;
            font-size: 20px;
            cursor: pointer;
            z-index: 1000;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        document.body.appendChild(toggle);
        
        toggle.addEventListener('click', () => this.toggleTheme());
        toggle.addEventListener('mouseenter', () => {
            toggle.style.transform = 'scale(1.1)';
        });
        toggle.addEventListener('mouseleave', () => {
            toggle.style.transform = 'scale(1)';
        });
    }

    updateToggleIcon() {
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    setupEventListeners() {
        // Raccourci clavier Ctrl+Shift+T
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.code === 'KeyT') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    // Méthode pour obtenir les couleurs du thème actuel
    getThemeColors() {
        const colors = {
            light: {
                primary: '#667eea',
                secondary: '#764ba2',
                background: '#ffffff',
                surface: '#f8f9fa',
                text: '#333333',
                textSecondary: '#666666'
            },
            dark: {
                primary: '#8b9dc3',
                secondary: '#9575cd',
                background: '#121212',
                surface: '#1e1e1e',
                text: '#ffffff',
                textSecondary: '#b0b0b0'
            }
        };
        return colors[this.currentTheme];
    }
}

// Instance globale
window.themeSystem = new ThemeSystem();
