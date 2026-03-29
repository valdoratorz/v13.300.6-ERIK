const PiranhaMessage = require("../../PiranhaMessage");

class Unknown21159 extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 21159;
    this.client = client;
    this.version = 0;
  }

  async encode() {
    this.writeHex(
      "0000002b5339366f4b4f57496f4977554b38627867547a6941594c5a7a6771743653706c73656f52424e4a6f625849b591010000000d3134312e39342e37352e3234310000000ab307a589251b58770000",
    );
  }
}

module.exports = Unknown21159;
