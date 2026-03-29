const PiranhaMessage = require("../../PiranhaMessage");
const AllianceListMessage = require("../Server/AllianceListMessage");

class AskForAllianceListMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 11618;
    this.version = 0;
  }

  async decode() {}

  async process() {
    new AllianceListMessage(this.client).send();
  }
}

module.exports = AskForAllianceListMessage;
