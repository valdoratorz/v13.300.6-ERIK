const PiranhaMessage = require('../../PiranhaMessage')
const BattleLogMessage = require('../Server/BattleLogMessage')

class AskForBattleLogMessage extends PiranhaMessage {
  constructor (bytes, client) {
    super(bytes)
    this.client = client
    this.id = 17783
    this.version = 1
  }

  async decode () {}

  async process () {
    await new BattleLogMessage(this.client).send()
  }
}

module.exports = AskForBattleLogMessage