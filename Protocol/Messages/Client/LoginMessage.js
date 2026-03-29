const PiranhaMessage = require("../../PiranhaMessage");
const LoginFailedMessage = require("../Server/LoginFailedMessage");
const LoginOkMessage = require("../Server/LoginOkMessage");
const OwnHomeDataMessage = require("../Server/OwnHomeDataMessage");
let { generateToken } = require("../../../Utils/TokenGenerator");

class LoginMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 10101;
    this.version = 1;
  }

  async decode() {
    this.data = {};

    this.data.HighID = this.readInt();
    this.data.LowID = this.readInt();
    this.data.Token = this.readString();
    this.data.Major = this.readVInt();
    this.data.Build = this.readVInt();
    this.data.Content = this.readVInt();

    this.data.resourceSha = this.readString();

    console.log(this.data);
  }

  async process() {
    if (this.data.Content === 377) {
      this.client.flagged = true;
    }
    let playerId = { high: this.data.HighID, low: this.data.LowID };
    let databaseuser = global.database.findOneBy({ id: playerId });

    if (this.data.HighID === 0 && this.data.LowID === 0) {
      databaseuser = global.database.create({
        id: {
          high: 0,
          low: global.newUserId++,
        },
        token: generateToken(),
        username: "",
        deck: [
          26000026, 26000015, 26000012, 26000000, 26000004, 26000005, 26000006,
          26000007,
        ],
      });
    } else {
      if (!databaseuser || databaseuser.token !== this.data.Token) {
        setTimeout(() => {
          new LoginFailedMessage(this.client, {
            //reason: "New update avaliable, update at: dsc.gg/erikclash",
            reason: "Invalid credentials, please clear app data",
          }).send();
        }, 2000);
        return;
      }
    }

    this.client.user = databaseuser;
    console.log(this.client.user);

    if (this.data.resourceSha !== "6761ebec26bc721f818c74565f6af8784b269e67") {
      setTimeout(() => {
        new LoginFailedMessage(this.client, {
          //reason: "New update avaliable, update at: dsc.gg/erikclash",
          reason: "patch",
        }).send();
      }, 2000);
      return;
    }

    setTimeout(() => {
      new LoginOkMessage(this.client).send();
      new OwnHomeDataMessage(this.client).send();
    }, 2000);
  }
}

module.exports = LoginMessage;
