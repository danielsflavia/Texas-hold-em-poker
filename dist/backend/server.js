"use strict";
// Express server with WebSocket support
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const ws_1 = __importDefault(require("ws"));
const path_1 = __importDefault(require("path"));
const GameController_1 = require("./game/GameController");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(process.cwd(), 'src/frontend')));
// Game instance
let gameController = null;
// REST API Endpoints
app.post('/api/game/start', (req, res) => {
    try {
        gameController = new GameController_1.GameController(1, 2); // Small blind: 1, Big blind: 2
        // Add some test players
        const players = [
            { id: 'p1', name: 'Player 1', chips: 1000 },
            { id: 'p2', name: 'Player 2', chips: 1000 },
            { id: 'p3', name: 'Player 3', chips: 1000 }
        ];
        players.forEach(p => {
            gameController.addPlayer(p.id, p.name, p.chips);
        });
        gameController.initializeRound();
        res.json({
            success: true,
            message: 'Game started',
            gameState: gameController.getGameState(),
            players: gameController.getPlayers().map(p => ({
                id: p.id,
                name: p.name,
                chips: p.chips,
                position: p.position
            }))
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/game/state', (req, res) => {
    if (!gameController) {
        return res.status(400).json({ error: 'Game not started' });
    }
    res.json({
        gameState: gameController.getGameState(),
        pot: gameController.getPot(),
        currentBet: gameController.getCurrentBet(),
        currentPlayerId: gameController.getCurrentPlayerId(),
        communityCards: gameController.getCommunityCards().map(c => c.toString()),
        players: gameController.getPlayers().map(p => ({
            id: p.id,
            name: p.name,
            chips: p.chips,
            hand: p.hand.map(c => c.toString()),
            folded: p.folded,
            allIn: p.allIn,
            currentBet: p.currentBet
        }))
    });
});
app.post('/api/game/action', (req, res) => {
    try {
        if (!gameController) {
            return res.status(400).json({ error: 'Game not started' });
        }
        const { playerId, action, raiseAmount } = req.body;
        gameController.processPlayerAction(playerId, action, raiseAmount);
        res.json({
            success: true,
            gameState: gameController.getGameState(),
            pot: gameController.getPot()
        });
    }
    catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});
app.post('/api/game/deal-flop', (req, res) => {
    try {
        if (!gameController) {
            return res.status(400).json({ error: 'Game not started' });
        }
        gameController.dealFlop();
        res.json({
            success: true,
            gameState: gameController.getGameState(),
            communityCards: gameController.getCommunityCards().map(c => c.toString())
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/game/deal-turn', (req, res) => {
    try {
        if (!gameController) {
            return res.status(400).json({ error: 'Game not started' });
        }
        gameController.dealTurn();
        res.json({
            success: true,
            gameState: gameController.getGameState(),
            communityCards: gameController.getCommunityCards().map(c => c.toString())
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/game/deal-river', (req, res) => {
    try {
        if (!gameController) {
            return res.status(400).json({ error: 'Game not started' });
        }
        gameController.dealRiver();
        res.json({
            success: true,
            gameState: gameController.getGameState(),
            communityCards: gameController.getCommunityCards().map(c => c.toString())
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.post('/api/game/showdown', (req, res) => {
    try {
        if (!gameController) {
            return res.status(400).json({ error: 'Game not started' });
        }
        const winners = gameController.determineWinner();
        gameController.awardPot(winners);
        gameController.endRound();
        res.json({
            success: true,
            winners: winners.map(w => ({ id: w.id, name: w.name, chips: w.chips })),
            gameState: gameController.getGameState()
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/api/game/logs', (req, res) => {
    if (!gameController) {
        return res.status(400).json({ error: 'Game not started' });
    }
    res.json({
        logs: gameController.getGameLogs()
    });
});
const server = new http_1.Server(app);
const wss = new ws_1.default.Server({ server });
// WebSocket connection handling for real-time updates
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);
            // Echo back or handle game messages
            ws.send(JSON.stringify({
                type: 'ack',
                data: 'Message received'
            }));
        }
        catch (error) {
            console.error('Error processing message:', error);
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});
// Serve index.html for all non-API routes
app.get('/*', (req, res) => {
    res.sendFile(path_1.default.join(process.cwd(), 'src/frontend/index.html'));
});
server.listen(port, () => {
    console.log(`Texas Holdem server running on http://localhost:${port}`);
    console.log(`WebSocket server running on ws://localhost:${port}`);
});
//# sourceMappingURL=server.js.map