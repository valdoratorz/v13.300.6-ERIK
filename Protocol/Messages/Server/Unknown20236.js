const PiranhaMessage = require('../../PiranhaMessage')

class Unknown20236 extends PiranhaMessage {
  constructor (client) {
    super()
    this.id = 20236
    this.client = client
    this.version = 1
  }

  async encode () {
    this.writeHex('00a0a5d1970d00')
  }
}

module.exports = Unknown20236