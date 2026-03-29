const PiranhaMessage = require("../../PiranhaMessage");

class SectorCommandMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 18683;
    this.version = 0;
  }

  async decode() {
    this.json = {};
    this.readVInt(); // vint: 571330933
    this.json.unk1 = this.readVInt(); //vint: 548
    this.readVInt();
    this.json.unk2 = this.readVInt(); //vint: 124;
    this.json.tick = this.readVInt(); //vint: 548;
    this.json.unk4 = this.readVInt(); //vint: -1;
    this.readVInt(); //vint: 0;
    this.readVInt(); // vint: 69916417;
    this.readVInt(); //vint: -1;
    this.readVInt(); //vint: 3;
    this.json.x = this.readVInt(); //vint: 26499;
    this.json.y = this.readVInt(); //vint: 7499;
    this.json.cardSCID = this.readInt(); //int: 26000004;
    this.json.unk5 = this.readInt(); //int: 0;
    this.json.checksum = this.readInt(); //int: 1900024832;
    console.log(this.json);
    console.log(this.json.cardSCID.toString().slice(0, 4));

    this.json.userHighId = this.client.user.id.high;
    this.json.userLowId = this.client.user.id.low;

    // if (
    //   this.json.checksum < 100000000 &&
    //   this.client.battle.clients.length > 1
    // ) {
    //   this.client.destroy();
    //   return;
    // }
    if (
      ["2600", "2700", "2800", "5000"].includes(
        this.json.cardSCID.toString().slice(0, 4),
      )
    ) {
      this.client.battle.commands.push(this.json);
    }

    this.client.battle.battleLastCommandTime = Date.now();
  }

  async process() {
    //await new TrainingSectorStateMessage(this.client).send();
  }
}

module.exports = SectorCommandMessage;
