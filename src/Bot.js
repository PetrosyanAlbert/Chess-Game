// src/Bot.js - Шахматный бот через внешний API

class ChessBot {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.color = 'black';
        
        // API настройки
        this.stockfishAPI = 'https://stockfish-api.vercel.app/api/stockfish';
        this.apiTimeout = 5000; // 5 секунд таймаут
    }

    // Главная функция для получения хода от API
    async makeMove(board, rules) {
        try {
            console.log('Запрашиваем ход у Stockfish API...');
            
            // Конвертируем доску в FEN нотацию
            const fen = this.boardToFEN(board);
            console.log('FEN позиция:', fen);
            
            // Запрос к API
            const move = await this.requestMoveFromAPI(fen);
            
            if (move) {
                console.log('Получен ход от API:', move);
                return this.convertAPIMove(move, board);
            } else {
                throw new Error('API не вернул ход');
            }
            
        } catch (error) {
            console.error('Ошибка API:', error);
            console.log('Используем простой fallback алгоритм');
            
            // Простой fallback если API не работает
            return this.makeSimpleMove(board, rules);
        }
    }

    // Запрос к Stockfish API
    async requestMoveFromAPI(fen) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout);
        
        try {
            const response = await fetch(this.stockfishAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fen: fen,
                    depth: this.getDifficultyDepth(),
                    time: 1500 // 1.5 секунды на обдумывание
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.bestMove || data.move;
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // Альтернативный API (Lichess)
    async requestMoveFromLichess(fen) {
        try {
            const response = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=1&variant=standard`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Lichess API недоступен');

            const data = await response.json();
            
            if (data.pvs && data.pvs.length > 0) {
                const moves = data.pvs[0].moves.split(' ');
                return moves[0]; // Первый ход
            }
            
            return null;
        } catch (error) {
            console.error('Lichess API ошибка:', error);
            return null;
        }
    }

    // Конвертация доски в FEN нотацию
    boardToFEN(board) {
        let fen = '';
        
        // Строим позицию по рядам
        for (let row = 0; row < 8; row++) {
            let emptyCount = 0;
            let rowStr = '';
            
            for (let col = 0; col < 8; col++) {
                const piece = board.getPiece(row, col);
                
                if (piece) {
                    if (emptyCount > 0) {
                        rowStr += emptyCount;
                        emptyCount = 0;
                    }
                    rowStr += this.pieceToFEN(piece);
                } else {
                    emptyCount++;
                }
            }
            
            if (emptyCount > 0) {
                rowStr += emptyCount;
            }
            
            fen += rowStr;
            if (row < 7) fen += '/';
        }
        
        // Добавляем метаинформацию FEN
        // Активный игрок, рокировки, взятие на проходе, полуходы, ходы
        fen += ' b - - 0 1';
        
        return fen;
    }

    // Конвертация фигуры в FEN символ
    pieceToFEN(piece) {
        const fenPieces = {
            'white': {
                'king': 'K', 'queen': 'Q', 'rook': 'R',
                'bishop': 'B', 'knight': 'N', 'pawn': 'P'
            },
            'black': {
                'king': 'k', 'queen': 'q', 'rook': 'r',
                'bishop': 'b', 'knight': 'n', 'pawn': 'p'
            }
        };
        
        return fenPieces[piece.color][piece.type];
    }

    // Конвертация хода из API формата в наш формат
    convertAPIMove(apiMove, board) {
        if (!apiMove || apiMove.length < 4) {
            console.error('Некорректный ход от API:', apiMove);
            return null;
        }
        
        try {
            // Парсим ход типа "e7e5"
            const fromCol = apiMove.charCodeAt(0) - 'a'.charCodeAt(0);
            const fromRow = 8 - parseInt(apiMove[1]);
            const toCol = apiMove.charCodeAt(2) - 'a'.charCodeAt(0);
            const toRow = 8 - parseInt(apiMove[3]);
            
            // Проверяем валидность координат
            if (fromRow < 0 || fromRow > 7 || fromCol < 0 || fromCol > 7 ||
                toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) {
                console.error('Некорректные координаты хода:', apiMove);
                return null;
            }
            
            // Получаем тип фигуры
            const piece = board.getPiece(fromRow, fromCol);
            
            return {
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol },
                piece: piece ? piece.type : 'unknown'
            };
            
        } catch (error) {
            console.error('Ошибка конвертации хода:', error);
            return null;
        }
    }

    // Глубина анализа для разных уровней сложности
    getDifficultyDepth() {
        const depths = {
            'easy': 5,    // Слабый уровень
            'medium': 10, // Средний уровень  
            'hard': 18    // Сильный уровень
        };
        return depths[this.difficulty] || 10;
    }

    // Простой fallback алгоритм если API не работает
    makeSimpleMove(board, rules) {
        const validMoves = this.getAllValidMoves(board, rules, this.color);
        
        if (validMoves.length === 0) return null;
        
        // Приоритет: взятие фигур > развитие > случайный ход
        const captureMoves = validMoves.filter(move => {
            return board.getPiece(move.to.row, move.to.col) !== null;
        });
        
        if (captureMoves.length > 0) {
            console.log('Fallback: выбираем ход со взятием');
            return captureMoves[Math.floor(Math.random() * captureMoves.length)];
        }
        
        // Ходы из начальной позиции (развитие)
        const developmentMoves = validMoves.filter(move => {
            return move.from.row <= 1; // черные фигуры развиваются с первых двух рядов
        });
        
        if (developmentMoves.length > 0) {
            console.log('Fallback: развиваем фигуры');
            return developmentMoves[Math.floor(Math.random() * developmentMoves.length)];
        }
        
        // Случайный ход
        console.log('Fallback: случайный ход');
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    // Получение всех валидных ходов
    getAllValidMoves(board, rules, color) {
        const moves = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board.getPiece(row, col);
                if (piece && piece.color === color) {
                    const possibleMoves = rules.getPossibleMovesForPiece(row, col);
                    possibleMoves.forEach(move => {
                        if (rules.isValidMove(row, col, move.row, move.col, color)) {
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

    // Установка сложности
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        console.log('Установлена сложность бота:', difficulty);
    }

    // Получение сложности
    getDifficulty() {
        return this.difficulty;
    }

    // Тест API подключения
    async testAPIConnection() {
        try {
            const testFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1';
            const move = await this.requestMoveFromAPI(testFEN);
            
            if (move) {
                console.log('✅ Stockfish API работает. Тестовый ход:', move);
                return true;
            } else {
                console.log('❌ Stockfish API не вернул ход');
                return false;
            }
        } catch (error) {
            console.error('❌ Ошибка подключения к API:', error);
            return false;
        }
    }
}