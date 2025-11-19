# Chess-Game
♟️ Chess Game — Modern Web Chess With AI & Multiplayer
🚀 Overview

Chess Game is a modern, fully interactive web-based chess application built with pure JavaScript.
It includes:
Player vs Player mode
Player vs AI mode powered by Stockfish API
complete chess logic (check, checkmate, stalemate)
move validation and highlighting
history & undo system
modular architecture with clean, maintainable code

This project showcases your skills as a JavaScript engineer and demonstrates real-game logic complexity.

🌟 Features

🔥 Two Full Game Modes
👥 Play with Friend — Local multiplayer
🤖 Play with Bot — AI-powered opponent with difficulty levels
🧠 AI Powered by Stockfish
Cloud-based Stockfish API integration
Board-to-FEN conversion

Difficulty levels (Easy / Medium / Hard)
Smart fallback algorithm if API is unreachable
Realistic thinking delay
♟ Complete Chess Engine
legal move validation
check detection
checkmate detection
stalemate handling
prevents illegal moves
fully functional undo system

🎨 Modern, Responsive UI
clean layout & responsive design
Unicode chess pieces
tile highlighting (selection + possible moves)
dynamic board rendering

🧠 Architecture Explained
🟦 Board — The Internal Board Model

Handles:
8×8 state
piece placement
move execution
move history
undo logic
king lookup

♟️ Piece — Individual Chess Pieces
Each piece:
knows its type
generates possible moves
updates its own position
🧠 Rules — The Chess Engine
Responsible for:
validating moves
preventing illegal moves
checking for check / checkmate / stalemate
simulating moves to detect king danger

🎮 Game — PvP Logic
selecting pieces
making moves
switching turns
updating UI

🤖 BotGame — PvE Logic
AI move handling
Stockfish API requests
fallback algorithm
difficulty management
UI integration

🔥 Bot — The AI Engine

sends FEN to Stockfish
receives best move
converts Stockfish notation to board coordinates
fallback move selection logic

🕹 How to Run
No build needed — you can open directly:

Open:
index.html

🔧 Technologies Used

JavaScript (ES6+)
HTML5
CSS3
Stockfish Cloud API
DOM-based rendering
Fully modular architecture

🛣 Roadmap
 Add castling
 Add en passant
 Add timers (chess clock)
 Add AI difficulty weighting
 Save game to localStorage
 Add Dark Mode
 Add online multiplayer (WebSockets)

🖼 Screenshots
(Add images in your GitHub repo and I’ll update the links.)

📜 License
This project is licensed under the MIT License.

👤 Author
Albert Petrosyan
