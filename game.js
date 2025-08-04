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
function spawnBot() {
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
for (let i = 0; i < 5; i++) {
  spawnBot();
}

let bullets = [];

function drawHuman(x, y, width, height, color, drawGun = true) {
  ctx.fillStyle = color;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
  // Head
  ctx.beginPath();
  ctx.arc(x, y - height / 2 - 8, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
  // Gun
  if (drawGun) {
    ctx.strokeStyle = 'silver';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y - height / 4);
    ctx.lineTo(x + width / 2 + 12, y - height / 4);
    ctx.stroke();
  }
}

function drawPlayer() {
  drawHuman(player.x, player.y, player.width, player.height, player.color);
}

function drawBots() {
  for (const bot of bots) {
    drawHuman(bot.x, bot.y, bot.width, bot.height, bot.color);
  }
}

function drawBullets() {
  ctx.fillStyle = 'yellow';
  for (const bullet of bullets) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

let touchingEnemy = false;

function updateBots() {
  touchingEnemy = false;
  for (let i = bots.length - 1; i >= 0; i--) {
    const bot = bots[i];
    bot.x += bot.dx;
    bot.y += bot.dy;

    if (bot.x < 0 || bot.x > canvas.width) bot.dx *= -1;
    if (bot.y < 0 || bot.y > canvas.height) bot.dy *= -1;

    const dx = bot.x - player.x;
    const dy = bot.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 40) {
      player.health -= 2;
      touchingEnemy = true;
      bot.dx *= -1;
      bot.dy *= -1;
      if (player.health <= 0) {
        alert('KATAM TATA BYE BYE : ' + player.score);
        document.location.reload();
      } else {
        // Push the player away from the bot
        player.x += dx * 0.1;
        player.y += dy * 0.1;
      }
    }       
  }

  if (!touchingEnemy && player.health < 100) {
    player.health += 0.04;
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;

    // Remove bullets outside screen
    if (
      bullet.x < 0 || bullet.x > canvas.width ||
      bullet.y < 0 || bullet.y > canvas.height
    ) {
      bullets.splice(i, 1);
      continue;
    }

    // Collision with bots
    for (let j = bots.length - 1; j >= 0; j--) {
      const bot = bots[j];
      const dx = bot.x - bullet.x;
      const dy = bot.y - bullet.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 20) {
        bots.splice(j, 1);
        bullets.splice(i, 1);
        player.score++;
        spawnBot(); // respawn a bot after one dies
        break;
      }
    }
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
  drawBullets();
  updateBots();
  updateBullets();
  updateUI();

  requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (e) => {
  player.x = e.clientX;
  player.y = e.clientY;
});

canvas.addEventListener('click', (e) => {
  const angle = Math.atan2(e.clientY - player.y, e.clientX - player.x);
  bullets.push({
    x: player.x + player.width / 2 + 12,
    y: player.y - player.height / 4,
    vx: Math.cos(angle) * 8,
    vy: Math.sin(angle) * 8
  });
});

gameLoop();
