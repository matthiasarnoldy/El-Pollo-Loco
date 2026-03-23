class Statusbar extends DrawableObject {
    percentage = 100;
    IMAGES = [
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png",
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png",
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png",
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png",
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png",
        "assets/img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png",
    ];

    constructor() {
        super().loadImage(this.IMAGES[0]);
        this.loadImages(this.IMAGES);
        this.position_x = 12;
        this.position_y = 0;
        this.height = 40;
        this.width = 150;
        this.setPercentage(100);
    }

    setPercentage(percentage) {
        this.percentage = percentage;
        let path = this.IMAGES[this.resolveImageIndex(percentage)];
        this.img = this.imageCache[path];
    }

    resolveImageIndex(percentage) {
        if (percentage == 100) {
            return 5;
        } else if (percentage > 80) {
            return 4;
        } else if (percentage > 60) {
            return 3;
        } else if (percentage > 40) {
            return 2;
        } else if (percentage > 20) {
            return 1;
        } else {
            return 0;
        }
    }
}