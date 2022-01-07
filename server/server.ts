import { QBCore } from './qbcore';
import { Config, GPUDict } from './config';
import { Utils } from './utils';
import { RigService } from './rig/rig.service';

const exp = global.exports;

Utils.onNetPromise('crypto:fetchrigs', async (req, res) => {
  const { source } = req;
  const Player = QBCore.Functions.GetPlayer(source);
  const { citizenid } = Player.PlayerData;

  const PlayerRigs = await RigService.fetchPlayerRigs(citizenid);
  const AllRigs = await RigService.fetchAllRigs().then((rigs) => rigs.filter((rig) => rig.Owner !== citizenid));

  res({
    status: 'ok',
    data: {
      playerRigs: PlayerRigs,
      allRigs: AllRigs,
    },
  });
});

onNet('crypto:playerunloaded', () => {
  const src = global.source;
  RigService.unloadPlayer(src);
});

QBCore.Functions.CreateUseableItem(Config.BasicRigItemName, async (source, item) => {
  emitNet('crypto:placerig', source, 'basic');
});

QBCore.Functions.CreateUseableItem(Config.AdvancedRigItemName, async (source) => {
  emitNet('crypto:placerig', source, 'advanced');
});

onNet('crypto:rigplaced', async (type: rigtype, data: PlaceRPC) => {
  const src = global.source;

  if (data.success) {
    await RigService.newRig(src, data, type);
  }
});

onNet('crypto:rigdisasemble', async (id: string) => {
  const src = global.source;
  await RigService.destroyRig(id, src);
});

onNet('crypto:cardremoved', async (id: string, card: string) => {
  const src = global.source;
  await RigService.removeCardFromRig(id, card, src);
});

onNet('crypto:cardadded', async (id: string, card: string) => {
  const src = global.source;
  await RigService.addCardToRig(id, card, src);
});
