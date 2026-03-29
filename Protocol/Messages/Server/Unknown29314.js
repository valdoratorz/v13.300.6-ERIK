const PiranhaMessage = require("../../PiranhaMessage")

class Unknown29314 extends PiranhaMessage {
  constructor(client) {
    super()
    this.id = 29314
    this.client = client
    this.version = 0
  }

  async encode() {
    this.writeHex(
      "01010000000004285634040103",
    )
  }
}

module.exports = Unknown29314