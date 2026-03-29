"use strict";

/**
 * Packetizer - Assembles incoming data chunks into complete packets.
 *
 * Protocol:
 *   - 2 bytes: message id
 *   - 3 bytes: payload length (unsigned, big‑endian)
 *   - 2 bytes: version
 *   - payload (exactly `payloadLength` bytes)
 *
 * This class maintains state across multiple `data` events and MUST be
 * instantiated once per connection and reused for all data from that connection.
 */
class Packetizer {
  constructor(session) {
    this._buffer = null; // Buffer holding incomplete data
    this._packet = null; // Buffer for the current packet being built (header or full packet)
    this.session = session; // Optional session reference
    this.maxPacketSize = 16 * 1024 * 1024; // 16 MB – adjust as needed
  }

  /**
   * Process an incoming data chunk, extract complete packets, and invoke the callback for each.
   * @param {Buffer} data - New data received.
   * @param {Function} callback - Function called with each complete packet buffer.
   */
  packetize(data, callback) {
    // Append new data to the internal buffer
    if (this._buffer) {
      this._buffer = Buffer.concat([this._buffer, data]);
    } else {
      this._buffer = data;
    }

    // Process as many complete packets as possible
    while (this._buffer && this._buffer.length > 0) {
      // Case 1: We already have a header and are waiting for the payload
      if (this._packet && this._packet.length > 0) {
        const payloadLength = this._packet.readUIntBE(2, 3); // bytes 2-4 are the length

        // Do we have enough data to complete the packet?
        if (this._buffer.length >= payloadLength) {
          // Extract the exact payload and build the full packet
          const payload = this._buffer.slice(0, payloadLength);
          const fullPacket = Buffer.concat([this._packet, payload]);

          callback(fullPacket); // deliver the complete packet

          // Clean up state
          this._packet = null;
          this._buffer = this._buffer.slice(payloadLength);
        } else {
          // Not enough payload yet – wait for more data
          break;
        }
      }
      // Case 2: No current packet – try to read a new header (needs at least 7 bytes)
      else if (this._buffer.length >= 7) {
        // Extract the 7‑byte header
        this._packet = this._buffer.slice(0, 7);
        this._buffer = this._buffer.slice(7);

        // Optional: validate the payload length
        const payloadLength = this._packet.readUIntBE(2, 3);
        if (payloadLength > this.maxPacketSize) {
          console.error(
            `Packet payload length ${payloadLength} exceeds maximum ${this.maxPacketSize}`,
          );
          // Discard this malformed packet and stop processing (or you could throw an error)
          this._packet = null;
          break;
        }

        // If payload length is zero, the header alone is the complete packet
        if (payloadLength === 0) {
          callback(this._packet);
          this._packet = null;
          // Continue the loop – there may be more packets in the buffer
        }
        // Otherwise, we need to wait for the payload; loop continues to check if we already have it
      }
      // Case 3: Not enough bytes for a full header – wait for more data
      else {
        break;
      }
    }
  }
}

module.exports = Packetizer;
