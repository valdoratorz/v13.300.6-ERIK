const PiranhaMessage = require("../../PiranhaMessage");
const WatchReplayMessage = require("../Server/WatchReplayMessage");

class AskForReplayMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 18210;
    this.version = 0;
  }

  async decode() {
    // this.readInt()
  }

  async process() {
    //await new LoginFailedMessage(this.client).send();
    await new WatchReplayMessage(this.client).send();
  }
}

module.exports = AskForReplayMessage;
