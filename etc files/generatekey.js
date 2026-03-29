const nacl = require("tweetnacl");

const keys = nacl.box.keyPair();

// real NaCl public key (32 bytes)
const publicKey = Buffer.from(keys.publicKey, "hex");
const privateKey = Buffer.from(keys.secretKey, "hex");

console.log("Public key:", publicKey.toString("hex"));
console.log("Secret key:", privateKey.toString("hex"));
