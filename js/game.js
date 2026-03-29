let canvas;
let world;
let keyboard = new Keyboard();
let isGamePausedUi = false;
let isSoundMutedUi = false;
let isFullscreenUi = false;
let areBannerControlsInitialized = false;
let areTouchControlsInitialized = false;

/**
 * Shows touch controls for gameplay.
 */
function showTouchControlsForGameplay() {
    document.querySelector(".touch-controls")?.classList.remove("d-none");
}

/**
 * Hides touch controls for overlay.
 */
function hideTouchControlsForOverlay() {
    document.querySelector(".touch-controls")?.classList.add("d-none");
}

/**
 * Shows start screen.
 */
function showStartScreen() {
    document.getElementById("startScreen")?.classList.remove("d-none");
    document.getElementById("gameBanner")?.classList.add("d-none");
    hideTouchControlsForOverlay();
    initTutorialsDialog();
    initLegalNoticeDialog();
}

/**
 * Hides start screen.
 */
function hideStartScreen() {
    document.getElementById("startScreen")?.classList.add("d-none");
    document.getElementById("gameBanner")?.classList.remove("d-none");
    showTouchControlsForGameplay();
}

/**
 * Shows tutorials dialog.
 */
function showTutorialsDialog() {
    document.getElementById("tutorialsDialog")?.classList.remove("d-none");
}

/**
 * Hides tutorials dialog.
 */
function hideTutorialsDialog() {
    document.getElementById("tutorialsDialog")?.classList.add("d-none");
}

/**
 * Initializes tutorials dialog.
 */
function initTutorialsDialog() {
    const dialog = document.getElementById("tutorialsDialog");
    if (dialog) {
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                hideTutorialsDialog();
            }
        });
    }
}

/**
 * Shows legal notice dialog.
 */
function showLegalNoticeDialog() {
    document.getElementById("legalNoticeDialog")?.classList.remove("d-none");
}

/**
 * Hides legal notice dialog.
 */
function hideLegalNoticeDialog() {
    document.getElementById("legalNoticeDialog")?.classList.add("d-none");
}

/**
 * Initializes legal notice dialog.
 */
function initLegalNoticeDialog() {
    const dialog = document.getElementById("legalNoticeDialog");
    if (dialog) {
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                hideLegalNoticeDialog();
            }
        });
    }
}

/**
 * Starts game.
 */
function startGame() {
    cleanupWorld();
    resetUiForGameStart();
    hideStartScreen();
    hideGameOverActions();
    init();
}

/**
 * Handles restart game.
 */
function restartGame() {
    cleanupWorld();
    resetUiForGameStart();
    hideStartScreen();
    hideGameOverActions();
    init();
}

/**
 * Handles go to start screen.
 */
function goToStartScreen() {
    cleanupWorld();
    resetUiForStartScreen();
    hideGameOverActions();
    showStartScreen();
}

/**
 * Shows game over actions.
 */
function showGameOverActions() {
    document.getElementById("gameOverActions")?.classList.remove("d-none");
    document.getElementById("gameBanner")?.classList.add("d-none");
    hideTouchControlsForOverlay();
}

/**
 * Hides game over actions.
 */
function hideGameOverActions() {
    document.getElementById("gameOverActions")?.classList.add("d-none");
    document.getElementById("gameBanner")?.classList.remove("d-none");
    showTouchControlsForGameplay();
}

/**
 * Initializes the setup.
 */
function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);
    window.audioManager?.setMuted(isSoundMutedUi);
    initBannerControls();
    initTouchControls();
}

/**
 * Handles cleanup world.
 * @returns {void}
 */
function cleanupWorld() {
    if (!world) return;
    world.destroy?.();
    world = null;
}

/**
 * Resets ui for game start.
 */
function resetUiForGameStart() {
    keyboard.RIGHT = false;
    keyboard.LEFT = false;
    keyboard.SPACE = false;
    keyboard.THROW = false;
    isGamePausedUi = false;
    setBannerPlayIcon();
    setPauseActionIcon("pause");
}

/**
 * Resets ui for start screen.
 */
function resetUiForStartScreen() {
    keyboard.RIGHT = false;
    keyboard.LEFT = false;
    keyboard.SPACE = false;
    keyboard.THROW = false;
    isGamePausedUi = false;
    setBannerPlayIcon();
    setPauseActionIcon("pause");
    const pauseDropdown = document.getElementById("pauseDropdown");
    pauseDropdown?.classList.add("d-none");
}

/**
 * Initializes banner controls.
 * @returns {void}
 */
function initBannerControls() {
    if (areBannerControlsInitialized) return;
    const controls = getBannerControls();
    bindPauseToggle(controls);
    bindPauseAction(controls);
    bindExitAction(controls);
    bindSoundAction(controls);
    bindFullscreenAction(controls);
    bindDropdownClose(controls);
    areBannerControlsInitialized = true;
}

/**
 * Returns banner controls.
 * @returns {{pauseToggleButton: (HTMLElement|null), pauseDropdown: (HTMLElement|null), pauseActionButton: (HTMLElement|null), exitActionButton: (HTMLElement|null), soundButton: (HTMLElement|null), fullscreenButton: (HTMLElement|null)}}
 */
function getBannerControls() {
    return {
        pauseToggleButton: document.getElementById("btnPause"),
        pauseDropdown: document.getElementById("pauseDropdown"),
        pauseActionButton: document.getElementById("btnPauseAction"),
        exitActionButton: document.getElementById("btnExitAction"),
        soundButton: document.getElementById("btnSound"),
        fullscreenButton: document.getElementById("btnFullscreen")
    };
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
        if (isGameOver()) {
            controls.pauseDropdown?.classList.add("d-none");
            return;
        }
        if (isGamePausedUi) {
            setBannerPlayIcon();
            isGamePausedUi = false;
            world.setPaused(false);
        } else {
            setBannerPauseIcon();
            isGamePausedUi = true;
            world.setPaused(true);
        }
        controls.pauseDropdown?.classList.add("d-none");
    });
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
        window.audioManager?.setMuted(isSoundMutedUi);
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

async function toggleFullscreen() {
    const gameShell = document.querySelector(".game-shell");
    if (!gameShell) return;
    if (!document.fullscreenElement) {
        await gameShell.requestFullscreen?.();
        return;
    }
    await document.exitFullscreen?.();
}

window.addEventListener("keydown", (event) => updateKeyboardState(event.code, true));
window.addEventListener("keyup", (event) => updateKeyboardState(event.code, false));

/**
 * Updates keyboard state.
 * @param {string} code
 * @param {boolean} isPressed
 */
function updateKeyboardState(code, isPressed) {
    if (isRightKey(code)) keyboard.RIGHT = isPressed;
    else if (isLeftKey(code)) keyboard.LEFT = isPressed;
    else if (isThrowKey(code)) keyboard.THROW = isPressed;
    else if (isJumpKey(code)) keyboard.SPACE = isPressed;
}

/**
 * Checks whether right key.
 * @param {string} code
 * @returns {boolean}
 */
function isRightKey(code) {
    return code === "ArrowRight" || code === "KeyD";
}

/**
 * Checks whether left key.
 * @param {string} code
 * @returns {boolean}
 */
function isLeftKey(code) {
    return code === "ArrowLeft" || code === "KeyA";
}

/**
 * Checks whether throw key.
 * @param {string} code
 * @returns {boolean}
 */
function isThrowKey(code) {
    return code === "Enter" || code === "KeyF";
}

/**
 * Checks whether jump key.
 * @param {string} code
 * @returns {boolean}
 */
function isJumpKey(code) {
    return code === "Space";
}