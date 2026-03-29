const Battle = require("../../../Utils/Battle");

class StartBattle {
  constructor(client) {
    this.client = client;
    this.commandID = 997;
  }

  decode(buf) {}
  process() {
    if (this.client.flagged) {
      return;
    }
    let myIP = this.client.remoteAddress.replace(/^::ffff:/, "");

    for (let connectedPlayer of global.connectedPlayers) {
      if (connectedPlayer.battle) {
        if (
          connectedPlayer.remoteAddress.replace(/^::ffff:/, "") === myIP &&
          connectedPlayer !== this.client
        ) {
          this.client.destroy();
          //connectedPlayer.destroy();
          return;
        }
      }
    }

    if (
      this.client.user.username === null ||
      this.client.user.username.replace(/ /g, "") === ""
    ) {
      this.client.destroy();
    }

    if (global.userInBattleSeach === null) {
      global.userInBattleSeach = this.client;
    } else if (global.userInBattleSeach !== this.client) {
      //await new TrainSectorStateMessage(this.client).send();
      let b = new Battle([global.userInBattleSeach, this.client]);
      b.start();
      global.userInBattleSeach = null;
    }
  }
}

module.exports = StartBattle;
