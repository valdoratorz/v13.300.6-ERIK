const PiranhaMessage = require("../../PiranhaMessage");

class BattleResultMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 26767;
    this.client = client;
    this.version = 0;
  }

  async encode() {
    this.writeVInt(0);
    this.writeVInt(0);
    this.writeInt(0);
    this.writeVInt(0);
    this.writeInt(0);
    this.writeVInt(0);
    this.writeVInt(0);
    this.writeVInt(0);
    this.writeVInt(0);
    this.writeInt(0);
    this.writeVInt(3);
    this.writeInt(0);
    this.writeVInt(0);
    this.writeVInt(2);
    this.writeVInt(0);
    this.writeVInt(0);
    this.writeInt(0);
    this.writeVInt(0);
    this.writeVInt(0);
    this.writeVInt(0);
  }
}

module.exports = BattleResultMessage;
