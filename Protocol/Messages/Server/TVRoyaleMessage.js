const PiranhaMessage = require("../../PiranhaMessage")

class TVRoyaleMessage extends PiranhaMessage {
  constructor(client) {
    super()
    this.id = 0 // idk the id cuz nulls doesnt have tv royale working :(
    this.client = client
    this.version = 0
  }

  async encode() {
    this.writeHex(
      "",
    )
  }
}

module.exports = TVRoyaleMessage