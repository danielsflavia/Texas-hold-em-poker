export declare enum Suit {
    Hearts = "H",
    Diamonds = "D",
    Clubs = "C",
    Spades = "S"
}
export declare enum Rank {
    Two = "2",
    Three = "3",
    Four = "4",
    Five = "5",
    Six = "6",
    Seven = "7",
    Eight = "8",
    Nine = "9",
    Ten = "T",
    Jack = "J",
    Queen = "Q",
    King = "K",
    Ace = "A"
}
export declare class Card {
    suit: Suit;
    rank: Rank;
    constructor(suit: Suit, rank: Rank);
    toString(): string;
    static fromString(str: string): Card;
}
//# sourceMappingURL=Card.d.ts.map