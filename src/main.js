document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы главного меню ---
    const playFriendBtn = document.getElementById('playFriend');
    const playBotBtn = document.getElementById('playBot');

    // 🧩 Обработчик: Играть с другом
    if (playFriendBtn) {
        playFriendBtn.addEventListener('click', () => {
            window.location.href = 'play-friend.html';
        });
    }

    // 🤖 Обработчик: Играть с ботом
    if (playBotBtn) {
        playBotBtn.addEventListener('click', () => {
            window.location.href = 'play-bot.html';
        });
    }

    // --- Определяем тип игры ---
    const chessboard = document.getElementById('chessboard');
    if (chessboard) {
        const pageTitle = document.title;
        const isPlayWithBot = pageTitle.includes('Bot') || window.location.pathname.includes('play-bot');
        
        // Запускаем нужную игру
        if (isPlayWithBot) {
            initializeBotChessGame();
        } else {
            initializeChessGame();
        }
    }
});

// 🌍 Глобальные переменные игры
let chessGame;
let botChessGame;

// ♟️ Игра "Игрок против игрока"
function initializeChessGame() {
    chessGame = new ChessGame();

    // Элементы управления
    const resetButton = document.getElementById('resetGame');
    const undoButton = document.getElementById('undoMove');
    const backButton = document.getElementById('backToMenu');

    // Запуск логики игры
    chessGame.initialize();

    // 🔄 Сброс игры
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            chessGame.newGame();
        });
    }

    // ⏪ Отмена хода
    if (undoButton) {
        undoButton.addEventListener('click', () => {
            chessGame.undoMove();
        });
    }

    // ⬅️ Назад в меню
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    console.log('✅ Chess game (vs Friend) initialized successfully!');
}

// 🤖 Игра "Игрок против бота"
function initializeBotChessGame() {
    botChessGame = new BotChessGame();

    // Элементы управления
    const resetButton = document.getElementById('resetGame');
    const undoButton = document.getElementById('undoMove');
    const backButton = document.getElementById('backToMenu');

    // Запуск логики игры
    botChessGame.initialize();

    // 🔄 Сброс игры
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            botChessGame.newGame();
        });
    }

    // ⏪ Отмена хода
    if (undoButton) {
        undoButton.addEventListener('click', () => {
            botChessGame.undoMove();
        });
    }

    // ⬅️ Назад в меню
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    console.log('✅ Chess game (vs Bot) initialized successfully!');
}