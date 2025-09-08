// Gestionnaire de sons pour les jeux
window.SoundManager = class SoundManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.isMuted = false;
        this.volume = 0.5;
        this.musicVolume = 0.3;
        this.initialize();
    }

    initialize() {
        // Chargement des sons de base
        this.loadSound('click', 'sounds/click.wav');
        this.loadSound('gameOver', 'sounds/game-over.wav');
        this.loadSound('point', 'sounds/point.wav');
        this.loadSound('powerup', 'sounds/powerup.wav');
        this.loadSound('select', 'sounds/select.wav');
        
        // Chargement de la musique de fond
        this.loadMusic('background', 'sounds/background-music.mp3');
        
        // Récupération des préférences de volume
        this.loadPreferences();
    }

    loadSound(name, src) {
        this.sounds[name] = new Audio(src);
        this.sounds[name].volume = this.volume;
    }

    loadMusic(name, src) {
        this.music = new Audio(src);
        this.music.loop = true;
        this.music.volume = this.musicVolume;
    }

    playSound(name) {
        if (this.isMuted) return;
        
        const sound = this.sounds[name];
        if (sound) {
            sound.currentTime = 0; // Permet de rejouer le son même s'il est déjà en cours
            sound.volume = this.volume;
            sound.play().catch(e => console.warn(`Impossible de jouer le son ${name}:`, e));
        }
    }

    playMusic() {
        if (this.isMuted || !this.music) return;
        
        this.music.volume = this.musicVolume;
        this.music.play().catch(e => console.warn('Impossible de jouer la musique:', e));
    }

    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.music) {
            this.music.muted = this.isMuted;
        }
        this.savePreferences();
        return this.isMuted;
    }

    setVolume(volume) {
        this.volume = Math.min(1, Math.max(0, volume));
        if (this.music) {
            this.music.volume = this.musicVolume * this.volume;
        }
        this.savePreferences();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.min(1, Math.max(0, volume));
        if (this.music) {
            this.music.volume = this.musicVolume * (this.isMuted ? 0 : 1);
        }
        this.savePreferences();
    }

    savePreferences() {
        localStorage.setItem('soundPreferences', JSON.stringify({
            volume: this.volume,
            musicVolume: this.musicVolume,
            isMuted: this.isMuted
        }));
    }

    loadPreferences() {
        const saved = localStorage.getItem('soundPreferences');
        if (saved) {
            try {
                const { volume, musicVolume, isMuted } = JSON.parse(saved);
                this.volume = volume || this.volume;
                this.musicVolume = musicVolume || this.musicVolume;
                this.isMuted = isMuted || false;
                
                if (this.music) {
                    this.music.volume = this.musicVolume * (this.isMuted ? 0 : 1);
                }
            } catch (e) {
                console.warn('Erreur lors du chargement des préférences sonores:', e);
            }
        }
    }
}

// Création d'une instance globale
window.soundManager = new SoundManager();

// Pour une utilisation facile dans les jeux
// Exemple : 
// import { soundManager } from '../utils/sound-manager.js';
// soundManager.playSound('point');
// soundManager.playMusic();
