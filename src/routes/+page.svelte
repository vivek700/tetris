<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		TETROMINOES,
		SPAWN_POSITION,
		GAME_SPEEDS,
		POINTS,
		LINES_PER_LEVEL
	} from '$lib/constants';

	// Game constants
	const BOARD_WIDTH = 10;
	const BOARD_HEIGHT = 20;
	const EMPTY_CELL = 0;

	// Game state
	let board = createEmptyBoard();
	let gameRunning = false;
	let score = 0;
	let level = 1;
	let linesCleared = 0;
	let gameLoop: ReturnType<typeof setInterval> | undefined;
	let currentPiece: { shape: number[][]; color: number } | null = null;
	let currentRotation = 0;
	let currentX = 0;
	let currentY = 0;
	let nextPiece: { shape: number[][]; color: number } | null = null;
	let gameOver = false;

	// Touch controls variables
	let touchStartX = 0;
	let touchStartY = 0;
	let touchStartTime = 0;

	// Create an empty board filled with zeros
	function createEmptyBoard() {
		return Array(BOARD_HEIGHT)
			.fill(0)
			.map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL));
	}

	// Get a random tetromino type
	function getRandomTetromino() {
		const pieces = 'IOSTZJL';
		const randPiece = pieces[Math.floor(Math.random() * pieces.length)];
		return TETROMINOES[randPiece as keyof typeof TETROMINOES];
	}

	// Spawn a new tetromino at the top of the board
	function spawnNewPiece() {
		if (nextPiece === null) {
			nextPiece = getRandomTetromino();
		}

		currentPiece = nextPiece;
		nextPiece = getRandomTetromino();
		currentRotation = 0;
		currentX = SPAWN_POSITION.x;
		currentY = SPAWN_POSITION.y;

		// Check if the game is over (collision on spawn)
		if (checkCollision(0, 0, currentRotation)) {
			// Game Over
			gameRunning = false;
			gameOver = true;
			clearInterval(gameLoop);
			return false;
		}

		// Update the board with the new piece
		drawPiece();
		return true;
	}

	// Draw the current piece on the board
	function drawPiece() {
		const shape = currentPiece?.shape[currentRotation] || [];
		const color = currentPiece?.color;

		// Create a new board without modifying the original
		let newBoard = board.map((row) => [...row]);

		// Clear the active piece from the board (for redrawing)
		for (let y = 0; y < BOARD_HEIGHT; y++) {
			for (let x = 0; x < BOARD_WIDTH; x++) {
				if (newBoard[y][x] >= 1 && newBoard[y][x] <= 7) {
					newBoard[y][x] = EMPTY_CELL;
				}
			}
		}

		// Draw the piece on the board
		for (let i = 0; i < shape.length; i += 2) {
			const x = currentX + shape[i];
			const y = currentY + shape[i + 1];

			if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
				newBoard[y][x] = color;
			}
		}

		board = newBoard;
	}

	// Check if a move would cause a collision
	function checkCollision(offsetX: number, offsetY: number, rotation: number) {
		const shape = currentPiece?.shape[rotation] || [];

		for (let i = 0; i < shape.length; i += 2) {
			const x = currentX + shape[i] + offsetX;
			const y = currentY + shape[i + 1] + offsetY;

			// Check boundaries
			if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
				return true;
			}

			// Check if the cell is already occupied by a locked piece (value > 10)
			if (y >= 0 && board[y][x] > 10) {
				return true;
			}
		}

		return false;
	}

	// Game initialization
	function startGame() {
		board = createEmptyBoard();
		gameRunning = true;
		gameOver = false;
		score = 0;
		level = 1;
		linesCleared = 0;
		nextPiece = null;

		// Generate first piece
		spawnNewPiece();

		// Set up game loop
		setupGameLoop();
	}

	// Set up the main game loop
	function setupGameLoop() {
		clearInterval(gameLoop);

		const speed = GAME_SPEEDS[level as keyof typeof GAME_SPEEDS] || GAME_SPEEDS[10]; // Default to level 10 speed if level > 10

		gameLoop = setInterval(() => {
			if (gameRunning) {
				moveDown();
			}
		}, speed);
	}

	// Move the current piece down
	function moveDown() {
		if (!checkCollision(0, 1, currentRotation)) {
			currentY++;
			drawPiece();
			return true;
		} else {
			// Lock the piece in place and check for line clears
			lockPiece();
			return false;
		}
	}

	// Lock the current piece in place
	function lockPiece() {
		// Convert active piece cells to landed pieces
		for (let y = 0; y < BOARD_HEIGHT; y++) {
			for (let x = 0; x < BOARD_WIDTH; x++) {
				if (board[y][x] >= 1 && board[y][x] <= 7) {
					board[y][x] = board[y][x] + 10; // Add 10 to indicate a settled piece
				}
			}
		}

		// Check for completed lines
		checkLines();

		// Spawn a new piece
		spawnNewPiece();
	}

	// Check for completed lines and remove them
	function checkLines() {
		let linesCount = 0;

		for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
			let lineComplete = true;

			for (let x = 0; x < BOARD_WIDTH; x++) {
				if (board[y][x] < 10) {
					lineComplete = false;
					break;
				}
			}

			if (lineComplete) {
				linesCount++;

				// Remove the line
				for (let yy = y; yy > 0; yy--) {
					for (let x = 0; x < BOARD_WIDTH; x++) {
						board[yy][x] = board[yy - 1][x];
					}
				}

				// Clear the top line
				for (let x = 0; x < BOARD_WIDTH; x++) {
					board[0][x] = EMPTY_CELL;
				}

				// Move the check position back up
				y++;
			}
		}

		// Update score based on lines cleared
		if (linesCount > 0) {
			updateScore(linesCount);
		}
	}

	// Update the score based on lines cleared
	function updateScore(lines: number) {
		switch (lines) {
			case 1:
				score += POINTS.SINGLE * level;
				break;
			case 2:
				score += POINTS.DOUBLE * level;
				break;
			case 3:
				score += POINTS.TRIPLE * level;
				break;
			case 4:
				score += POINTS.TETRIS * level;
				break;
		}

		linesCleared += lines;

		// Check for level up
		const newLevel = Math.floor(linesCleared / LINES_PER_LEVEL) + 1;
		if (newLevel > level) {
			level = newLevel;
			setupGameLoop(); // Update game speed
		}
	}

	// TOUCH CONTROL FUNCTIONS

	// Handle touch start event
	function handleTouchStart(event: TouchEvent) {
		if (!gameRunning) {
			startGame();
			return;
		}

		const touch = event.touches[0];
		touchStartX = touch.clientX;
		touchStartY = touch.clientY;
		touchStartTime = Date.now();
	}

	// Handle touch end event
	function handleTouchEnd(event: TouchEvent) {
		if (!gameRunning || !currentPiece) return;

		const touch = event.changedTouches[0];
		const touchEndX = touch.clientX;
		const touchEndY = touch.clientY;
		const touchEndTime = Date.now();

		const touchDuration = touchEndTime - touchStartTime;
		const deltaX = touchEndX - touchStartX;
		const deltaY = touchEndY - touchStartY;
		const absDeltaX = Math.abs(deltaX);
		const absDeltaY = Math.abs(deltaY);

		// Determine if it was a swipe (longer movement) or a tap (short movement)
		const minSwipeDistance = 30; // Minimum distance to consider it a swipe
		const maxTapDistance = 10; // Maximum distance to consider it a tap
		const maxTapDuration = 200; // Maximum duration for a tap in milliseconds

		// Handle swipes
		if (absDeltaX > minSwipeDistance || absDeltaY > minSwipeDistance) {
			// Horizontal swipe
			if (absDeltaX > absDeltaY) {
				if (deltaX > 0) {
					// Swipe right
					if (!checkCollision(1, 0, currentRotation)) {
						currentX++;
						drawPiece();
					}
				} else {
					// Swipe left
					if (!checkCollision(-1, 0, currentRotation)) {
						currentX--;
						drawPiece();
					}
				}
			}
			// Vertical swipe
			else {
				if (deltaY > 0) {
					// Swipe down (soft drop)
					if (moveDown()) {
						score += POINTS.SOFT_DROP;
					}
				} else {
					// Swipe up (hard drop)
					let dropDistance = 0;
					while (!checkCollision(0, dropDistance + 1, currentRotation)) {
						dropDistance++;
					}

					if (dropDistance > 0) {
						score += POINTS.HARD_DROP * dropDistance;
						currentY += dropDistance;
						drawPiece();
						lockPiece();
					}
				}
			}
		}
		// Handle tap (rotate)
		else if (
			absDeltaX <= maxTapDistance &&
			absDeltaY <= maxTapDistance &&
			touchDuration <= maxTapDuration
		) {
			// Tap detected - rotate the piece
			const nextRotation = (currentRotation + 1) % 4;
			if (!checkCollision(0, 0, nextRotation)) {
				currentRotation = nextRotation;
				drawPiece();
			} else {
				// Wall kick - try to adjust position if rotation fails
				// Try moving left
				if (!checkCollision(-1, 0, nextRotation)) {
					currentX--;
					currentRotation = nextRotation;
					drawPiece();
				}
				// Try moving right
				else if (!checkCollision(1, 0, nextRotation)) {
					currentX++;
					currentRotation = nextRotation;
					drawPiece();
				}
				// Try moving up (for I piece mainly)
				else if (!checkCollision(0, -1, nextRotation)) {
					currentY--;
					currentRotation = nextRotation;
					drawPiece();
				}
			}
		}
	}

	// Handle touch move event - prevent default to avoid scrolling
	function handleTouchMove(event: TouchEvent) {
		if (gameRunning) {
			event.preventDefault();
		}
	}

	onMount(() => {
		// Set up keyboard event listeners when the component mounts
		window.addEventListener('keydown', handleKeydown);

		// Set up touch event listeners
		const gameBoard = document.getElementById('game-board');
		if (gameBoard) {
			gameBoard.addEventListener('touchstart', handleTouchStart, { passive: false });
			gameBoard.addEventListener('touchend', handleTouchEnd, { passive: false });
			gameBoard.addEventListener('touchmove', handleTouchMove, { passive: false });
		}
	});

	onDestroy(() => {
		// Clean up event listeners and game loop when component is destroyed
		window.removeEventListener('keydown', handleKeydown);

		const gameBoard = document.getElementById('game-board');
		if (gameBoard) {
			gameBoard.removeEventListener('touchstart', handleTouchStart);
			gameBoard.removeEventListener('touchend', handleTouchEnd);
			gameBoard.removeEventListener('touchmove', handleTouchMove);
		}

		clearInterval(gameLoop);
	});

	// Handle keyboard input
	function handleKeydown(event: KeyboardEvent) {
		if (!gameRunning) {
			if (event.code === 'Space') startGame();
			return;
		}

		switch (event.code) {
			case 'ArrowLeft':
				if (!checkCollision(-1, 0, currentRotation)) {
					currentX--;
					drawPiece();
				}
				break;
			case 'ArrowRight':
				if (!checkCollision(1, 0, currentRotation)) {
					currentX++;
					drawPiece();
				}
				break;
			case 'ArrowDown':
				if (moveDown()) {
					score += POINTS.SOFT_DROP; // Points for soft drop
				}
				break;
			case 'ArrowUp':
				const nextRotation = (currentRotation + 1) % 4;
				if (!checkCollision(0, 0, nextRotation)) {
					currentRotation = nextRotation;
					drawPiece();
				} else {
					// Wall kick - try to adjust position if rotation fails
					// Try moving left
					if (!checkCollision(-1, 0, nextRotation)) {
						currentX--;
						currentRotation = nextRotation;
						drawPiece();
					}
					// Try moving right
					else if (!checkCollision(1, 0, nextRotation)) {
						currentX++;
						currentRotation = nextRotation;
						drawPiece();
					}
					// Try moving up (for I piece mainly)
					else if (!checkCollision(0, -1, nextRotation)) {
						currentY--;
						currentRotation = nextRotation;
						drawPiece();
					}
				}
				break;
			case 'Space':
				// Hard drop
				let dropDistance = 0;
				while (!checkCollision(0, dropDistance + 1, currentRotation)) {
					dropDistance++;
				}

				if (dropDistance > 0) {
					score += POINTS.HARD_DROP * dropDistance;
					currentY += dropDistance;
					drawPiece();
					lockPiece();
				}
				break;
			case 'KeyP':
				// Pause game
				gameRunning = !gameRunning;
				break;
		}
	}
	function getCellColor(cellValue: number) {
		const colors = [
			'bg-gray-100', // Empty cell
			'bg-cyan-400', // I piece
			'bg-yellow-300', // O piece
			'bg-purple-500', // T piece
			'bg-green-500', // S piece
			'bg-red-500', // Z piece
			'bg-blue-500', // J piece
			'bg-orange-500' // L piece
		];

		// For settled pieces (value > 10), use the same colors but subtract 10
		if (cellValue >= 11 && cellValue <= 17) {
			return colors[cellValue - 10] + ' border-gray-400';
		}

		// For active pieces (value 1-7)
		if (cellValue >= 1 && cellValue <= 7) {
			return colors[cellValue];
		}

		// Default for empty cells
		return colors[0];
	}

	// Helper function to display the next piece preview
	function isNextPieceCell(x: number, y: number) {
		if (!nextPiece) return false;

		// Center the piece in the 4x4 grid
		const offsetX = 1;
		const offsetY = 1;

		const shape = nextPiece.shape[0]; // Use the first rotation state

		for (let i = 0; i < shape.length; i += 2) {
			const pieceX = shape[i] + offsetX + 1; // +1 for center point
			const pieceY = shape[i + 1] + offsetY + 1; // +1 for center point

			if (x === pieceX && y === pieceY) {
				return true;
			}
		}

		return false;
	}
</script>

<main
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 p-4"
>
	<div class="flex flex-col items-center gap-8 md:flex-row">
		<div class="rounded-lg border border-gray-600 bg-gray-700 p-6 shadow-xl">
			<h1 class="mb-6 text-center text-3xl font-bold text-white">TETRIS</h1>
			<div class="mb-4 space-y-2 rounded-lg bg-gray-800 p-4">
				<p class="text-lg font-medium text-white">
					Score: <span class="font-bold text-yellow-300">{score}</span>
				</p>
				<p class="text-lg font-medium text-white">
					Level: <span class="font-bold text-green-400">{level}</span>
				</p>
				<p class="text-lg font-medium text-white">
					Lines: <span class="font-bold text-blue-300">{linesCleared}</span>
				</p>
			</div>

			{#if nextPiece}
				<div class="mt-6 rounded-lg bg-gray-800 p-4">
					<p class="mb-2 text-lg font-medium text-white">Next Piece:</p>
					<div class="mx-auto grid h-24 w-24 grid-cols-4 grid-rows-4 gap-0">
						{#each Array(4) as _, y}
							{#each Array(4) as _, x}
								<div
									class="h-6 w-6 border border-gray-700 {isNextPieceCell(x, y)
										? getCellColor(nextPiece.color)
										: 'bg-gray-900'}"
								></div>
							{/each}
						{/each}
					</div>
				</div>
			{/if}

			<div class="mt-6 rounded-lg bg-gray-800 p-4">
				<p class="mb-2 text-lg font-medium text-white">Controls:</p>
				<div class="space-y-1 text-sm text-gray-300">
					<p>⬅️ ➡️: Move</p>
					<p>⬇️: Soft Drop</p>
					<p>⬆️: Rotate</p>
					<p>Space: Hard Drop</p>
					<p>P: Pause</p>
					<hr class="my-1 border-gray-600" />
					<p class="font-medium text-blue-300">Touch Controls:</p>
					<p>Tap: Rotate</p>
					<p>Swipe Left/Right: Move</p>
					<p>Swipe Down: Soft Drop</p>
					<p>Swipe Up: Hard Drop</p>
				</div>
			</div>

			{#if !gameRunning}
				<button
					on:click={startGame}
					class="mt-6 w-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 font-bold text-white shadow-lg transition-colors hover:from-blue-600 hover:to-purple-700"
				>
					{gameOver ? 'Game Over - Play Again' : score > 0 ? 'Resume Game' : 'Start Game'}
				</button>
			{/if}
		</div>

		<div
			id="game-board"
			class="touch-manipulation rounded-lg border border-gray-600 bg-gray-700 p-4 shadow-xl"
		>
			<div class="border-2 border-gray-600 bg-gray-900 shadow-inner">
				{#each board as row, rowIndex}
					<div class="flex">
						{#each row as cell, colIndex}
							<div class="h-7 w-7 border border-gray-800 {getCellColor(cell)}"></div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
</main>
