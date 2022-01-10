interface IGPU {
  hashrate: number;
  wattage: number;
  name: string;
}

interface IGPUDict {
  [key: string]: IGPU;
}

interface IConfig {
  BasicRigCardLimit: number;
  AdvancedRigCardLimit: number;
  BasicRigItemName: string;
  AdvancedRigItemName: string;
  TickRate: number;
}

interface CardMangerData {
  empty: boolean;
  card: IGPU;
}

type citizenid = string;
type rigtype = 'basic' | 'advanced';
interface Vector3 {
  x: number;
  y: number;
  z: number;
}

interface Rig {
  Owner: citizenid;
  Id: string;
  Type: rigtype;
  Position: Vector3;
  Rotation: Vector3;
  GPUS: IGPU[];
}

interface FetchRigsResponse {
  playerRigs: Rig[];
  allRigs: Rig[];
}
