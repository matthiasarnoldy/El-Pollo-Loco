let canvas;
let world;
let keyboard = new Keyboard();
let isGamePausedUi = false;
let isSoundMutedUi = false;
let isFullscreenUi = false;

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);
    initBannerControls();
}

function initBannerControls() {
    const controls = getBannerControls();
    bindPauseToggle(controls);
    bindPauseAction(controls);
    bindExitAction(controls);
    bindSoundAction(controls);
    bindFullscreenAction(controls);
    bindDropdownClose(controls);
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

function bindPauseToggle(controls) {
    controls.pauseToggleButton?.addEventListener("click", (event) => {
        event.stopPropagation();
        setPauseActionIcon(isGamePausedUi ? "play" : "pause");
        controls.pauseDropdown?.classList.toggle("d-none");
    });
}

function bindPauseAction(controls) {
    controls.pauseActionButton?.addEventListener("click", () => {
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
        window.location.reload();
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