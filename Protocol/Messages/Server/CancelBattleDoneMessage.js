const PiranhaMessage = require("../../PiranhaMessage");

class KeepAliveOkMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 29690;
    this.client = client;
    this.version = 0;
  }

  async encode() {}
}

module.exports = KeepAliveOkMessage;
