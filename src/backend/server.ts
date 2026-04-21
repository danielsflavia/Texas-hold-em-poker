// Express server with WebSocket support

import express from 'express';
import { Server as HTTPServer } from 'http';
import WebSocket from 'ws';
import path from 'path';
import { GameController, GameState } from './game/GameController';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Game instance
let gameController: GameController | null = null;

// REST API Endpoints

app.post('/api/game/start', (req, res) => {
  try {
    gameController = new GameController(1, 2); // Small blind: 1, Big blind: 2
    
    // Add some test players
    const players = [
      { id: 'p1', name: 'Player 1', chips: 1000 },
      { id: 'p2', name: 'Player 2', chips: 1000 },
      { id: 'p3', name: 'Player 3', chips: 1000 }
    ];

    players.forEach(p => {
      gameController!.addPlayer(p.id, p.name, p.chips);
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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
  } catch (error: any) {
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

const server = new HTTPServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket connection handling for real-time updates
wss.on('connection', (ws: WebSocket) => {
  console.log('New WebSocket client connected');

  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);
      
      // Echo back or handle game messages
      ws.send(JSON.stringify({
        type: 'ack',
        data: 'Message received'
      }));
    } catch (error) {
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
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

server.listen(port, () => {
  console.log(`Texas Holdem server running on http://localhost:${port}`);
  console.log(`WebSocket server running on ws://localhost:${port}`);
});
