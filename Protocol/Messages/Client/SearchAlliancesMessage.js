const PiranhaMessage = require("../../PiranhaMessage");
const LoginFailedMessage = require("../Server/LoginFailedMessage");
const SearchAllianceMessage = require("../Server/SearchAllianceMessage");
//const Cards = require("../../../Utils/json/cards.json");

const RarityMaxLevel = {
  common: 15, // 16
  rare: 15, // 16
  epic: 15, // 16
  legendary: 15, // 16
};

function GetCardDataByID(id) {
  const realID = 26000000 + (id - 1);
  return Cards.find((c) => c.id === realID);
}

function GetMaxLevel(id) {
  const data = GetCardDataByID(id);
  if (!data) {
    return 15;
  }
  return RarityMaxLevel[data.rarity.toLowerCase()] ?? 15;
}

//const AllCardIDS = Cards.map((c) => c.id);

class SearchAlliancesMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 10949;
    this.version = 1;
  }

  async decode() {
    this.message = this.readString();
  }

  async process() {
    await new LoginFailedMessage(this.client, {
      reason: "cards maxxed",
    }).send();
    //await new SearchAllianceMessage(this.client).send();
  }
}

module.exports = SearchAlliancesMessage;
