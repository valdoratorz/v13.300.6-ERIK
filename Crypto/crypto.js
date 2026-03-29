const crypto = require("crypto");
const nacl = require("tweetnacl");

/* =========================
   🔁 Helper Functions
========================= */

function blake2b(data, outLen) {
  return crypto.createHash("blake2b512").update(data).digest().slice(0, outLen);
}

function incrementNonceLE(buf) {
  let n = BigInt("0x" + Buffer.from(buf).reverse().toString("hex"));
  n += 2n;
  return Buffer.from(
    n.toString(16).padStart(buf.length * 2, "0"),
    "hex",
  ).reverse();
}

/* =========================
   🔢 Nonce Class
========================= */

class Nonce {
  constructor(nonce = null, clientKey = null, serverKey = null) {
    if (!clientKey) {
      this._nonce = nonce ? Buffer.from(nonce) : crypto.randomBytes(24);
    } else {
      const parts = [];
      if (nonce) parts.push(Buffer.from(nonce));
      parts.push(Buffer.from(clientKey));
      parts.push(Buffer.from(serverKey));
      this._nonce = blake2b(Buffer.concat(parts), 24);
    }
  }

  toBuffer() {
    return this._nonce;
  }

  increment() {
    this._nonce = incrementNonceLE(this._nonce);
  }
}

/* =========================
   🔐 Crypto Class (SERVER)
========================= */

class CryptographyError extends Error {}

class Crypto {
  constructor() {
    this.authenticated = false;

    // 🔴 CHANGE THESE (SERVER KEYS MUST BE CONSTANT)
    this.server_private_key = Buffer.from(
      "5af8377510e591a2d42549c48cc98747af84d72aa59d012d1405a6286b5acc50",
      "hex",
    );
    this.server_public_key = Buffer.from(
      "9731d4399b117f5bb10050f09ab25cf5df26c38e8a597b89aba105c94a075743",
      "hex",
    );

    // 🟢 Set during handshake
    this.client_public_key = null;
    this.shared_key = null;

    this.decryptNonce = null;
    this.encryptNonce = new Nonce();
    this.session_key = null;
  }

  decrypt(packetId, payload) {
    payload = Buffer.from(payload);

    // 🟢 Unencrypted packets
    if (packetId === 10100) return payload;

    if (packetId === 10101) {
      // 1️⃣ read client public key (plain)
      this.client_public_key = payload.slice(0, 32);

      const encrypted = payload.slice(32);

      // 2️⃣ derive shared key
      this.shared_key = Buffer.from(
        nacl.box.before(this.client_public_key, this.server_private_key),
      );

      // 3️⃣ derive LOGIN NONCE (DO NOT CHANGE THIS)
      const loginNonce = new Nonce(
        null,
        this.client_public_key,
        this.server_public_key,
      );

      console.log("SHARED", this.shared_key.toString("hex"));
      console.log("LOGIN NONCE", loginNonce.toBuffer().toString("hex"));

      // 4️⃣ decrypt login payload
      const opened = nacl.secretbox.open(
        encrypted,
        loginNonce.toBuffer(),
        this.shared_key,
      );

      if (!opened) {
        throw new Error("Login decryption failed (nonce/key mismatch)");
      }

      const decrypted = Buffer.from(opened);

      // 5️⃣ extract session values
      this.decryptNonce = new Nonce(decrypted.slice(0, 24));
      this.encryptNonce = new Nonce(decrypted.slice(24, 48));

      this.authenticated = true;

      return decrypted.slice(48);
    }

    // 🟢 Still not encrypted yet
    if (!this.decryptNonce) return payload;

    if (!this.authenticated) {
      throw new CryptographyError("Not authenticated");
    }

    this.decryptNonce.increment();

    return Buffer.from(
      nacl.secretbox.open(
        payload,
        this.decryptNonce.toBuffer(),
        this.shared_key,
      ),
    );
  }

  encrypt(packetId, payload) {
    payload = Buffer.from(payload);

    // 🟢 No encryption yet
    if (!this.authenticated) return payload;

    this.encryptNonce.increment();

    return Buffer.from(
      nacl.secretbox(payload, this.encryptNonce.toBuffer(), this.shared_key),
    );
  }

  getEncryptionOverhead() {
    return 16;
  }
}

module.exports = {
  Crypto,
  Nonce,
  CryptographyError,
};
