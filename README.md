# Texas Holdem Poker Game

A fully functional Texas Holdem poker game with a 16-bit pixel art interface, built as a web-based application hosted on a local Node.js server.

## Project Structure

```
texas_holdem/
├── src/
│   ├── backend/
│   │   ├── game/
│   │   │   ├── Deck.ts           # Card and deck management
│   │   │   ├── Player.ts         # Player state and actions
│   │   │   ├── HandEvaluator.ts  # Hand ranking and evaluation
│   │   │   └── GameController.ts # Game state machine and dealer logic
│   │   └── server.ts             # Express server and API endpoints
│   └── frontend/
│       ├── index.html            # Main HTML page
│       ├── styles.css            # Pixel art styling
│       └── game.js               # Canvas renderer and game logic
├── dist/                         # Compiled JavaScript (generated)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Features

### Game Mechanics
- **Full Texas Holdem Rules**: Complete implementation of official poker rules
- **State Machine**: Structured game flow (Lobby → Shuffling → Dealing → Pre-Flop → Flop → Turn → River → Showdown → Hand End)
- **Betting System**: Support for fold, check, call, raise, and all-in actions
- **Hand Evaluation**: Automatic hand ranking with 5-card combination evaluation
- **Pot Management**: Tracks total pot and individual contributions
- **Side Pot Support**: Handles cases where players go all-in with different amounts

### Game Components
- **Deck System**: 52-card deck with Fisher-Yates shuffle algorithm
- **Player System**: Multiple players with chip counts, hand tracking, and status indicators
- **Hand Evaluator**: Ranks hands from Royal Flush to High Card with proper kicker evaluation
- **Game Controller**: Manages game flow, turn order, and rule enforcement
- **Dealer Logic**: Automatically handles all dealer responsibilities

### User Interface
- **2D Pixel Art Style**: 16-bit retro aesthetic with gold and green poker table theme
- **Real-time Updates**: Live player status, pot tracking, and game state display
- **Action Buttons**: Intuitive controls for player actions
- **Game Log**: Complete history of all game actions
- **Player Panel**: Live view of all players' status and chip counts
- **Canvas Rendering**: Custom pixel art rendering of cards and game state

### Backend
- **Express Server**: RESTful API for game management
- **WebSocket Support**: Real-time communication for future multiplayer features
- **Game Logging**: Complete action history with timestamps
- **Turn Timer Support**: Framework for turn time limits

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Setup

1. Navigate to the project directory:
```bash
cd Texas_Holdem
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

## Running the Game

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
1. Build the project:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

### Watch Mode (for development)
```bash
npm run watch
```

This will continuously compile TypeScript files as you make changes.

## Game Flow

1. **Start Game**: Click "Start Game" to initialize the round with players
2. **Pre-Flop**: Players receive 2 hole cards and place initial bets
3. **Flop**: 3 community cards are revealed
4. **Turn**: 1 additional community card is revealed
5. **River**: Final community card is revealed
6. **Showdown**: Remaining players' hands are evaluated
7. **Winner**: Pot is awarded to the best hand

## API Endpoints

### Game Management
- `POST /api/game/start` - Start a new game
- `GET /api/game/state` - Get current game state
- `GET /api/game/logs` - Get game action history

### Card Dealing
- `POST /api/game/deal-flop` - Deal the flop (3 community cards)
- `POST /api/game/deal-turn` - Deal the turn (4th community card)
- `POST /api/game/deal-river` - Deal the river (5th community card)

### Player Actions
- `POST /api/game/action` - Process player action (fold, check, call, raise, all-in)
- `POST /api/game/showdown` - Evaluate hands and determine winner

## Game Rules Implemented

### Hand Rankings (Strongest to Weakest)
1. Royal Flush: A-K-Q-J-10, same suit
2. Straight Flush: Five consecutive cards, same suit
3. Four of a Kind: Four cards of same rank
4. Full House: Three of a kind plus pair
5. Flush: Five cards of same suit
6. Straight: Five consecutive cards
7. Three of a Kind: Three cards of same rank
8. Two Pair: Two different pairs
9. One Pair: Two cards of same rank
10. High Card: No combinations

### Betting Rules
- Players act in clockwise order
- Betting continues until all active players match the highest bet
- Raises must be at least double the previous bet
- All-in players can't act further but remain in the hand
- Folded players are immediately removed from the round

### Special Cases
- **Heads-up**: 2-player specific rules with dealer/small blind relationship
- **Multiple All-ins**: Remaining community cards dealt automatically
- **Pot Splitting**: Handled when multiple players have identical best hands

## Technologies Used

### Backend
- **TypeScript**: Type-safe game logic
- **Node.js**: Runtime environment
- **Express.js**: REST API framework
- **WebSocket**: Real-time communication

### Frontend
- **HTML5 Canvas**: Custom pixel art rendering
- **CSS3**: Retro 16-bit themed styling
- **Vanilla JavaScript**: Game logic and UI interaction
- **Responsive Design**: Works on different screen sizes

## Future Enhancements

- AI players with different difficulty levels
- Multiplayer support over network
- Tournament mode with elimination
- Hand history and statistics tracking
- Sound effects and animations
- Mobile-responsive interface improvements
- Database persistence for game history
- Replay functionality

## Architecture

### Game State Machine
```
LOBBY → SHUFFLING → DEALING_HOLE_CARDS → PRE_FLOP → 
FLOP → TURN → RIVER → SHOWDOWN → HAND_END → (repeat)
```

### Component Separation
- **Deck**: Card management and shuffling
- **Player**: Player state, actions, and chip management
- **HandEvaluator**: Hand ranking logic
- **GameController**: Game flow and rule enforcement
- **Server**: API and game session management
- **Renderer**: Canvas-based visual output

## Code Quality

- Type-safe TypeScript implementation
- Comprehensive error handling
- Input validation for all player actions
- Proper encapsulation of game logic
- Clean separation of concerns
- Extensive logging for debugging

## License

MIT License - Advanced Computing Project

## Author

Created as part of the Advanced Computing Project - Texas Holdem Poker Game specification (2026)
