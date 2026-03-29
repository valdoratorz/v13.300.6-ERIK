//const BattleEventMessage = require("../Protocol/Messages/Server/BattleEventMessage.js");
const BattleResultMessage = require("../Protocol/Messages/Server/BattleResultMessage.js");
const SectorHearbeatMessage = require("../Protocol/Messages/Server/SectorHearbeatMessage.js");
const SectorStateMessage = require("../Protocol/Messages/Server/SectorStateMessage2.js");
const TrainingSectorStateMessage = require("../Protocol/Messages/Server/TrainingSectorStateMessage.js");
const Unknown21159 = require("../Protocol/Messages/Server/Unknown21159.js");

class Battle {
  constructor(clients) {
    this.hearBeatId = 1;
    this.commands = [];
    this.battleLastCommandTime = Date.now();
    this.crowns = [];
    this.clients = clients;
    for (let i = 0; i < this.clients.length; i++) {
      let el = this.clients[i];
      el.battle = this;
      this.crowns.push(0);
    }
  }

  start() {
    if (this.clients.length >= 2) {
      new Unknown21159(this.clients[0]).send();
      new SectorStateMessage(
        this.clients[0],
        this.clients[0],
        this.clients[1],
      ).send();
      new Unknown21159(this.clients[1]).send();
      new SectorStateMessage(
        this.clients[1],
        this.clients[0],
        this.clients[1],
      ).send();
    } else {
      new Unknown21159(this.clients[0]).send();
      new TrainingSectorStateMessage(this.clients[0]).send();
    }
    this.hearBeat = setInterval(() => {
      this.sendHearBeat();
    }, 500);
  }

  sendHearBeat() {
    console.log(Date.now() - this.battleLastCommandTime);
    if (
      Date.now() - this.battleLastCommandTime > 4000 &&
      this.hearBeatId >= 10 * 2
    ) {
      this.finish();
      return;
    }
    new SectorHearbeatMessage(
      this.clients[0],
      this.hearBeatId,
      this.commands,
      false,
    ).send();
    if (this.clients.length >= 2) {
      new SectorHearbeatMessage(
        this.clients[1],
        this.hearBeatId,
        this.commands,
        true,
      ).send();
    }
    this.commands = [];
    this.hearBeatId += 1;
  }

  setCrowns(client, crowns) {
    this.crowns[this.clients.indexOf(client)] = crowns;
  }

  sendResult() {
    const player1Crowns = this.crowns[0];
    const player2Crowns = this.crowns[1];
    let player1trophies = 0;
    let player2trophies = 0;
    if (player1Crowns > player2Crowns) {
      player1trophies = 30;
    } else {
      player1trophies = -30;
    }
    player2trophies = -player1trophies;

    new BattleResultMessage(
      this.clients[0],
      player1Crowns,
      player2Crowns,
      player1trophies,
    ).send();
    if (this.clients.length >= 2) {
      new BattleResultMessage(
        this.clients[1],
        player2Crowns,
        player1Crowns,
        player2trophies,
      ).send();
    }

    // this.clients[0].user.stats.trophies += player1trophies;
    // this.clients[1].user.stats.trophies += player2trophies;
    // if (this.clients[0].user.stats.trophies < 0)
    //   this.clients[0].user.stats.trophies = 0;
    // if (this.clients[1].user.stats.trophies < 0)
    //   this.clients[1].user.stats.trophies = 0;
    // global.database.update(
    //   this.clients[0].user._systemid,
    //   this.clients[0].user,
    // );
    // global.database.update(
    //   this.clients[1].user._systemid,
    //   this.clients[1].user,
    // );
  }

  /*sendEvent(event, from) {
    let to = this.clients.indexOf(from) === 0 ? 1 : 0;
    new BattleEventMessage(this.clients[to], event).send();
  }*/

  finish() {
    for (let i = 0; i < this.clients.length; i++) {
      let el = this.clients[i];
      el.battle = null;
    }
    this.sendResult();
    clearInterval(this.hearBeat);
  }
}

module.exports = Battle;
