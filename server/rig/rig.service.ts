import { _RigDB, RigDb } from './rig.db';
import { GrahpicsCard, Rig } from './rig.class';
import { QBCore } from '../qbcore';
import { Config } from '../config';
import { _RigLogger, RigLogger } from './rig.logger';

const exp = global.exports;

class _RigService {
  private RigDb: _RigDB;
  private RigLogger: _RigLogger;
  private Rigs: Map<rigid, Rig>;

  constructor() {
    this.RigDb = RigDb;
    this.RigLogger = RigLogger;
    this.Rigs = new Map<rigid, Rig>();
  }

  async newRig(playerSrc: string | number, data: PlaceRPC, type: rigtype) {
    const { pos, rotation, id } = data;
    const Player = QBCore.Functions.GetPlayer(playerSrc);
    const { citizenid } = Player.PlayerData;

    let item: string;
    switch (type) {
      case 'basic':
        item = Config.BasicRigItemName;
        break;
      case 'advanced':
        item = Config.AdvancedRigItemName;
        break;
    }

    const rig = new Rig({
      Owner: citizenid,
      Type: type,
      GPUS: [],
      Position: pos,
      Rotation: rotation,
      Id: id,
    });

    this.Rigs.set(rig.Id, rig);
    await this.RigDb.Insert(rig);

    RigLogger.newRig(rig);

    Player.Functions.RemoveItem(item, 1);
  }

  async destroyRig(id: rigid, playerSrc: string | number) {
    const rig = this.Rigs.get(id);
    if (!rig) return;

    const Player = QBCore.Functions.GetPlayer(playerSrc);
    if (rig.Owner !== Player.PlayerData.citizenid) return;

    let item: string;
    switch (rig.Type) {
      case 'basic':
        item = Config.BasicRigItemName;
        break;
      case 'advanced':
        item = Config.AdvancedRigItemName;
        break;
    }

    Player.Functions.AddItem(item, 1);
    rig.GPUS.forEach((card) => {
      Player.Functions.AddItem(card.name, 1);
    });
    await this.RigDb.Delete(rig);
    this.Rigs.delete(rig.Id);
  }

  async addCardToRig(id: rigid, card: string, playerSrc: number | string) {
    const rig = this.Rigs.get(id);
    if (!rig) return;

    const Player = QBCore.Functions.GetPlayer(playerSrc);
    if (rig.Owner !== Player.PlayerData.citizenid) return;

    if (Player.Functions.RemoveItem(card, 1)) {
      rig.GPUS.push(new GrahpicsCard(card));
      this.Rigs.set(rig.Id, rig);
      await this.RigDb.Update(rig);
    }
  }

  async removeCardFromRig(id: rigid, card: string, playerSrc: number | string) {
    const rig = this.Rigs.get(id);
    if (!rig) return;

    const Player = QBCore.Functions.GetPlayer(playerSrc);
    if (rig.Owner !== Player.PlayerData.citizenid) return;

    const rigCard = rig.GPUS.find((gpu) => gpu.name === card);
    if (!rigCard) return;

    const index = rig.GPUS.indexOf(rigCard);
    rig.GPUS.splice(index, 1);

    Player.Functions.AddItem(card, 1);
    await this.RigDb.Update(rig);
    this.Rigs.set(rig.Id, rig);
  }

  async fetchPlayerRigs(citizenid: citizenid): Promise<Rig[]> {
    return new Promise(async (resolve) => {
      const resp: DatabaseResp[] = await exp.oxmysql.query_async('SELECT * FROM player_miningrigs WHERE citizenid = ?', [citizenid]);
      const player_rigs: Rig[] = [];

      resp.forEach((el) => {
        const rig = new Rig(JSON.parse(el.rig));
        this.Rigs.set(el.id, rig);
        player_rigs.push(rig);
      });

      RigLogger.loadedRigs(player_rigs, citizenid);

      resolve(player_rigs);
    });
  }

  async fetchAllRigs(): Promise<Rig[]> {
    return new Promise(async (resolve) => {
      const resp: DatabaseResp[] = await exp.oxmysql.query_async('SELECT * FROM player_miningrigs');
      const all_rigs = [];

      if (!resp || resp.length < 1) return resolve([]);

      for (let i = 0; i < resp.length; i++) {
        all_rigs.push(new Rig(JSON.parse(resp[i].rig)));
      }

      resolve(all_rigs);
    });
  }

  unloadPlayer(playerSrc: string | number) {
    const Player = QBCore.Functions.GetPlayer(playerSrc);
    const { citizenid } = Player.PlayerData;

    this.Rigs.forEach((rig, id) => {
      if (rig.Owner === citizenid) {
        this.Rigs.delete(id);
      }
    });

    RigLogger.unloadedPlayer(citizenid);
  }

  collectionLoop() {
    setInterval(() => {
      this.Rigs.forEach((rig) => {
        let total = 0;
        rig.GPUS.forEach((card) => {
          total += card.hashrate / (card.wattage * 0.1);
        });
        const Player = QBCore.Functions.GetPlayerByCitizenId(rig.Owner);
        if (Player && total > 0) {
          Player.Functions.AddMoney('crypto', total);
          RigLogger.cryptoEarned(rig, total);
        }
      });
    }, Config.TickRate * 60 * 1000);
  }
}

export const RigService = new _RigService();
RigService.collectionLoop();
