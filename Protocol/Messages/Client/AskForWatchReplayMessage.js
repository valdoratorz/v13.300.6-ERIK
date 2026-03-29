const PiranhaMessage = require('../../PiranhaMessage')
const WatchReplayMessage = require('../Server/WatchReplayMessage')

class AskForWatchReplayMessage extends PiranhaMessage {
  constructor (bytes, client) {
    super(bytes)
    this.client = client
    this.id = 18210
    this.version = 1
  }

  async decode () {}

  async process () {
    await new WatchReplayMessage(this.client).send()
  }
}

module.exports = AskForWatchReplayMessage