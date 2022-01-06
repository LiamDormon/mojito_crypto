import { Control, Game, Prop, Scaleform, Vector3 } from '@nativewrappers/client';
import { InstructionalButtons } from '@nativewrappers/client/lib/ui/InstructionalButtons'
import { Config, GPUDict } from './config';
import { ClientUtils, uuidV4 } from '@project-error/pe-utils';

export abstract class MiningRig {
  private _tick: number;
  private _entity: Prop;

  public MODELHASH: number;
  public LIMIT: number;
  public GPUS: GraphicsCard[] = [];
  public RIGID: string;
  public set Position(pos: Vector3) {
    if (DoesEntityExist(this._entity.Handle)) {
      this._entity.Position = pos;
    }
  }
  public get Position(): Vector3 {
    if (DoesEntityExist(this._entity.Handle)) {
      return this._entity.Position;
    }
  }
  public get Handle(): number {
    if (DoesEntityExist(this._entity.Handle)) {
      return this._entity.Handle;
    }
  }
  public get Heading(): number {
    if (DoesEntityExist(this._entity.Handle)) {
      return this._entity.Heading;
    }
  }
  public set Heading(dir) {
    if (DoesEntityExist(this._entity.Handle)) {
      this._entity.Heading = dir;
    }
  }

  public get WorkPerTick(): number {
    let total = 0;
    for (let i = 0; i < this.GPUS.length; i++) {
      total += this.GPUS[i].hashrate / (this.GPUS[i].wattage * 0.1);
    }

    return total;
  }

  constructor(pos?: Vector3, gpus?: GraphicsCard[], rigid?: string) {
    if (pos) {
      this._entity = new Prop(CreateObject(this.MODELHASH, pos.x, pos.y, pos.z, true, true, false));
      this.Position = pos;
    }

    if (gpus) {
      this.GPUS = gpus;
    }

    if (rigid) {
      this.RIGID = rigid;
    } else {
      this.RIGID = uuidV4();
    }
  }

  public AddCard(gpu: GraphicsCard): boolean {
    if (this.GPUS && this.GPUS.length >= this.LIMIT) {
      return false;
    }
    this.GPUS.push(gpu);

    return true;
  }

  public RemoveCardOfType(type: string) {
    for (let i = 0; i <= this.GPUS.length; i++) {
      if (this.GPUS[i].name === type) {
        const card = this.GPUS[i];
        this.GPUS.splice(i, 1);
        return card;
      }
    }

    throw new Error('GPU of this type was not found');
  }

  public Deconstruct(): void {
    this._entity.delete();
    emitNet('crypto:rigdisasemble', this.RIGID);
  }

  public RegisterTarget(): void {
    global.exports['qb-target'].AddTargetEntity(this.Handle, {
      distance: 2.0,
      options: [
        {
          label: 'Open Mining Rig',
          icon: 'fas fa-server',
          event: 'crypto:openmenu',
        },
      ],
    });
  }

  public Place(): Promise<void> {
    return new Promise((resolve, reject) => {
      const PlyPed = Game.PlayerPed;
      const SpawnCoords = PlyPed.getOffsetPosition(new Vector3(0.0, 0.8, 0.0));
      this._entity = new Prop(CreateObject(this.MODELHASH, SpawnCoords.x, SpawnCoords.y, SpawnCoords.z, true, true, false));
      SetEntityCollision(this._entity.Handle, false, false);

      this._entity.Opacity = 150;

      const buttons = new InstructionalButtons([
        { controls: [Control.PhoneLeft, Control.PhoneRight, Control.PhoneUp, Control.PhoneDown], label: 'Left / Right / Forward / Back' },
        { controls: [Control.FrontendRs, Control.FrontendLs], label: 'Up / Down' },
        { controls: [Control.Context, Control.ContextSecondary], label: 'Rotate' },
      ]);

      this._tick = setTick(() => {
        buttons.draw();

        DisableControlAction(0, Control.Cover, true);
        DisableControlAction(0, Control.Duck, true);

        // Up-Arrow
        if (IsControlPressed(0, Control.PhoneUp)) {
          this._entity.Position = this._entity.getOffsetPosition(new Vector3(0, -0.04, 0));
        }
        // Down-Arrow
        if (IsControlPressed(0, Control.PhoneDown)) {
          this._entity.Position = this._entity.getOffsetPosition(new Vector3(0, 0.04, 0));
        }
        // Left-Arrow
        if (IsControlPressed(0, Control.PhoneLeft)) {
          this._entity.Position = this._entity.getOffsetPosition(new Vector3(0.04, 0, 0));
        }
        // Right-Arrow
        if (IsControlPressed(0, Control.PhoneRight)) {
          this._entity.Position = this._entity.getOffsetPosition(new Vector3(-0.04, 0, 0));
        }
        // Shift
        if (IsControlPressed(0, Control.FrontendLs)) {
          this._entity.Position = Vector3.add(this._entity.Position, new Vector3(0.0, 0.0, 0.04));
        }
        // Control
        if (IsControlPressed(0, Control.FrontendRs)) {
          this._entity.Position = Vector3.add(this._entity.Position, new Vector3(0.0, 0.0, -0.04));
        }

        // E
        if (IsControlPressed(0, Control.Context)) {
          this._entity.Rotation = Vector3.add(this._entity.Rotation, new Vector3(0.0, 0.0, 1.0));
        }
        // Q
        if (IsControlPressed(0, Control.ContextSecondary)) {
          this._entity.Rotation = Vector3.add(this._entity.Rotation, new Vector3(0.0, 0.0, -1.0));
        }

        // Enter
        if (IsControlJustPressed(0, Control.PhoneSelect)) {
          clearTick(this._tick);
          this._entity.Opacity = 255;
          this.Position = this._entity.Position;
          this._entity.IsPositionFrozen = true;
          SetEntityCollision(this._entity.Handle, true, true);

          resolve();
        }

        if (IsControlJustPressed(0, Control.PhoneCancel)) {
          clearTick(this._tick);
          this._entity.delete();

          reject('User cancelled placing object');
        }
      });
    });
  }
}

export class BasicMiningRig extends MiningRig {
  constructor(pos?: Vector3, gpus?: GraphicsCard[], rigid?: string) {
    super(pos, gpus, rigid);
    this.LIMIT = Config.BasicRigCardLimit;
    this.MODELHASH = GetHashKey('prop_dyn_pc_02');
  }
}

export class AdvancedMiningRig extends MiningRig {
  constructor(pos?: Vector3, gpus?: GraphicsCard[], rigid?: string) {
    super(pos, gpus, rigid);
    this.LIMIT = Config.AdvancedRigCardLimit;
    this.MODELHASH = GetHashKey('xm_base_cia_server_01');
  }
}

export class GraphicsCard implements IGPU {
  public name: string;
  public hashrate: number;
  public wattage: number;

  constructor(type: string) {
    this.name = type;
    this.hashrate = GPUDict[type].hashrate;
    this.wattage = GPUDict[type].wattage;
  }
}

class Utility extends ClientUtils {
  NearestRig(rigs: MiningRig[]): [number, MiningRig] {
    const PlyLocation = Game.PlayerPed.Position;

    let ClosestDist = -1;
    let ClosestRig: MiningRig = null;
    rigs.forEach((rig) => {
      const dist = PlyLocation.distance(rig.Position);
      if (ClosestDist == -1 || dist < ClosestDist) {
        ClosestDist = dist;
        ClosestRig = rig;
      }
    });

    return [ClosestDist, ClosestRig];
  }
}

export const Utils = new Utility();
