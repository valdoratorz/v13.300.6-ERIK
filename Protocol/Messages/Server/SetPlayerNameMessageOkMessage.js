const PiranhaMessage = require("../../PiranhaMessage");

function isValidString(str) {
  if (typeof str !== "string") return false;

  // Allow:
  // Letters (A-Z, a-z)
  // Numbers (0-9)
  // Space
  // / , . - _ ( ) < >
  const regex = /^[A-Za-z0-9\/,\.\-_()<> ]+$/;

  return regex.test(str);
}

class SetPlayerNameMessageOkMessage extends PiranhaMessage {
  constructor(client, newName) {
    super();
    this.id = 27551;
    this.client = client;
    this.version = 0;
    this.newName = newName;
  }

  async encode() {
    let badwords = ["dsc.", "discord.", "dsc/"];
    for (let i = 0; i < badwords.length; i++) {
      const badWord = badwords[i];
      if (this.newName.includes(badWord)) {
        this.client.destroy();
      }
    }

    if (!isValidString(this.newName)) {
      this.client.destroy();
    }

    this.client.user.username = this.newName;
    this.writeString(this.newName);
    this.writeVInt(0); //nameset
  }
}

module.exports = SetPlayerNameMessageOkMessage;
