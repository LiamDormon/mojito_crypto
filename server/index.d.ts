interface IConfig {
  BasicRigCardLimit: number;
  AdvancedRigCardLimit: number;
  BasicRigItemName: string;
  AdvancedRigItemName: string;
  TickRate: number;
}

interface PlaceRPC {
  success: boolean;
  pos?: Vec3;
  rotation?: Vec3;
  id?: string;
}

interface IGPUDict {
  [key: string]: GraphicsCard;
}

interface GraphicsCard {
  name: string;
  hashrate: number;
  wattage: number;
}
interface Vec3 {
  x: number;
  y: number;
  z: number;
}

type citizenid = string;
type rigtype = 'basic' | 'advanced';
type rigid = string;

interface DatabaseResp {
  id: string;
  citizenid: citizenid;
  rig: string;
}
