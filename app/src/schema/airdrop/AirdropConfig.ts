export interface IAirdropConfig {
  minSolAmount: number;
  paused: boolean;
  endTime: Date;
}

export class AirdropConfig implements IAirdropConfig {
  minSolAmount: number;
  paused: boolean;
  endTime: Date;

  constructor(data: IAirdropConfig) {
    this.minSolAmount = data.minSolAmount;
    this.paused = data.paused;
    this.endTime = new Date(data.endTime);
  }

  static dummy() {
    return new AirdropConfig({
      minSolAmount: 0.001,
      paused: false,
      endTime: new Date(),
    });
  }
}
