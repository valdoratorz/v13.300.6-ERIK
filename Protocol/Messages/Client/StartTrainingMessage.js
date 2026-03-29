const Battle = require("../../../Utils/Battle");
const PiranhaMessage = require("../../PiranhaMessage");
const TrainingSectorStateMessage = require("../Server/TrainingSectorStateMessage");

class StartTrainingMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 17400;
    this.version = 1;
  }

  async decode() {}

  async process() {
    this.client.clientBattleTick = 0;
    setTimeout(() => {
      let b = new Battle([this.client]);
      b.start();
    }, 1000);
  }
}

module.exports = StartTrainingMessage;
