'use strict';
const h1 = document.getElementById('h1');
const music = document.getElementById('bg-music');
const crunchSound = document.getElementById('crunch-sound');
const gameOverSound = document.getElementById('gameover-sound');
const canvas = document.querySelector('canvas');
const arrowsContainer = document.querySelector('.arrows-container');
const arrowBtns = Array.from(document.getElementsByClassName('arrow'));
const up = document.getElementById('up');
const right = document.getElementById('right');
const down = document.getElementById('down');
const left = document.getElementById('left');
const overlay = document.querySelector('.overlay');
const closeBtn = document.getElementById('close');
const restartBtn = document.getElementById('restart');
const cancelBtn = document.getElementById('cancel');
let scoreText = document.getElementById('score');
let scoreModal = document.getElementById('score-modal');
const windowWidth = window.innerWidth;
// Game variables
// Canvas
const blockSize = windowWidth < 775 ? 10: 20;
const columns = 30;
const rows = 30;
canvas.width = blockSize * rows;
canvas.height = blockSize * columns;
const ctx = canvas.getContext('2d');
// Snake 
const snake =
{
  head:
  { 
    x: canvas.width / 2,
    y: canvas.height / 2
  }, 
  body:[]
};
// Food 
const food = { x: 0, y: 0 };
// State & settings
let direction = '';
const velocity = { x: 0, y: 0 }
let score = 0;
const gracePeriod = 150; // before collision
let gameStarted = false;
let gameOver = false;
let modalClosed = false;
let drawInterval;
// Game logic
function main()
{ 
  drawInterval = setInterval(draw, 60);
  drawFood();
  initArrows();
  document.addEventListener('keydown', changeDirection);
  initModalButtons();
}

function draw() 
{
  ctx.clearRect(0,0, canvas.width, canvas.height);
  // Draw canvas
  ctx.fillStyle = '#000';
  ctx.fillRect(0,0,canvas.width, canvas.height);
  // Draw snake head
  ctx.fillStyle = '#ffd43b';
  ctx.fillRect(snake.head.x, snake.head.y, blockSize, blockSize);
  // Draw snake body
  ctx.fillStyle = '#ffd43b';
  snake.body.forEach(segment =>
    ctx.fillRect(segment.x, segment.y, blockSize, blockSize));
  // Draw food
  ctx.fillStyle = '#306998';
  ctx.fillRect(food.x,food.y, blockSize, blockSize);

  update();
}

function drawFood()
{
  food.x = Math.floor(Math.random() * rows) * blockSize;
  food.y = Math.floor(Math.random() * columns) * blockSize;
}

function changeDirection(e)
{
  switch (e.key)
  {
    case 'ArrowUp':
      if (direction !== 'down')
      {
        direction = 'up';
        velocity.x = 0;
        velocity.y = -blockSize;
        removeClassActive();
        addClassActive(up);
        if (!gameStarted) gameStarted = true;

      }
      break;
    
    case 'ArrowRight':
      if (direction !== 'left')
      {
        direction = 'right';
        velocity.x = blockSize;
        velocity.y = 0;
        removeClassActive();
        addClassActive(right);
        if (!gameStarted) gameStarted = true;

      }
      break;
    
    case 'ArrowDown':
      if (direction !== 'up') 
      {
        direction = 'down';
        velocity.x = 0;
        velocity.y = blockSize;
        removeClassActive();
        addClassActive(down);
        if (!gameStarted) gameStarted = true;

      }
      break;
      
    case 'ArrowLeft':
      if (direction !== 'right' && direction)
      {
        direction = 'left';
        velocity.x = -blockSize;
        velocity.y = 0;
        removeClassActive();
        addClassActive(left);
        if (!gameStarted) gameStarted = true;

      }
      break;
  }
}

function navigate(k)
{
  // Title id and prefix it with Arrow
  const key = `Arrow${k[0].toUpperCase() + k.slice(1)}`;
  // Stimulate key
  document.dispatchEvent(new KeyboardEvent('keydown', { key: key }));
}

function initArrows()
{
  arrowsContainer.addEventListener('click', handleArrowEvents)
}

function handleArrowEvents(e)
{
  if (e.target.classList.contains('arrow'))
    navigate(e.target.id);
}

function addClassActive(btn)
{
  if (direction) btn.classList.add('active');
}

function playMusic()
{
 music.play();
}

function pauseMusic() {
  music.pause();
}

function playSoundEffect(e)
{
  if (e === 'gameover')
  {
    gameOverSound.play();
  }
  else if (e === 'crunch')
  {
    crunchSound.play();
  }
}

function resetAudio(audio)
{
  audio.currentTime = 0;
}

function update()
{
  // Update body
  if (snake.body.length)
  {
    for (let i = snake.body.length - 1; i > 0; i--)
    {
      // Each segment will follow its previous
      snake.body[i] = { ...snake.body[i - 1] };
    }
    // first body segment is set to old head
    snake.body[0] = { ...snake.head};
  }

  if (gameStarted) playMusic();


  switch (direction) 
  {
    case 'up':
      if (snake.head.y > 0) 
      {
        snake.head.y += velocity.y;
      }
      break;
      
    case 'right':
      if (snake.head.x + blockSize < canvas.width) 
      {
        snake.head.x += velocity.x;
      }
      break;
  
    case 'down':
      if (snake.head.y + blockSize < canvas.height) 
      {
        snake.head.y += velocity.y;
      }
      break;
      
    case 'left':
      if (snake.head.x > 0) 
      {
        snake.head.x += velocity.x;
      }
      break;
  }
  checkCollision();
}

function checkCollision() 
{
  // Canvas collision
  if (snake.head.x + blockSize === canvas.width || snake.head.x === 0 || snake.head.y + blockSize === canvas.height || snake.head.y === 0) 
  {
   // if direction has not been changed within 150ms game over
    setTimeout(() => 
    {
      if 
      (
        (snake.head.x === 0 && direction === 'left')
        
        || (snake.head.x + blockSize === canvas.width && direction === 'right') 
       
        || (snake.head.y === 0 && direction === 'up' )
        
        || (snake.head.y + blockSize === canvas.height
        && direction === 'down') 
      )
      {
        gameOver = true;
      }
    }, gracePeriod);
  } 
  // Self collision
  snake.body.forEach(segment =>
  {
    if (snake.head.x === segment.x && snake.head.y === segment.y)
    {
      gameOver = true;
    }
  });
  // Food collision
  if (snake.head.x === food.x && snake.head.y === food.y) 
  {
    playSoundEffect('crunch');
    resetAudio(crunchSound);
    snake.body.push({x: food.x, y: food.y});
    drawFood();
    updateScore();
  }
  if (gameOver) endGame();
}

function updateScore()
{
  scoreText.textContent = ++score;
}

function openModal()
{
  overlay.classList.remove('hidden');
  scoreModal.textContent = scoreText.textContent;
}

function initModalButtons()
{
  modal.addEventListener('click', handleModalEvents);
}

function handleModalEvents(e)
{
  if (e.target.classList.contains('modal-btn'))
  {
    if (e.target.classList.contains('exit'))
    {
      closeModal();
    }
    else
    {
      closeModal();
      resetGame();
    }
  }
}

function closeModal()
{
  overlay.classList.add('hidden');
  modalClosed = true;
}

function removeEvents()
{
  document.removeEventListener('keydown', changeDirection);
  arrowsContainer.removeEventListener('click', handleArrowEvents);
   if (modalClosed) modal.removeEventListener('click', handleModalEvents);
}

function removeClassActive()
{
  arrowBtns.forEach(btn =>
  {
    btn.classList.remove('active');
  });
}

function resetGame()
{
  // Reset snake
  [snake.head.x, snake.head.y] = [canvas.width / 2, canvas.height / 2];
  snake.body.length = 0;
  // Reset food
  [food.x, food.y] = [0];
  // Reset state & settings
  direction = '';
  [velocity.x, velocity.y] = [0];
  score = 0;
  gameStarted = false;
  gameOver = false;
  modalClosed = false;
  h1.innerHTML = 'Score: <span id="score">0';
  h1.style.color = '#7f0';
  scoreText = document.getElementById('score');
  scoreModal = document.getElementById('score-modal');
  h1.style.animation = 'none';
  h1.style.textShadow = '0 0 30px #7f0';
  // Reinitialize game
  main();
}

function endGame()
{
  clearInterval(drawInterval);
  pauseMusic();
  resetAudio(music);
  playSoundEffect('gameover');
  setTimeout(openModal, 3000);
  removeEvents();
  removeClassActive();
  h1.textContent = 'Game over!';
  h1.style.cssText = 'animation: change-color .9s infinite alternate; text-shadow: 0 0 30px #ff0000;';
}

main();
