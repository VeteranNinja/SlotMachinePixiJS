const app = new PIXI.Application(640, 200, {
    autoResize: true,
    antialias: true,
    resolution: 1,
});

document.body.appendChild(app.view);


class Resources {
    constructor(balance, stake, win) {
        this.balance = 150;
        this.stake = 1;
        this.win = 0;
        this.playing = false;
        this.addStake = function () {
            //Add stake with one point till it equals to three
            if (playerResources.stake >= 1 && playerResources.stake <= 2) {
                playerResources.stake ++;
            }
        };
        this.minusStake = function minusStake() {
            //Reduce stake one point till it equals to 1
            if (playerResources.stake > 1) {
                playerResources.stake --;
            }
        };
        this.reduceBalance = function (){
            //Reduce Balance when player prss on spin button
            this.balance = this.balance - this.stake;
        }
    }
}
let playerResources = new Resources();

PIXI.loader
    .add("red", "./assets/images/hearts red.png")
    .add("ball", "./assets/images/ball.png")
    .add("star", "./assets/images/starfish.png")
    .add("buttonActive", "./assets/images/spin.png")
    .add("coins", "./assets/images/coin.png")
    .add("yellowBar", "./assets/images/leftArrow.png")
    .add("blueBar", "./assets/images/rightArrow.png")
    .add("background", "./assets/images/background.png")
    .load(onAssetsLoaded);


const REEL_WIDTH = 90;
const SYMBOL_SIZE = 80;
let reels = [];
let anotherSlot = [];
let slotTextures = [];
let anotherSlotTextures = [];
let reelContainer;
let reel;

let red = PIXI.Texture.fromImage("./assets/images/hearts red.png");
let ball = PIXI.Texture.fromImage("./assets/images/ball.png");
let star = PIXI.Texture.fromImage("./assets/images/starfish.png");


//onAssetsLoaded handler builds the example.
function onAssetsLoaded() {

    //Create different slot symbols.
    slotTextures = [
        red,
        ball,
        star
    ];

    //container for footer items
    const footerContainer = new PIXI.Container();

    // draw a rectangle
    let graphicsOne = new PIXI.Graphics();
    graphicsOne.lineStyle(2, 0x221112, 1);
    graphicsOne.beginFill(0x1100AA, 0.25);
    graphicsOne.drawRect(50, 440, 120, 35, 15);
    graphicsOne.endFill();

    // draw a rectangle
    let graphicsTwo = new PIXI.Graphics();
    graphicsTwo.lineStyle(2, 0x221112, 1);
    graphicsTwo.beginFill(0x1100AA, 0.25);
    graphicsTwo.drawRect(255, 440, 120, 35, 15);
    graphicsTwo.endFill();

    //draw coin image for total balance
    let coins = new PIXI.Sprite.fromImage("./assets/images/poker-chip.png");
    coins.x = app.screen.width - 150;
    coins.y = 2;
    coins.scale.x *= 0.08;
    coins.scale.y *= 0.08;

    //Create PIXI container to hold all app buttons
    const buttonsHolder = new PIXI.Container();
    buttonsHolder.x = 0;
    buttonsHolder.y = 0;
    const makeImageButton = (image, x, y, scale) => {
        const button = PIXI.Sprite.fromImage(image);
        button.interactive = true;
        button.buttonMode = true;
        buttonsHolder.addChild(button);
        button.x = x;
        button.y = y;
        button.scale.set(scale);
        return button;
    };
    //Add image sprite, location and scale leftArrow button
    const leftArrow = makeImageButton(
        './assets/images/leftArrow.png',
        220,
        440,
        0.05
    );
    //Add image sprite, location and scale rightArrow button
    const rightArrow = makeImageButton(
        './assets/images/rightArrow.png',
        380,
        440,
        0.05
    );
    //Add image sprite, location and scale the spinButton button
    const buttonActive = makeImageButton(
        './assets/images/spin.png',
        450,
        375,
        0.2
    );

        //check for event on click on rightArrow button and call AddStake function
        rightArrow.addListener("pointerdown", () => {
            playerResources.addStake();
            // pdate  PIXI stack text on screen
            stackText.text = playerResources.stake;
        });

        //check for event on click on leftArrow button and call MinusStake function
        leftArrow.addListener("pointerdown", () => {
            playerResources.minusStake();
            footerContainer.addChild(stackText);
            //update  PIXI text on screen
            stackText.text = playerResources.stake;
        });

        //check for event on spin button
        buttonActive.addListener('pointerdown', () => {
            startPlay();
            //Reduce balance on click depending on bet amount
            playerResources.reduceBalance();
            //Add changes on canvas environment
            balanceText.text = playerResources.balance;
            console.log(`button clicked`);
        });

    //Build the reels
    reelContainer = new PIXI.Container();
    for (let i = 0; i < 3; i++) {
        const rc = new PIXI.Container();
        rc.x = i * REEL_WIDTH;
        reelContainer.addChild(rc);

        reel = {
            container: rc,
            symbols: [],
            position: 0,
            previousPosition: 0,
            blur: new PIXI.filters.BlurFilter()
        };

        //let newposition = reel.reelContainer.getChildIndex;
        reel.blur.blurX = 0;
        reel.blur.blurY = 0;
        rc.filters = [reel.blur];

        //Build the symbols
        for (let j = 0; j < 3; j++) {
            const symbol = new PIXI.Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
            //Scale the symbol to fit symbol area.
            symbol.y = j * SYMBOL_SIZE;
            symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height);
            symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 9);
            reel.symbols.push(symbol);
            rc.addChild(symbol);
        }
        reels.push(reel);
    }
    app.stage.addChild(reelContainer);

    //Build top & bottom covers and position reelContainer
    const margin = 50;
    reelContainer.y = margin * 2.8;
    reelContainer.x = 200;
    const top = new PIXI.Graphics();
    top.beginFill(0x1122ff);
    
    top.drawRect(0, 0, app.screen.width, margin);
    const bottom = new PIXI.Graphics();
    bottom.beginFill(0x1122ff);
    bottom.drawRect(-100, 380 + margin, app.screen.width, margin);

    //Add text Style properties
    const style = new PIXI.TextStyle({
        fontFace: 'verdana',
        fontSize: 24,
        fill: ['#ffff00', '#00ff99'], // gradient
        stroke: '#4a1850',
        strokeThickness: 5,
        wordWrap: true,
        wordWrapWidth: 300
    });

    //Add header text
    const headerText = new PIXI.Text('Slot Machines', style);
    headerText.x = Math.round((top.width - headerText.width) / 2);
    headerText.y = Math.round((margin - headerText.height) / 2);
    top.addChild(headerText);

    //Stack Selector Text between arrow buttons
    let stackText = new PIXI.Text(`${playerResources.stake}`, style);
    stackText.x = (app.screen.width / 3 + 40);
    stackText.y = 440;
    footerContainer.addChild(stackText);

    //Add win text to the canvas
    let winText = new PIXI.Text(`${playerResources.win}`, style);
    winText.x = 100;
    winText.y = 440;
    footerContainer.addChild(winText);

    //Add balance text to the canvas
    let balanceText = new PIXI.Text(`${playerResources.balance}`, style);
    balanceText.x = 600;
    balanceText.y = 7;
    top.addChild(balanceText);

    app.stage.addChild(top);
    app.stage.addChild(coins);
    app.stage.addChild(footerContainer);
    footerContainer.addChild(
        bottom,
        graphicsOne,
        graphicsTwo,
        buttonsHolder,
        buttonActive,
        stackText,
        winText);
    footerContainer.x = 100;
    footerContainer.y = 120;

    let running = false;

    //Function to start playing.
    function startPlay() {
        if (running) return;
        running = true;

        for (let i = 0; i < reels.length; i++) {
            const r = reels[i];
            const extra = Math.floor(Math.random() * 3);
            tweenTo(r, "position", r.position + 10 + i * 5 + extra, 2500 + i * 600 + extra * 600, backout(0.6), null, i == reels.length - 1 ? reelsComplete : null);
        }
    }

    //Reels done handler.
    function reelsComplete() {
        running = false;
    }

    // Listen for animate update.
    app.ticker.add(delta => {
        //Update the slots.
        for (const r of reels) {
            //Update blur filter y amount based on speed.
            //This would be better if calculated with time in mind also. Now blur depends on frame rate.
            r.blur.blurY = (r.position - r.previousPosition) * 8;
            r.previousPosition = r.position;

            //Update symbol positions on reel.
            for (let j = 0; j < r.symbols.length; j++) {
                const s = r.symbols[j];
                const prevy = s.y;
                s.y = (r.position + j) % r.symbols.length * SYMBOL_SIZE - SYMBOL_SIZE;
                if (s.y < 0 && prevy > SYMBOL_SIZE) {
                    //Detect going over and swap a texture. 
                    //This should in proper product be determined from some logical reel.
                    s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                    s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                    s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
                }
            }
        }
    });
}

//Very simple tweening utility function.
const tweening = [];

function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
    const tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now()
    };

    tweening.push(tween);
    return tween;
}
// Listen for animate update.
app.ticker.add(delta => {
    const now = Date.now();
    const remove = [];
    for (var i = 0; i < tweening.length; i++) {
        const t = tweening[i];
        const phase = Math.min(1, (now - t.start) / t.time);

        t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
        if (t.change) t.change(t);
        if (phase == 1) {
            t.object[t.property] = t.target;
            if (t.complete)
                t.complete(t);
            remove.push(t);
        }
    }
    for (var i = 0; i < remove.length; i++) {
        tweening.splice(tweening.indexOf(remove[i]), 1);
    }
});

//Basic lerp funtion.
function lerp(a1, a2, t) {
    return a1 * (1 - t) + a2 * t;
}

//Backout function from tweenjs.
//https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
backout = amount => t => --t * t * ((amount + 1) * t + amount) + 1;