var module = Process.getModuleByName("libg.so");
var base = module.base;
const libc = Process.getModuleByName("libc.so");
const getaddrinfo = libc.findExportByName("getaddrinfo");

let messagingPtr = null;

let cacheFD = null;

const ServerConnection_pInstance = 0x16edd30;

const malloc = new NativeFunction(libc.findExportByName("malloc"), "pointer", ["int",]);
const fChatToAllianceStreamMessageCtor = new NativeFunction(base.add(0xe080e4), "void", ["pointer"],);
const fMessaging_Send = new NativeFunction(base.add(0x1108514), "void", ["pointer", "pointer",]);
const free = new NativeFunction(libc.findExportByName("free"), "void", ["pointer",]); const StringCtor = new NativeFunction(base.add(0x1118d44), "void", ["pointer", "pointer",]);
const libc_send = new NativeFunction(libc.findExportByName("send"), "int", ["int", "pointer", "int", "int",]);

function toRawHex(byteArray) {
    if (byteArray === null) return "";
    const u8 = new Uint8Array(byteArray);
    let hex = "";
    for (let i = 0; i < u8.length; i++) {
        hex += u8[i].toString(16).padStart(2, "0");
    }
    return hex;
}

const Utils = {
    StringCtor(ptr, strptr) {
        StringCtor(ptr, strptr);
    },
    createStringPtr(str) {
        var ptr = malloc(str.length + 1);
        ptr.writeUtf8String(str);
        return ptr;
    },
    createStringObject(str) {
        var strptr = Utils.createStringPtr(str);
        let ptr = malloc(128);
        Utils.StringCtor(ptr, strptr);
        return ptr;
    },
    strPtr(content) {
        return Memory.allocUtf8String(content);
    },
};

var Buffer = {
    _setEncodingLength: function (buffer, length) {
        console.log(buffer);
        buffer.add(2).writeU8((length >> 16) & 0xff);
        buffer.add(3).writeU8((length >> 8) & 0xff);
        buffer.add(4).writeU8(length & 0xff);
    },
    _setMessageType: function (buffer, type) {
        buffer.add(0).writeU8((type >> 8) & 0xff);
        buffer.add(1).writeU8(type & 0xff);
    },
    _setMessageVersion: function (buffer, version) {
        buffer.add(5).writeU8((version >> 8) & 0xff);
        buffer.add(6).writeU8(version & 0xff);
    },
};

function sendCustomPayload(id, payloadBytes) {
    const headerLen = 7;
    const payloadLen = payloadBytes.length;
    const totalLen = headerLen + payloadLen;
    const packet = malloc(totalLen);

    Buffer._setMessageType(packet, id);
    Buffer._setEncodingLength(packet, payloadLen);
    Buffer._setMessageVersion(packet, 0);

    if (payloadLen > 0) {
        const bytes =
            payloadBytes instanceof Uint8Array
                ? payloadBytes
                : new Uint8Array(payloadBytes);
        packet.add(headerLen).writeByteArray(bytes);
    }
    libc_send(cacheFD, packet, totalLen, 0);
    free(packet);
}

function buildChatToAllianceStreamMessage(payload) {
    var message = malloc(116);
    fChatToAllianceStreamMessageCtor(message);
    ptr(message).add(0x90).writePointer(Utils.createStringObject(payload));
    return message;
}

function sendClanMessage(payload) {
    let message = buildChatToAllianceStreamMessage(payload);
    fMessaging_Send(messagingPtr, message);
}

console.log("[*] Crypto bypass loading...");
console.log("[+] libg.so @ " + base);

Interceptor.replace(base.add(0x1109180), new NativeCallback(function () {
    console.warn("[+][PepperCrypto::secretbox_open] Skipped decryption");
    return 1;
}, "int", [],),);

Interceptor.replace(base.add(0x94c810), new NativeCallback(
    function () {
        console.warn("[+][sub_94C810] Skipped");
        return 1;
    }, "void", [],),);

function stringToByteArray(str) {
    const utf8bytes = [];
    for (let i = 0; i < str.length; i++) {
        let codePoint = str.charCodeAt(i);
        if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
            const high = codePoint;
            const low = str.charCodeAt(++i);
            codePoint = (high - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;
        }
        if (codePoint < 0x80) {
            utf8bytes.push(codePoint);
        } else if (codePoint < 0x800) {
            utf8bytes.push(0xc0 | (codePoint >> 6));
            utf8bytes.push(0x80 | (codePoint & 0x3f));
        } else if (codePoint < 0x10000) {
            utf8bytes.push(0xe0 | (codePoint >> 12));
            utf8bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
            utf8bytes.push(0x80 | (codePoint & 0x3f));
        } else {
            utf8bytes.push(0xf0 | (codePoint >> 18));
            utf8bytes.push(0x80 | ((codePoint >> 12) & 0x3f));
            utf8bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
            utf8bytes.push(0x80 | (codePoint & 0x3f));
        }
    }

    const len = utf8bytes.length;
    const result = [
        (len >> 24) & 0xff,
        (len >> 16) & 0xff,
        (len >> 8) & 0xff,
        len & 0xff,
        ...utf8bytes,
    ];

    return result;
}


Interceptor.attach(getaddrinfo, {
    onEnter(args) {
        this.c = Memory.allocUtf8String("192.168.1.40");
        args[0] = this.c;
        args[1].writeUtf8String("9330");

        const ServerConnection = base.add(ServerConnection_pInstance).readPointer();
        messagingPtr = ServerConnection.add(8).readPointer();

        console.log(messagingPtr);
    },
});


var isClientOffSync = new NativeFunction(base.add(0xf10ab0), "int", [
    "pointer",
]);

Interceptor.replace(base.add(0xf10ab0), new NativeCallback(function (a1) {
    return 0;
}, "int", ["pointer"],),);

const updateOffset = 0xe30fbc;

setImmediate(function () {
    Interceptor.attach(base.add(updateOffset), {
        onEnter(args) {
            this.a1 = args[0];
        },

        onLeave() {
            try {

                this.a1.add(489).writeU8(0);


                this.a1.add(491).writeU8(0);
                aaaa;
            } catch (e) { }
        },
    });

    console.log("[+] Client-side desync suppressed");
});

Interceptor.attach(base.add(0xe158fc), {
    onEnter(args) {
        console.log(args[1].readInt());
    },
});

Interceptor.attach(libc.findExportByName("connect"), {
    onEnter(args) {
        cacheFD = args[0].toInt32();
    },
});

let canSkipEncryption = false;

class PiranhaMessage {
    static encode(Message) {
        return new NativeFunction(
            Message.readPointer().add(16).readPointer(),
            "int",
            ["pointer"],
        )(Message);
    }

    static decode(Message) {
        return new NativeFunction(
            Message.readPointer().add(24).readPointer(),
            "int",
            ["pointer"],
        )(Message);
    }

    static getServiceNodeType(Message) {
        return new NativeFunction(
            Message.readPointer().add(32).readPointer(),
            "int",
            ["pointer"],
        )(Message);
    }

    static getMessageType(Message) {
        return new NativeFunction(
            Message.readPointer().add(40).readPointer(),
            "int",
            ["pointer"],
        )(Message);
    }

    static getMessageTypeName(Message) {
        return new NativeFunction(
            Message.readPointer().add(48).readPointer(),
            "pointer",
            ["pointer"],
        )(Message);
    }

    static getEncodingLength(Message) {
        return PiranhaMessage.getByteStream(Message).add(24).readInt();
    }

    static isClientToServerMessage(Message) {
        return (
            (PiranhaMessage.getMessageType(Message) >= 10000 &&
                PiranhaMessage.getMessageType(Message) < 20000) ||
            PiranhaMessage.getMessageType(Message) === 30000
        );
    }

    static destruct(Message) {
        return new NativeFunction(
            Message.readPointer().add(56).readPointer(),
            "int",
            ["pointer"],
        )(Message);
    }

    static getByteStream(Message) {
        return Message.add(8);
    }
}

let sendPepperAuthentication = new NativeFunction(base.add(0x1109630), "pointer", ["pointer", "pointer"],);

Interceptor.replace(base.add(0x1109630), new NativeCallback(function (a1, a2) {
    a1.add(24).writeU8(5);
    fMessaging_Send(a1, a2);
}, "pointer", ["pointer", "pointer"],),);

const cmpAddress = base.add(0x110a18c);

Interceptor.attach(cmpAddress, {
    onEnter(args) {
        this.context.x0 = ptr(10100);
        console.log("[*] Forced message ID to 10100 at cmp instruction");
    },
});

let ownStars = 0,
    enemyStars = 0;

Interceptor.attach(base.add(0xd2a0d8), {
    onEnter(args) {
        this.returnAddr = this.returnAddress.sub(base).toInt32();
    },
    onLeave(retval) {
        const addr = this.returnAddr;
        switch (addr) {
            case 8075200:
                ownStars = retval.toInt32();
                break;
            case 8075184:
                enemyStars = retval.toInt32();
                break;
        }
    },
});

function getCrownMessageId(stars) {
    if (stars === 1) return 10097;
    if (stars === 2) return 10098;
    if (stars === 3) return 10099;
}

let secondsSincelastCommand = -1;

Interceptor.attach(base.add(0x1108514), {
    onEnter(args) {
        let msgtype = new NativeFunction(args[1].readPointer().add(40).readPointer(), "int", ["pointer"],)(args[1]);
        if (msgtype === 18683) {
            secondsSincelastCommand = 0;
        }
    },
});

setInterval(() => {
    console.log("own stars: " + ownStars);
    console.log("enemy stars: " + enemyStars);
    if (secondsSincelastCommand != -1) {
        secondsSincelastCommand += 0.5;
    }
    if (
        (ownStars >= 1 && ownStars <= 3) ||
        (enemyStars >= 1 && enemyStars <= 3)
    ) {
        if (secondsSincelastCommand >= 3) {
            sendClanMessage(`{${ownStars},${enemyStars}7`);
            ownStars = 0;
            enemyStars = 0;
            secondsSincelastCommand = -1;
        }
    }
}, 500);

Process.setExceptionHandler(function (details) {
    console.log("=== CRASH ===");
    console.log("Type:", details.type);
    console.log("Address:", details.address.sub(base));

    console.log(
        Thread.backtrace(details.context, Backtracer.ACCURATE)
            .map(DebugSymbol.fromAddress)
            .join("\n"),
    );

    return false;
});
