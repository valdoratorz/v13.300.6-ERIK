const PiranhaMessage = require("../../PiranhaMessage");
const CancelMatchmakingMessage = require("../Server/CancelMatchmakingMessage");

class AskForCancelMatchmakingMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 19566;
    this.version = 1;
  }

  async decode() {}

  async process() {
    //await new Promise(resolve => setTimeout(resolve, 1000))

    await new CancelMatchmakingMessage(this.client).send();
  }
}

module.exports = AskForCancelMatchmakingMessage;
