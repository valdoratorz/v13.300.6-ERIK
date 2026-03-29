const PiranhaMessage = require("../../PiranhaMessage");
const LoginFailedMessage = require("../Server/LoginFailedMessage");

class AskStopSupportingCreatorMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 10188;
    this.version = 0;
  }

  async decode() {
    // this.readInt()
  }

  async process() {
    new LoginFailedMessage(this.client, {
      reason: "you you don't support us, just uninstall ts",
    }).send();
  }
}

module.exports = AskStopSupportingCreatorMessage;
