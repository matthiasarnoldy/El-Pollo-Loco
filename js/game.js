let canvas;
let world;
let keyboard = new Keyboard();
let isGamePausedUi = false;
let isSoundMutedUi = false;
let isFullscreenUi = false;
let areBannerControlsInitialized = false;
let areTouchControlsInitialized = false;

function showStartScreen() {
    const screen = document.getElementById("startScreen");
    screen?.classList.remove("d-none");
}

function hideStartScreen() {
    const screen = document.getElementById("startScreen");
    screen?.classList.add("d-none");
}

function startGame() {
    cleanupWorld();
    resetUiForGameStart();
    hideStartScreen();
    hideGameOverActions();
    init();
}

function restartGame() {
    cleanupWorld();
    resetUiForGameStart();
    hideStartScreen();
    hideGameOverActions();
    init();
}

function goToStartScreen() {
    cleanupWorld();
    resetUiForStartScreen();
    hideGameOverActions();
    showStartScreen();
}

function showGameOverActions() {
    const actions = document.getElementById("gameOverActions");
    actions?.classList.remove("d-none");
}

function hideGameOverActions() {
    const actions = document.getElementById("gameOverActions");
    actions?.classList.add("d-none");
}

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);
    initBannerControls();
    initTouchControls();
}

function cleanupWorld() {
    if (!world) return;
    world.destroy?.();
    world = null;
}

function resetUiForGameStart() {
    keyboard.RIGHT = false;
    keyboard.LEFT = false;
    keyboard.SPACE = false;
    keyboard.THROW = false;
    isGamePausedUi = false;
    setBannerPlayIcon();
    setPauseActionIcon("pause");
}

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

function getTouchControls() {
    return {
        leftButton: document.getElementById("btnTouchLeft"),
        rightButton: document.getElementById("btnTouchRight"),
        jumpButton: document.getElementById("btnTouchJump"),
        throwButton: document.getElementById("btnTouchThrow")
    };
}

function initTouchControls() {
    if (areTouchControlsInitialized) return;
    const controls = getTouchControls();
    bindHoldControl(controls.leftButton, () => keyboard.LEFT = true, () => keyboard.LEFT = false);
    bindHoldControl(controls.rightButton, () => keyboard.RIGHT = true, () => keyboard.RIGHT = false);
    bindTapControl(controls.jumpButton, () => keyboard.SPACE = true, () => keyboard.SPACE = false);
    bindTapControl(controls.throwButton, () => keyboard.THROW = true, () => keyboard.THROW = false);
    areTouchControlsInitialized = true;
}

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

function isGameOver() {
    return !!world?.gameOverTriggered;
}

function bindPauseToggle(controls) {
    controls.pauseToggleButton?.addEventListener("click", (event) => {
        if (isGameOver()) return;
        event.stopPropagation();
        setPauseActionIcon(isGamePausedUi ? "play" : "pause");
        controls.pauseDropdown?.classList.toggle("d-none");
    });
}

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

function bindExitAction(controls) {
    controls.exitActionButton?.addEventListener("click", () => {
        goToStartScreen();
    });
}

function bindSoundAction(controls) {
    controls.soundButton?.addEventListener("click", () => {
        isSoundMutedUi = !isSoundMutedUi;
        setSoundIcon(isSoundMutedUi ? "muted" : "on");
    });
}

function bindFullscreenAction(controls) {
    controls.fullscreenButton?.addEventListener("click", () => {
        isFullscreenUi = !isFullscreenUi;
        setFullscreenIcon(isFullscreenUi ? "minimize" : "maximize");
        toggleFullscreen();
    });

    document.addEventListener("fullscreenchange", syncFullscreenIcon);
}

function bindDropdownClose(controls) {
    document.addEventListener("click", () => {
        controls.pauseDropdown?.classList.add("d-none");
    });
}

function syncFullscreenIcon() {
    isFullscreenUi = !!document.fullscreenElement;
    setFullscreenIcon(isFullscreenUi ? "minimize" : "maximize");
}

function setBannerPauseIcon() {
    const pauseToggleButton = document.getElementById("btnPause");
    if (!pauseToggleButton) return;
    pauseToggleButton.innerHTML = getPauseIconTemplate();
}

function setBannerPlayIcon() {
    const pauseToggleButton = document.getElementById("btnPause");
    if (!pauseToggleButton) return;
    pauseToggleButton.innerHTML = getPlayIconTemplate();
}

function setPauseActionIcon(type) {
    const pauseActionButton = document.getElementById("btnPauseAction");
    if (!pauseActionButton) return;
    if (type === "play") {
        pauseActionButton.innerHTML = getPlayIconTemplate();
        return;
    }
    pauseActionButton.innerHTML = getPauseIconTemplate();
}

function setSoundIcon(type) {
    const soundButton = document.getElementById("btnSound");
    if (!soundButton) return;
    if (type === "muted") {
        soundButton.innerHTML = getSoundMutedIconTemplate();
        return;
    }
    soundButton.innerHTML = getSoundOnIconTemplate();
}

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

function updateKeyboardState(code, isPressed) {
    if (isRightKey(code)) keyboard.RIGHT = isPressed;
    else if (isLeftKey(code)) keyboard.LEFT = isPressed;
    else if (isThrowKey(code)) keyboard.THROW = isPressed;
    else if (isJumpKey(code)) keyboard.SPACE = isPressed;
}

function isRightKey(code) {
    return code === "ArrowRight" || code === "KeyD";
}

function isLeftKey(code) {
    return code === "ArrowLeft" || code === "KeyA";
}

function isThrowKey(code) {
    return code === "Enter" || code === "KeyF";
}

function isJumpKey(code) {
    return code === "Space";
}