class Endboss extends MovableObject {
    height = 350;
    width = 300;
    position_x = 600;
    // position_x = 6000;
    position_y = 90;
    health = 100;
    damage = 0.8;
    bodyDimensions = { headH: 65, headW: 85, bodyH: 125, bodyW: 200, bodyL: 20, feetW: 80, feetL: 80 };
    offset = {
        left: 35,
        right: 40,
        top: 75,
        bottom: 10
    };
    IMAGES_WALKING = [
        "assets/img/4_enemie_boss_chicken/1_walk/G1.png",
        "assets/img/4_enemie_boss_chicken/1_walk/G2.png",
        "assets/img/4_enemie_boss_chicken/1_walk/G3.png",
        "assets/img/4_enemie_boss_chicken/1_walk/G4.png",
    ];
    IMAGES_ALERT = [
        "assets/img/4_enemie_boss_chicken/2_alert/G6.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G5.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G6.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G7.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G8.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G9.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G10.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G11.png",
        "assets/img/4_enemie_boss_chicken/2_alert/G12.png",
    ];
    IMAGES_ATTACK = [
        "assets/img/4_enemie_boss_chicken/3_attack/G13.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G14.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G15.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G16.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G17.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G18.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G19.png",
        "assets/img/4_enemie_boss_chicken/3_attack/G20.png",
    ];
    IMAGES_HURT = [
        "assets/img/4_enemie_boss_chicken/4_hurt/G21.png",
        "assets/img/4_enemie_boss_chicken/4_hurt/G22.png",
        "assets/img/4_enemie_boss_chicken/4_hurt/G23.png",
    ];
    IMAGES_DEAD = [
        "assets/img/4_enemie_boss_chicken/5_dead/G24.png",
        "assets/img/4_enemie_boss_chicken/5_dead/G25.png",
        "assets/img/4_enemie_boss_chicken/5_dead/G26.png",
    ];
    world;


    constructor() {
        super().loadImage(this.IMAGES_ALERT[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);

        this.animate();
    }

    getHitboxAreas() {
        const { headH, headW, bodyH, bodyW, bodyL, feetW, feetL } = this.bodyDimensions;
        const x = this.getHitboxLeft(), y = this.getHitboxTop();
        const feetH = this.getHitboxBottom() - y - headH - bodyH;
        return {
            head: { x, y, w: headW, h: headH },
            body: { x: x + bodyL, y: y + headH, w: bodyW, h: bodyH },
            feet: { x: x + feetL, y: y + headH + bodyH, w: feetW, h: feetH }
        };
    }

    animate() {
        setInterval(() => {
            if (this.world.character.position_x > 400) {
            // if (this.world.character.position_x > 5555) {
                this.playAnimationOnce(this.IMAGES_ALERT);
            }
        }, 1000 / 4)
    }
}