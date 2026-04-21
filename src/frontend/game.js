// Frontend Game Logic and Renderer

class PokerGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = 'LOBBY';
    this.players = [];
    this.pot = 0;
    this.currentBet = 0;
    this.communityCards = [];
    this.playerCardsRevealed = new Set(); // Track which players revealed their cards
    this.animationQueue = [];
    this.ws = null;
    
    this.setupEventListeners();
    this.setupPixelArtFilters();
    this.startAnimationLoop();
  }

  setupEventListeners() {
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('dealFlopBtn').addEventListener('click', () => this.dealFlop());
    document.getElementById('dealTurnBtn').addEventListener('click', () => this.dealTurn());
    document.getElementById('dealRiverBtn').addEventListener('click', () => this.dealRiver());
    document.getElementById('showdownBtn').addEventListener('click', () => this.showdown());
    
    document.getElementById('revealCardsBtn').addEventListener('click', () => this.toggleRevealCards());
    document.getElementById('foldBtn').addEventListener('click', () => this.playerAction('fold'));
    document.getElementById('checkBtn').addEventListener('click', () => this.playerAction('check'));
    document.getElementById('callBtn').addEventListener('click', () => this.playerAction('call'));
    document.getElementById('raiseBtn').addEventListener('click', () => this.toggleRaiseInput());
    document.getElementById('allInBtn').addEventListener('click', () => this.playerAction('all-in'));
    document.getElementById('confirmRaise').addEventListener('click', () => this.confirmRaise());
  }

  setupPixelArtFilters() {
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
  }

  async startGame() {
    try {
      const response = await fetch('/api/game/start', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        this.gameState = data.gameState;
        this.players = data.players;
        this.playerCardsRevealed.clear();
        this.updateGameDisplay();
        this.addLog('Game Started with ' + this.players.length + ' players');
        this.addLog('Cards dealt! Use "Reveal My Cards" to see your hand.');
        this.updateControlButtons();
        document.getElementById('actionPanel').classList.remove('hidden');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      this.addLog('Error: Failed to start game');
    }
  }

  toggleRevealCards() {
    if (this.playerCardsRevealed.has('p1')) {
      this.playerCardsRevealed.delete('p1');
      this.addLog('Your cards are now hidden');
    } else {
      this.playerCardsRevealed.add('p1');
      this.addLog('Your cards are now revealed');
    }
  }

  async dealFlop() {
    try {
      const response = await fetch('/api/game/deal-flop', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        this.communityCards = data.communityCards;
        this.gameState = data.gameState;
        this.addLog('🎴 Flop dealt: ' + data.communityCards.join(' '));
        this.updateGameDisplay();
        this.updateControlButtons();
      }
    } catch (error) {
      console.error('Error dealing flop:', error);
      this.addLog('Error: Failed to deal flop');
    }
  }

  async dealTurn() {
    try {
      const response = await fetch('/api/game/deal-turn', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        this.communityCards = data.communityCards;
        this.gameState = data.gameState;
        this.addLog('🎴 Turn dealt: ' + data.communityCards[3]);
        this.updateGameDisplay();
        this.updateControlButtons();
      }
    } catch (error) {
      console.error('Error dealing turn:', error);
      this.addLog('Error: Failed to deal turn');
    }
  }

  async dealRiver() {
    try {
      const response = await fetch('/api/game/deal-river', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        this.communityCards = data.communityCards;
        this.gameState = data.gameState;
        this.addLog('🎴 River dealt: ' + data.communityCards[4]);
        this.updateGameDisplay();
        this.updateControlButtons();
      }
    } catch (error) {
      console.error('Error dealing river:', error);
      this.addLog('Error: Failed to deal river');
    }
  }

  async showdown() {
    try {
      const response = await fetch('/api/game/showdown', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        const winners = data.winners.map(w => w.name).join(', ');
        this.addLog('🏆 Winners: ' + winners);
        this.gameState = data.gameState;
        this.updateGameDisplay();
        this.updateControlButtons();
      }
    } catch (error) {
      console.error('Error during showdown:', error);
      this.addLog('Error: Failed to determine winner');
    }
  }

  async playerAction(action) {
    try {
      const raiseAmount = action === 'raise' ? document.getElementById('raiseAmount').value : undefined;
      const response = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: 'p1',
          action: action,
          raiseAmount: raiseAmount ? parseInt(raiseAmount) : undefined
        })
      });
      
      const data = await response.json();
      if (data.success) {
        this.addLog('✓ You ' + action + (action === 'raise' ? 'ed' : action === 'fold' ? 'ed' : action === 'check' ? 'ed' : action === 'all-in' ? ' (all-in)' : 'ed'));
        this.updateGameDisplay();
      } else {
        this.addLog('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error processing action:', error);
      this.addLog('Error: Failed to process action');
    }
  }

  toggleRaiseInput() {
    const input = document.getElementById('raiseInput');
    input.classList.toggle('hidden');
  }

  confirmRaise() {
    const amount = document.getElementById('raiseAmount').value;
    if (amount && parseInt(amount) > 0) {
      this.playerAction('raise');
      document.getElementById('raiseInput').classList.add('hidden');
      document.getElementById('raiseAmount').value = '';
    } else {
      this.addLog('Error: Invalid raise amount');
    }
  }

  async updateGameDisplay() {
    try {
      const response = await fetch('/api/game/state');
      const data = await response.json();
      
      this.gameState = data.gameState;
      this.pot = data.pot;
      this.currentBet = data.currentBet;
      this.communityCards = data.communityCards;
      this.players = data.players;
      
      document.getElementById('gameState').textContent = this.gameState;
      document.getElementById('potDisplay').textContent = 'Pot: $' + this.pot;
      
      this.updatePlayersList();
      this.render();
    } catch (error) {
      console.error('Error updating game display:', error);
    }
  }

  updatePlayersList() {
    const playersList = document.getElementById('playersList');
    playersList.innerHTML = '';
    
    this.players.forEach(player => {
      const playerCard = document.createElement('div');
      playerCard.className = 'player-card';
      if (player.folded) playerCard.classList.add('folded');
      if (!player.folded) playerCard.classList.add('active');
      
      let cardsDisplay = '🂠 🂠';
      if (this.playerCardsRevealed.has(player.id)) {
        cardsDisplay = player.hand.length > 0 ? player.hand.join(' ') : '🂠 🂠';
      }
      
      playerCard.innerHTML = `
        <div class="player-name">${player.name}</div>
        <div class="player-info">
          <div class="chips">💰 ${player.chips}</div>
          <div>Bet: $${player.currentBet}</div>
          <div>Hand: ${cardsDisplay}</div>
          ${player.allIn ? '<div class="status all-in">ALL-IN</div>' : ''}
          ${player.folded ? '<div class="status folded">FOLDED</div>' : ''}
        </div>
      `;
      playersList.appendChild(playerCard);
    });
  }

  updateControlButtons() {
    // Hide Deal buttons during pre-flop since flop auto-deals
    document.getElementById('dealFlopBtn').style.display = this.gameState === 'PRE_FLOP' ? 'none' : 'block';
    document.getElementById('dealFlopBtn').disabled = this.gameState !== 'FLOP';
    document.getElementById('dealTurnBtn').disabled = this.gameState !== 'TURN';
    document.getElementById('dealRiverBtn').disabled = this.gameState !== 'RIVER';
    document.getElementById('showdownBtn').disabled = this.gameState !== 'RIVER';
    
    // Show action panel during pre-flop
    const actionPanel = document.getElementById('actionPanel');
    if (this.gameState === 'PRE_FLOP') {
      actionPanel.classList.remove('hidden');
    } else if (this.gameState === 'LOBBY') {
      actionPanel.classList.add('hidden');
    }
  }

  addLog(message) {
    const logContent = document.getElementById('logContent');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + message;
    logContent.insertBefore(entry, logContent.firstChild);
    
    // Keep only last 20 entries
    while (logContent.children.length > 20) {
      logContent.removeChild(logContent.lastChild);
    }
  }

  render() {
    const { width, height } = this.canvas;
    
    // Clear canvas with green felt
    this.ctx.fillStyle = '#2d5a2d';
    this.ctx.fillRect(0, 0, width, height);
    
    // Draw table border
    this.ctx.strokeStyle = '#d4af37';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Draw community cards area
    this.drawCommunityCards();
    
    // Draw player hole cards
    this.drawPlayerHoleCards();
    
    // Draw pot display
    this.drawPotDisplay();
    
    // Draw current bet display
    this.drawBetDisplay();
    
    // Draw game state indicator
    this.drawGameStateIndicator();
  }

  drawCommunityCards() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2 - 50;
    const cardWidth = 60;
    const cardHeight = 90;
    const spacing = 15;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.fillText('COMMUNITY CARDS', centerX - 80, centerY - 20);
    
    const totalWidth = (cardWidth * Math.max(5, this.communityCards.length)) + (spacing * (Math.max(5, this.communityCards.length) - 1));
    const startX = centerX - totalWidth / 2;
    
    // Draw all 5 card slots
    for (let i = 0; i < 5; i++) {
      const x = startX + i * (cardWidth + spacing);
      const y = centerY;
      
      if (this.communityCards[i]) {
        this.drawCard(x, y, this.communityCards[i], cardWidth, cardHeight);
      } else {
        // Draw empty slot
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x, y, cardWidth, cardHeight);
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, cardWidth, cardHeight);
      }
    }
  }

  drawPlayerHoleCards() {
    const y = this.canvas.height - 120;
    const cardWidth = 50;
    const cardHeight = 70;
    const spacing = 15;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.fillText('YOUR HOLE CARDS', 30, y - 10);
    
    const player = this.players.find(p => p.id === 'p1');
    if (!player) return;
    
    const startX = 30;
    
    for (let i = 0; i < 2; i++) {
      const x = startX + i * (cardWidth + spacing);
      
      if (this.playerCardsRevealed.has('p1') && player.hand[i]) {
        this.drawCard(x, y, player.hand[i], cardWidth, cardHeight);
      } else {
        // Draw face-down card
        this.drawCardFaceDown(x, y, cardWidth, cardHeight);
      }
    }
  }

  drawCard(x, y, cardText, width, height) {
    // Card background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x, y, width, height);
    
    // Card border
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
    
    // Card text
    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold ' + (width / 4) + 'px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(cardText, x + width / 2, y + height / 2);
  }

  drawCardFaceDown(x, y, width, height) {
    // Card background (blue for face-down)
    this.ctx.fillStyle = '#1a3a7a';
    this.ctx.fillRect(x, y, width, height);
    
    // Card border
    this.ctx.strokeStyle = '#d4af37';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);
    
    // Draw pattern or indicator
    this.ctx.fillStyle = '#d4af37';
    this.ctx.font = 'bold 8px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('?', x + width / 2, y + height / 2);
  }

  drawPotDisplay() {
    const x = 30;
    const y = 40;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x, y, 150, 40);
    
    this.ctx.fillStyle = '#d4af37';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('POT', x + 10, y + 15);
    
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('$' + this.pot, x + 10, y + 30);
  }

  drawBetDisplay() {
    const x = this.canvas.width - 180;
    const y = 40;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x, y, 150, 40);
    
    this.ctx.fillStyle = '#d4af37';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('CURRENT BET', x + 10, y + 15);
    
    this.ctx.font = 'bold 16px Arial';
    this.ctx.fillText('$' + this.currentBet, x + 10, y + 30);
  }

  drawGameStateIndicator() {
    const x = this.canvas.width / 2;
    const y = this.canvas.height - 30;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x - 100, y - 15, 200, 25);
    
    this.ctx.fillStyle = '#d4af37';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.gameState, x, y);
  }

  startAnimationLoop() {
    const animate = () => {
      this.render();
      requestAnimationFrame(animate);
    };
    animate();
  }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
  const game = new PokerGame();
  
  // Auto-update game state every 1 second
  setInterval(() => {
    if (game.gameState !== 'LOBBY') {
      game.updateGameDisplay();
    }
  }, 1000);
});
