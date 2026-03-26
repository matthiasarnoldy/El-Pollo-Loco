class Statusbar extends DrawableObject {
    displayValue = 100;
    IMAGES = {
        health: "assets/img/7_statusbars/3_icons/icon_health.png",
        coin: "assets/img/7_statusbars/3_icons/icon_coin.png",
        bottle: "assets/img/7_statusbars/3_icons/icon_salsa_bottle.png",
        endboss: "assets/img/7_statusbars/3_icons/icon_health_endboss.png"
    };

    constructor(type = "health", x = 16, y = 0) {
        super();
        const iconPath = this.IMAGES[type] || this.IMAGES.health;
        this.loadImage(iconPath);
        this.position_x = x;
        this.position_y = y + 4;
        this.height = 64;
        this.width = 64;
        this.setPercentage(100);
    }

    draw(ctx) {
        super.draw(ctx);
        const valueText = `${Math.max(0, Math.round(this.displayValue))}`;
        const textYOffset = 10;
        ctx.font = "28px playwriteMX, Arial, sans-serif";
        ctx.fillStyle = "#FDDF77";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(valueText, this.position_x + this.width, this.position_y + this.height / 2 + textYOffset);
    }

    setByValue(value, maxValue) {
        const safeMax = Math.max(1, maxValue);
        const normalized = Math.max(0, Math.min(100, Math.round((value / safeMax) * 100)));
        this.setPercentage(normalized);
        this.displayValue = value;
    }

    setPercentage(percentage) {
        this.displayValue = percentage;
    }
}