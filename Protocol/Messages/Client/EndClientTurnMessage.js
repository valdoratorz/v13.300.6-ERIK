const PiranhaMessage = require("../../PiranhaMessage");
const CommandManager = require("../../CommandManager");
const Commands = new CommandManager();

class EndClientTurnMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 16345;
    this.version = 1;
  }

  async decode() {
    this.data = {};

    this.data.Tick = this.readVInt();
    this.data.Checksum = this.readVInt();
    this.data.Count = this.readVInt();

    console.log(this.data);
    //     vint: 856
    // vint: 7929856
    // vint: 1
    // vint: 792

    // vint: 855
    // vint: 855
    // vint: 0
    // vint: 70112894
    // int: 26000031
    // vint: 1
    // vint: -1
    // vint: -1
    // vint: 170000000
    // int: -1
  }

  async process() {
    const commands = Commands.getCommands();

    if (this.data.Count == 0 && this.buffer.length > 32) {
      return;
    }

    if (this.data.Count == 0) return;

    for (let i = 0; i < this.data.Count; i++) {
      this.commandID = this.readVInt();

      if (commands.indexOf(String(this.commandID)) != -1) {
        const command = new (Commands.handle(this.commandID))(this.client);
        this.client.log(
          `Command ${this.commandID} (${command.constructor.name}) handled!`,
        );
        command.decode(this);
        await command.process();
      } else if (this.commandID > 499) {
        this.client.log(`Command ${this.commandID} isn't handled!`);
      }
    }
  }
}

module.exports = EndClientTurnMessage;
