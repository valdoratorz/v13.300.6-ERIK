const Battle = require("../../../Utils/Battle");
const TrainingSectorStateMessage = require("../../Messages/Server/TrainingSectorStateMessage");

class SwapSpells {
  constructor(client) {
    this.client = client;
    this.commandID = 792;
  }

  decode(buf) {
    buf.readVInt();
    buf.readVInt();
    buf.readVInt();
    buf.readVInt();
    this.card = buf.readInt();
    this.positionIndex = buf.readVInt();
  }
  process() {
    if (this.positionIndex <= 7 && this.card != 0) {
      if (this.card.toString().length === 8) {
        if (
          this.card.toString().startsWith("2600") ||
          this.card.toString().startsWith("2700") ||
          this.card.toString().startsWith("2800")
        ) {
          console.log("old");
          console.log(this.client.user.deck);
          this.client.user.deck[this.positionIndex] = this.card;
          console.log("new");
          console.log(this.client.user.deck);
          global.database.update(this.client.user._systemid, this.client.user);
        }
      }
    }
  }
}

module.exports = SwapSpells;
