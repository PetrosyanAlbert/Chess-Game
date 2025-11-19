// src/Board.js - Логика шахматной доски

class Board {
    constructor() {
        this.board = this.createInitialBoard();
        this.history = [];
    }

    // Создание начальной расстановки
    createInitialBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        
        // Черные фигуры (верх)
        board[0] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(type => ({ type, color: 'black' }));
        board[1] = Array(8).fill({ type: 'pawn', color: 'black' });
        
        // Белые фигуры (низ)
        board[7] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'].map(type => ({ type, color: 'white' }));
        board[6] = Array(8).fill({ type: 'pawn', color: 'white' });
        
        return board;
    }

    // Получение фигуры на позиции
    getPiece(row, col) {
        if (!this.isValidPosition(row, col)) return null;
        return this.board[row][col];
    }

    // Установка фигуры на позицию
    setPiece(row, col, piece) {
        if (this.isValidPosition(row, col)) {
            this.board[row][col] = piece;
        }
    }

    // Проверка валидности позиции
    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    // Выполнение хода
    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.getPiece(fromRow, fromCol);
        const capturedPiece = this.getPiece(toRow, toCol);
        
        if (!piece) return false;
        
        // Сохранение хода в истории
        this.history.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece: piece,
            capturedPiece: capturedPiece
        });
        
        // Выполнение хода
        this.setPiece(toRow, toCol, piece);
        this.setPiece(fromRow, fromCol, null);
        
        return true;
    }

    // Отмена последнего хода
    undoMove() {
        if (this.history.length === 0) return false;
        
        const lastMove = this.history.pop();
        this.setPiece(lastMove.from.row, lastMove.from.col, lastMove.piece);
        this.setPiece(lastMove.to.row, lastMove.to.col, lastMove.capturedPiece);
        
        return true;
    }

    // Проверка, пуста ли клетка
    isEmpty(row, col) {
        return this.getPiece(row, col) === null;
    }

    // Проверка, есть ли на клетке фигура противника
    isEnemyPiece(row, col, playerColor) {
        const piece = this.getPiece(row, col);
        return piece && piece.color !== playerColor;
    }

    // Проверка, есть ли на клетке фигура союзника
    isAllyPiece(row, col, playerColor) {
        const piece = this.getPiece(row, col);
        return piece && piece.color === playerColor;
    }

    // Получение копии доски
    getBoardCopy() {
        return this.board.map(row => row.map(piece => piece ? { ...piece } : null));
    }

    // Сброс доски
    reset() {
        this.board = this.createInitialBoard();
        this.history = [];
    }

    // Поиск короля
    findKing(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.getPiece(row, col);
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { row, col };
                }
            }
        }
        return null;
    }
}