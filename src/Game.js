// src/Game.js - Основная логика шахматной игры

class ChessGame {
    constructor() {
        this.board = new Board();
        this.rules = new ChessRules(this.board);
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameStatus = 'playing';
        this.winner = null;
    }

    // Инициализация игры
    initialize() {
        this.board.reset();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.gameStatus = 'playing';
        this.winner = null;
        this.renderBoard();
        this.updateUI();
    }

    // Обработка клика по клетке
    handleSquareClick(row, col) {
        // Разрешаем клики при шахе, блокируем только при мате и пате
        if (this.gameStatus === 'checkmate' || this.gameStatus === 'stalemate') return;

        if (this.selectedSquare) {
            // Попытка сделать ход
            if (this.tryMakeMove(this.selectedSquare.row, this.selectedSquare.col, row, col)) {
                this.clearSelection();
                this.switchPlayer();
                this.checkGameStatus();
                this.renderBoard();
                this.updateUI();
            } else {
                this.clearSelection();
                this.trySelectSquare(row, col);
            }
        } else {
            // Попытка выбрать фигуру
            this.trySelectSquare(row, col);
        }
    }

    // Попытка выбрать клетку
    trySelectSquare(row, col) {
        const piece = this.board.getPiece(row, col);
        
        if (piece && piece.color === this.currentPlayer) {
            this.selectedSquare = { row, col };
            this.highlightSquare(row, col);
            this.highlightPossibleMoves(row, col);
        }
    }

    // Попытка сделать ход
    tryMakeMove(fromRow, fromCol, toRow, toCol) {
        if (this.rules.isValidMove(fromRow, fromCol, toRow, toCol, this.currentPlayer)) {
            this.board.makeMove(fromRow, fromCol, toRow, toCol);
            return true;
        }
        return false;
    }

    // Очистка выделения
    clearSelection() {
        this.selectedSquare = null;
        this.clearHighlights();
    }

    // Смена игрока
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
    }

    // Проверка статуса игры
    checkGameStatus() {
        const status = this.rules.getGameStatus(this.currentPlayer);
        this.gameStatus = status.status;
        this.winner = status.winner;
    }

    // Отмена последнего хода
    undoMove() {
        if (this.board.undoMove()) {
            this.switchPlayer(); // Возвращаем предыдущего игрока
            this.clearSelection();
            this.gameStatus = 'playing';
            this.winner = null;
            this.renderBoard();
            this.updateUI();
            return true;
        }
        return false;
    }

    // Новая игра
    newGame() {
        this.initialize();
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

                // Добавление фигуры
                const piece = this.board.getPiece(row, col);
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.classList.add('piece', piece.color);
                    
                    // Используем одинаковые контурные символы для всех фигур
                    const symbols = {
                        king: '♔',
                        queen: '♕', 
                        rook: '♖',
                        bishop: '♗',
                        knight: '♘',
                        pawn: '♙'
                    };
                    
                    const pieceSymbol = symbols[piece.type];
                    pieceElement.textContent = pieceSymbol;
                    pieceElement.setAttribute('data-piece', pieceSymbol); // Для альтернативного стиля
                    square.appendChild(pieceElement);
                }

                // Добавление обработчика события
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                chessboard.appendChild(square);
            }
        }
    }

    // Подсветка клетки
    highlightSquare(row, col) {
        const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (square) {
            square.classList.add('selected');
        }
    }

    // Подсветка возможных ходов
    highlightPossibleMoves(row, col) {
        const possibleMoves = this.rules.getPossibleMovesForPiece(row, col);
        
        possibleMoves.forEach(move => {
            if (this.rules.isValidMove(row, col, move.row, move.col, this.currentPlayer)) {
                const square = document.querySelector(`[data-row="${move.row}"][data-col="${move.col}"]`);
                if (square) {
                    square.classList.add('possible-move');
                }
            }
        });
    }

    // Очистка подсветки
    clearHighlights() {
        document.querySelectorAll('.selected').forEach(square => {
            square.classList.remove('selected');
        });
        document.querySelectorAll('.possible-move').forEach(square => {
            square.classList.remove('possible-move');
        });
    }

    // Обновление UI
    updateUI() {
        const turnElement = document.getElementById('currentTurn');
        const statusElement = document.getElementById('gameStatus');

        if (turnElement) {
            if (this.gameStatus === 'playing') {
                turnElement.textContent = `${this.currentPlayer === 'white' ? 'White' : 'Black'}'s turn`;
            } else if (this.gameStatus === 'check') {
                turnElement.textContent = `${this.currentPlayer === 'white' ? 'White' : 'Black'} in check! Your turn`;
            } else if (this.gameStatus === 'checkmate') {
                turnElement.textContent = `Checkmate! ${this.winner === 'white' ? 'White' : 'Black'} wins!`;
            } else if (this.gameStatus === 'stalemate') {
                turnElement.textContent = 'Stalemate! Draw!';
            }
        }

        if (statusElement) {
            statusElement.textContent = this.gameStatus;
        }
    }

    // Получение текущего состояния игры
    getGameState() {
        return {
            board: this.board.getBoardCopy(),
            currentPlayer: this.currentPlayer,
            gameStatus: this.gameStatus,
            winner: this.winner,
            history: [...this.board.history]
        };
    }

    // Получение всех валидных ходов для текущего игрока
    getAllValidMoves() {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board.getPiece(row, col);
                if (piece && piece.color === this.currentPlayer) {
                    const possibleMoves = this.rules.getPossibleMovesForPiece(row, col);
                    possibleMoves.forEach(move => {
                        if (this.rules.isValidMove(row, col, move.row, move.col, this.currentPlayer)) {
                            moves.push({
                                from: { row, col },
                                to: { row: move.row, col: move.col },
                                piece: piece.type
                            });
                        }
                    });
                }
            }
        }
        
        return moves;
    }
}