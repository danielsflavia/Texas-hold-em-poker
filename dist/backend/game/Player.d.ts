import { Card } from './Card';
export declare class Player {
    id: string;
    name: string;
    chips: number;
    hand: Card[];
    folded: boolean;
    allIn: boolean;
    currentBet: number;
    position: number;
    constructor(id: string, name: string, chips: number);
}
//# sourceMappingURL=Player.d.ts.map