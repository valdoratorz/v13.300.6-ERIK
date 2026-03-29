const PiranhaMessage = require('../../PiranhaMessage')

class Unknown21043 extends PiranhaMessage {
  constructor (client) {
    super()
    this.id = 21043
    this.client = client
    this.version = 1
  }

  async encode () {
    this.writeHex('000000')
  }
}

module.exports = Unknown21043