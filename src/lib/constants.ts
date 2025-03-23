
// Tetromino shapes defined by their relative coordinates from a center point
// Each array represents a different rotation state
export const TETROMINOES = {
	I: {

		shape: [
			[0, -1, 0, 0, 0, 1, 0, 2],  // vertical: includes [0,0]
			[-1, 0, 0, 0, 1, 0, 2, 0],  // horizontal: includes [0,0]
			[0, -1, 0, 0, 0, 1, 0, 2],
			[-1, 0, 0, 0, 1, 0, 2, 0]
		],
		color: 1
	},
	O: {
		shape: [
			[0, 0, 1, 0, 0, 1, 1, 1],  // [[0,0], [1,0], [0,1], [1,1]] - square
			[0, 0, 1, 0, 0, 1, 1, 1],
			[0, 0, 1, 0, 0, 1, 1, 1],
			[0, 0, 1, 0, 0, 1, 1, 1]
		],
		color: 2
	},
	T: {
		shape: [
			[0, 0, -1, 0, 1, 0, 0, 1],  // T pointing down
			[0, 0, 0, -1, 0, 1, -1, 0],  // T pointing left
			[0, 0, -1, 0, 1, 0, 0, -1],  // T pointing up
			[0, 0, 0, -1, 0, 1, 1, 0]   // T pointing right
		],
		color: 3
	},
	S: {
		shape: [
			[0, 0, 0, -1, 1, -1, -1, 0],  // S horizontal
			[0, 0, 0, -1, 1, 0, 1, 1],    // S vertical
			[0, 0, 0, -1, 1, -1, -1, 0],
			[0, 0, 0, -1, 1, 0, 1, 1]
		],
		color: 4
	},
	Z: {
		shape: [
			[0, 0, 0, -1, -1, -1, 1, 0],  // Z horizontal
			[0, 0, 0, -1, 1, -1, 1, 0],   // Z vertical
			[0, 0, 0, -1, -1, -1, 1, 0],
			[0, 0, 0, -1, 1, -1, 1, 0]
		],
		color: 5
	},
	J: {
		shape: [
			[0, 0, -1, 0, 1, 0, -1, -1],  // J pointing up
			[0, 0, 0, -1, 0, 1, -1, 1],   // J pointing left
			[0, 0, -1, 0, 1, 0, 1, 1],    // J pointing down
			[0, 0, 0, -1, 0, 1, 1, -1]    // J pointing right
		],
		color: 6
	},
	L: {
		shape: [
			[0, 0, -1, 0, 1, 0, 1, -1],   // L pointing up
			[0, 0, 0, -1, 0, 1, 1, 1],    // L pointing right
			[0, 0, -1, 0, 1, 0, -1, 1],   // L pointing down
			[0, 0, 0, -1, 0, 1, -1, -1]   // L pointing left
		],
		color: 7
	}
};

// Initial positions for newly spawned tetrominoes
export const SPAWN_POSITION = {
	x: 4,  // Center of the board horizontally
	y: 1   // Near the top
};

// Game timing in milliseconds (adjust for difficulty)
export const GAME_SPEEDS = {
	1: 1000,    // Level 1: 1 second per drop
	2: 850,     // Level 2
	3: 700,     // Level 3
	4: 600,     // Level 4
	5: 500,     // Level 5
	6: 400,     // Level 6
	7: 300,     // Level 7
	8: 250,     // Level 8
	9: 200,     // Level 9
	10: 150,    // Level 10+
};

// Scoring system
export const POINTS = {
	SINGLE: 100,    // 1 line cleared
	DOUBLE: 300,    // 2 lines cleared
	TRIPLE: 500,    // 3 lines cleared
	TETRIS: 800,    // 4 lines cleared
	SOFT_DROP: 1,   // Points per cell for soft drop
	HARD_DROP: 2    // Points per cell for hard drop
};

// Lines needed to advance to the next level
export const LINES_PER_LEVEL = 10;
