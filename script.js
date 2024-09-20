const wordsAndClues = [
    {word: "fur", keyLetter: "F", clue: "Coat cover", prefill: null},
    {word: "rat", keyLetter: "R", clue: "Sneaky rodent", prefill: null},
    {word: "kit", keyLetter: "I", clue: null, prefill: "K"},
    {word: "vet", keyLetter: "E", clue: null, prefill: "V"},
    {word: "hen", keyLetter: "N", clue: null, prefill: "H"},
    {word: "dog", keyLetter: "D", clue: "Loyal companion", prefill: null}
];

const N = 3;  // Number of letters in each word
const K = wordsAndClues.length;  // Number of words

const gridContainer = document.getElementById("grid");
const clueBox = document.getElementById("clue-box");
const keyboardContainer = document.getElementById("keyboard");

let grid = [];
let currentRow = 0;
let currentCol = 0;
let remainingLetters = {};

// Initialize the grid array
function initGrid() {
    grid = wordsAndClues.map(wordInfo => {
        return wordInfo.word.split('').map(letter => ({
            letter: '',
            keyLetter: wordInfo.keyLetter === letter.toUpperCase(),
            prefill: wordInfo.prefill && wordInfo.prefill.toUpperCase() === letter.toUpperCase()
        }));
    });

    renderGrid();
    highlightCurrentCell();
    updateClueBox();  // Display the clue for the first row upon loading the page
    updateRemainingLetters();
    renderKeyboard();
}

// Render the grid
function renderGrid() {
    gridContainer.innerHTML = '';  // Clear the grid container

    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const div = document.createElement("div");
            div.classList.add("cell");
            div.dataset.row = rowIndex;
            div.dataset.col = colIndex;

            if (cell.keyLetter) {
                div.classList.add("key-letter");
            }
            if (cell.prefill) {
                div.classList.add("prefilled");
                div.textContent = wordsAndClues[rowIndex].prefill.toUpperCase();
                grid[rowIndex][colIndex].letter = wordsAndClues[rowIndex].prefill.toUpperCase();
            } else {
                div.addEventListener("click", () => handleCellClick(rowIndex, colIndex));
            }

            div.textContent = cell.letter;
            gridContainer.appendChild(div);
        });
    });
}

function renderKeyboard() {
    const keyboardLayout = [
        "QWERTYUIOP",
        "ASDFGHJKL",
        "ZXCVBNM"
    ];

    keyboardContainer.innerHTML = ''; // Clear the keyboard container

    // Create a set of all letters used in the puzzle
    const usedLetters = new Set();
    wordsAndClues.forEach(wordInfo => {
        wordInfo.word.split('').forEach(letter => {
            usedLetters.add(letter.toUpperCase());
        });
    });

    keyboardLayout.forEach((row, rowIndex) => {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("keyboard-row");

        row.split('').forEach(letter => {
            const button = document.createElement("button");
            button.classList.add("key-button");
            button.textContent = letter;

            if (!usedLetters.has(letter)) {
                // If the letter is not used in the puzzle, disable and style it
                button.classList.add("disabled");
                button.disabled = true;
                button.style.backgroundColor = "darkgray"; // Color unused letters dark gray
            } else if (remainingLetters[letter] === 0) {
                button.classList.add("disabled");
                button.disabled = true;
            } else if (remainingLetters[letter] === 1) {
                button.classList.add("yellow");
            } else if (remainingLetters[letter] >= 2) {
                button.classList.add("green");
            }

            button.addEventListener("click", () => setCellValue(letter));
            rowDiv.appendChild(button);
        });

        if (rowIndex === 2) {
            const backspaceButton = document.createElement("button");
            backspaceButton.classList.add("key-button", "backspace");
            backspaceButton.textContent = "⌫";
            backspaceButton.addEventListener("click", () => setCellValue(''));
            rowDiv.appendChild(backspaceButton);
        }

        keyboardContainer.appendChild(rowDiv);
    });
}



// Handle cell clicks
function handleCellClick(row, col) {
    currentRow = row;
    currentCol = col;
    highlightCurrentCell();
    updateClueBox();
}

// Highlight the currently selected cell
function highlightCurrentCell() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => cell.classList.remove("active"));

    const currentCell = document.querySelector(`.cell[data-row="${currentRow}"][data-col="${currentCol}"]`);
    if (currentCell) {
        currentCell.classList.add("active");
    }
}

// Update the clue box
function updateClueBox() {
    const clue = wordsAndClues[currentRow].clue;
    clueBox.textContent = clue ? clue : "No clue for this word.";
}

// Handle keyboard input
document.addEventListener("keydown", (event) => {
    if (/^[a-zA-Z]$/.test(event.key)) {
        setCellValue(event.key.toUpperCase());
    } else if (event.key === "Backspace") {
        event.preventDefault();  // Prevent default backspace behavior
        setCellValue('');
    } else if (event.key === "ArrowUp") {
        moveUp();
    } else if (event.key === "ArrowDown") {
        moveDown();
    } else if (event.key === "ArrowLeft") {
        moveLeft();
    } else if (event.key === "ArrowRight") {
        moveRight();
    }
});

// Set value in the grid and update display
function setCellValue(letter) {
    if (!document.querySelector(`.cell[data-row="${currentRow}"][data-col="${currentCol}"]`).classList.contains("prefilled")) {
        grid[currentRow][currentCol].letter = letter;

        renderGrid();  // Re-render the grid to update the display
        updateRemainingLetters();
        renderKeyboard();  // Update the keyboard display based on remaining letters
        if (letter !== '') {
            moveToNextCell();
        }
    }
}

// Move to the next editable cell (right)
function moveToNextCell() {
    do {
        currentCol++;
        if (currentCol >= N) {
            currentCol = 0;
            currentRow++;
        }
        if (currentRow >= K) {
            currentRow = 0;
        }
    } while (document.querySelector(`.cell[data-row="${currentRow}"][data-col="${currentCol}"]`).classList.contains("prefilled"));

    highlightCurrentCell();
    updateClueBox();  // Update the clue box when moving to the next cell
}

// Arrow key navigation functions
function moveUp() {
    if (currentRow > 0) {
        currentRow--;
    }
    highlightCurrentCell();
    updateClueBox();
}

function moveDown() {
    if (currentRow < K - 1) {
        currentRow++;
    }
    highlightCurrentCell();
    updateClueBox();
}

function moveLeft() {
    if (currentCol > 0) {
        currentCol--;
    }
    highlightCurrentCell();
    updateClueBox();
}

function moveRight() {
    if (currentCol < N - 1) {
        currentCol++;
    }
    highlightCurrentCell();
    updateClueBox();
}

// Update the remaining letters count and re-render the keyboard
function updateRemainingLetters() {
    remainingLetters = {};

    // Initialize remaining letters count from all words
    wordsAndClues.forEach(wordInfo => {
        wordInfo.word.split("").forEach(letter => {
            if (!wordInfo.prefill || wordInfo.prefill.toUpperCase() !== letter.toUpperCase()) {
                remainingLetters[letter.toUpperCase()] = (remainingLetters[letter.toUpperCase()] || 0) + 1;
            }
        });
    });

    // Subtract the count based on the current grid state
    grid.forEach(row => {
        row.forEach(cell => {
            if (cell.letter && remainingLetters[cell.letter] !== undefined) {
                remainingLetters[cell.letter]--;
            }
        });
    });

    renderKeyboard();  // Update the keyboard to reflect the new state of remaining letters
}

document.getElementById("submit-button").addEventListener("click", checkBoardState);
document.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        checkBoardState();
    }
});

function checkBoardState() {
    let correct = true;

    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const expectedLetter = wordsAndClues[rowIndex].word[colIndex].toUpperCase();
            if (cell.letter !== expectedLetter) {
                correct = false;
            }
        });
    });

    displayMessage(correct);
}

function displayMessage(isCorrect) {
    const messageBox = document.getElementById("message-box");
    if (isCorrect) {
        messageBox.textContent = "Congratulations! You've solved the puzzle!";
        messageBox.style.color = "green";
    } else {
        messageBox.textContent = "Oops! There are some mistakes. Try again.";
        messageBox.style.color = "red";
    }
}

// Initialize the game
initGrid();
