const PiranhaMessage = require("../../PiranhaMessage");
const AllianceListMessage = require("../Server/AllianceListMessage");
const LoginFailedMessage = require("../Server/LoginFailedMessage");

class SearchClansMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.id = 19564;
    this.client = client;
    this.version = 1;
  }

  decode() {
    if (
      this.readAll().slice(0, 30).toString() ===
      Buffer.from(
        "010000000000000032000000ffffffff000000042f6d6178000100010001",
        "hex",
      ).toString()
    ) {
      this.message = "/max";
    }
  }

  async process() {
    console.log(this.message);
    if (this.message === "/max") {
      new LoginFailedMessage(this.client, {
        reason: "maxxed all cards",
      }).send();
    }
    //new AllianceListMessage(this.client).send();
  }
}

module.exports = SearchClansMessage;
