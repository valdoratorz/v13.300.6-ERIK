const PiranhaMessage = require('../../PiranhaMessage')

class Unknown20137 extends PiranhaMessage {
  constructor (client) {
    super()
    this.id = 20137
    this.client = client
    this.version = 1
  }

  async encode () {
    this.writeHex('0100')
  }
}

module.exports = Unknown20137