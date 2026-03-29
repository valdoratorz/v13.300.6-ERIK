const PiranhaMessage = require("../../PiranhaMessage");

class SectorHearbeatMessage extends PiranhaMessage {
  constructor(client, hearBeatId, commands) {
    super();
    this.id = 21473;
    this.client = client;
    this.version = 0;
    this.hearBeatId = hearBeatId;
    this.commands = commands;
  }

  async encode() {
    //this.writeByte(this.jsonParams.tick);
    //console.log(this.jsonParams.tick);

    this.writeVInt(this.hearBeatId); // readVInt
    this.writeVInt(0); // readVInt

    this.writeVInt(this.commands.length); //cmd count
    for (let cmd of this.commands) {
      this.writeVInt(cmd.unk2);
      this.writeVInt(cmd.tick); //tick * 10
      this.writeVInt(-1);
      this.writeVInt(cmd.userHighId);
      this.writeVInt(cmd.userLowId); //usr id
      this.writeVInt(-1);
      this.writeVInt(1);
      this.writeVInt(cmd.x); //x
      this.writeVInt(cmd.y); //y
      this.writeInt(cmd.cardSCID);
      this.writeInt(0);
      this.writeInt(cmd.checksum);
    }

    /*this.writeVInt(this.events.length);

    for (let event of this.events) {
      switch (event.type) {
        case 1:
          this.writeVInt(event.type);
          this.writeVInt(event.tick);
          this.writeVInt(event.tick);

          this.writeVInt(event.userId.high);
          this.writeVInt(event.userId.low);

          this.writeVInt(event.deckIndex);
          this.writeVInt(event.card.high);
          this.writeVInt(event.card.low);
          this.writeByte(0);
          this.writeByte(1);
          this.writeByte(event.card.id); // CARD ID
          this.writeByte(event.card.level);
          this.writeVInt(event.coords.x);
          this.writeVInt(event.coords.y);
      }
    }

    /*this.writeHex(
      "8c01d7c1aac10301bc01b30b7f0093d3cc427f0293c002bb55018cba800000000030400000",
      //"01baf8a3fd0100",
      //"00",
    );*/
  }
}

module.exports = SectorHearbeatMessage;
