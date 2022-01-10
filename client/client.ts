import { QBCore } from './qbcore';
import { MiningRig, BasicMiningRig, GraphicsCard, Utils, AdvancedMiningRig } from './classes';
import { GPUDict } from './config';
import { ServerPromiseResp } from '@project-error/pe-utils';
import { Vector3 } from '@nativewrappers/client';

let MY_RIGS: MiningRig[] = [];
let ALL_RIGS: MiningRig[] = [];
const exp = global.exports;

on('QBCore:Client:OnPlayerLoaded', async () => {
  const resp = await Utils.emitNetPromise<ServerPromiseResp<FetchRigsResponse>>('crypto:fetchrigs', {});
  if (!resp.data.playerRigs || !resp.data.allRigs) return;

  for (const rig of resp.data.playerRigs) {
    let _rig: MiningRig;
    switch (rig.Type) {
      case 'basic':
        _rig = new BasicMiningRig(Vector3.create(rig.Position), Vector3.create(rig.Rotation), rig.GPUS, rig.Id);
        break;
      case 'advanced':
        _rig = new AdvancedMiningRig(Vector3.create(rig.Position), Vector3.create(rig.Rotation), rig.GPUS, rig.Id);
        break;
    }
    await _rig.Create();
    _rig.Rotation = Vector3.create(rig.Rotation);
    _rig.RegisterTarget();

    MY_RIGS.push(_rig);
  }

  for (const rig of resp.data.allRigs) {
    let _rig: MiningRig;
    switch (rig.Type) {
      case 'basic':
        _rig = new BasicMiningRig(Vector3.create(rig.Position), Vector3.create(rig.Rotation), rig.GPUS, rig.Id);
        break;
      case 'advanced':
        _rig = new AdvancedMiningRig(Vector3.create(rig.Position), Vector3.create(rig.Rotation), rig.GPUS, rig.Id);
        break;
    }
    await _rig.Create();

    ALL_RIGS.push(_rig);
  }
});

on('QBCore:Client:OnPlayerLoaded', () => {
  // Destroy all rig entities
  for (const rig of ALL_RIGS.concat(MY_RIGS)) {
    rig.Destroy();
  }
  MY_RIGS = [];
  emitNet('crypto:playerunloaded');
});

onNet('crypto:placerig', async (type: string) => {
  let data;
  try {
    let rig: MiningRig;
    switch (type) {
      case 'basic':
        rig = new BasicMiningRig();
        break;
      case 'advanced':
        rig = new AdvancedMiningRig();
        break;
    }

    await rig.Place();
    rig.RegisterTarget();
    MY_RIGS.push(rig);

    data = {
      success: true,
      pos: rig.Position,
      rotation: rig.Rotation,
      id: rig.RIGID,
    };
  } catch (e) {
    console.log(e);

    data = {
      success: false,
    };
  }

  emitNet('crypto:rigplaced', type, data);
});

on('crypto:openmenu', () => {
  const [dist, rig] = Utils.NearestRig(MY_RIGS);
  if (dist > 5) return;

  exp['qb-menu'].openMenu([
    {
      header: 'Crypto Mining Rig',
      txt: `Production Rate: ${Math.round(rig.WorkPerTick * 100) / 100}`,
      isMenuHeader: true,
    },
    {
      header: 'Disassemble',
      txt: 'Take your mining rig apart',
      params: {
        event: 'crypto:yeetrig',
      },
    },
    {
      header: 'Cards',
      txt: 'Manage the GPUs in your mining rig',
      params: {
        event: 'crypto:cardmanager',
      },
    },
  ]);
});

on('crypto:yeetrig', () => {
  const [dist, rig] = Utils.NearestRig(MY_RIGS);
  if (dist < 2.5) {
    rig.Deconstruct();
    MY_RIGS.splice(MY_RIGS.indexOf(rig), 1);
  }
});

on('crypto:cardmanager', () => {
  const [dist, rig] = Utils.NearestRig(MY_RIGS);

  if (dist < 2.5) {
    const MenuData = [];
    for (let i = 0; i < rig.LIMIT; i++) {
      const empty = rig.GPUS[i]?.name == undefined;
      MenuData[i] = {
        header: `GPU Slot ${i + 1}`,
        txt: empty ? 'Empty Slot' : QBCore.Shared.Items[rig.GPUS[i].name].label,
        params: {
          event: 'crypto:cardmenu',
          args: {
            empty,
            card: rig.GPUS[i] || null,
          },
        },
      };
    }

    exp['qb-menu'].openMenu([
      {
        header: 'Card Manager',
        isMenuHeader: true,
      },
      ...MenuData,
      {
        header: '< Go Back',
        params: {
          event: 'crypto:openmenu',
        },
      },
    ]);
  }
});

on('crypto:cardmenu', (data: CardMangerData) => {
  if (data.empty) {
    exp['qb-menu'].openMenu([
      {
        header: 'Graphics Card',
        isMenuHeader: true,
      },
      {
        header: 'Add a card',
        params: {
          event: 'crypto:addcard',
        },
      },
      {
        header: '< Go Back',
        params: {
          event: 'crypto:cardmanager',
        },
      },
    ]);
  } else {
    exp['qb-menu'].openMenu([
      {
        header: 'Graphics Card',
        isMenuHeader: true,
      },
      {
        header: 'Remove card',
        txt: QBCore.Shared.Items[data.card.name].label,
        params: {
          event: 'crypto:yeetcardinrig',
          args: data.card.name,
        },
      },
      {
        header: '< Go Back',
        params: {
          event: 'crypto:cardmanager',
        },
      },
    ]);
  }
});

on('crypto:addcard', () => {
  const MenuData = [];
  const PlayerData = QBCore.Functions.GetPlayerData();

  for (let item in PlayerData.items) {
    const cardname = PlayerData.items[item].name;
    if (GPUDict[cardname]) {
      MenuData.push({
        header: PlayerData.items[item].label,
        params: {
          event: 'crypto:docardinrig',
          args: cardname,
        },
      });
    }
  }

  exp['qb-menu'].openMenu([
    {
      header: 'Add a card',
      isMenuHeader: true,
    },
    ...MenuData,
    {
      header: '< Go Back',
      params: {
        event: 'crypto:cardmanager',
      },
    },
  ]);
});

on('crypto:yeetcardinrig', (cardname: string) => {
  const [dist, rig] = Utils.NearestRig(MY_RIGS);
  if (dist < 5) {
    const oldcard = rig.RemoveCardOfType(cardname);
    emitNet('crypto:cardremoved', rig.RIGID, oldcard.name);
  }
});

on('crypto:docardinrig', (cardname: string) => {
  const [dist, rig] = Utils.NearestRig(MY_RIGS);
  const card = new GraphicsCard(cardname);
  if (dist < 5) {
    if (rig.AddCard(card)) {
      emitNet('crypto:cardadded', rig.RIGID, card.name);
      QBCore.Functions.Notify(`Successfully added a ${QBCore.Shared.Items[cardname].label} to the rig`, 'success');
    } else {
      QBCore.Functions.Notify('This rig is full', 'error');
    }
  }
});
