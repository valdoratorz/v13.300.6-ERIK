const PiranhaMessage = require("../../PiranhaMessage");

class Unknown17357 extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 17357;
    this.version = 1;
  }

  async decode() {}

  async process() {}
}

module.exports = Unknown17357;
