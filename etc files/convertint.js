"use strict";

/**
 * Encode a signed 32-bit integer into VarInt bytes
 * @param {number} value
 * @returns {Buffer}
 */
function encodeVarInt(value) {
  const bytes = [];

  value |= 0;

  let temp = (value >> 25) & 0x40;
  let flipped = value ^ (value >> 31);

  temp |= value & 0x3f;

  value >>= 6;
  flipped >>= 6;

  if (flipped === 0) {
    bytes.push(temp);
    return Buffer.from(bytes);
  }

  bytes.push(temp | 0x80);

  flipped >>= 7;
  let r = flipped ? 0x80 : 0x00;

  bytes.push((value & 0x7f) | r);
  value >>= 7;

  while (flipped !== 0) {
    flipped >>= 7;
    r = flipped ? 0x80 : 0x00;
    bytes.push((value & 0x7f) | r);
    value >>= 7;
  }

  return Buffer.from(bytes);
}

/**
 * Decode VarInt bytes into a signed 32-bit integer
 * @param {Buffer} buffer
 * @param {number} [offset=0]
 * @returns {{ value: number, bytesRead: number }}
 */
function decodeVarInt(buffer, offset = 0) {
  let result = 0;
  let shift = 0;
  let byte;
  let pos = offset;

  byte = buffer[pos++];
  const sign = byte & 0x40 ? -1 : 0;

  result |= (byte & 0x3f) << shift;
  shift += 6;

  if ((byte & 0x80) === 0) {
    return {
      value: (result ^ sign) | 0,
      bytesRead: pos - offset,
    };
  }

  do {
    byte = buffer[pos++];
    result |= (byte & 0x7f) << shift;
    shift += 7;
  } while (byte & 0x80);

  return {
    value: (result ^ sign) | 0,
    bytesRead: pos - offset,
  };
}

/**
 * Decode a VarInt directly from a hex string
 * @param {string} hex
 * @returns {number}
 */
function decodeVarIntFromHex(hex) {
  if (typeof hex !== "string") {
    throw new TypeError("Hex input must be a string");
  }

  const cleanHex = hex.replace(/^0x/i, "").replace(/\s+/g, "");

  if (cleanHex.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }

  const buffer = Buffer.from(cleanHex, "hex");

  const { value, bytesRead } = decodeVarInt(buffer);

  if (bytesRead !== buffer.length) {
    throw new Error("Extra bytes detected after VarInt");
  }

  return value;
}

/**
 * Encode an integer and return a VarInt hex string
 * @param {number} value
 * @returns {string}
 */
function encodeIntToVarIntHex(value) {
  if (!Number.isInteger(value)) {
    throw new TypeError("Value must be an integer");
  }

  const buffer = encodeVarInt(value);

  return [...buffer].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/* ===========================
   Example Usage
=========================== */

console.log(encodeIntToVarIntHex(70175753));
console.log(encodeIntToVarIntHex(70175801));
console.log(encodeIntToVarIntHex(54));
