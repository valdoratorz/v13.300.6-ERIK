const net = require("net");
const MessageFactory = require("./Protocol/MessageFactory");
const figlet = require("figlet");
const fs = require("fs");
const path = require("path");
const Packetizer = require("./packetizer");
const Database = require("./database");

const server = new net.Server();
const Messages = new MessageFactory();
const PORT = 9330;

global.userInBattleSeach = null;

/**
 * 🌍 GLOBAL CONNECTED PLAYERS LIST
 * Always represents currently active sockets
 */
global.connectedPlayers = [];

// ======================================
// 🔐 ANTI-DDOS CONFIG
// ======================================
const ipConnections = new Map();
const bannedIPs = new Map();

const MAX_CONNECTIONS_PER_IP = 3;
const MAX_PACKETS_PER_SECOND = 15;
const MAX_PACKET_SIZE = 10 * 1024; // 10KB
const LOGIN_TIMEOUT = 15000; // 15 seconds
const BAN_TIME = 30 * 60 * 1000; // 30 minutes

const LOGIN_PACKET_ID = 10101;
// ======================================

global.rootPath = __dirname;

global.database = new Database("database.json");

for (const plr of global.database.getAll()) {
  console.log(plr);
  if (Date.now() - plr.lastLogin > 10 * 24 * 60 * 60 * 1000) {
    global.database.delete(plr._systemid);
  }
}

global.newUserId = 1;

if (fs.existsSync(path.join(global.rootPath, "newUserId.txt"))) {
  global.newUserId = parseInt(
    fs.readFileSync(path.join(global.rootPath, "newUserId.txt"), "utf-8"),
  );
}

function banIP(ip, reason) {
  console.log(`[${ip}] >> BANNED (${reason})`);
  bannedIPs.set(ip, Date.now() + BAN_TIME);
}

function isBanned(ip) {
  if (!bannedIPs.has(ip)) return false;

  if (Date.now() > bannedIPs.get(ip)) {
    bannedIPs.delete(ip);
    return false;
  }

  return true;
}

server.on("connection", (client) => {
  client.setNoDelay(true);

  const ip = client.remoteAddress.replace(/^::ffff:/, "");

  // 🔥 Reject banned IP
  if (isBanned(ip)) {
    client.destroy();
    return;
  }

  // 🔥 Max connections per IP
  const currentConnections = ipConnections.get(ip) || 0;
  if (currentConnections >= MAX_CONNECTIONS_PER_IP) {
    banIP(ip, "Too many connections");
    client.destroy();
    return;
  }

  ipConnections.set(ip, currentConnections + 1);

  // =============================
  // CLIENT STATE
  // =============================
  client.isAuthenticated = false;
  client.packetCount = 0;
  client.lastPacketReset = Date.now();

  // Add to global list safely
  global.connectedPlayers.push(client);

  client.log = (text) => {
    console.log(`[${ip}] >> ${text}`);
  };

  client.log("Connection accepted");

  // 🔥 Login timeout protection
  const loginTimeout = setTimeout(() => {
    if (!client.isAuthenticated) {
      client.log("Login timeout");
      client.destroy();
    }
  }, LOGIN_TIMEOUT);

  const packets = Messages.getPackets();

  client.on("data", async (data) => {
    // 🔥 Max packet size protection

    // 🔥 Rate limit per second
    if (Date.now() - client.lastPacketReset > 1000) {
      client.packetCount = 0;
      client.lastPacketReset = Date.now();
    }

    client.packetCount++;

    if (client.packetCount > MAX_PACKETS_PER_SECOND) {
      banIP(ip, "Packet spam");
      client.destroy();
      return;
    }

    let packetizer = new Packetizer();

    //packetizedData = data;

    packetizer.packetize(data, async (packetizedData) => {
      let message = {
        id: packetizedData.readUInt16BE(0),
        len: packetizedData.readUIntBE(2, 3),
        version: packetizedData.readUInt16BE(5),
        payload: packetizedData.slice(7),
        client,
      };

      // 🔐 Block packets before login
      if (
        !client.isAuthenticated &&
        message.id !== LOGIN_PACKET_ID &&
        message.id !== 10100 &&
        message.id !== 11111 &&
        message.id !== 14173 &&
        message.id !== 10108
      ) {
        client.log(`Blocked packet ${message.id}`);
        client.destroy();
        return;
      }

      if (packets.includes(String(message.id))) {
        try {
          const packet = new (Messages.handle(message.id))(
            message.payload,
            client,
          );

          client.log(`packet ${message.id} is handled`);

          await packet.decode();
          await packet.process();

          if (message.id === LOGIN_PACKET_ID) {
            client.isAuthenticated = true;
            clearTimeout(loginTimeout);
            client.log("Authenticated");
          }
        } catch (e) {
          console.error(e);
          client.destroy();
        }
      } else {
        client.log(`Unknown packet ${message.id}`);
      }
    });
  });

  function cleanupClient() {
    // Remove from global.connectedPlayers safely
    const index = global.connectedPlayers.indexOf(client);
    if (index !== -1) {
      global.connectedPlayers.splice(index, 1);
    }

    if (global.userInBattleSeach === client) {
      global.userInBattleSeach = null;
    }

    const count = ipConnections.get(ip) || 1;
    if (count <= 1) {
      ipConnections.delete(ip);
    } else {
      ipConnections.set(ip, count - 1);
    }

    clearTimeout(loginTimeout);
  }

  client.on("close", cleanupClient);
  client.on("end", cleanupClient);

  client.on("error", (error) => {
    console.error(error);
    cleanupClient();
    client.destroy();
  });
});

server.once("listening", async () => {
  console.log(await figlet.text("Eriks Royale v13"));
  console.log(`[SERVER] >> Server started on ${PORT} port!`);
});

server.listen(PORT);

process.on("uncaughtException", console.error);
process.on("unhandledRejection", console.error);

console.log((26000000).toString(16));
console.log((27000000).toString(16));
console.log((28000000).toString(16));
