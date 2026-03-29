/**
 * Returns banner controls.
 * @returns {{helpButton: (HTMLElement|null), pauseToggleButton: (HTMLElement|null), pauseDropdown: (HTMLElement|null), pauseActionButton: (HTMLElement|null), exitActionButton: (HTMLElement|null), soundButton: (HTMLElement|null), fullscreenButton: (HTMLElement|null)}}
 */
function getBannerControls() {
    return {
        helpButton: document.getElementById("btnHelp"),
        pauseToggleButton: document.getElementById("btnPause"),
        pauseDropdown: document.getElementById("pauseDropdown"),
        pauseActionButton: document.getElementById("btnPauseAction"),
        exitActionButton: document.getElementById("btnExitAction"),
        soundButton: document.getElementById("btnSound"),
        fullscreenButton: document.getElementById("btnFullscreen")
    };
}

/**
 * Binds help action.
 * @param {{helpButton: (HTMLElement|null)}} controls
 * @returns {void}
 */
function bindHelpAction(controls) {
    controls.helpButton?.addEventListener("click", () => {
        shouldResumeGameOnTutorialClose = false;
        if (!isGameOver() && !isGamePausedUi) {
            pauseGameFromRunning();
            setPauseActionIcon("play");
            shouldResumeGameOnTutorialClose = true;
        }
        showTutorialsDialog();
    });
}

/**
 * Returns touch controls.
 * @returns {{leftButton: (HTMLElement|null), rightButton: (HTMLElement|null), jumpButton: (HTMLElement|null), throwButton: (HTMLElement|null)}}
 */
function getTouchControls() {
    return {
        leftButton: document.getElementById("btnTouchLeft"),
        rightButton: document.getElementById("btnTouchRight"),
        jumpButton: document.getElementById("btnTouchJump"),
        throwButton: document.getElementById("btnTouchThrow")
    };
}

/**
 * Initializes touch controls.
 * @returns {void}
 */
function initTouchControls() {
    if (areTouchControlsInitialized) return;
    const controls = getTouchControls();
    disableLongPressCalloutOnGameplayElements(controls);
    bindHoldControl(controls.leftButton, () => keyboard.LEFT = true, () => keyboard.LEFT = false);
    bindHoldControl(controls.rightButton, () => keyboard.RIGHT = true, () => keyboard.RIGHT = false);
    bindTapControl(controls.jumpButton, () => keyboard.SPACE = true, () => keyboard.SPACE = false);
    bindTapControl(controls.throwButton, () => keyboard.THROW = true, () => keyboard.THROW = false);
    areTouchControlsInitialized = true;
}

/**
 * Handles disable long press callout on gameplay elements.
 * @param {{leftButton: (HTMLElement|null), rightButton: (HTMLElement|null), jumpButton: (HTMLElement|null), throwButton: (HTMLElement|null)}} controls
 */
function disableLongPressCalloutOnGameplayElements(controls) {
    const canvasElement = document.getElementById("canvas");
    canvasElement?.addEventListener("contextmenu", (event) => event.preventDefault());
    [controls.leftButton, controls.rightButton, controls.jumpButton, controls.throwButton]
        .forEach((button) => button?.addEventListener("contextmenu", (event) => event.preventDefault()));
}

/**
 * Binds hold control.
 * @param {(HTMLElement|null)} button
 * @param {() => void} onPress
 * @param {() => void} onRelease
 * @returns {void}
 */
function bindHoldControl(button, onPress, onRelease) {
    if (!button) return;
    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        onPress();
    });
    button.addEventListener("pointerup", onRelease);
    button.addEventListener("pointercancel", onRelease);
    button.addEventListener("pointerleave", onRelease);
}

/**
 * Binds tap control.
 * @param {(HTMLElement|null)} button
 * @param {() => void} onPress
 * @param {() => void} onRelease
 * @returns {void}
 */
function bindTapControl(button, onPress, onRelease) {
    if (!button) return;
    button.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        onPress();
        setTimeout(onRelease, 120);
    });
    button.addEventListener("pointerup", onRelease);
    button.addEventListener("pointercancel", onRelease);
}

/**
 * Checks whether game over.
 * @returns {boolean}
 */
function isGameOver() {
    return !!world?.gameOverTriggered;
}

/**
 * Binds pause toggle.
 * @param {{pauseToggleButton: (HTMLElement|null), pauseDropdown: (HTMLElement|null)}} controls
 * @returns {void}
 */
function bindPauseToggle(controls) {
    controls.pauseToggleButton?.addEventListener("click", (event) => {
        if (isGameOver()) return;
        event.stopPropagation();
        setPauseActionIcon(isGamePausedUi ? "play" : "pause");
        controls.pauseDropdown?.classList.toggle("d-none");
    });
}

/**
 * Binds pause action.
 * @param {{pauseActionButton: (HTMLElement|null), pauseDropdown: (HTMLElement|null)}} controls
 */
function bindPauseAction(controls) {
    controls.pauseActionButton?.addEventListener("click", () => {
        if (closePauseDropdownOnGameOver(controls)) return;
        togglePausedState();
        controls.pauseDropdown?.classList.add("d-none");
    });
}

/**
 * Closes pause dropdown when game is over.
 * @param {{pauseDropdown: (HTMLElement|null)}} controls
 * @returns {boolean}
 */
function closePauseDropdownOnGameOver(controls) {
    if (!isGameOver()) return false;
    controls.pauseDropdown?.classList.add("d-none");
    return true;
}

/**
 * Toggles paused state.
 * @returns {void}
 */
function togglePausedState() {
    if (isGamePausedUi) {
        resumeGameFromPause();
        return;
    }
    pauseGameFromRunning();
}

/**
 * Resumes game from pause state.
 * @returns {void}
 */
function resumeGameFromPause() {
    setBannerPlayIcon();
    isGamePausedUi = false;
    world.setPaused(false);
}

/**
 * Pauses game from running state.
 * @returns {void}
 */
function pauseGameFromRunning() {
    setBannerPauseIcon();
    isGamePausedUi = true;
    world.setPaused(true);
}

/**
 * Binds exit action.
 * @param {{exitActionButton: (HTMLElement|null)}} controls
 */
function bindExitAction(controls) {
    controls.exitActionButton?.addEventListener("click", () => {
        goToStartScreen();
    });
}

/**
 * Binds sound action.
 * @param {{soundButton: (HTMLElement|null)}} controls
 */
function bindSoundAction(controls) {
    controls.soundButton?.addEventListener("click", () => {
        isSoundMutedUi = !isSoundMutedUi;
        storeSoundMutedState(isSoundMutedUi);
        window.audioManager?.setMuted(isSoundMutedUi);
        if (!isSoundMutedUi && world && !world.gameOverTriggered) {
            window.audioManager?.playLoop("game.soundtrack");
        }
        setSoundIcon(isSoundMutedUi ? "muted" : "on");
    });
}

/**
 * Binds fullscreen action.
 * @param {{fullscreenButton: (HTMLElement|null)}} controls
 */
function bindFullscreenAction(controls) {
    controls.fullscreenButton?.addEventListener("click", () => {
        isFullscreenUi = !isFullscreenUi;
        setFullscreenIcon(isFullscreenUi ? "minimize" : "maximize");
        toggleFullscreen();
    });

    document.addEventListener("fullscreenchange", syncFullscreenIcon);
}

/**
 * Binds dropdown close.
 * @param {{pauseDropdown: (HTMLElement|null)}} controls
 */
function bindDropdownClose(controls) {
    document.addEventListener("click", () => {
        controls.pauseDropdown?.classList.add("d-none");
    });
}

/**
 * Handles sync fullscreen icon.
 */
function syncFullscreenIcon() {
    isFullscreenUi = !!document.fullscreenElement;
    setFullscreenIcon(isFullscreenUi ? "minimize" : "maximize");
}

/**
 * Sets banner pause icon.
 * @returns {void}
 */
function setBannerPauseIcon() {
    const pauseToggleButton = document.getElementById("btnPause");
    if (!pauseToggleButton) return;
    pauseToggleButton.innerHTML = getPauseIconTemplate();
}

/**
 * Sets banner play icon.
 * @returns {void}
 */
function setBannerPlayIcon() {
    const pauseToggleButton = document.getElementById("btnPause");
    if (!pauseToggleButton) return;
    pauseToggleButton.innerHTML = getPlayIconTemplate();
}

/**
 * Sets pause action icon.
 * @param {"play"|"pause"} type
 * @returns {void}
 */
function setPauseActionIcon(type) {
    const pauseActionButton = document.getElementById("btnPauseAction");
    if (!pauseActionButton) return;
    if (type === "play") {
        pauseActionButton.innerHTML = getPlayIconTemplate();
        return;
    }
    pauseActionButton.innerHTML = getPauseIconTemplate();
}

/**
 * Sets sound icon.
 * @param {"muted"|"on"} type
 * @returns {void}
 */
function setSoundIcon(type) {
    const soundButton = document.getElementById("btnSound");
    if (!soundButton) return;
    if (type === "muted") {
        soundButton.innerHTML = getSoundMutedIconTemplate();
        return;
    }
    soundButton.innerHTML = getSoundOnIconTemplate();
}

/**
 * Sets fullscreen icon.
 * @param {"minimize"|"maximize"} type
 * @returns {void}
 */
function setFullscreenIcon(type) {
    const fullscreenButton = document.getElementById("btnFullscreen");
    if (!fullscreenButton) return;
    if (type === "minimize") {
        fullscreenButton.innerHTML = getFullscreenMinimizeIconTemplate();
        return;
    }
    fullscreenButton.innerHTML = getFullscreenMaximizeIconTemplate();
}

/**
 * Toggles fullscreen mode for the game shell.
 * @returns {Promise<void>}
 */
async function toggleFullscreen() {
    const gameShell = document.querySelector(".game-shell");
    if (!gameShell) return;
    if (!document.fullscreenElement) {
        await gameShell.requestFullscreen?.();
        return;
    }
    await document.exitFullscreen?.();
}
