const PiranhaMessage = require('../../PiranhaMessage')
const OwnHomeDataMessage = require('../Server/OwnHomeDataMessage')

class GoHomeMessage extends PiranhaMessage {
  constructor (bytes, client) {
    super(bytes)
    this.client = client
    this.id = 14575
    this.version = 1
  }

  async decode () {}

  async process () {
    await new OwnHomeDataMessage(this.client).send()
  }
}

module.exports = GoHomeMessage