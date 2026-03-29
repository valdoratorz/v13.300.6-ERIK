const PiranhaMessage = require("../../PiranhaMessage");

class SendBattleEventMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 11216;
    this.version = 1;
  }

  async decode() {
    for (let i = 0; i < 20; i++) {
      console.log(this.readVInt());
    }
  }

  async process() {}
}

module.exports = SendBattleEventMessage;
