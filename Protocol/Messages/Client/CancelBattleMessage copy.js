const PiranhaMessage = require("../../PiranhaMessage");
const CancelBattleDoneMessage = require("../Server/CancelBattleDoneMessage");

class CancelBattleMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 19566;
    this.version = 1;
  }

  async decode() {}

  async process() {
    await new CancelBattleDoneMessage(this.client).send();
  }
}

module.exports = CancelBattleMessage;
