const PiranhaMessage = require("../../PiranhaMessage");
const ChestContentMessage = require("../Server/ChestContentMessage");

class BuyShopChestMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 19779;
    this.version = 1;
  }

  async decode() {}

  async process() {
    //await new ChestContentMessage(this.client).send();
  }
}

module.exports = BuyShopChestMessage;
