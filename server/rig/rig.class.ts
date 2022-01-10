import { GPUDict } from '../config';

export class Rig {
  public Owner: citizenid;
  public Type: rigtype;
  public GPUS: GraphicsCard[];
  public Position: Vec3;
  public Rotation: Vec3;
  public Id: string;

  constructor(data: Rig) {
    this.Owner = data.Owner;
    this.Id = data.Id;
    this.GPUS = data.GPUS;
    this.Type = data.Type;
    this.Position = data.Position;
    this.Rotation = data.Rotation;
  }
}

export class GrahpicsCard {
  public name: string;
  public hashrate: number;
  public wattage: number;

  constructor(name: string) {
    this.name = name;
    this.hashrate = GPUDict[name].hashrate;
    this.wattage = GPUDict[name].wattage;
  }
}
