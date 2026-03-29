const PiranhaMessage = require("../../PiranhaMessage")

class CreateAllianceMessage extends PiranhaMessage {
  constructor(client) {
    super()
    this.id = 12696
    this.client = client
    this.version = 0
  }

  decode() {
    this.clanName = this.readString();
    console.log(this.clanName);
  }
}

module.exports = CreateAllianceMessage