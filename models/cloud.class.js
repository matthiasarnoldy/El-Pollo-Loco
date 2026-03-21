class Cloud extends MovableObject {
    height = 300;
    width = 450;


    constructor() {
        super().loadImage("assets/img/5_background/layers/4_clouds/1.png");

        this.position_x = 200 + Math.random() * 500;
        this.position_y = 20;
    }
}