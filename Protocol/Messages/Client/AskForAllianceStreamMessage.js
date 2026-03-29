const PiranhaMessage = require('../../PiranhaMessage')
const AllianceStreamMessage = require('../Server/AllianceStreamMessage')

class AskForAllianceStreamMessage extends PiranhaMessage {
  constructor (bytes, client) {
    super(bytes)
    this.client = client
    this.id = 18856
    this.version = 1
  }

  async decode () {}

  async process () {
    await new AllianceStreamMessage(this.client).send()
  }
}

module.exports = AskForAllianceStreamMessage