const net = require("net");

const helper = require("../common/helper");
const logs = require("../common/logs");
const protopacket = require("../protopacket/protopacket");
const protoformat = require("../protoformat/protoformat");

class baseconnection {
    constructor(c) {
        this._name = "baseconnection";
        this._connection = c;   // socket
        this._recv = Buffer.alloc(0);
        this._packets = [];
    }
    get connection() { return this._connection; }
    get packets() { return this._packets; }
    doData(dat) {
        let by_dat = Buffer.from(dat);
        this._recv = Buffer.concat([this._recv, by_dat], this._recv.length + by_dat.length);

        this.doPacket();
    }
    doPacket() {
        while (true) {
            let pack = protopacket.depacket(this._recv);
            if (pack.len > 0) {
                let fmt = protoformat.deformat(pack.msg);
                if (false == helper.isNullOrUndefined(fmt)) {
                    pack.fmt = fmt;
                }
                this._packets.push(pack);

                this._recv = this._recv.slice(pack.len);
            } else {
                break;
            }
        }
    }
    destroy() {
        this._recv = null;
        this._packets = [];
        if (false == helper.isNullOrUndefined(this._connection)) {
            this._connection.destroy();
            this._connection = null;
        }
    }
}
module.exports = baseconnection;

