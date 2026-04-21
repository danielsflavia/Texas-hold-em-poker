"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = exports.Rank = exports.Suit = void 0;
var Suit;
(function (Suit) {
    Suit["Hearts"] = "H";
    Suit["Diamonds"] = "D";
    Suit["Clubs"] = "C";
    Suit["Spades"] = "S";
})(Suit || (exports.Suit = Suit = {}));
var Rank;
(function (Rank) {
    Rank["Two"] = "2";
    Rank["Three"] = "3";
    Rank["Four"] = "4";
    Rank["Five"] = "5";
    Rank["Six"] = "6";
    Rank["Seven"] = "7";
    Rank["Eight"] = "8";
    Rank["Nine"] = "9";
    Rank["Ten"] = "T";
    Rank["Jack"] = "J";
    Rank["Queen"] = "Q";
    Rank["King"] = "K";
    Rank["Ace"] = "A";
})(Rank || (exports.Rank = Rank = {}));
class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }
    toString() {
        return `${this.rank}${this.suit}`;
    }
    static fromString(str) {
        const rank = str[0];
        const suit = str[1];
        return new Card(suit, rank);
    }
}
exports.Card = Card;
//# sourceMappingURL=Card.js.map