const PiranhaMessage = require("../../PiranhaMessage");
const LoginOkMessage = require("../Server/LoginOkMessage");
const SetPlayerNameMessageOkMessage = require("../Server/SetPlayerNameMessageOkMessage");

class SetPlayerNameMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 16334;
    this.version = 0;
  }

  async decode() {
    this.readByte();
    this.newName = this.readString();
  }

  async process() {
    await new SetPlayerNameMessageOkMessage(this.client, this.newName).send();
  }
}

module.exports = SetPlayerNameMessage;
