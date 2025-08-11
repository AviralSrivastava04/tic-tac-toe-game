// ----- Elements -----
const game = document.getElementById("game");
const status = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const toggleBtn = document.getElementById("theme-toggle");
const modeBtn = document.getElementById("mode-btn"); // new button

// ----- Sounds -----
const clickSound = document.getElementById("click-sound");
const winSound = document.getElementById("win-sound");
const drawSound = document.getElementById("draw-sound");

// ----- Game state -----
let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X"; // human always starts as X
let gameOver = false;
let vsAI = false; // false -> 2 players, true -> human vs AI

// create UI cells (if you already create them elsewhere, skip or remove)
function createBoard() {
  game.innerHTML = "";
  board.forEach((cell, index) => {
    const div = document.createElement("div");
    div.classList.add("cell");
    div.dataset.index = index;
    div.textContent = cell;
    game.appendChild(div);
  });
}
createBoard(); // initial creation

// ----- Utility: check winner (returns "X","O","draw" or null) -----
function getWinner(simBoard) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let [a,b,c] of winPatterns) {
    if (simBoard[a] && simBoard[a] === simBoard[b] && simBoard[a] === simBoard[c]) {
      return simBoard[a]; // "X" or "O"
    }
  }
  if (!simBoard.includes("")) return "draw";
  return null;
}

// ----- Visual highlight for winner cells -----
function highlightWinnerCells(pattern) {
  pattern.forEach(i => {
    game.children[i].style.background = "#03dac5";
    game.children[i].style.color = "#121212";
  });
}

// ----- Update status and UI after a change -----
function updateUI() {
  // redraw board content
  board.forEach((val, idx) => {
    const cell = game.querySelector(`[data-index='${idx}']`);
    if (cell) cell.textContent = val;
  });
}

// ----- Game over handler (used after a winner is found) -----
function handleGameOver(result) {
  gameOver = true;
  if (result === "draw") {
    status.textContent = "🤝 It's a draw!";
    drawSound.play();
  } else {
    status.textContent = `🎉 Player ${result} wins!`;
    winSound.play();
    // highlight winning cells visually
    const winPatterns = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (let pattern of winPatterns) {
      const [a,b,c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        highlightWinnerCells(pattern);
        break;
      }
    }
  }
}

// ----- Check current board for end state ----- 
function checkAndHandleWinner() {
  const result = getWinner(board);
  if (result) handleGameOver(result);
  return result;
}

// ----- Minimax for unbeatable AI (AI plays "O") -----
function minimax(simBoard, depth, isMaximizing) {
  const result = getWinner(simBoard);
  if (result === "O") return 10 - depth;
  if (result === "X") return depth - 10;
  if (result === "draw") return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!simBoard[i]) {
        simBoard[i] = "O";
        let score = minimax(simBoard, depth + 1, false);
        simBoard[i] = "";
        bestScore = Math.max(bestScore, score);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!simBoard[i]) {
        simBoard[i] = "X";
        let score = minimax(simBoard, depth + 1, true);
        simBoard[i] = "";
        bestScore = Math.min(bestScore, score);
      }
    }
    return bestScore;
  }
}

function findBestMove() {
  let bestScore = -Infinity;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = "O";
      let score = minimax(board, 0, false);
      board[i] = "";
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

// ----- AI move with slight delay for UX -----
function aiMove() {
  if (gameOver) return;
  // small delay so player sees their move
  setTimeout(() => {
    const best = findBestMove();
    if (best !== -1) {
      board[best] = "O";
      clickSound.play();
      updateUI();
      const result = checkAndHandleWinner();
      if (!result) {
        currentPlayer = "X";
        status.textContent = `Player ${currentPlayer}'s turn`;
      }
    }
  }, 350);
}

// ----- Click handler for user moves -----
game.addEventListener("click", (e) => {
  if (gameOver) return;
  const idx = e.target.dataset.index;
  if (typeof idx === "undefined") return;
  const index = Number(idx);
  if (board[index]) return; // already filled

  // If vsAI and it's AI's turn, ignore clicks
  if (vsAI && currentPlayer === "O") return;

  // Player move
  board[index] = currentPlayer;
  clickSound.play();
  updateUI();

  const result = checkAndHandleWinner();
  if (!result) {
    // switch turn
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    status.textContent = `Player ${currentPlayer}'s turn`;

    // If vs AI and it's AI's turn now -> make AI move
    if (vsAI && currentPlayer === "O" && !gameOver) {
      aiMove();
    }
  }
});

// ----- Reset button -----
resetBtn.addEventListener("click", () => {
  board = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameOver = false;
  status.textContent = `Player ${currentPlayer}'s turn`;
  // reset cell styles & content
  for (let i = 0; i < 9; i++) {
    const cell = game.querySelector(`[data-index='${i}']`);
    if (cell) {
      cell.textContent = "";
      cell.style.background = "";
      cell.style.color = "";
    }
  }
});

// ----- Mode toggle button -----
modeBtn.addEventListener("click", () => {
  vsAI = !vsAI;
  modeBtn.textContent = vsAI ? "Mode: VS AI" : "Mode: 2 Players";
  // If switching to VS AI and it's AI's turn (possible after reset?), make AI move if needed
  if (vsAI && currentPlayer === "O" && !gameOver) aiMove();
});

// ----- Theme toggle (existing) -----
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});

// ----- Initial UI setup -----
status.textContent = `Player ${currentPlayer}'s turn`;
updateUI();
