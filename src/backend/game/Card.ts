export enum Suit {
  Hearts = 'H',
  Diamonds = 'D',
  Clubs = 'C',
  Spades = 'S'
}

export enum Rank {
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = 'T',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
  Ace = 'A'
}

export class Card {
  constructor(public suit: Suit, public rank: Rank) {}

  toString(): string {
    return `${this.rank}${this.suit}`;
  }

  static fromString(str: string): Card {
    const rank = str[0] as Rank;
    const suit = str[1] as Suit;
    return new Card(suit, rank);
  }
}
