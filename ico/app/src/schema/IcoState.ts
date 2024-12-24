export interface Round {
  id: number;
  tokenPrice: string; // Stored as string due to precision requirements
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
    }
    this.config.startTime = new Date(this.config.startTime);
  }

  static dummy() {
    return new IcoState({
      rounds: [],
      config: {
        id: 0,
        paused: false,
        startTime: new Date(),
      },
    });
  }
}
