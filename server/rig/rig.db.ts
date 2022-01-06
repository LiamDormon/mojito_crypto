import { Rig } from './rig.class';

const exp = global.exports;

export class _RigDB {
  public Update(rig: Rig): Promise<void> {
    return new Promise((resolve) => {
      setImmediate(async () => {
        resolve(
          await exp.oxmysql.query_async('UPDATE player_miningrigs SET rig = :rig WHERE id = :id', {
            rig: JSON.stringify(rig),
            id: rig.Id,
          }),
        );
      });
    });
  }

  public Insert(rig: Rig): Promise<void> {
    return new Promise((resolve) => {
      setImmediate(async () => {
        resolve(
          await exp.oxmysql.query_async('INSERT INTO player_miningrigs (id, citizenid, rig) VALUES (:id, :citizenid, :rig)', {
            id: rig.Id,
            citizenid: rig.Owner,
            rig: JSON.stringify(rig),
          }),
        );
      });
    });
  }

  public Delete(rig: Rig): Promise<void> {
    return new Promise((resolve) => {
      setImmediate(async () => {
        resolve(
          await exp.oxmysql.query_async('DELETE FROM player_miningrigs WHERE id = :id', {
            id: rig.Id,
          }),
        );
      });
    });
  }
}

export const RigDb = new _RigDB();
