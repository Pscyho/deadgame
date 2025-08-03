const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: 20,
  height: 40,
  color: 'lime',
  health: 100,
  score: 0
};

let bots = [];
for (let i = 0; i < 5; i++) {
  bots.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    width: 20,
    height: 40,
    color: 'crimson',
    dx: (Math.random() - 0.5) * 2,
    dy: (Math.random() - 0.5) * 2
  });
}

function drawHuman(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
  // Head
  ctx.beginPath();
  ctx.arc(x, y - height / 2 - 8, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
}

function drawPlayer() {
  drawHuman(player.x, player.y, player.width, player.height, player.color);
}

function drawBots() {
  for (const bot of bots) {
    drawHuman(bot.x, bot.y, bot.width, bot.height, bot.color);
  }
}

let touchingEnemy = false;

function updateBots() {
  touchingEnemy = false;
  for (const bot of bots) {
    bot.x += bot.dx;
    bot.y += bot.dy;

    if (bot.x < 0 || bot.x > canvas.width) bot.dx *= -1;
    if (bot.y < 0 || bot.y > canvas.height) bot.dy *= -1;

    const dx = bot.x - player.x;
    const dy = bot.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40) {
      player.health -= 1;
      touchingEnemy = true;
      bot.dx *= -1;
      bot.dy *= -1;
      if (player.health <= 0) {
        alert('Game Over! Final Score: ' + player.score);
        document.location.reload();
      }
        player.score += 10;
        bot.x = Math.random() * canvas.width;
        bot.y = Math.random() * canvas.height;
    }
  }

  if (!touchingEnemy && player.health < 100) {
    player.health += 0.1;
  }
}

function updateUI() {
  document.getElementById('health').textContent = Math.round(player.health);
  document.getElementById('score').textContent = player.score;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPlayer();
  drawBots();
  updateBots();
  updateUI();

  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (e) => {
  player.x = e.clientX;
  player.y = e.clientY;
});

gameLoop();