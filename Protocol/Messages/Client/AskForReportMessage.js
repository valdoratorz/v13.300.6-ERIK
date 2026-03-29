const PiranhaMessage = require('../../PiranhaMessage')

class AskForReportMessage extends PiranhaMessage {
  constructor (bytes, client) {
    super(bytes)
    this.client = client
    this.id = 16555
    this.version = 1
  }

  async decode () {}

  async process () {}
}

module.exports = AskForReportMessage