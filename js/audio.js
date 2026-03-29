class AudioManager {
    isMuted = false;
    activeSounds = [];
    queuedPlays = {};
    sounds = {
        "character.land": { src: "assets/sounds/characterLanding.mp3", volume: 0.25 },
        "character.hurt": { src: "assets/sounds/characterHurt.mp3", volume: 0.15 },
        "character.running": { src: "assets/sounds/characterRunning.mp3", volume: 0.2 },
        "character.snore": { src: "assets/sounds/characterSnore.mp3", volume: 0.1 },
        "collect.coin": { src: "assets/sounds/collectCoin.mp3", volume: 0.25 },
        "collect.bottle": { src: "assets/sounds/collectBottle.mp3", volume: 0.22 },
        "game.soundtrack": { src: "assets/sounds/gameSoundtrack.mp3", volume: 0.02 },
        "game.win": { src: "assets/sounds/winSound.mp3", volume: 0.6 },
        "game.lose": { src: "assets/sounds/loseSound.mp3", volume: 0.4 },
        "enemy.chicken.hit": { src: "assets/sounds/chickenHit.mp3", volume: 0.08 },
        "enemy.endboss.hit": { src: "assets/sounds/chickenHit.mp3", volume: 0.1 },
        "enemy.endboss.attack": { src: "assets/sounds/chickenAttack.mp3", volume: 0.18 },
        "enemy.endboss.move": { src: "assets/sounds/endboss.mp3", volume: 0.2 },
        "enemy.chicken.walk": { src: "assets/sounds/chicken.mp3", volume: 0.55 },
        "enemy.chicken_small.walk": { src: "assets/sounds/chicken_small.mp3", volume: 0.25 },
        "bottle.break": { src: "assets/sounds/bottleBreak.mp3", volume: 0.3 }
    };

    /**
     * Plays a sound by key.
     * @param {string} key
     * @param {{volumeMultiplier?: number, playbackRate?: number, queueIfPlaying?: boolean, maxQueue?: number}} [options]
     * @returns {void}
     */
    play(key, options = {}) {
        if (this.isMuted) return;
        const alreadyPlaying = this.activeSounds.some((entry) => entry.key === key);
        if (alreadyPlaying) {
            if (options.queueIfPlaying) {
                const currentQueue = this.queuedPlays[key] || 0;
                const maxQueue = Math.max(0, options.maxQueue ?? Infinity);
                this.queuedPlays[key] = Math.min(maxQueue, currentQueue + 1);
            } else {
                this.queuedPlays[key] = 0;
            }
            return;
        }
        const config = this.sounds[key];
        if (!config) return;
        const sound = new Audio(config.src);
        const volumeMultiplier = Math.max(0, Math.min(1, options.volumeMultiplier ?? 1));
        sound.volume = Math.max(0, Math.min(1, config.volume * volumeMultiplier));
        sound.playbackRate = Math.max(0.5, Math.min(2, options.playbackRate ?? 1));
        this.activeSounds.push({ key, sound });
        sound.addEventListener("ended", () => {
            this.removeActiveSound(sound);
            if ((this.queuedPlays[key] || 0) <= 0) return;
            this.queuedPlays[key]--;
            this.play(key, options);
        });
        sound.addEventListener("error", () => this.removeActiveSound(sound));
        sound.play().catch(() => this.removeActiveSound(sound));
    }

    /**
     * Plays a looping sound by key if not already active.
     * @param {string} key
     * @param {{volumeMultiplier?: number, playbackRate?: number, fadeInMs?: number}} [options]
     * @returns {void}
     */
    playLoop(key, options = {}) {
        if (this.isMuted) return;
        const alreadyPlaying = this.activeSounds.some((entry) => entry.key === key);
        if (alreadyPlaying) return;
        const config = this.sounds[key];
        if (!config) return;
        const sound = new Audio(config.src);
        const volumeMultiplier = Math.max(0, Math.min(1, options.volumeMultiplier ?? 1));
        const targetVolume = Math.max(0, Math.min(1, config.volume * volumeMultiplier));
        const fadeInMs = Math.max(0, options.fadeInMs ?? 0);
        sound.volume = fadeInMs > 0 ? 0 : targetVolume;
        sound.playbackRate = Math.max(0.5, Math.min(2, options.playbackRate ?? 1));
        sound.loop = true;
        const entry = { key, sound, fadeIntervalId: null, isFadingOut: false };
        this.activeSounds.push(entry);
        if (fadeInMs > 0) {
            const intervalMs = 25;
            const stepCount = Math.max(1, Math.ceil(fadeInMs / intervalMs));
            const volumeStep = targetVolume / stepCount;
            entry.fadeIntervalId = setInterval(() => {
                sound.volume = Math.min(targetVolume, sound.volume + volumeStep);
                if (sound.volume >= targetVolume) {
                    clearInterval(entry.fadeIntervalId);
                    entry.fadeIntervalId = null;
                }
            }, intervalMs);
        }
        sound.addEventListener("error", () => this.removeActiveSound(sound));
        sound.play().catch(() => this.removeActiveSound(sound));
    }

    /**
     * Sets global muted state.
     * @param {boolean} value
     * @returns {void}
     */
    setMuted(value) {
        this.isMuted = value;
        if (!this.isMuted) return;
        this.queuedPlays = {};
        this.activeSounds.forEach((entry) => {
            if (entry.fadeIntervalId) {
                clearInterval(entry.fadeIntervalId);
                entry.fadeIntervalId = null;
            }
            const { sound } = entry;
            sound.pause();
            sound.currentTime = 0;
        });
        this.activeSounds = [];
    }

    /**
     * Stops all currently active sounds for a specific key.
     * @param {string} key
     * @param {{fadeOutMs?: number}} [options]
     * @returns {void}
     */
    stopByKey(key, options = {}) {
        this.queuedPlays[key] = 0;
        const fadeOutMs = Math.max(0, options.fadeOutMs ?? 0);
        if (fadeOutMs === 0) {
            this.activeSounds = this.activeSounds.filter((entry) => {
                if (entry.key !== key) return true;
                if (entry.fadeIntervalId) {
                    clearInterval(entry.fadeIntervalId);
                    entry.fadeIntervalId = null;
                }
                entry.isFadingOut = false;
                entry.sound.pause();
                entry.sound.currentTime = 0;
                return false;
            });
            return;
        }
        this.activeSounds = this.activeSounds.filter((entry) => {
            if (entry.key !== key) return true;
            if (entry.isFadingOut) return true;
            if (entry.fadeIntervalId) {
                clearInterval(entry.fadeIntervalId);
                entry.fadeIntervalId = null;
            }
            entry.isFadingOut = true;
            const { sound } = entry;
            const startVolume = sound.volume;
            const intervalMs = 25;
            const stepCount = Math.max(1, Math.ceil(fadeOutMs / intervalMs));
            const volumeStep = startVolume / stepCount;
            entry.fadeIntervalId = setInterval(() => {
                sound.volume = Math.max(0, sound.volume - volumeStep);
                if (sound.volume <= 0) {
                    clearInterval(entry.fadeIntervalId);
                    entry.fadeIntervalId = null;
                    entry.isFadingOut = false;
                    sound.pause();
                    sound.currentTime = 0;
                    this.removeActiveSound(sound);
                }
            }, intervalMs);
            return true;
        });
    }

    /**
     * Removes sound from active list.
     * @param {HTMLAudioElement} sound
     * @returns {void}
     */
    removeActiveSound(sound) {
        this.activeSounds = this.activeSounds.filter((item) => {
            if (item.sound !== sound) return true;
            if (item.fadeIntervalId) {
                clearInterval(item.fadeIntervalId);
                item.fadeIntervalId = null;
            }
            item.isFadingOut = false;
            return false;
        });
    }
}

window.audioManager = new AudioManager();
