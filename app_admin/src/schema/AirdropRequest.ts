export interface IAirdropRequest {
  id: number;
  address: string;
  ip: string;
  underProcess: boolean;
  success: boolean;
  createdAt?: Date;
}

export class AidropRequest implements IAirdropRequest {
  id: number;
  address: string;
  ip: string;
  underProcess: boolean;
  success: boolean;
  createdAt?: Date | undefined;

  constructor(data: any) {
    this.address = data.address;
    this.id = data.id;
    this.ip = data.ip;
    this.underProcess = data.underProcess;
    this.success = data.success;
    this.createdAt = new Date(data.createdAt);
  }
}
