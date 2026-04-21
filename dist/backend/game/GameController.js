"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = exports.GameState = void 0;
const Card_1 = require("./Card");
const Player_1 = require("./Player");
const GameState_1 = require("./GameState");
Object.defineProperty(exports, "GameState", { enumerable: true, get: function () { return GameState_1.GameState; } });
class GameController {
    constructor(smallBlind, bigBlind) {
        this.deck = [];
        this.communityCards = [];
        this.players = [];
        this.currentPlayerIndex = 0;
        this.pot = 0;
        this.currentBet = 0;
        this.gameState = GameState_1.GameState.Waiting;
        this.dealerPosition = 0;
        this.logs = [];
        this.smallBlind = smallBlind;
        this.bigBlind = bigBlind;
        this.initializeDeck();
    }
    initializeDeck() {
        this.deck = [];
        for (const suit of Object.values(Card_1.Suit)) {
            for (const rank of Object.values(Card_1.Rank)) {
                this.deck.push(new Card_1.Card(suit, rank));
            }
        }
        this.shuffleDeck();
    }
    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }
    addPlayer(id, name, chips) {
        const player = new Player_1.Player(id, name, chips);
        player.position = this.players.length;
        this.players.push(player);
        this.logs.push(`${name} joined the game.`);
    }
    initializeRound() {
        this.gameState = GameState_1.GameState.PreFlop;
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
    dealHands() {
        for (let i = 0; i < 2; i++) {
            for (const player of this.players) {
                player.hand.push(this.deck.pop());
            }
        }
    }
    postBlinds() {
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
    getGameState() {
        return this.gameState;
    }
    getPlayers() {
        return this.players;
    }
    getCommunityCards() {
        return this.communityCards;
    }
    getPot() {
        return this.pot;
    }
    getCurrentBet() {
        return this.currentBet;
    }
    getCurrentPlayerId() {
        if (this.players.length === 0)
            return null;
        return this.players[this.currentPlayerIndex].id;
    }
    processPlayerAction(playerId, action, raiseAmount) {
        const player = this.players.find(p => p.id === playerId);
        if (!player || player.folded)
            throw new Error('Invalid player or player folded');
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
                if (player.chips === 0)
                    player.allIn = true;
                this.logs.push(`${player.name} called ${callAmount}.`);
                break;
            case 'raise':
                if (!raiseAmount || raiseAmount <= this.currentBet)
                    throw new Error('Invalid raise amount');
                const raiseTotal = raiseAmount - player.currentBet;
                if (raiseTotal > player.chips)
                    throw new Error('Not enough chips');
                player.chips -= raiseTotal;
                player.currentBet = raiseAmount;
                this.currentBet = raiseAmount;
                this.pot += raiseTotal;
                if (player.chips === 0)
                    player.allIn = true;
                this.logs.push(`${player.name} raised to ${raiseAmount}.`);
                break;
        }
        this.nextPlayer();
    }
    nextPlayer() {
        do {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        } while (this.players[this.currentPlayerIndex].folded && this.activePlayers().length > 1);
        if (this.isBettingRoundComplete()) {
            this.advanceGameState();
        }
    }
    activePlayers() {
        return this.players.filter(p => !p.folded);
    }
    isBettingRoundComplete() {
        const active = this.activePlayers();
        return active.every(p => p.currentBet === this.currentBet || p.allIn || p.folded);
    }
    advanceGameState() {
        switch (this.gameState) {
            case GameState_1.GameState.PreFlop:
                this.gameState = GameState_1.GameState.Flop;
                this.dealFlop();
                break;
            case GameState_1.GameState.Flop:
                this.gameState = GameState_1.GameState.Turn;
                this.dealTurn();
                break;
            case GameState_1.GameState.Turn:
                this.gameState = GameState_1.GameState.River;
                this.dealRiver();
                break;
            case GameState_1.GameState.River:
                this.gameState = GameState_1.GameState.Showdown;
                break;
        }
        this.resetBets();
    }
    resetBets() {
        this.players.forEach(p => p.currentBet = 0);
        this.currentBet = 0;
        this.currentPlayerIndex = (this.dealerPosition + 1) % this.players.length; // SB starts
    }
    dealFlop() {
        this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
        this.logs.push('Flop dealt.');
    }
    dealTurn() {
        this.communityCards.push(this.deck.pop());
        this.logs.push('Turn dealt.');
    }
    dealRiver() {
        this.communityCards.push(this.deck.pop());
        this.logs.push('River dealt.');
    }
    determineWinner() {
        // Simple implementation: highest card wins
        const active = this.activePlayers();
        if (active.length === 1)
            return active;
        // For simplicity, return the player with the highest card
        let winner = active[0];
        for (const player of active) {
            if (this.getHandValue(player.hand) > this.getHandValue(winner.hand)) {
                winner = player;
            }
        }
        return [winner];
    }
    getHandValue(hand) {
        // Simple ranking: sum of ranks
        return hand.reduce((sum, card) => sum + this.rankValue(card.rank), 0);
    }
    rankValue(rank) {
        const values = {
            [Card_1.Rank.Two]: 2, [Card_1.Rank.Three]: 3, [Card_1.Rank.Four]: 4, [Card_1.Rank.Five]: 5,
            [Card_1.Rank.Six]: 6, [Card_1.Rank.Seven]: 7, [Card_1.Rank.Eight]: 8, [Card_1.Rank.Nine]: 9,
            [Card_1.Rank.Ten]: 10, [Card_1.Rank.Jack]: 11, [Card_1.Rank.Queen]: 12, [Card_1.Rank.King]: 13, [Card_1.Rank.Ace]: 14
        };
        return values[rank];
    }
    awardPot(winners) {
        const share = Math.floor(this.pot / winners.length);
        winners.forEach(w => {
            w.chips += share;
            this.logs.push(`${w.name} won ${share} chips.`);
        });
        this.pot = 0;
    }
    endRound() {
        this.gameState = GameState_1.GameState.RoundEnd;
        this.dealerPosition = (this.dealerPosition + 1) % this.players.length;
        this.logs.push('Round ended.');
    }
    getGameLogs() {
        return this.logs;
    }
}
exports.GameController = GameController;
//# sourceMappingURL=GameController.js.map