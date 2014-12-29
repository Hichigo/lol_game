var cnv = document.getElementById('cnv'),
    ctx = cnv.getContext('2d'),
    w = cnv.width = 600,
    h = cnv.height = 850,
    x = Math.random() * 600 >> 0,
    speed = 100,
    oldTime = new Date(),
    nowTime,
    stars = [],
    flash = [],
    speedK = 10,
    gdt = 0,
    score = 0,
    maxScore = 200,
    lineScoreSize = 500,
    scoreSize = 0,
    numFlash = 10,
    img = new Image(),
    badFlash = new Image(),
    goodFlash = new Image();

img.src = 'монитор.png';
badFlash.src = 'bad64.png';
goodFlash.src = 'good64.png';

ctx.fillStyle = '#fff';
ctx.font = '20px Arial';

var Star = {
  constructor: function(x, y, r, speed) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.speed = speed;
    return this;
  }
};

var Player = {
  constructor: function(img, x, y, speed, type) {
    this.img = img;
    this.x = x - img.width / 2;
    this.y = y - img.height / 2;
    this.speed = speed;
    this.type = type || 'player';
    return this;
  },
  resolvePos: function(x) {
    this.x += x;
    if(this.x <= 0) {
      this.x = 0;
    } else if(this.x >= w - this.img.width){
      this.x = w - this.img.width;
    }
  },
  move: function(dt) {
    if(input.isDown('LEFT') || input.isDown('a')) { //left
      this.resolvePos(-(this.speed * dt));
    } else if(input.isDown('RIGHT') || input.isDown('d')) { //right
      this.resolvePos(this.speed * dt);
    }
  }
};

var pl = Object.create(Player).constructor(img, range(0, w-128), h-128, 500);

function endOfTheGame() {
  if(score >= 20) {
    return 'win';
  } else if(score < 0) {
    return 'end';
  } else {
    return 'con';
  }
}

function range(min, max) {
  return min + Math.random() * (max - min);
}

function init() {
  for(var i = 0; i < 40; i++) {
    var radius = range(3, 7),
        speed = (25 + radius) * speedK;
    stars[i] = Object.create(Star).constructor(Math.random() * w >> 0, Math.random() * h >> 0, radius, speed);
  }
  for(i = 0; i < numFlash; i++) {
    var randCol = (Math.random()*2 >> 0);
    var fl = randCol ? badFlash : goodFlash;
    var type = randCol ? 'red' : 'green';
    flash[i] = Object.create(Player).constructor(fl, range(0, w-fl.width), range(-(h*2), -h), range(300, 700), type);
  }
}

var requestAnimFrame = (function(){
    return window.requestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        };
})();

function update(dt) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,w,h);
  ctx.fillStyle = "#fff";
  for(var i = 0; i < stars.length; i++) {
    if(stars[i].y >= h + stars[i].r) {
      stars[i].y = -stars[i].r;
      stars[i].x = Math.random() * w >> 0;
      stars[i].r = range(3, 7);
      stars[i].speed = (25 + stars[i].r) * speedK;
    } else {
      stars[i].y += dt * stars[i].speed;
    }
  }
  for(i = 0; i < flash.length; i++) {
    if(flash[i].y > h + flash[i].img.height) {
      flash[i].y = range(-400, -200);
      flash[i].x = range(0, w-flash[i].img.width);
      flash[i].img = (Math.random()*2 >> 0) ? badFlash : goodFlash;
      flash[i].speed = range(300, 700);
    } else {
      flash[i].y += dt * flash[i].speed;
    }
    
    if(flash[i].y + flash[i].img.height >= pl.y) {
      if(flash[i].x >= pl.x - (pl.img.width / 2) && flash[i].x <= pl.x + pl.img.width) {
        if(flash[i].type === 'green') { // тут что то непонятное происходит :)
          score++;
        } else if(flash[i].type === 'red') {
          score -= 5;
        }
        var randCol = (Math.random()*2 >> 0);
        var fl = randCol ? badFlash : goodFlash;
        var type = randCol ? 'red' : 'green';
        flash[i].y = range(-400, -200);
        flash[i].x = range(0, w-flash[i].img.width);
        flash[i].img = fl;
        flash[i].speed = range(300, 700);
        flash[i].type = type;

        var percent = score * 100 / 200;
        scoreSize = (percent / 100) * lineScoreSize;
      }
    }
  }
  pl.move(dt);
}

function render() {
  for(var i = 0; i < stars.length; i++) {
    ctx.beginPath();
    ctx.arc(stars[i].x, stars[i].y, stars[i].r, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
  }
  for(i = 0; i < flash.length; i++) {
    ctx.drawImage(flash[i].img, flash[i].x, flash[i].y);
  }
  ctx.fillText('Score: ' + score, 30, 30);
  ctx.drawImage(pl.img, pl.x, pl.y);
  ctx.fillStyle = '#f90';
  ctx.fillRect(50, h - 20, scoreSize, 10);
}

function main() {
  if(endOfTheGame() === 'con') {
    nowTime = new Date();
    var delta = (nowTime - oldTime) / 1000.0;
    gdt = delta;
    update(delta);
    render();
    oldTime = new Date();
  } else if(endOfTheGame() === 'win') {
    ctx.fillText('Победа!', 260, h / 2 - 15);
  } else if(endOfTheGame() === 'end') {
    ctx.fillText('Поражение!', 250, h / 2 - 15);
  }

  requestAnimFrame(main);
}

init();
main();