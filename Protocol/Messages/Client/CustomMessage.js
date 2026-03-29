const PiranhaMessage = require("../../PiranhaMessage");

class CustomMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 11111;
    this.version = 0;
  }

  async decode() {
    this.stringMessage = this.readString();
    console.log(this.stringMessage);
  }

  async process() {
    if (this.stringMessage === "updateID-1") {
      this.client.isUpdated = true;
    }
  }
}

module.exports = CustomMessage;
