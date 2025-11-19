// src/Piece.js - Логика шахматных фигур

// Unicode символы шахматных фигур
const PIECE_SYMBOLS = {
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    },
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    }
};

class Piece {
    constructor(type, color, row, col) {
        this.type = type;
        this.color = color;
        this.row = row;
        this.col = col;
        this.hasMoved = false;
    }

    // Получение символа фигуры
    getSymbol() {
        return PIECE_SYMBOLS[this.color][this.type];
    }

    // Получение возможных ходов для фигуры
    getPossibleMoves(board) {
        switch (this.type) {
            case 'pawn':
                return this.getPawnMoves(board);
            case 'rook':
                return this.getRookMoves(board);
            case 'bishop':
                return this.getBishopMoves(board);
            case 'knight':
                return this.getKnightMoves(board);
            case 'queen':
                return this.getQueenMoves(board);
            case 'king':
                return this.getKingMoves(board);
            default:
                return [];
        }
    }

    // Ходы пешки
    getPawnMoves(board) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;
        const startRow = this.color === 'white' ? 6 : 1;

        // Ход вперед
        const newRow = this.row + direction;
        if (board.isValidPosition(newRow, this.col) && board.isEmpty(newRow, this.col)) {
            moves.push({ row: newRow, col: this.col });

            // Двойной ход с начальной позиции
            if (this.row === startRow && board.isEmpty(newRow + direction, this.col)) {
                moves.push({ row: newRow + direction, col: this.col });
            }
        }

        // Взятие по диагонали
        [-1, 1].forEach(dcol => {
            const newCol = this.col + dcol;
            if (board.isValidPosition(newRow, newCol) && board.isEnemyPiece(newRow, newCol, this.color)) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        return moves;
    }

    // Ходы ладьи
    getRookMoves(board) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]]; // право, лево, вниз, вверх

        directions.forEach(([drow, dcol]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = this.row + i * drow;
                const newCol = this.col + i * dcol;

                if (!board.isValidPosition(newRow, newCol)) break;

                if (board.isEmpty(newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (board.isEnemyPiece(newRow, newCol, this.color)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });

        return moves;
    }

    // Ходы слона
    getBishopMoves(board) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]]; // диагонали

        directions.forEach(([drow, dcol]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = this.row + i * drow;
                const newCol = this.col + i * dcol;

                if (!board.isValidPosition(newRow, newCol)) break;

                if (board.isEmpty(newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (board.isEnemyPiece(newRow, newCol, this.color)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });
        return moves;
    }

    // Ходы коня
    getKnightMoves(board) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        knightMoves.forEach(([drow, dcol]) => {
            const newRow = this.row + drow;
            const newCol = this.col + dcol;

            if (board.isValidPosition(newRow, newCol) && 
                (board.isEmpty(newRow, newCol) || board.isEnemyPiece(newRow, newCol, this.color))) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        return moves;
    }

    // Ходы ферзя (комбинация ладьи и слона)
    getQueenMoves(board) {
        return [...this.getRookMoves(board), ...this.getBishopMoves(board)];
    }

    // Ходы короля
    getKingMoves(board) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        directions.forEach(([drow, dcol]) => {
            const newRow = this.row + drow;
            const newCol = this.col + dcol;

            if (board.isValidPosition(newRow, newCol) && 
                (board.isEmpty(newRow, newCol) || board.isEnemyPiece(newRow, newCol, this.color))) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        // TODO: Добавить логику рокировки

        return moves;
    }

    // Обновление позиции фигуры
    updatePosition(row, col) {
        this.row = row;
        this.col = col;
        this.hasMoved = true;
    }

    // Клонирование фигуры
    clone() {
        const cloned = new Piece(this.type, this.color, this.row, this.col);
        cloned.hasMoved = this.hasMoved;
        return cloned;
    }
}

// Функция для создания фигуры
function createPiece(type, color, row, col) {
    return new Piece(type, color, row, col);
}

// Экспорт
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Piece, createPiece, PIECE_SYMBOLS };
}