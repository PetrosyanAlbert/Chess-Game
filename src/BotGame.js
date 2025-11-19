// src/BotGame.js - Игра с API ботом

class BotChessGame extends ChessGame {
    constructor() {
        super();
        this.bot = new ChessBot('medium');
        this.playerColor = 'white';
        this.botColor = 'black';
        this.isPlayerTurn = true;
        this.botThinking = false;
        this.moveCount = 0;
    }

    // Инициализация игры с ботом
    initialize() {
        this.board = new Board();
        this.rules = new ChessRules(this.board);
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameStatus = 'playing';
        this.winner = null;
        this.playerColor = 'white';
        this.botColor = 'black';
        this.isPlayerTurn = true;
        this.botThinking = false;
        this.moveCount = 0;
        
        this.renderBoard();
        this.updateUI();
        
        // Настройка селектора сложности
        this.setupDifficultySelector();
        
        // Тестируем API подключение при инициализации
        this.testBotConnection();
    }

    // Настройка селектора сложности
    setupDifficultySelector() {
        const difficultySelect = document.getElementById('difficulty');
        if (difficultySelect) {
            this.bot.setDifficulty(difficultySelect.value);
            
            difficultySelect.addEventListener('change', (e) => {
                this.bot.setDifficulty(e.target.value);
                console.log('Сложность изменена на:', e.target.value);
            });
        }
    }

    // Тест подключения к API
    async testBotConnection() {
        console.log('Тестируем подключение к шахматному API...');
        const isConnected = await this.bot.testAPIConnection();
        
        if (isConnected) {
            console.log('API бот готов к игре!');
        } else {
            console.log('API недоступен, будет использоваться fallback алгоритм');
        }
    }

    // Обработка клика по клетке
    handleSquareClick(row, col) {
        // Блокируем взаимодействие во время хода бота
        if (!this.isPlayerTurn || this.botThinking || 
            this.gameStatus === 'checkmate' || this.gameStatus === 'stalemate') {
            return;
        }

        if (this.selectedSquare) {
            const piece = this.board.getPiece(this.selectedSquare.row, this.selectedSquare.col);
            if (piece && piece.color === this.playerColor) {
                if (this.tryMakeMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                    this.clearSelection();
                    this.isPlayerTurn = false;
                    this.moveCount++;
                    this.checkGameStatus();
                    this.renderBoard();
                    this.updateUI();
                    
                    // Запускаем ход бота с небольшой задержкой
                    setTimeout(() => this.makeBotMove(), 800);
                    return;
                }
            }
            this.clearSelection();
            this.trySelectSquare(row, col);
        } else {
            this.trySelectSquare(row, col);
        }
    }

    // Выбор клетки игроком
    trySelectSquare(row, col) {
        const piece = this.board.getPiece(row, col);
        
        if (piece && piece.color === this.playerColor && this.isPlayerTurn) {
            this.selectedSquare = { row, col };
            this.highlightSquare(row, col);
            this.highlightPossibleMoves(row, col);
        }
    }

    // Ход бота через API
    async makeBotMove() {
        if (this.gameStatus === 'checkmate' || this.gameStatus === 'stalemate') {
            return;
        }

        this.botThinking = true;
        this.updateUI('Bot is analyzing position...');

        try {
            console.log(`--- Ход бота #${Math.floor(this.moveCount/2) + 1} ---`);
            
            // Получаем ход от API бота
            const botMove = await this.bot.makeMove(this.board, this.rules);
            
            if (botMove && this.isValidBotMove(botMove)) {
                console.log('Бот делает ход:', 
                    `${String.fromCharCode(97 + botMove.from.col)}${8 - botMove.from.row}` +
                    `${String.fromCharCode(97 + botMove.to.col)}${8 - botMove.to.row}`);
                
                // Выполняем ход бота
                this.board.makeMove(
                    botMove.from.row, 
                    botMove.from.col, 
                    botMove.to.row, 
                    botMove.to.col
                );
                
                this.isPlayerTurn = true;
                this.botThinking = false;
                this.moveCount++;
                
                this.checkGameStatus();
                this.renderBoard();
                this.updateUI();
                
            } else {
                console.error('Бот вернул некорректный ход:', botMove);
                this.handleBotError();
            }
            
        } catch (error) {
            console.error('Критическая ошибка при ходе бота:', error);
            this.handleBotError();
        }
    }

    // Проверка валидности хода от бота
    isValidBotMove(move) {
        if (!move || !move.from || !move.to) {
            return false;
        }

        const { from, to } = move;
        
        // Проверяем координаты
        if (from.row < 0 || from.row > 7 || from.col < 0 || from.col > 7 ||
            to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7) {
            return false;
        }

        // Проверяем что на исходной позиции есть черная фигура
        const piece = this.board.getPiece(from.row, from.col);
        if (!piece || piece.color !== this.botColor) {
            return false;
        }

        // Проверяем валидность хода через правила игры
        return this.rules.isValidMove(from.row, from.col, to.row, to.col, this.botColor);
    }

    // Обработка ошибки бота
    handleBotError() {
        console.log('Ошибка бота, возвращаем ход игроку');
        this.botThinking = false;
        this.isPlayerTurn = true;
        this.updateUI('Bot error - your turn continues');
    }

    // Проверка статуса игры
    checkGameStatus() {
        const currentColor = this.isPlayerTurn ? this.playerColor : this.botColor;
        const status = this.rules.getGameStatus(currentColor);
        this.gameStatus = status.status;
        this.winner = status.winner;
    }

    // Отмена хода
    undoMove() {
        if (this.botThinking) {
            console.log('Нельзя отменить ход пока бот думает');
            return false;
        }

        let undoCount = 0;
        
        // Отменяем ход бота если сейчас ход игрока
        if (this.isPlayerTurn && this.board.history.length > 0) {
            this.board.undoMove();
            undoCount++;
            this.moveCount--;
        }
        
        // Отменяем ход игрока
        if (this.board.history.length > 0) {
            this.board.undoMove();
            undoCount++;
            this.moveCount--;
        }

        if (undoCount > 0) {
            this.isPlayerTurn = true;
            this.botThinking = false;
            this.clearSelection();
            this.gameStatus = 'playing';
            this.winner = null;
            this.renderBoard();
            this.updateUI();
            console.log(`Отменено ходов: ${undoCount}`);
            return true;
        }
        
        return false;
    }

    // Новая игра
    newGame() {
        console.log('Начинаем новую игру против API бота');
        this.initialize();
    }

    // Обновление UI
    updateUI(customMessage = null) {
        const turnElement = document.getElementById('currentTurn');

        if (turnElement) {
            if (customMessage) {
                turnElement.textContent = customMessage;
            } else if (this.gameStatus === 'playing') {
                if (this.botThinking) {
                    turnElement.textContent = 'Bot is thinking...';
                } else if (this.isPlayerTurn) {
                    turnElement.textContent = 'Your turn (White)';
                } else {
                    turnElement.textContent = 'Bot\'s turn (Black)';
                }
            } else if (this.gameStatus === 'check') {
                if (this.isPlayerTurn) {
                    turnElement.textContent = 'You are in check!';
                } else {
                    turnElement.textContent = 'Bot is in check!';
                }
            } else if (this.gameStatus === 'checkmate') {
                if (this.winner === this.playerColor) {
                    turnElement.textContent = 'Congratulations! You beat the AI!';
                } else {
                    turnElement.textContent = 'Checkmate! AI wins!';
                }
            } else if (this.gameStatus === 'stalemate') {
                turnElement.textContent = 'Stalemate! It\'s a draw!';
            }
        }
    }

    // Рендер доски
    renderBoard() {
        const chessboard = document.getElementById('chessboard');
        if (!chessboard) return;

        chessboard.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;

                const piece = this.board.getPiece(row, col);
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece', piece.color);
                    
                    const symbols = {
                        king: '♔',
                        queen: '♕', 
                        rook: '♖',
                        bishop: '♗',
                        knight: '♘',
                        pawn: '♙'
                    };
                    
                    pieceElement.textContent = symbols[piece.type];
                    square.appendChild(pieceElement);
                }

                square.addEventListener('click', () => this.handleSquareClick(row, col));
                chessboard.appendChild(square);
            }
        }
    }

    // Подсветка возможных ходов
    highlightPossibleMoves(row, col) {
        const piece = this.board.getPiece(row, col);
        if (!piece || piece.color !== this.playerColor) return;

        const possibleMoves = this.rules.getPossibleMovesForPiece(row, col);
        
        possibleMoves.forEach(move => {
            if (this.rules.isValidMove(row, col, move.row, move.col, this.playerColor)) {
                const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
                if (square) {
                    square.classList.add('possible-move');
                }
            }
        });
    }
}