import { Card } from './Card';

export class Player {
  public hand: Card[] = [];
  public folded: boolean = false;
  public allIn: boolean = false;
  public currentBet: number = 0;
  public position: number = 0;

  constructor(public id: string, public name: string, public chips: number) {}
}
