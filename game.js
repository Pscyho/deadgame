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
    dy: (Math.random() - 0.5) * 2,
    shootCooldown: Math.random() * 200 + 100 // Random delay
  });
}
for (let i = 0; i < 5; i++) spawnBot();

let bullets = [];
let enemyBullets = [];

function drawHuman(x, y, width, height, color, drawGun = true) {
  ctx.fillStyle = color;
  ctx.fillRect(x - width / 2, y - height / 2, width, height);
  ctx.beginPath();
  ctx.arc(x, y - height / 2 - 8, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
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

  ctx.fillStyle = 'red';
  for (const bullet of enemyBullets) {
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function updateBots() {
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
      player.health -= 1;
      bot.dx *= -1;
      bot.dy *= -1;
      if (player.health <= 0) {
        alert('Game Over! Final Score: ' + player.score);
        document.location.reload();
      }
    }

    // === Enemy shooting logic ===
    bot.shootCooldown--;
    if (bot.shootCooldown <= 0) {
      const angle = Math.atan2(player.y - bot.y, player.x - bot.x);
      enemyBullets.push({
        x: bot.x,
        y: bot.y,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4
      });
      bot.shootCooldown = Math.random() * 150 + 100;
    }
  }

  if (player.health < 100) player.health += 0.1;
}

function updateBullets() {
  // Player bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
      bullets.splice(i, 1);
      continue;
    }
    for (let j = bots.length - 1; j >= 0; j--) {
      const bot = bots[j];
      const dx = bot.x - bullet.x;
      const dy = bot.y - bullet.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 20) {
        bots.splice(j, 1);
        bullets.splice(i, 1);
        player.score+= 20;
        spawnBot();
        break;
      }
    }
  }

  // Enemy bullets
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const bullet = enemyBullets[i];
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
      enemyBullets.splice(i, 1);
      continue;
    }
    const dx = bullet.x - player.x;
    const dy = bullet.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 20) {
      player.health -= 5;
      enemyBullets.splice(i, 1);
      if (player.health <= 0) {
        alert('Game Over! Final Score: ' + player.score);
        document.location.reload();
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
