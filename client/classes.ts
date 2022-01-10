import { Control, Game, Prop, Vector3 } from '@nativewrappers/client';
import { InstructionalButtons } from '@nativewrappers/client/lib/ui/InstructionalButtons';
import { Config, GPUDict } from './config';
import { ClientUtils, uuidV4 } from '@project-error/pe-utils';
import { QBCore } from './qbcore';

const Speeds = [0.01, 0.05, 0.1, 0.2, 0.5];

export abstract class MiningRig {
  private _tick: number;
  private _speed: number;
  private _entity: Prop;

  public MODELHASH: number;
  public LIMIT: number;
  public GPUS: GraphicsCard[] = [];
  public RIGID: string;
  public Position: Vector3;
  public Rotation: Vector3;

  public get WorkPerTick(): number {
    let total = 0;
    for (let i = 0; i < this.GPUS.length; i++) {
      total += this.GPUS[i].hashrate / (this.GPUS[i].wattage * 0.1);
    }

    return total;
  }

  constructor(pos?: Vector3, rotation?: Vector3, gpus?: GraphicsCard[], rigid?: string) {
    this.Position = pos ?? new Vector3(0, 0, 0);
    this.Rotation = rotation ?? new Vector3(0, 0, 0);
    this.GPUS = gpus ?? [];
    this.RIGID = rigid ?? uuidV4();
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
    this.Destroy();
    emitNet('crypto:rigdisasemble', this.RIGID);
  }

  public RegisterTarget(): void {
    global.exports['qb-target'].AddEntityZone(
      `miningrig-${this.RIGID}`,
      this._entity.Handle,
      {
        name: `miningrig-${this.RIGID}`,
        debug: GetConvar('mojito_debug', '0') == '1',
      },
      {
        distance: 2.0,
        options: [
          {
            label: 'Open Mining Rig',
            icon: 'fas fa-server',
            event: 'crypto:openmenu',
          },
        ],
      },
    );
  }

  public Create(): Promise<void> {
    return new Promise((resolve, reject) => {
      const gameTimer = GetGameTimer();
      this._entity = new Prop(CreateObject(this.MODELHASH, this.Position.x, this.Position.y, this.Position.z, false, true, false));
      this._entity.Rotation = this.Rotation;
      this._entity.Position = this.Position;

      this._tick = setTick(() => {
        if (this._entity.exists()) {
          this._entity.IsPositionFrozen = true;
          clearTick(this._tick);
          resolve();
        }

        if (GetGameTimer() - gameTimer >= 5000) {
          clearTick(this._tick);
          reject('Timeout: entity was not created in 5000ms');
        }
      });
    });
  }

  public Destroy(): void {
    this._entity.delete();
  }

  public Place(): Promise<void> {
    return new Promise((resolve, reject) => {
      const PlyPed = Game.PlayerPed;
      const SpawnCoords = PlyPed.getOffsetPosition(new Vector3(0.0, 0.8, 0.0));
      this._entity = new Prop(CreateObject(this.MODELHASH, SpawnCoords.x, SpawnCoords.y, SpawnCoords.z, true, true, false));
      SetEntityCollision(this._entity.Handle, false, false);

      this._entity.Opacity = 150;

      const buttons = new InstructionalButtons([
        {
          controls: [Control.PhoneLeft, Control.PhoneUp, Control.PhoneDown, Control.PhoneRight],
          label: 'Move',
        },
        { controls: [Control.FrontendRs, Control.FrontendLs], label: 'Height' },
        { controls: [Control.Context, Control.ContextSecondary], label: 'Rotate' },
        { controls: [Control.PhoneExtraOption], label: 'Place on Ground' },
        { controls: [Control.ScriptedFlyZUp, Control.ScriptedFlyZDown], label: 'Speed' },
      ]);

      this._speed = 0;

      this._tick = setTick(() => {
        buttons.draw();

        DisableControlAction(0, Control.Cover, true);
        DisableControlAction(0, Control.Duck, true);

        // Up-Arrow
        if (IsControlPressed(0, Control.PhoneUp)) {
          this._entity.Position = this._entity.getOffsetPosition(new Vector3(0, -Speeds[this._speed], 0));
        }
        // Down-Arrow
        if (IsControlPressed(0, Control.PhoneDown)) {
          this._entity.Position = this._entity.getOffsetPosition(new Vector3(0, Speeds[this._speed], 0));
        }
        // Left-Arrow
        if (IsControlPressed(0, Control.PhoneLeft)) {
          this._entity.Position = this._entity.getOffsetPosition(new Vector3(Speeds[this._speed], 0, 0));
        }
        // Right-Arrow
        if (IsControlPressed(0, Control.PhoneRight)) {
          this._entity.Position = this._entity.getOffsetPosition(new Vector3(-Speeds[this._speed], 0, 0));
        }
        // Shift
        if (IsControlPressed(0, Control.FrontendLs)) {
          this._entity.Position = Vector3.add(this._entity.Position, new Vector3(0.0, 0.0, Speeds[this._speed]));
        }
        // Control
        if (IsControlPressed(0, Control.FrontendRs)) {
          this._entity.Position = Vector3.add(this._entity.Position, new Vector3(0.0, 0.0, -Speeds[this._speed]));
        }

        // E
        if (IsControlPressed(0, Control.Context)) {
          this._entity.Rotation = Vector3.add(this._entity.Rotation, new Vector3(0.0, 0.0, Speeds[this._speed]));
        }
        // Q
        if (IsControlPressed(0, Control.ContextSecondary)) {
          this._entity.Rotation = Vector3.add(this._entity.Rotation, new Vector3(0.0, 0.0, -Speeds[this._speed]));
        }

        // SPACE
        if (IsControlJustPressed(0, Control.PhoneExtraOption)) {
          this._entity.placeOnGround();
        }

        // PAGEUP
        if (IsControlJustPressed(0, Control.ScriptedFlyZUp)) {
          if (Speeds[this._speed + 1]) {
            this._speed += 1;
          }
        }

        // PAGEDOWN
        if (IsControlJustPressed(0, Control.ScriptedFlyZDown)) {
          if (Speeds[this._speed - 1]) {
            this._speed -= 1;
          }
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
  constructor(pos?: Vector3, rotation?: Vector3, gpus?: GraphicsCard[], rigid?: string) {
    super(pos, rotation, gpus, rigid);
    this.LIMIT = Config.BasicRigCardLimit;
    this.MODELHASH = GetHashKey('prop_dyn_pc_02');
  }
}

export class AdvancedMiningRig extends MiningRig {
  constructor(pos?: Vector3, rotation?: Vector3, gpus?: GraphicsCard[], rigid?: string) {
    super(pos, rotation, gpus, rigid);
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
