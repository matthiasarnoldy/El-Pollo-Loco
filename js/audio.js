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
     * @param {{volumeMultiplier?: number, playbackRate?: number, queueIfPlaying?: boolean, maxQueue?: number, overlapIfPlaying?: boolean}} [options]
     * @returns {void}
     */
    play(key, options = {}) {
        if (this.isMuted) return;
        if (!options.overlapIfPlaying && this.handleExistingSound(key, options)) return;
        const sound = this.createSound(key, options);
        if (!sound) return;
        this.registerOneShotSound(key, sound, options);
        sound.play().catch(() => this.removeActiveSound(sound));
    }

    /**
     * Handles repeated playback requests.
     * @param {string} key
     * @param {{queueIfPlaying?: boolean, maxQueue?: number}} options
     * @returns {boolean}
     */
    handleExistingSound(key, options) {
        const alreadyPlaying = this.activeSounds.some((entry) => entry.key === key);
        if (!alreadyPlaying) return false;
        if (!options.queueIfPlaying) this.queuedPlays[key] = 0;
        else this.incrementQueuedPlay(key, options.maxQueue);
        return true;
    }

    /**
     * Increments queued playback count.
     * @param {string} key
     * @param {number} [maxQueue]
     * @returns {void}
     */
    incrementQueuedPlay(key, maxQueue) {
        const currentQueue = this.queuedPlays[key] || 0;
        const limit = Math.max(0, maxQueue ?? Infinity);
        this.queuedPlays[key] = Math.min(limit, currentQueue + 1);
    }

    /**
     * Creates a configured audio instance.
     * @param {string} key
     * @param {{volumeMultiplier?: number, playbackRate?: number}} options
     * @returns {(HTMLAudioElement|null)}
     */
    createSound(key, options) {
        const config = this.sounds[key];
        if (!config) return null;
        const sound = new Audio(config.src);
        sound.volume = this.getVolume(config.volume, options.volumeMultiplier);
        sound.playbackRate = this.getPlaybackRate(options.playbackRate);
        return sound;
    }

    /**
     * Returns normalized sound volume.
     * @param {number} baseVolume
     * @param {number} [volumeMultiplier]
     * @returns {number}
     */
    getVolume(baseVolume, volumeMultiplier) {
        const multiplier = Math.max(0, Math.min(1, volumeMultiplier ?? 1));
        return Math.max(0, Math.min(1, baseVolume * multiplier));
    }

    /**
     * Returns normalized playback rate.
     * @param {number} [playbackRate]
     * @returns {number}
     */
    getPlaybackRate(playbackRate) {
        return Math.max(0.5, Math.min(2, playbackRate ?? 1));
    }

    /**
     * Registers a one-shot sound.
     * @param {string} key
     * @param {HTMLAudioElement} sound
        * @param {{volumeMultiplier?: number, playbackRate?: number, queueIfPlaying?: boolean, maxQueue?: number, overlapIfPlaying?: boolean}} options
     * @returns {void}
     */
    registerOneShotSound(key, sound, options) {
        this.activeSounds.push({ key, sound });
        sound.addEventListener("ended", () => this.handleOneShotEnded(key, sound, options));
        sound.addEventListener("error", () => this.removeActiveSound(sound));
    }

    /**
     * Handles the end of a one-shot sound.
     * @param {string} key
     * @param {HTMLAudioElement} sound
        * @param {{volumeMultiplier?: number, playbackRate?: number, queueIfPlaying?: boolean, maxQueue?: number, overlapIfPlaying?: boolean}} options
     * @returns {void}
     */
    handleOneShotEnded(key, sound, options) {
        this.removeActiveSound(sound);
        if ((this.queuedPlays[key] || 0) <= 0) return;
        this.queuedPlays[key]--;
        this.play(key, options);
    }

    /**
     * Plays a looping sound by key if not already active.
     * @param {string} key
     * @param {{volumeMultiplier?: number, playbackRate?: number, fadeInMs?: number}} [options]
     * @returns {void}
     */
    playLoop(key, options = {}) {
        if (this.isMuted) return;
        if (this.activeSounds.some((entry) => entry.key === key)) return;
        const sound = this.createSound(key, options);
        if (!sound) return;
        this.registerLoopSound(key, sound, options.fadeInMs ?? 0);
        sound.play().catch(() => this.removeActiveSound(sound));
    }

    /**
     * Registers a looping sound.
     * @param {string} key
     * @param {HTMLAudioElement} sound
     * @param {number} fadeInMs
     * @returns {void}
     */
    registerLoopSound(key, sound, fadeInMs) {
        sound.loop = true;
        const entry = this.createLoopEntry(key, sound);
        this.activeSounds.push(entry);
        this.applyFadeIn(entry, fadeInMs);
        sound.addEventListener("error", () => this.removeActiveSound(sound));
    }

    /**
     * Creates a loop entry.
     * @param {string} key
     * @param {HTMLAudioElement} sound
     * @returns {{key: string, sound: HTMLAudioElement, targetVolume: number, fadeIntervalId: (number|null), isFadingOut: boolean}}
     */
    createLoopEntry(key, sound) {
        return { key, sound, targetVolume: sound.volume, fadeIntervalId: null, isFadingOut: false };
    }

    /**
     * Applies fade-in to a loop entry.
     * @param {{sound: HTMLAudioElement, targetVolume: number, fadeIntervalId: (number|null)}} entry
     * @param {number} fadeInMs
     * @returns {void}
     */
    applyFadeIn(entry, fadeInMs) {
        if (fadeInMs <= 0) return;
        const intervalMs = 25;
        const stepCount = Math.max(1, Math.ceil(fadeInMs / intervalMs));
        const volumeStep = entry.targetVolume / stepCount;
        entry.sound.volume = 0;
        entry.fadeIntervalId = setInterval(() => this.fadeInStep(entry, volumeStep), intervalMs);
    }

    /**
     * Performs one fade-in step.
     * @param {{sound: HTMLAudioElement, targetVolume: number, fadeIntervalId: (number|null)}} entry
     * @param {number} volumeStep
     * @returns {void}
     */
    fadeInStep(entry, volumeStep) {
        entry.sound.volume = Math.min(entry.targetVolume, entry.sound.volume + volumeStep);
        if (entry.sound.volume < entry.targetVolume) return;
        this.clearFadeInterval(entry);
    }

    /**
     * Sets global muted state.
     * @param {boolean} value
     * @returns {void}
     */
    setMuted(value) {
        this.isMuted = value;
        if (!this.isMuted) return;
        this.stopAll();
    }

    /**
     * Stops all active sounds immediately.
     * @returns {void}
     */
    stopAll() {
        this.queuedPlays = {};
        this.activeSounds.forEach((entry) => this.stopEntry(entry));
        this.activeSounds = [];
    }

    /**
     * Stops one active sound entry immediately.
     * @param {{sound: HTMLAudioElement, fadeIntervalId?: (number|null)}} entry
     * @returns {void}
     */
    stopEntry(entry) {
        if (entry.fadeIntervalId) {
            clearInterval(entry.fadeIntervalId);
            entry.fadeIntervalId = null;
        }
        entry.sound.pause();
        entry.sound.currentTime = 0;
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
        if (fadeOutMs === 0) return this.stopSoundsImmediately(key);
        this.fadeOutSoundsByKey(key, fadeOutMs);
    }

    /**
     * Stops sounds immediately by key.
     * @param {string} key
     * @returns {void}
     */
    stopSoundsImmediately(key) {
        this.activeSounds = this.activeSounds.filter((entry) => !this.shouldRemoveImmediately(entry, key));
    }

    /**
     * Checks and stops a sound immediately.
     * @param {{key: string, sound: HTMLAudioElement, fadeIntervalId?: (number|null), isFadingOut?: boolean}} entry
     * @param {string} key
     * @returns {boolean}
     */
    shouldRemoveImmediately(entry, key) {
        if (entry.key !== key) return false;
        this.clearFadeInterval(entry);
        entry.isFadingOut = false;
        this.resetSound(entry.sound);
        return true;
    }

    /**
     * Starts fade-out for matching sounds.
     * @param {string} key
     * @param {number} fadeOutMs
     * @returns {void}
     */
    fadeOutSoundsByKey(key, fadeOutMs) {
        this.activeSounds = this.activeSounds.filter((entry) => this.keepAfterFadeRequest(entry, key, fadeOutMs));
    }

    /**
     * Handles a fade-out request for one entry.
     * @param {{key: string, sound: HTMLAudioElement, fadeIntervalId?: (number|null), isFadingOut?: boolean}} entry
     * @param {string} key
     * @param {number} fadeOutMs
     * @returns {boolean}
     */
    keepAfterFadeRequest(entry, key, fadeOutMs) {
        if (entry.key !== key || entry.isFadingOut) return true;
        this.clearFadeInterval(entry);
        this.startFadeOut(entry, fadeOutMs);
        return true;
    }

    /**
     * Starts fade-out for an entry.
     * @param {{sound: HTMLAudioElement, fadeIntervalId?: (number|null), isFadingOut?: boolean}} entry
     * @param {number} fadeOutMs
     * @returns {void}
     */
    startFadeOut(entry, fadeOutMs) {
        const intervalMs = 25;
        const stepCount = Math.max(1, Math.ceil(fadeOutMs / intervalMs));
        const volumeStep = entry.sound.volume / stepCount;
        entry.isFadingOut = true;
        entry.fadeIntervalId = setInterval(() => this.fadeOutStep(entry, volumeStep), intervalMs);
    }

    /**
     * Performs one fade-out step.
     * @param {{sound: HTMLAudioElement, fadeIntervalId?: (number|null), isFadingOut?: boolean}} entry
     * @param {number} volumeStep
     * @returns {void}
     */
    fadeOutStep(entry, volumeStep) {
        entry.sound.volume = Math.max(0, entry.sound.volume - volumeStep);
        if (entry.sound.volume > 0) return;
        this.clearFadeInterval(entry);
        entry.isFadingOut = false;
        this.resetSound(entry.sound);
        this.removeActiveSound(entry.sound);
    }

    /**
     * Clears a fade interval.
     * @param {{fadeIntervalId?: (number|null)}} entry
     * @returns {void}
     */
    clearFadeInterval(entry) {
        if (!entry.fadeIntervalId) return;
        clearInterval(entry.fadeIntervalId);
        entry.fadeIntervalId = null;
    }

    /**
     * Resets a sound element.
     * @param {HTMLAudioElement} sound
     * @returns {void}
     */
    resetSound(sound) {
        sound.pause();
        sound.currentTime = 0;
    }

    /**
     * Removes sound from active list.
     * @param {HTMLAudioElement} sound
     * @returns {void}
     */
    removeActiveSound(sound) {
        this.activeSounds = this.activeSounds.filter((item) => {
            if (item.sound !== sound) return true;
            this.clearFadeInterval(item);
            item.isFadingOut = false;
            return false;
        });
    }
}

window.audioManager = new AudioManager();
