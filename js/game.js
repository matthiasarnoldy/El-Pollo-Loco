let canvas;
let world;
let keyboard = new Keyboard();
const SOUND_MUTED_STORAGE_KEY = "el-pollo-loco.sound-muted";
let isGamePausedUi = false;
let shouldResumeGameOnTutorialClose = false;
let isSoundMutedUi = getStoredSoundMutedState();
let isFullscreenUi = false;
let areBannerControlsInitialized = false;
let areTouchControlsInitialized = false;

/**
 * Returns stored muted state.
 * @returns {boolean}
 */
function getStoredSoundMutedState() {
    try {
        return localStorage.getItem(SOUND_MUTED_STORAGE_KEY) === "true";
    } catch {
        return false;
    }
}

/**
 * Stores muted state.
 * @param {boolean} value
 * @returns {void}
 */
function storeSoundMutedState(value) {
    try {
        localStorage.setItem(SOUND_MUTED_STORAGE_KEY, String(value));
    } catch {
    }
}

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
    if (!shouldResumeGameOnTutorialClose || !world || isGameOver()) return;
    shouldResumeGameOnTutorialClose = false;
    resumeGameFromPause();
    setPauseActionIcon("pause");
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
    window.audioManager?.playLoop("game.soundtrack");
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
    window.audioManager?.playLoop("game.soundtrack");
}

/**
 * Handles go to start screen.
 */
function goToStartScreen() {
    window.audioManager?.stopAll();
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
    setSoundIcon(isSoundMutedUi ? "muted" : "on");
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
    bindHelpAction(controls);
    bindPauseToggle(controls);
    bindPauseAction(controls);
    bindExitAction(controls);
    bindSoundAction(controls);
    bindFullscreenAction(controls);
    bindDropdownClose(controls);
    areBannerControlsInitialized = true;
}