// Gestionnaire d'effets visuels
window.VisualEffects = class VisualEffects {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.effects = [];
        this.nextId = 0;
        this.init();
    }

    init() {
        // Créer un canevas pour les effets visuels
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'visual-effects-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Démarrer la boucle d'animation
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Créer un effet de particules
    createParticles(x, y, options = {}) {
        const {
            count = 20,
            color = '#ffffff',
            minSpeed = 1,
            maxSpeed = 5,
            size = 3,
            life = 1.5,
            spread = 360,
            gravity = 0.2,
            fade = true,
            onComplete = null
        } = options;

        const particles = [];
        const id = this.nextId++;

        for (let i = 0; i < count; i++) {
            const angle = (Math.random() * spread * Math.PI) / 180;
            const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
            
            particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: size * (0.5 + Math.random() * 0.5),
                life: life * (0.8 + Math.random() * 0.4),
                maxLife: life,
                color,
                gravity,
                fade
            });
        }

        this.effects.push({
            id,
            type: 'particles',
            particles,
            onComplete
        });

        return id;
    }

    // Créer un effet de texte flottant
    createText(text, x, y, options = {}) {
        const {
            color = '#ffffff',
            size = 24,
            life = 1.5,
            velocity = { x: 0, y: -1 },
            fade = true,
            onComplete = null
        } = options;

        const id = this.nextId++;

        this.effects.push({
            id,
            type: 'text',
            text,
            x,
            y,
            vx: velocity.x,
            vy: velocity.y,
            size,
            color,
            life,
            maxLife: life,
            fade,
            onComplete
        });

        return id;
    }

    // Mettre à jour un effet
    updateEffect(effect, dt) {
        effect.life -= dt;
        
        if (effect.life <= 0) {
            if (effect.onComplete) effect.onComplete();
            return false;
        }
        
        if (effect.type === 'particles') {
            this.updateParticles(effect, dt);
        } else if (effect.type === 'text') {
            this.updateText(effect, dt);
        }
        
        return true;
    }

    updateParticles(effect, dt) {
        effect.particles = effect.particles.filter(particle => {
            // Mettre à jour la position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            
            // Mettre à jour la durée de vie
            particle.life -= dt;
            
            // Supprimer les particules mortes
            return particle.life > 0;
        });
        
        // Si toutes les particules sont mortes, supprimer l'effet
        if (effect.particles.length === 0) {
            if (effect.onComplete) effect.onComplete();
            return false;
        }
        
        return true;
    }

    updateText(effect, dt) {
        // Mettre à jour la position
        effect.x += effect.vx;
        effect.y += effect.vy;
        
        // Ralentir progressivement
        effect.vx *= 0.98;
        effect.vy *= 0.98;
        
        return true;
    }

    // Dessiner un effet
    drawEffect(effect) {
        if (effect.type === 'particles') {
            this.drawParticles(effect);
        } else if (effect.type === 'text') {
            this.drawText(effect);
        }
    }

    drawParticles(effect) {
        effect.particles.forEach(particle => {
            const alpha = particle.fade ? particle.life / particle.maxLife : 1;
            
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = alpha;
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }

    drawText(effect) {
        const alpha = effect.fade ? effect.life / effect.maxLife : 1;
        
        this.ctx.font = `bold ${effect.size}px Arial`;
        this.ctx.fillStyle = effect.color;
        this.ctx.globalAlpha = alpha;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Ombre portée pour une meilleure lisibilité
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.fillText(effect.text, effect.x, effect.y);
        
        // Réinitialiser les styles
        this.ctx.shadowColor = 'transparent';
        this.ctx.globalAlpha = 1;
    }

    // Supprimer un effet par son ID
    removeEffect(id) {
        this.effects = this.effects.filter(effect => effect.id !== id);
    }

    // Supprimer tous les effets
    clearEffects() {
        this.effects = [];
    }

    // Boucle d'animation
    animate() {
        // Effacer le canevas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Mettre à jour et dessiner chaque effet
        this.effects = this.effects.filter(effect => {
            // Mettre à jour l'effet
            const isAlive = this.updateEffect(effect, 1/60); // 60 FPS
            
            // Dessiner l'effet s'il est toujours en vie
            if (isAlive) {
                this.drawEffect(effect);
                return true;
            }
            
            return false;
        });
        
        // Continuer l'animation
        requestAnimationFrame(() => this.animate());
    }
}

// Créer une instance globale
window.visualEffects = new VisualEffects();

// Exemples d'utilisation :
/*
// Créer des particules à la position de la souris
document.addEventListener('click', (e) => {
    visualEffects.createParticles(e.clientX, e.clientY, {
        count: 30,
        color: '#ff3366',
        size: 4,
        speed: 2,
        spread: 180,
        gravity: 0.2
    });
});

// Afficher du texte flottant
visualEffects.createText('+100', 100, 100, {
    color: '#00ff00',
    size: 32,
    velocity: { x: 0, y: -2 },
    life: 2
});
*/
