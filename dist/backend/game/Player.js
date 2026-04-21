"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(id, name, chips) {
        this.id = id;
        this.name = name;
        this.chips = chips;
        this.hand = [];
        this.folded = false;
        this.allIn = false;
        this.currentBet = 0;
        this.position = 0;
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map