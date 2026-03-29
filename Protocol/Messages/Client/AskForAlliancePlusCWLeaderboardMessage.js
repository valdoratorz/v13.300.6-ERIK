const PiranhaMessage = require('../../PiranhaMessage')
const GlobalAllianceLeaderboardMessage = require('../Server/GlobalAllianceLeaderboardMessage')

class AskForAlliancePlusCWLeaderboardMessage extends PiranhaMessage {
  constructor (bytes, client) {
    super(bytes)
    this.client = client
    this.id = 14093
    this.version = 1
  }

  async decode () {}

  async process () {
    await new GlobalAllianceLeaderboardMessage(this.client).send()
  }
}

module.exports = AskForAlliancePlusCWLeaderboardMessage