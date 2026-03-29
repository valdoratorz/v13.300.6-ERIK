// kill_crypto_clean.js
var module = Process.getModuleByName("libg.so");
var base = Process.getModuleByName("libg.so").base;
const libc = Process.getModuleByName("libc.so");
const getaddrinfo = libc.findExportByName('getaddrinfo');

const v14LoadOffset = 0x1111E58; // LDAR W8, [X22]
const addr = base.add(v14LoadOffset);
const originalV14 = addr.readByteArray(4);

let cache = {fd: null}


// console.log("[*] Crypto bypass loading...");
// console.log("[+] libg.so @ " + base);

//24104

Interceptor.replace(base.add(0x1109180), new NativeCallback(function() {
	console.warn("[+][PepperCrypto::secretbox_open] Skipped decryption");
	return 1;
}, 'int', []));


Interceptor.replace(base.add(0x94C810), new NativeCallback(function() {
	console.warn("[+][sub_94C810] Skipped");
	return 1;
}, 'void', []));


//sub_E31E70 - outofsync xref

//sub_
Interceptor.attach(getaddrinfo, {
    onEnter(args) {
        this.c = Memory.allocUtf8String('192.168.1.40');
        args[0] = this.c;
		
		Memory.protect(addr, 0x1000, 'rwx');
		
		addr.writeByteArray(originalV14);

		console.log("🔁 v14 patch rolled back (LDAR restored)");

		setTimeout(() => {
			

			
			
			//outofsync id 28968

			// MOVZ W8, #5  (ARM64)
			// opcode = 0x528000A8  → little-endian
			addr.writeU8(0xA8);
			addr.add(1).writeU8(0x00);
			addr.add(2).writeU8(0x80);
			addr.add(3).writeU8(0x52);

			console.log("✅ v14 forced to 5 (do NOT disassemble after)");
		}, 1000);
    }
});

/*Interceptor.replace(base.add(0xB238F8), new NativeCallback(function() {
	console.warn("[+] Ouofsync skipped");
	return 0;
}, 'int', []));
*/
//LogicCommandManager::tick

var isClientOffSync = (new NativeFunction(base.add(0xF10AB0), 'int', ['pointer']));

Interceptor.replace(base.add(0xF10AB0), new NativeCallback(function(a1) {
	//console.warn("[+] LogicTime::isClientOffSync bypassed: " + a1);
	return 0;
}, 'int', ['pointer']));

const updateOffset = 0xE30FBC;  // LogicGameMode::update

setImmediate(function () {

    Interceptor.attach(base.add(updateOffset), {

        onEnter: function (args) {
            this.a1 = args[0];
        },

        onLeave: function () {

            try {
                // Force desync flag OFF
                this.a1.add(489).writeU8(0);

                // Also clear secondary flag
                this.a1.add(491).writeU8(0);aaaa

            } catch (e) {}
        }
    });

    console.log("[+] Client-side desync suppressed");
});

/*
const tbzOffsetBattlePatch = 0xB0B340;
const targetBattlePatch = base.add(tbzOffsetBattlePatch);

// branch target
const skipBattlePatch = base.add(0xB0B36C);

Memory.patchCode(targetBattlePatch, 4, function (code) {
    const writer = new Arm64Writer(code, { pc: targetBattlePatch });
    writer.putBImm(skipBattlePatch);
    writer.flush();
});*/

console.log("Patched full update check");

var enc = base.add(0x111632C);

Interceptor.replace(enc, new NativeCallback(function(
    inPtr,
    inLen,
    outPtr,
    outLen,
    key,
    ctx
) {

    console.log("Encryption skipped");

    var len = parseInt(inLen); // safest conversion

    Memory.copy(outPtr, inPtr, len);

    outPtr.add(len).writeByteArray(
        new Uint8Array(16)
    );

    return 0;

}, 'int', ['pointer','ulong','pointer','ulong','pointer','pointer']));






/*const if_v5_branch = base.add(0xE15924); // <-- IDA offset here

Memory.protect(if_v5_branch, 4, 'rwx');

// ARM64 NOP
if_v5_branch.writeU32(0xD503201F);*/

/*const skip_if_v3 = base.add(0x158F4); // CBZ instruction offset

Memory.protect(skip_if_v3, 4, 'rwx');
skip_if_v3.writeU32(0xD503201F); // NOP

console.log('[+] if (v3) disabled');*/


/*Interceptor.replace(base.add(0xB39B44), new NativeCallback(function (a1) {
	console.warn("[+] 0xB39B44 bypassed");
	return a1;
}, 'int64', ['int64']));*/

/*Interceptor.attach(base.add(0xF85144), {
	onEnter(args) {
		console.warn("[+]getstars?");
	},
	onLeave(retval) {
		console.log("[+]getstars retval " + retval.toInt32());
	}
});*/


//sub_F85144

/*var SET_CLIENT_CHECKSUM = 0xE158FC;
var setClientChecksum = (new NativeFunction(base.add(SET_CLIENT_CHECKSUM), 'void', ['int', 'pointer']));

Interceptor.replace(base.add(SET_CLIENT_CHECKSUM), new NativeCallback(function (a1, a2) {
	var stars = 0;
	return setClientChecksum(a1, ptr(stars));
}, 'void', ['int', 'pointer']));*/

/*Interceptor.attach(base.add(0x110A034), {
	onEnter(args) {
		this.a1 = args[0];
		this.a2 = args[1];
	},
	onLeave(retval) {
		retval.replace(this.a2 + 8);
		console.warn("[+][sub_154CE40] Skipped encryption");
	}
});*/
//

/*Interceptor.attach(base.add(0xE158FC), {
	onEnter(args) {
		console.log("a1: " + args[0].readInt());
		console.log("a2: " + args[1].readInt());
		//args[1] = args[0];
	}
});

Interceptor.attach(base.add(0xB3A090), {
	onLeave(retval) {
		console.log("-retval: " + retval.readPointer());
		retval.replace(ptr(0));
	}
});*/

const realEncrypt = base.add(0xf3c594);

const plainEncrypt = new NativeCallback(
    function (ctx, src, dst, len) {
        try {
            if (src.isNull() || dst.isNull() || len <= 0)
                return -1;

            // passthrough
            Memory.copy(dst, src, len);
            return 0;
        } catch (e) {
            console.error('encrypt error:', e);
            return -1;
        }
    },
    'int',
    ['pointer', 'pointer', 'pointer', 'int']
);
//

Interceptor.replace(realEncrypt, plainEncrypt);

console.log('[✓] encrypt replaced @', realEncrypt);
