class Chicken extends MovableObject {
    height = 68;
    width = 60;
    position_y = 347;


    constructor() {
        super().loadImage("assets/img/3_enemies_chicken/chicken_normal/1_walk/1_w.png");

        this.position_x = 200 + Math.random() * 500;
    }
}