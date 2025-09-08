window.SplashScreen = class SplashScreen {
    constructor() {
        this.element = null;
        this.progressBar = null;
        this.loadingText = null;
        this.startButton = null;
        this.progress = 0;
        this.loadingPhrases = [
            "Chargement des jeux...",
            "Préparation de l'arcade...",
            "Chargement des graphismes...",
            "Presque terminé..."
        ];
        this.init();
    }

    init() {
        this.createSplashScreen();
        this.simulateLoading();
    }

    createSplashScreen() {
        // Créer l'élément de l'écran de démarrage
        this.element = document.createElement('div');
        this.element.className = 'splash-screen';
        
        // Contenu de l'écran de démarrage
        this.element.innerHTML = `
            <div class="splash-content">
                <div class="splash-logo">
                    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="100" cy="100" r="90" fill="#00D1B2"/>
                        <path d="M60 100C60 78.9543 77.1634 62 98.5 62C119.837 62 137 78.9543 137 100C137 121.046 119.837 138 98.5 138C77.1634 138 60 121.046 60 100Z" fill="#1A1A2E"/>
                        <path d="M98.5 75C86.5066 75 76.75 86.3726 76.75 100C76.75 113.627 86.5066 125 98.5 125C110.493 125 120.25 113.627 120.25 100C120.25 86.3726 110.493 75 98.5 75Z" fill="white"/>
                        <path d="M98.5 90C104.299 90 109 94.4772 109 100C109 105.523 104.299 110 98.5 110C92.701 110 88 105.523 88 100C88 94.4772 92.701 90 98.5 90Z" fill="#1A1A2E"/>
                    </svg>
                </div>
                <h1 class="splash-title">ArcadeJS</h1>
                <p class="splash-subtitle">Rétrogaming à son meilleur</p>
                <div class="splash-progress">
                    <div class="splash-progress-bar"></div>
                </div>
                <p class="splash-loading">Chargement en cours...</p>
                <button class="splash-start-btn">Commencer</button>
                <div class="splash-version">v1.0.0</div>
            </div>
        `;

        // Ajouter au body
        document.body.appendChild(this.element);
        
        // Récupérer les éléments
        this.progressBar = this.element.querySelector('.splash-progress-bar');
        this.loadingText = this.element.querySelector('.splash-loading');
        this.startButton = this.element.querySelector('.splash-start-btn');
        
        // Ajouter l'événement au bouton
        this.startButton.addEventListener('click', () => this.hide());
    }

    simulateLoading() {
        let currentPhase = 0;
        const totalPhases = 4;
        const phaseDuration = 1000; // ms
        
        const updatePhase = () => {
            if (currentPhase < totalPhases) {
                // Mettre à jour le texte de chargement
                this.loadingText.textContent = this.loadingPhrases[currentPhase];
                
                // Mettre à jour la barre de progression
                this.progress = ((currentPhase + 1) / totalPhases) * 100;
                this.updateProgress(this.progress);
                
                currentPhase++;
                setTimeout(updatePhase, phaseDuration);
            } else {
                // Chargement terminé, afficher le bouton
                this.loadingText.textContent = "Prêt à jouer !";
                this.startButton.style.display = 'block';
            }
        };
        
        // Démarrer la simulation de chargement
        updatePhase();
    }

    updateProgress(percent) {
        this.progressBar.style.width = `${percent}%`;
    }

    hide() {
        // Jouer le son de clic
        if (window.soundManager) {
            window.soundManager.playSound('click');
        }
        
        // Cacher l'écran de démarrage
        this.element.classList.add('hidden');
        
        // Supprimer l'élément après l'animation
        setTimeout(() => {
            this.element.remove();
            
            // Déclencher un événement personnalisé lorsque l'écran de démarrage est masqué
            const event = new CustomEvent('splashScreenHidden');
            document.dispatchEvent(event);
        }, 500);
    }
}

// Démarrer automatiquement l'écran de démarrage lorsque le DOM est chargé
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.splashScreen = new SplashScreen();
    });
} else {
    window.splashScreen = new SplashScreen();
}
