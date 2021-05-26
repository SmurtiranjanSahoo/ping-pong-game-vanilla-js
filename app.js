var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

let hit = new Audio();
let wall = new Audio();
let userScore = new Audio();
let comScore = new Audio();

hit.src = "sounds/hit.mp3";
wall.src = "sounds/wall.mp3";
comScore.src = "sounds/comScore.mp3";
userScore.src = "sounds/userScore.mp3";

function drawRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

// ball
var ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  speed: 10,
  velocityX: 7,
  velocityY: 5,
  color: "white",
};

//net
var net = {
  x: canvas.width / 2 - 1,
  y: 0,
  width: 2,
  height: 10,
  color: "white",
};

// draw text
function drawText(text, x, y) {
  ctx.fillStyle = "#FFF";
  ctx.font = "75px fantasy";
  ctx.fillText(text, x, y);
}

//paddle
var user = {
  x: 10,
  y: canvas.height / 2 - 70,
  width: 20,
  height: 140,
  score: 0,
  color: "white",
};
var com = {
  x: canvas.width - 20 - 10,
  y: canvas.height / 2 - 70,
  width: 20,
  height: 140,
  score: 0,
  color: "white",
};

//paddle user move
window.addEventListener("keydown", moveUserPaddle);
window.addEventListener("mousemove", movePaddleMouse);

function movePaddleMouse(evt) {
  //for mousemove event
  let rect = canvas.getBoundingClientRect();
  user.y = evt.clientY - rect.top - user.height / 2;
}

function moveUserPaddle(evt) {
  if (evt.keyCode == "38" && user.y > 0) {
    // 38 up arrow
    user.y = user.y - user.height / 2;
  } else if (evt.keyCode == "40" && user.y < canvas.height - user.height) {
    //down arrow
    user.y = user.y + user.height / 2;
    //console.log("down");
  }
}

//resetGame
function resetGame() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.velocityX = -ball.velocityX;
  ball.speed = 10;
}

// collision detection
function collision(b, p) {
  p.top = p.y;
  p.bottom = p.y + p.height;
  p.left = p.x;
  p.right = p.x + p.width;

  b.top = b.y - b.radius;
  b.bottom = b.y + b.radius;
  b.left = b.x - b.radius;
  b.right = b.x + b.radius;

  return (
    p.left < b.right && p.top < b.bottom && p.right > b.left && p.bottom > b.top
  );
}

// render
function render() {
  // clear the canvas
  drawRect(0, 0, canvas.width, canvas.height, "#000");

  // draw the user score to the left
  drawText(user.score, canvas.width / 4, canvas.height / 5);

  // draw the COM score to the right
  drawText(com.score, (3 * canvas.width) / 4, canvas.height / 5);

  //ball
  drawCircle(ball.x, ball.y, ball.radius, ball.color);
  //paddle
  drawRect(user.x, user.y, user.width, user.height, user.color);
  drawRect(com.x, com.y, com.width, com.height, com.color);
  //net
  for (let i = 0; i <= canvas.height; i += 15) {
    drawRect(net.x, net.y + i, net.width, net.height, net.color);
  }
  // Instruction
  instructionTxt();
}

//update
function update() {
  //score update
  if (ball.x - ball.radius < 0) {
    com.score++;
    comScore.play();
    resetGame();
  } else if (ball.x + ball.radius > canvas.width) {
    user.score++;
    userScore.play();
    resetGame();
  }

  //ball
  ball.x += ball.velocityX;
  ball.y += ball.velocityY;
  // when the ball collides with bottom and top walls we inverse the y velocity.
  if (ball.y > canvas.height - ball.radius || ball.y - ball.radius < 0) {
    ball.velocityY = -ball.velocityY;
    wall.play();
  }
  //AI paddle computer
  const computerLevel = 0.1;
  com.y += (ball.y - (com.y + com.height / 2)) * computerLevel;

  // we check if the paddle hit the user or the com paddle
  let player = ball.x + ball.radius < canvas.width / 2 ? user : com;

  // if the ball hits a paddle
  if (collision(ball, player)) {
    // play sound
    hit.play();
    // we check where the ball hits the paddle
    let collidePoint = ball.y - (player.y + player.height / 2);
    // normalize the value of collidePoint, we need to get numbers between -1 and 1.
    // -player.height/2 < collide Point < player.height/2
    collidePoint = collidePoint / (player.height / 2);

    // when the ball hits the top of a paddle we want the ball, to take a -45degees angle
    // when the ball hits the center of the paddle we want the ball to take a 0degrees angle
    // when the ball hits the bottom of the paddle we want the ball to take a 45degrees
    // Math.PI/4 = 45degrees
    let angleRad = (Math.PI / 4) * collidePoint;

    // change the X and Y velocity direction
    let direction = ball.x + ball.radius < canvas.width / 2 ? 1 : -1;
    ball.velocityX = direction * ball.speed * Math.cos(angleRad);
    ball.velocityY = ball.speed * Math.sin(angleRad);

    // speed up the ball everytime a paddle hits it.
    ball.speed += 0.1;
  }
}

function instructionTxt() {
  ctx.fillStyle = "#FFF";
  ctx.font = "12px serif";
  ctx.fillText(
    "Use Arrow key or mouse to control Paddle",
    2.5 * (canvas.width / 4),
    4.9 * (canvas.height / 5)
  );
}

function game() {
  requestAnimationFrame(game);
  render();
  update();
}

game();
