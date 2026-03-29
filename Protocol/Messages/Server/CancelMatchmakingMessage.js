const PiranhaMessage = require("../../PiranhaMessage");

class CancelMatchmakingMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 29690;
    this.client = client;
    this.version = 1;
  }

  async encode() {}
  async process() {
    if (global.userInBattleSeach == client) {
      global.userInBattleSeach = null;
    }
  }
}

module.exports = CancelMatchmakingMessage;
