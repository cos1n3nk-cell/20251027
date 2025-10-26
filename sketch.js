/* global createCanvas, windowWidth, windowHeight, random, color, width, height, noStroke, fill, circle, PI, cos, sin, rectMode, CENTER, square, angleMode, background, windowResized, beginShape, endShape, vertex, TWO_PI, push, pop, stroke, strokeWeight, loadSound, noLoop, loop, mousePressed, userStartAudio, text, textSize, textAlign, dist, mouseX, mouseY, red, green, blue, CLOSE, translate */

// 圓的總數
const NUM_CIRCLES = 30;
// 固定的顏色列表 (HEX 格式)
const COLORS = [
    '#ff595e', // +1 分
    '#ffca3a', // +2 分
    '#8ac926', // -1 分 (其他顏色)
    '#1982c4', // +1 分
    '#6a4c93'  // -1 分 (其他顏色)
];

let circles = []; 
let popSound; 
let audioContextStarted = false; // 追蹤音訊是否已因用戶點擊而啟動

// 新增：遊戲相關變數
let score = 0;
const fixedText = "414730084";
const textColor = '#eb6424'; // 文字顏色：eb6424
const textSizeVal = 32; // 文字大小：32px


// ====================================================================
// preload 函式 - 載入檔案
// ====================================================================
function preload() {
    // 假設你的 pop.mp3 在 assets 資料夾內
    popSound = loadSound(['assets/pop.mp3']); 
}


// ====================================================================
// ExplosionParticle 類別：模擬爆破後的碎片
// ====================================================================
class ExplosionParticle {
    constructor(x, y, particleColor) {
        this.x = x;
        this.y = y;
        this.color = particleColor;
        this.lifespan = 255; 
        this.size = random(2, 5); 
        
        this.angle = random(TWO_PI); 
        this.speed = random(1, 4);
        this.vx = cos(this.angle) * this.speed;
        this.vy = sin(this.angle) * this.speed;
        this.gravity = 0.05; 
    }

    update() {
        this.vx *= 0.95; 
        this.vy += this.gravity; 
        this.x += this.vx;
        this.y += this.vy;
        this.lifespan -= 5; 
    }

    display() {
        let displayColor = color(red(this.color), green(this.color), blue(this.color), this.lifespan);
        fill(displayColor);
        noStroke();
        circle(this.x, this.y, this.size);
    }

    isFinished() {
        return this.lifespan < 0;
    }
}


// ====================================================================
// Circle 類別：氣球本體
// ====================================================================
class Circle {
    constructor() {
        this.reset();
        this.particles = []; 
        this.exploded = false; 
    }
    
    reset() {
        this.colorHex = random(COLORS).substring(1); 
        let r = parseInt(this.colorHex.substring(0, 2), 16);
        let g = parseInt(this.colorHex.substring(2, 4), 16);
        let b = parseInt(this.colorHex.substring(4, 6), 16);
        
        this.alpha = random(50, 200); 
        this.color = color(r, g, b, this.alpha); 
        this.diameter = random(50, 200); 
        
        this.x = random(width); 
        this.y = random(height, height + 200); 
        this.speed = random(0.5, 3.0); 

        this.exploded = false;
        this.particles = [];
    }

    // 新增：檢查滑鼠是否點擊在氣球上
    isClicked(mx, my) {
        let d = dist(mx, my, this.x, this.y);
        return d < this.diameter / 2;
    }

    explode() {
        this.exploded = true;
        
        // 播放音效：只有在 audioContextStarted 為 true 時才播放
        if (popSound && audioContextStarted) { 
            // 避免疊音太多，只在音效沒播放時才啟動
            if (!popSound.isPlaying()) {
                popSound.play();
            }
        }
        
        // 產生碎片
        for (let i = 0; i < 15; i++) {
            this.particles.push(new ExplosionParticle(this.x, this.y, this.color));
        }
    }

    move() {
        if (this.exploded) {
            // 更新碎片
            for (let i = this.particles.length - 1; i >= 0; i--) {
                this.particles[i].update();
                if (this.particles[i].isFinished()) {
                    this.particles.splice(i, 1);
                }
            }
            if (this.particles.length === 0) {
                this.reset();
            }
            return; 
        }

        this.y -= this.speed;

        // *** 移除隨機爆破邏輯 (氣球只會因滑鼠點擊而爆破) ***

        if (this.y < -this.diameter / 2) {
            this.reset();
        }
    }

    display() {
        if (this.exploded) {
            for (let p of this.particles) {
                p.display();
            }
            return;
        }
        
        noStroke(); 
        fill(this.color); 
        circle(this.x, this.y, this.diameter); 

        // 繪製星星
        let radius = this.diameter / 2;
        let starOuterRadius = this.diameter / 6; 
        let starInnerRadius = starOuterRadius / 2.5; 
        let distance = radius / 2;
        let starX = this.x + distance * cos(PI / 4); 
        let starY = this.y - distance * sin(PI / 4);

        fill(255, 150); 
        noStroke(); 

        drawStar(starX, starY, starOuterRadius, starInnerRadius, 5);
    }
}


// ====================================================================
// drawStar 函數
// ====================================================================
function drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    
    push();
    translate(x, y); 
    
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
        let sx = cos(a) * radius2; 
        let sy = sin(a) * radius2;
        vertex(sx, sy);
        sx = cos(a + halfAngle) * radius1; 
        sy = sin(a + halfAngle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
    pop(); 
}


// ====================================================================
// p5.js 核心函數：setup, mousePressed, draw
// ====================================================================
function setup() {
    createCanvas(windowWidth, windowHeight); 
    angleMode(RADIANS); 
    
    for (let i = 0; i < NUM_CIRCLES; i++) {
        circles.push(new Circle());
    }

    // 啟動時先停止 draw 迴圈
    noLoop(); 
}

function mousePressed() {
    // 第一次點擊：啟動音訊環境
    if (!audioContextStarted) {
        userStartAudio(); 
        
        // 嘗試播放一次並停止，確保瀏覽器完全解鎖 AudioContext
        if (popSound) {
            popSound.play();
            popSound.stop();
        }
        
        audioContextStarted = true;
        loop(); // 啟動 draw 迴圈
    } 
    
    // 音訊已啟動：處理點擊氣球的遊戲邏輯
    else {
        for (let i = circles.length - 1; i >= 0; i--) {
            let circle = circles[i];
            
            // 檢查是否點擊到未爆破的氣球
            if (!circle.exploded && circle.isClicked(mouseX, mouseY)) {
                
                // 執行計分邏輯
                switch (circle.colorHex) {
                    case 'ff595e': // 紅色
                        score += 1;
                        break;
                    case 'ffca3a': // 黃色
                        score += 2;
                        break;
                    case '1982c4': // 藍色
                        score += 1;
                        break;
                    default: // 其他顏色 (綠、紫)
                        score -= 1;
                        break;
                }
                
                // 爆破氣球
                circle.explode();
                
                // 一次點擊只爆破一個氣球
                break; 
            }
        }
    }
}

function draw() {
    background(0); 
    
    if (!audioContextStarted) {
        // 音訊未啟動時顯示提示
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text("點擊畫面以開始 (啟用音效並開始遊戲)", width / 2, height / 2);
    } else {
        // 正常運行程式 (遊戲進行中)
        for (let i = 0; i < circles.length; i++) {
            circles[i].move();    
            circles[i].display(); 
        }
        
        // 顯示固定文字與分數
        
        // 設置文字樣式
        fill(textColor);
        textSize(textSizeVal);
        
        // 左上角文字
        textAlign(LEFT, TOP);
        text(fixedText, 20, 20); // 20px 邊距
        
        // 右上角分數
        textAlign(RIGHT, TOP);
        text(`分數: ${score}`, width - 20, 20); // 20px 邊距
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}