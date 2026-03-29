const PiranhaMessage = require('../../PiranhaMessage')
const TVRoyaleMessage = require('../Server/TVRoyaleMessage')

class AskForTVRoyaleMessage extends PiranhaMessage {
  constructor (bytes, client) {
    super(bytes)
    this.client = client
    this.id = 10444
    this.version = 1
  }

  async decode () {}

  async process () {
    await new TVRoyaleMessage(this.client).send()
  }
}

module.exports = AskForTVRoyaleMessage