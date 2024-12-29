export interface IAirdropConfig {
  amount: number;
  minSolAmount: number;
  paused: boolean;
  endTime: Date;
}

export class AirdropConfig implements IAirdropConfig {
  amount: number;
  minSolAmount: number;
  paused: boolean;
  endTime: Date;

  constructor(data: any) {
    this.amount = data.amount;
    this.minSolAmount = data.minSolAmount;
    this.paused = data.paused;
    this.endTime = new Date(data.endTime);
  }

  static dummy() {
    return new AirdropConfig({
      amount: 0,
      minSolAmount: 0,
      paused: false,
      endTime: new Date(),
    });
  }
}
