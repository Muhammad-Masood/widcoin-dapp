export type Stage = {
    stageNumber: number;
    stageSupply: number;
    supplyRemaining: number;
    tokenPrice: number;
    minParticipationUSDT: number;
    winningPool: number;
    winner: string;
    supplySold?: number;
}