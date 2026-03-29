const PiranhaMessage = require("../../PiranhaMessage");

class AllianceListMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 23288;
    this.client = client;
    this.version = 0;
  }

  async encode() {
    let clans = [
      {
        id: {
          high: 0,
          low: 14033883,
        },
        name: "/max",
        memberCount: 6,
      },
      {
        id: {
          high: 0,
          low: 14033884,
        },
        name: "/unlock",
        memberCount: 7,
      },
      {
        id: {
          high: 0,
          low: 14033885,
        },
        name: "Heard",
        memberCount: 7,
      },
      {
        id: {
          high: 0,
          low: 14033886,
        },
        name: "You've been",
        memberCount: 7,
      },
      {
        id: {
          high: 0,
          low: 14033887,
        },
        name: "Chatting with",
        memberCount: 7,
      },
      {
        id: {
          high: 0,
          low: 14033888,
        },
        name: "Vile",
        memberCount: 7,
      },
    ];
    this.writeByte(1);
    this.writeByte(clans.length); //clan count
    this.writeByte(1);
    for (let clan of clans) {
      this.writeLong(clan.id.high, clan.id.low);
      this.writeString(clan.name);
      this.writeHex("00f4243d01");
      this.writeByte(clan.memberCount);
      this.writeHex("b766");
      this.writeHex("00");
      this.writeHex("00");
      this.writeHex("00");
      this.writeHex("00");
      this.writeHex("00");
      this.writeHex("00");
      this.writeHex("00");
      this.writeHex("00");
      this.writeHex("000000");
      this.writeInt(57000007);

      this.writeHex("00");
      this.writeHex("00");
      this.writeHex("00");
      this.writeHex("00");
      this.writeHex("00");
      this.writeHex("00000001");
    }
    this.writeByte(0x00);
  }
}

module.exports = AllianceListMessage;
