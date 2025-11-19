// src/Rules.js - Правила шахматной игры

class ChessRules {
    constructor(board) {
        this.board = board;
    }

    // Проверка валидности хода
    isValidMove(fromRow, fromCol, toRow, toCol, currentPlayer) {
        const piece = this.board.getPiece(fromRow, fromCol);
        
        // Базовые проверки
        if (!piece) return false;
        if (piece.color !== currentPlayer) return false;
        if (!this.board.isValidPosition(toRow, toCol)) return false;
        if (fromRow === toRow && fromCol === toCol) return false;
        if (this.board.isAllyPiece(toRow, toCol, currentPlayer)) return false;

        // Получение возможных ходов для фигуры
        const possibleMoves = this.getPossibleMovesForPiece(fromRow, fromCol);
        const moveExists = possibleMoves.some(move => move.row === toRow && move.col === toCol);
        
        if (!moveExists) return false;

        // Проверка, не ставит ли ход собственного короля под шах
        return !this.wouldBeInCheckAfterMove(fromRow, fromCol, toRow, toCol, currentPlayer);
    }

    // Получение всех возможных ходов для фигуры
    getPossibleMovesForPiece(row, col) {
        const piece = this.board.getPiece(row, col);
        if (!piece) return [];

        switch (piece.type) {
            case 'pawn':
                return this.getPawnMoves(row, col, piece.color);
            case 'rook':
                return this.getRookMoves(row, col, piece.color);
            case 'bishop':
                return this.getBishopMoves(row, col, piece.color);
            case 'knight':
                return this.getKnightMoves(row, col, piece.color);
            case 'queen':
                return this.getQueenMoves(row, col, piece.color);
            case 'king':
                return this.getKingMoves(row, col, piece.color);
            default:
                return [];
        }
    }

    // Ходы пешки
    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Ход вперед
        const newRow = row + direction;
        if (this.board.isValidPosition(newRow, col) && this.board.isEmpty(newRow, col)) {
            moves.push({ row: newRow, col });

            // Двойной ход с начальной позиции
            if (row === startRow && this.board.isEmpty(newRow + direction, col)) {
                moves.push({ row: newRow + direction, col });
            }
        }

        // Взятие по диагонали
        [-1, 1].forEach(dcol => {
            const newCol = col + dcol;
            if (this.board.isValidPosition(newRow, newCol) && 
                this.board.isEnemyPiece(newRow, newCol, color)) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        return moves;
    }

    // Ходы ладьи
    getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        directions.forEach(([drow, dcol]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * drow;
                const newCol = col + i * dcol;

                if (!this.board.isValidPosition(newRow, newCol)) break;

                if (this.board.isEmpty(newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.board.isEnemyPiece(newRow, newCol, color)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });

        return moves;
    }

    // Ходы слона
    getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

        directions.forEach(([drow, dcol]) => {
            for (let i = 1; i < 8; i++) {
                const newRow = row + i * drow;
                const newCol = col + i * dcol;

                if (!this.board.isValidPosition(newRow, newCol)) break;

                if (this.board.isEmpty(newRow, newCol)) {
                    moves.push({ row: newRow, col: newCol });
                } else {
                    if (this.board.isEnemyPiece(newRow, newCol, color)) {
                        moves.push({ row: newRow, col: newCol });
                    }
                    break;
                }
            }
        });

        return moves;
    }

    // Ходы коня
    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        knightMoves.forEach(([drow, dcol]) => {
            const newRow = row + drow;
            const newCol = col + dcol;

            if (this.board.isValidPosition(newRow, newCol) && 
                (this.board.isEmpty(newRow, newCol) || this.board.isEnemyPiece(newRow, newCol, color))) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        return moves;
    }

    // Ходы ферзя
    getQueenMoves(row, col, color) {
        return [...this.getRookMoves(row, col, color), ...this.getBishopMoves(row, col, color)];
    }

    // Ходы короля
    getKingMoves(row, col, color) {
        const moves = [];
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        directions.forEach(([drow, dcol]) => {
            const newRow = row + drow;
            const newCol = col + dcol;

            if (this.board.isValidPosition(newRow, newCol) && 
                (this.board.isEmpty(newRow, newCol) || this.board.isEnemyPiece(newRow, newCol, color))) {
                moves.push({ row: newRow, col: newCol });
            }
        });

        return moves;
    }

    // Проверка шаха
    isInCheck(color) {
        const kingPos = this.board.findKing(color);
        if (!kingPos) return false;

        // Проверяем, атакует ли какая-либо вражеская фигура короля
        const enemyColor = color === 'white' ? 'black' : 'white';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board.getPiece(row, col);
                if (piece && piece.color === enemyColor) {
                    const moves = this.getPossibleMovesForPiece(row, col);
                    if (moves.some(move => move.row === kingPos.row && move.col === kingPos.col)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // Проверка, будет ли шах после хода
    wouldBeInCheckAfterMove(fromRow, fromCol, toRow, toCol, color) {
        // Делаем временный ход
        const piece = this.board.getPiece(fromRow, fromCol);
        const capturedPiece = this.board.getPiece(toRow, toCol);
        
        this.board.setPiece(toRow, toCol, piece);
        this.board.setPiece(fromRow, fromCol, null);

        // Проверяем шах
        const inCheck = this.isInCheck(color);

        // Возвращаем доску в исходное состояние
        this.board.setPiece(fromRow, fromCol, piece);
        this.board.setPiece(toRow, toCol, capturedPiece);

        return inCheck;
    }

    // Проверка мата
    isCheckmate(color) {
        if (!this.isInCheck(color)) return false;

        // Ищем, есть ли ход, который НЕ приводит к шаху
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board.getPiece(row, col);
                if (piece && piece.color === color) {
                    const moves = this.getPossibleMovesForPiece(row, col);
                    for (const move of moves) {
                        // Проверяем базовую валидность (не своя фигура, в пределах доски)
                        if (this.board.isValidPosition(move.row, move.col) && 
                            !this.board.isAllyPiece(move.row, move.col, color)) {
                            
                            // Проверяем напрямую wouldBeInCheckAfterMove, избегая рекурсии
                            if (!this.wouldBeInCheckAfterMove(row, col, move.row, move.col, color)) {
                                return false; // Найден валидный ход, который устраняет шах
                            }
                        }
                    }
                }
            }
        }
        return true; // Мат - нет ходов для выхода из шаха
    }

    // Проверка пата
    isStalemate(color) {
        if (this.isInCheck(color)) return false; // Пат невозможен при шахе

        // Ищем, есть ли хоть один ход, который НЕ приводит к шаху
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board.getPiece(row, col);
                if (piece && piece.color === color) {
                    const moves = this.getPossibleMovesForPiece(row, col);
                    for (const move of moves) {
                        // Проверяем базовую валидность
                        if (this.board.isValidPosition(move.row, move.col) && 
                            !this.board.isAllyPiece(move.row, move.col, color)) {
                            
                            // Проверяем напрямую, не приводит ли ход к шаху
                            if (!this.wouldBeInCheckAfterMove(row, col, move.row, move.col, color)) {
                                return false; // Найден валидный ход
                            }
                        }
                    }
                }
            }
        }
        return true; // Пат
    }

    // Проверка окончания игры
    getGameStatus(color) {
        if (this.isCheckmate(color)) {
            return { status: 'checkmate', winner: color === 'white' ? 'black' : 'white' };
        }
        
        if (this.isStalemate(color)) {
            return { status: 'stalemate', winner: null };
        }
        
        if (this.isInCheck(color)) {
            return { status: 'check', winner: null };
        }
        
        return { status: 'playing', winner: null };
    }
}