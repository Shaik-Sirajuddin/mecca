export interface IAirdropConfig {
  minSolAmount: number;
  paused: boolean;
  endTime: Date;
  amount: number;
}

export class AirdropConfig implements IAirdropConfig {
  minSolAmount: number;
  paused: boolean;
  endTime: Date;
  amount: number;

  constructor(data: IAirdropConfig) {
    this.minSolAmount = data.minSolAmount;
    this.paused = data.paused;
    this.endTime = new Date(data.endTime);
    this.amount = data.amount;
  }

  static dummy() {
    return new AirdropConfig({
      minSolAmount: 0.001,
      paused: false,
      endTime: new Date(),
      amount: 0.001,
    });
  }
}
