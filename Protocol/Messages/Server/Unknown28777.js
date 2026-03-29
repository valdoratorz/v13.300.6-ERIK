const PiranhaMessage = require('../../PiranhaMessage')

class Unknown28777 extends PiranhaMessage {
  constructor (client) {
    super()
    this.id = 28777
    this.client = client
    this.version = 1
  }

  async encode () {
    this.writeHex('000100')
  }
}

module.exports = Unknown28777