const game = document.getElementById("game");
    const status = document.getElementById("status");
    const resetBtn = document.getElementById("reset");

    let board = ["", "", "", "", "", "", "", "", ""];
    let currentPlayer = "X";
    let gameOver = false;

    // ---------------------------------
    const clickSound = document.getElementById("click-sound");
    const winSound = document.getElementById("win-sound");
    const drawSound = document.getElementById("draw-sound");

    // -----------------------------------

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

    function checkWinner() {
      const winPatterns = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
      ];
      for (let pattern of winPatterns) {
        const [a,b,c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          gameOver = true;
          status.textContent = "🎉 Player ${board[a]} wins!";
          // ----------------------------------------------------------------
          winSound.play();
          // ----------------------------------------------------------------
          highlightWinnerCells(pattern);
          return;
        }
      }
      if (!board.includes("")) {
        gameOver = true;
        status.textContent = "🤝 It's a draw!";
        // --------------------------------------------------------------------
        drawSound.play();
        // ---------------------------------------------------------------------
      }
    }

    function highlightWinnerCells(pattern) {
      pattern.forEach(i => {
        game.children[i].style.background = "#03dac5";
        game.children[i].style.color = "#121212";
      });
    }

    game.addEventListener("click", e => {
      const index = e.target.dataset.index;
      if (!index || board[index] || gameOver) return;
      board[index] = currentPlayer;
      // ----------------------------------------------------------------------------------
      clickSound.play();
      // ----------------------------------------------------------------------------------
      createBoard();
      checkWinner();
      if (!gameOver) {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        status.textContent = "Player ${currentPlayer}'s turn";
      }
    });

    resetBtn.addEventListener("click", () => {
      board = ["", "", "", "", "", "", "", "", ""];
      currentPlayer = "X";
      gameOver = false;
      status.textContent = "Player X's turn";
      createBoard();
    });

    createBoard();

    // --------------------------------------------------
    const toggleBtn = document.getElementById("theme-toggle");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
});