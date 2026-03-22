let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);

    console.log("My character is", world.character)
}

window.addEventListener("keydown", (event) => {
    switch (event.code) {
        case "ArrowRight":
        case "KeyD":
            keyboard.RIGHT = true;
            break;
        case "ArrowLeft":
        case "KeyA":
            keyboard.LEFT = true;
            break;
        case "Space":
            keyboard.SPACE = true;
            break;
    }
});

window.addEventListener("keyup", (event) => {
    switch (event.code) {
        case "ArrowRight":
        case "KeyD":
            keyboard.RIGHT = false;
            break;
        case "ArrowLeft":
        case "KeyA":
            keyboard.LEFT = false;
            break;
        case "Space":
            keyboard.SPACE = false;
            break;
    }
});