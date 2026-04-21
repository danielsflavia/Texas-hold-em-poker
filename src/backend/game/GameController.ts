import { Card, Suit, Rank } from './Card';
import { Player } from './Player';
import { GameState } from './GameState';

export { GameState };

export class GameController {
  private deck: Card[] = [];
  private communityCards: Card[] = [];
  private players: Player[] = [];
  private currentPlayerIndex: number = 0;
  private pot: number = 0;
  private currentBet: number = 0;
  private smallBlind: number;
  private bigBlind: number;
  private gameState: GameState = GameState.Waiting;
  private dealerPosition: number = 0;
  private logs: string[] = [];

  constructor(smallBlind: number, bigBlind: number) {
    this.smallBlind = smallBlind;
    this.bigBlind = bigBlind;
    this.initializeDeck();
  }

  private initializeDeck(): void {
    this.deck = [];
    for (const suit of Object.values(Suit)) {
      for (const rank of Object.values(Rank)) {
        this.deck.push(new Card(suit, rank));
      }
    }
    this.shuffleDeck();
  }

  private shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  addPlayer(id: string, name: string, chips: number): void {
    const player = new Player(id, name, chips);
    player.position = this.players.length;
    this.players.push(player);
    this.logs.push(`${name} joined the game.`);
  }

  initializeRound(): void {
    this.gameState = GameState.PreFlop;
    this.communityCards = [];
    this.pot = 0;
    this.currentBet = this.bigBlind;
    this.currentPlayerIndex = (this.dealerPosition + 3) % this.players.length; // UTG
    this.players.forEach(p => {
      p.hand = [];
      p.folded = false;
      p.allIn = false;
      p.currentBet = 0;
    });
    this.dealHands();
    this.postBlinds();
    this.logs.push('New round started.');
  }

  private dealHands(): void {
    for (let i = 0; i < 2; i++) {
      for (const player of this.players) {
        player.hand.push(this.deck.pop()!);
      }
    }
  }

  private postBlinds(): void {
    const smallBlindPos = (this.dealerPosition + 1) % this.players.length;
    const bigBlindPos = (this.dealerPosition + 2) % this.players.length;
    
    this.players[smallBlindPos].chips -= this.smallBlind;
    this.players[smallBlindPos].currentBet = this.smallBlind;
    this.pot += this.smallBlind;
    
    this.players[bigBlindPos].chips -= this.bigBlind;
    this.players[bigBlindPos].currentBet = this.bigBlind;
    this.pot += this.bigBlind;
    
    this.logs.push(`${this.players[smallBlindPos].name} posted small blind: ${this.smallBlind}.`);
    this.logs.push(`${this.players[bigBlindPos].name} posted big blind: ${this.bigBlind}.`);
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getPlayers(): Player[] {
    return this.players;
  }

  getCommunityCards(): Card[] {
    return this.communityCards;
  }

  getPot(): number {
    return this.pot;
  }

  getCurrentBet(): number {
    return this.currentBet;
  }

  getCurrentPlayerId(): string | null {
    if (this.players.length === 0) return null;
    return this.players[this.currentPlayerIndex].id;
  }

  processPlayerAction(playerId: string, action: string, raiseAmount?: number): void {
    const player = this.players.find(p => p.id === playerId);
    if (!player || player.folded) throw new Error('Invalid player or player folded');
    
    switch (action) {
      case 'fold':
        player.folded = true;
        this.logs.push(`${player.name} folded.`);
        break;
      case 'call':
        const callAmount = Math.min(this.currentBet - player.currentBet, player.chips);
        player.chips -= callAmount;
        player.currentBet += callAmount;
        this.pot += callAmount;
        if (player.chips === 0) player.allIn = true;
        this.logs.push(`${player.name} called ${callAmount}.`);
        break;
      case 'raise':
        if (!raiseAmount || raiseAmount <= this.currentBet) throw new Error('Invalid raise amount');
        const raiseTotal = raiseAmount - player.currentBet;
        if (raiseTotal > player.chips) throw new Error('Not enough chips');
        player.chips -= raiseTotal;
        player.currentBet = raiseAmount;
        this.currentBet = raiseAmount;
        this.pot += raiseTotal;
        if (player.chips === 0) player.allIn = true;
        this.logs.push(`${player.name} raised to ${raiseAmount}.`);
        break;
    }
    
    this.nextPlayer();
  }

  private nextPlayer(): void {
    do {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    } while (this.players[this.currentPlayerIndex].folded && this.activePlayers().length > 1);
    
    if (this.isBettingRoundComplete()) {
      this.advanceGameState();
    }
  }

  private activePlayers(): Player[] {
    return this.players.filter(p => !p.folded);
  }

  private isBettingRoundComplete(): boolean {
    const active = this.activePlayers();
    return active.every(p => p.currentBet === this.currentBet || p.allIn || p.folded);
  }

  private advanceGameState(): void {
    switch (this.gameState) {
      case GameState.PreFlop:
        this.gameState = GameState.Flop;
        this.dealFlop();
        break;
      case GameState.Flop:
        this.gameState = GameState.Turn;
        this.dealTurn();
        break;
      case GameState.Turn:
        this.gameState = GameState.River;
        this.dealRiver();
        break;
      case GameState.River:
        this.gameState = GameState.Showdown;
        break;
    }
    this.resetBets();
  }

  private resetBets(): void {
    this.players.forEach(p => p.currentBet = 0);
    this.currentBet = 0;
    this.currentPlayerIndex = (this.dealerPosition + 1) % this.players.length; // SB starts
  }

  dealFlop(): void {
    this.communityCards.push(this.deck.pop()!, this.deck.pop()!, this.deck.pop()!);
    this.logs.push('Flop dealt.');
  }

  dealTurn(): void {
    this.communityCards.push(this.deck.pop()!);
    this.logs.push('Turn dealt.');
  }

  dealRiver(): void {
    this.communityCards.push(this.deck.pop()!);
    this.logs.push('River dealt.');
  }

  determineWinner(): Player[] {
    // Simple implementation: highest card wins
    const active = this.activePlayers();
    if (active.length === 1) return active;
    
    // For simplicity, return the player with the highest card
    let winner = active[0];
    for (const player of active) {
      if (this.getHandValue(player.hand) > this.getHandValue(winner.hand)) {
        winner = player;
      }
    }
    return [winner];
  }

  private getHandValue(hand: Card[]): number {
    // Simple ranking: sum of ranks
    return hand.reduce((sum, card) => sum + this.rankValue(card.rank), 0);
  }

  private rankValue(rank: Rank): number {
    const values: { [key in Rank]: number } = {
      [Rank.Two]: 2, [Rank.Three]: 3, [Rank.Four]: 4, [Rank.Five]: 5,
      [Rank.Six]: 6, [Rank.Seven]: 7, [Rank.Eight]: 8, [Rank.Nine]: 9,
      [Rank.Ten]: 10, [Rank.Jack]: 11, [Rank.Queen]: 12, [Rank.King]: 13, [Rank.Ace]: 14
    };
    return values[rank];
  }

  awardPot(winners: Player[]): void {
    const share = Math.floor(this.pot / winners.length);
    winners.forEach(w => {
      w.chips += share;
      this.logs.push(`${w.name} won ${share} chips.`);
    });
    this.pot = 0;
  }

  endRound(): void {
    this.gameState = GameState.RoundEnd;
    this.dealerPosition = (this.dealerPosition + 1) % this.players.length;
    this.logs.push('Round ended.');
  }

  getGameLogs(): string[] {
    return this.logs;
  }
}
