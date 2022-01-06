import { Rig } from './rig.class';

export class _RigLogger {
  loggerActive: boolean;

  constructor() {
    this.loggerActive = GetConvarInt('mojito_debug', 0) == 1;
  }

  newRig(rig: Rig) {
    if (!this.loggerActive) return;

    console.log(`^4 New ${rig.Type} mining rig placed by ${rig.Owner} [${this.getTime()}]^0`);
  }

  cryptoEarned(rig: Rig, amount: number) {
    if (!this.loggerActive) return;

    console.log(`^4 Gave ${amount} qbits to ${rig.Owner} [${this.getTime()}]^0`);
  }

  loadedRigs(player_rigs: Rig[], player: citizenid) {
    if (!this.loggerActive) return;

    console.log(`^4 Loaded crypto rigs for ${player}: [${this.getTime()}]^0`);
    console.log(player_rigs);
  }

  unloadedPlayer(player: citizenid) {
    if (!this.loggerActive) return;

    console.log(`^4 Unloaded player ${player} [${this.getTime()}]`);
  }

  private getTime(): string {
    return new Date().toLocaleString();
  }
}

export const RigLogger = new _RigLogger();
