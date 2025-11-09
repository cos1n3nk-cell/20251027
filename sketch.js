/*
By Okazz
*/
let colors = ['#7bdff2', '#b2f7ef', '#f7d6e0', '#f2b5d4'];
let ctx;
let motions = [];
let motionClasses = [];
let sceneTimer = 0;
let resetTime = 60 * 8.5;
let fadeOutTime = 30;

// 新增：隱藏選單變數
let menuWidth = 320;
let menuX = -menuWidth;
let menuTargetX = -menuWidth;
let menuEasing = 0.12;
let menuItems = ['第一單元作品', '第一單元講義', '測驗系統', '測驗卷筆記', '作品筆記', '回到首頁'];
let menuLinks = {
    '測驗系統': 'https://cos1n3nk-cell.github.io/251109/',
    '測驗卷筆記': 'https://hackmd.io/@cosine6/H1zDbzRkbe',
    '作品筆記': 'https://hackmd.io/@cosine6/SJI2KMC1bx',
    '第一單元作品': 'https://cos1n3nk-cell.github.io/20251027/',
    '第一單元講義': 'https://hackmd.io/@cosine6/Sy0kF7Asgx'
};
let menuTextSize = 32;
let iframeElem = null; // 新增：iframe 參考
let backButton = null; // 新增：回去按鈕參考

function setup() {
	createCanvas(windowWidth, windowHeight);
	rectMode(CENTER);
	ctx = drawingContext;
	INIT();
}

function draw() {
    background('#eff7f6');
    for (let m of motions) {
        m.run();
    }

    let alph = 0;
    if ((resetTime - fadeOutTime) < sceneTimer && sceneTimer <= resetTime) {
        alph = map(sceneTimer, (resetTime - fadeOutTime), resetTime, 0, 255);
        background(255, alph);

    }

    if (frameCount % resetTime == 0) {
        INIT();
    }

    sceneTimer++;

    // 新增：選單滑出邏輯（當滑鼠在最左側 100px 時滑出）
    if (mouseX <= 100) {
        menuTargetX = 0;
    } else {
        menuTargetX = -menuWidth;
    }
    menuX = lerp(menuX, menuTargetX, menuEasing);

    // 在最上層繪製選單
    drawMenu();
}

function INIT() {
	sceneTimer = 0;
	motions = [];
	motionClasses = [Motion01, Motion02, Motion03, Motion04, Motion05];
	let drawingRegion = width * 0.75;
	let cellCount = 25;
	let cellSize = drawingRegion / cellCount;
	let clr = '#415a77';
	for (let i = 0; i < cellCount; i++) {
		for (let j = 0; j < cellCount; j++) {
			let x = cellSize * j + (cellSize / 2) + (width - drawingRegion) / 2;
			let y = cellSize * i + (cellSize / 2) + (height - drawingRegion) / 2;
			let MotionClass = random(motionClasses);
			let t = -int(dist(x, y, width / 2, height / 2) * 0.7);
			motions.push(new MotionClass(x, y, cellSize, t, clr));
		}
	}
}

function easeInOutQuint(x) {
	return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
}

class Agent {
	constructor(x, y, w, t, clr) {
		this.x = x;
		this.y = y;
		this.w = w;

		this.t1 = int(random(30, 100));
		this.t2 = this.t1 + int(random(30, 100));
		this.t = t;
		this.clr2 = color(clr);
		this.clr1 = color(random(colors));
		this.currentColor = this.clr1;
	}

	show() {
	}

	move() {
		if (0 < this.t && this.t < this.t1) {
			let n = norm(this.t, 0, this.t1 - 1);
			this.updateMotion1(easeInOutQuint(n));
		} else if (this.t1 < this.t && this.t < this.t2) {
			let n = norm(this.t, this.t1, this.t2 - 1);
			this.updateMotion2(easeInOutQuint(n));
		}
		this.t++;
	}

	run() {
		this.show();
		this.move();
	}

	updateMotion1(n) {

	}
	updateMotion2(n) {

	}

}

class Motion01 extends Agent {
	constructor(x, y, w, t, clr) {
		super(x, y, w, t, clr);
		this.shift = this.w * 3;
		this.ang = int(random(4)) * (TAU / 4);
		this.size = 0;
	}

	show() {
		noStroke();
		fill(this.currentColor);
		square(this.x + this.shift * cos(this.ang), this.y + this.shift * sin(this.ang), this.size);
	}

	updateMotion1(n) {
		this.shift = lerp(this.w * 3, 0, n);
		this.size = lerp(0, this.w, n);
		this.currentColor = lerpColor(this.clr1, this.clr2, n);
	}
}

class Motion02 extends Agent {
	constructor(x, y, w, t, clr) {
		super(x, y, w, t, clr);
		this.shift = this.w * 2;
		this.ang = int(random(4)) * (TAU / 4);
		this.size = 0;
		this.corner = this.w / 2;
	}

	show() {
		noStroke();
		fill(this.currentColor);
		square(this.x + this.shift * cos(this.ang), this.y + this.shift * sin(this.ang), this.size, this.corner);
	}

	updateMotion1(n) {
		this.shift = lerp(0, this.w * 2, n);
		this.size = lerp(0, this.w / 2, n);
	}

	updateMotion2(n) {
		this.size = lerp(this.w / 2, this.w, n);
		this.shift = lerp(this.w * 2, 0, n);
		this.corner = lerp(this.w / 2, 0, n);
		this.currentColor = lerpColor(this.clr1, this.clr2, n);
	}
}

class Motion03 extends Agent {
	constructor(x, y, w, t, clr) {
		super(x, y, w, t, clr);
		this.shift = this.w * 2;
		this.ang = 0;
		this.size = 0
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.ang);
		noStroke();
		fill(this.currentColor);
		square(0, 0, this.size);
		pop();
	}

	updateMotion1(n) {
		this.ang = lerp(0, TAU, n);
		this.size = lerp(0, this.w, n);
		this.currentColor = lerpColor(this.clr1, this.clr2, n);

	}
}

class Motion04 extends Agent {
	constructor(x, y, w, t, clr) {
		super(x, y, w, t, clr);
		this.shift = this.w * 2;
		this.ang = int(random(4)) * (TAU / 4);
		this.rot = PI;
		this.side = 0;
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.ang);
		translate(-this.w / 2, -this.w / 2);
		rotate(this.rot);
		fill(this.currentColor);
		rect(this.w / 2, (this.w / 2) - (this.w - this.side) / 2, this.w, this.side);
		pop();
	}

	updateMotion1(n) {
		this.side = lerp(0, this.w, n);
	}

	updateMotion2(n) {
		this.currentColor = lerpColor(this.clr1, this.clr2, n);
		this.rot = lerp(PI, 0, n);
	}
}

class Motion05 extends Agent {
	constructor(x, y, w, t, clr) {
		super(x, y, w, t, clr);
		this.shift = this.w / 2;
		this.size = 0;
	}

	show() {
		push();
		translate(this.x, this.y);
		for (let i = 0; i < 4; i++) {
			fill(this.currentColor);
			square((this.w / 4) + this.shift, (this.w / 4) + this.shift, this.size);
			rotate(TAU / 4);
		}
		pop();
	}

	updateMotion1(n) {
		this.size = lerp(0, this.w / 4, n);
	}

	updateMotion2(n) {
		this.currentColor = lerpColor(this.clr1, this.clr2, n);
		this.shift = lerp(this.w / 2, 0, n);
		this.size = lerp(this.w / 4, this.w / 2, n);

	}
}

// 新增：繪製選單（文字大小 32px）
function drawMenu() {
    push();
    translate(menuX, 0);

    // 背景
    noStroke();
    fill('#2b2b2b');
    rect(menuWidth / 2, height / 2, menuWidth, height);

    // 選單文字
    textSize(menuTextSize);
    textAlign(LEFT, TOP);

    let startY = 80;
    let gap = 88;
    for (let i = 0; i < menuItems.length; i++) {
        let y = startY + i * gap;
        // 判斷滑鼠是否在選單與該項目上（考慮 menuX 偏移）
        let relMouseX = mouseX - menuX;
        let hovered = relMouseX >= 0 && relMouseX <= menuWidth && mouseY >= y && mouseY <= y + 48;

        if (hovered) {
            fill('#ffd166'); // hover 顏色
        } else {
            fill(255); // 文字顏色
        }
        // 左內距 40
        text(menuItems[i], 40, y);
    }
    pop();
}

// 新增：顯示 / 隱藏 / 調整 iframe 的函式
function showIframe(url) {
    if (!iframeElem) {
        iframeElem = createElement('iframe');
        iframeElem.style('border', 'none');
        iframeElem.attribute('frameborder', '0');
        iframeElem.style('position', 'fixed');
        iframeElem.style('z-index', '9999');
        iframeElem.style('background', '#ffffff');
        iframeElem.style('box-shadow', '0 8px 24px rgba(0,0,0,0.4)');
    }
    
    let w = floor(windowWidth * 0.8);
    let h = floor(windowHeight * 0.8);
    let left = floor((windowWidth - w) / 2);
    let top = floor((windowHeight - h) / 2);
    
    iframeElem.size(w, h);
    iframeElem.position(left, top);
    iframeElem.attribute('src', url);
    iframeElem.show();
    
    // 創建或顯示回去按鈕
    if (!backButton) {
        backButton = createButton('離開');
        backButton.position(20, 20);
        backButton.style('padding', '10px 20px');
        backButton.style('background-color', '#7bdff2');
        backButton.style('border', 'none');
        backButton.style('border-radius', '5px');
        backButton.style('cursor', 'pointer');
        backButton.style('font-size', '16px');
        backButton.style('color', '#2b2b2b');
        backButton.style('z-index', '10000');
        backButton.mouseOver(() => backButton.style('background-color', '#b2f7ef'));
        backButton.mouseOut(() => backButton.style('background-color', '#7bdff2'));
        backButton.mousePressed(() => {
            hideIframe();
            INIT();
            backButton.hide();
        });
    }
    backButton.show();
}

function hideIframe() {
    if (iframeElem) {
        iframeElem.hide();
    }
    if (backButton) {
        backButton.hide();
    }
}

function mousePressed() {
    if (mouseX >= menuX && mouseX <= menuX + menuWidth) {
        let startY = 80;
        let gap = 88;
        for (let i = 0; i < menuItems.length; i++) {
            let y = startY + i * gap;
            if (mouseY >= y && mouseY <= y + 48) {
                let menuItem = menuItems[i];
                if (menuLinks[menuItem]) {
                    showIframe(menuLinks[menuItem]);
                } else if (menuItem === '回到首頁') {
                    hideIframe();
                    INIT();
                }
                break;
            }
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    if (iframeElem && iframeElem.style('display') !== 'none') {
        let w = floor(windowWidth * 0.8);
        let h = floor(windowHeight * 0.8);
        let left = floor((windowWidth - w) / 2);
        let top = floor((windowHeight - h) / 2);
        iframeElem.size(w, h);
        iframeElem.position(left, top);
    }
}
