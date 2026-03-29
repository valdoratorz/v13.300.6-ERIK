const PiranhaMessage = require("../../PiranhaMessage");
const AllianceListMessage = require("../Server/AllianceListMessage");

class ChatToAllianceStreamMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 13900;
    this.version = 0;
  }

  async decode() {
    this.message = this.readString();
  }

  async process() {
    console.log(this.message);
  }
}

module.exports = ChatToAllianceStreamMessage;
