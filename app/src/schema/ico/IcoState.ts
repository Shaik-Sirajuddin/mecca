import Decimal from "decimal.js";

export interface Round {
  id: number;
  tokenPrice: Decimal; // Stored as string due to precision requirements
  endTime: Date; // ISO string format
}

export interface Config {
  id: number;
  startTime: Date; // ISO string format
  paused: boolean;
}

export interface IIcoState {
  rounds: Round[];
  config: Config;
}

export class IcoState implements IIcoState {
  rounds: Round[];
  config: Config;

  constructor(data: any) {
    this.rounds = data.rounds;
    this.config = data.config;
    for (let i = 0; i < this.rounds.length; i++) {
      this.rounds[i].endTime = new Date(this.rounds[i].endTime);
      this.rounds[i].tokenPrice = new Decimal(this.rounds[i].tokenPrice);
    }
    this.config.startTime = new Date(this.config.startTime);
  }

  static dummy() {
    return new IcoState({
      rounds: [
        {
          endTime: new Date(),
          id: 0,
          tokenPrice: new Decimal(0.1),
        },
      ],
      config: {
        id: 0,
        paused: false,
        startTime: new Date(),
      },
    });
  }
}
