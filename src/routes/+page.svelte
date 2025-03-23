<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	const BOARD_WIDTH = 10;
	const BOARD_HEIGHT = 20;
	const EMPTY_CELL = 0;

	let board = createEmptyBoard();
	let gameRunning = false;
	let score = 0;
	let level = 1;
	let linesCleared = 0;
	let gameLoop;
	let currentPiece = null;
	let currentRotation = 0;
	let currentX = 0;
	let currentY = 0;
	let nextPiece = null;

	function createEmptyBoard() {
		return Array(BOARD_HEIGHT)
			.fill()
			.map(() => Array(BOARD_WIDTH).fill(EMPTY_CELL));
	}

	function getRandomTetromino() {
		const pieces = 'IOSTZJL';
		const randPiece = pieces[Math.floor(Math.random() * pieces.length)];
		return TETROMINOES[randPiece];
	}

	function spawnNewPiece() {
		if (nextPiece === null) {
			nextPiece = getRandomTetromino();
		}
		currentPiece = nextPiece;
		nextPiece = getRandomTetromino();
		currentRotation = 0;
		currentX = SPAWN_POSITION.x;
		currentY = SPAWN_POSITION.y;

		if (checkCollision(0, 0, currentRotation)) {
			gameRunning = false;
			clearInterval(gameLoop);
			return false;
		}
		drawPiece();
		return true;
	}
	function drawPiece() {
		const shape = currentPiece.shape[currentRotation];
		const color = currentPiece.color;

		let newBoard = board.map((row) => [...row]);
		for (let y = 0; y < BOARD_HEIGHT; y++) {
			for (let x = 0; x < BOARD_WIDTH; x++) {
				if (board[y][x] >= 1 && board[y][x] <= 7) {
					newBoard[y][x] = EMPTY_CELL;
				}
			}
		}

		for (let i = 0; i < shape.length; i += 2) {
			const x = currentX + shape[i];
			const y = currentY + shape[i + 1];

			if (x >= 0 && x < BOARD_WIDTH && y >= 0 && y < BOARD_HEIGHT) {
				newBoard[y][x] = color;
			}
		}
		board = newBoard;
	}

	function startGame() {
		board = createEmptyBoard();
		gameRunning = true;
		score = 0;
		level = 1;
		linesCleared = 0;

		spawnNewPiece();

		setupGameLoop();
	}

	onMount(() => {
		window?.addEventListener('keydown', handleKeydown);
	});
	onDestroy(() => {
		window?.removeEventListener('keydown', handleKeydown);
		clearInterval(gameLoop);
	});
	function handleKeydown(event) {
		if (!gameRunning) {
			if (event.code === 'Space') startGame();
			return;
		}

		switch (event.code) {
			case 'ArrowLeft':
				//move piece left
				break;
			case 'ArrowRight':
				//move piece right
				break;
			case 'ArrowDown':
				//move piece left
				break;
			case 'ArrowUp':
				//move piece left
				break;
			case 'Space':
				//move piece left
				break;
			case 'KeyP':
				gameRunning = !gameRunning;
				break;
		}
	}
	function getCellColor(cellValue) {
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

		return colors[cellValue];
	}
</script>

<main class="flex min-h-screen items-center justify-center bg-gray-100 p-4">
	<div class="flex flex-col items-center gap-8 md:flex-row">
		<div class="rounded-lg bg-white p-6 shadow-lg">
			<h1 class="mb-4 text-center text-3xl font-bold">Tetris</h1>
			<div class="mb-4 space-y-2">
				<p class="text-lg font-medium">Score: <span class="font-bold">{score}</span></p>
				<p class="text-lg font-medium">Level: <span class="font-bold">{level}</span></p>
				<p class="text-lg font-medium">Lines: <span class="font-bold">{linesCleared}</span></p>
			</div>
			{#if !gameRunning}
				<button
					on:click={startGame}
					class="w-full rounded bg-green-500 px-4 py-2 font-bold text-white transition-colors hover:bg-green-600"
				>
					{score > 0 ? 'Resume Game' : 'Start Game'}
				</button>
			{/if}
		</div>

		<div class="rounded-lg bg-white p-2 shadow-lg">
			<div class="border-2 border-gray-800 bg-gray-100">
				{#each board as row, rowIndex}
					<div class="flex">
						{#each row as cell, colIndex}
							<div
								class="h-6 w-6 border border-gray-300 {cell !== EMPTY_CELL
									? getCellColor(cell)
									: 'bg-gray-100'}"
							></div>
						{/each}
					</div>
				{/each}
			</div>
		</div>
	</div>
</main>
