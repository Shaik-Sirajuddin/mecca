export interface Config {
  id: number;
  startTime: Date;
  paused: boolean;
}

export interface Round {
  id: number;
  tokenPrice: string; // Using string to match Sequelize's DECIMAL type
  endTime: Date;
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
    this.config = {
      ...data.config,
      startTime: new Date(data.config.startTime),
    };
  }

  static dummy() {
    return new IcoState({
      rounds: [],
      config: {
        startTime: new Date(),
        paused: false,
      },
    });
  }
}
