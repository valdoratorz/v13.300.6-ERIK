const PiranhaMessage = require("../../PiranhaMessage");

class LoginFailedMessage extends PiranhaMessage {
  constructor(client, jsonParams) {
    super();
    this.id = 20103;
    this.client = client;
    this.version = 4;
    this.jsonParams = jsonParams;
  }

  async encode() {
    // 8 = Update Available
    // 9 = Connection Error
    // 10 = Maintenance
    // 11 = Banned

    //https://link-target.net/927764/POMeEPEp8tYD
    let updateURL = "https://eriksroyale.netlify.app";
    if (this.jsonParams?.reason === "update") {
      this.writeHex("08");
      this.writeString("{}");
      this.writeString("");
      this.writeString(updateURL);
      this.writeString(""); //update url
      this.writeString("");
      this.writeHex("0000FFFFFFFF00FFFFFFFF00");
      return;
    }

    if (this.jsonParams?.reason && this.jsonParams.reason !== "patch") {
      this.writeHex("03FFFFFFFFFFFFFFFFFFFFFFFF");
      this.writeString(this.jsonParams.reason);
      this.writeHex("0000FFFFFFFF00FFFFFFFF00");
    } else {
      this.writeVInt(7);
      this.writeString(null);
      this.writeString(null);
      this.writeString(null);
      this.writeString(null);
      this.writeVInt(0);
      this.writeString(null);
      this.writeVInt(2);
      this.writeString("https://yellowwarmsand.com/patch-cr");
      this.writeString("http://45.95.201.23/patch-cr");
      this.writeString(null);
    }
  }
}

module.exports = LoginFailedMessage;
