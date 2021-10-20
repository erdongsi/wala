const net = require("net");
//const events = require("events");

const helper = require("../common/helper");
const logs = require("../common/logs");

const HEAD_SIZE = 16;

class protopacket {
    static _name = "protopacket";
    static ALGORITHM = 'rc4';
    //constructor() {
    //    super();
    //    this.lst_clients = [];
    //    this.hb_timeout = 10000;
    //}
    // buf/string 打包， return buf = head(HEAD_SIZE) + buf;  head = lenSize(4) + key(4) + otherHead;
    static enpacket(raw) {
        //logs.log("["+this._name+":enpacket] (", "raw[",raw.length,"]) >>>>>");
        //logs.log("["+this._name+":enpacket] (", "raw[",raw,"]) >>>>>");

        let key = helper.randomKey(4);
        //logs.logYellow("["+this._name+":enpacket] key:", key);

        let by_msg = helper.cipher(raw, this.ALGORITHM, key);
        //logs.log("["+this._name+":enpacket] by_msg:", by_msg);

        let len = HEAD_SIZE + by_msg.length;
        //logs.log(""+this._name+":enpacket] len:", len);
        let by_len = Buffer.alloc(HEAD_SIZE-4);
        by_len.writeUInt32BE(len, 0);
        //logs.log("["+this._name+":enpacket] by_len:", by_len);
        let by_key = Buffer.from(key);
        //logs.log("["+this._name+":enpacket] by_key:", by_key);
        let by_head = Buffer.concat([by_len,by_key], by_len.length+by_key.length);
        //logs.log("["+this._name+":enpacket] by_head:", by_head);
        let by_send = Buffer.concat([by_head,by_msg], len);
        //logs.log("["+this._name+":enpacket] by_send:", by_send.length);
        //logs.log("["+this._name+":enpacket] by_send:", by_send);

        return by_send;
    }
    static depacket(raw) {
        //logs.log("["+this._name+":depacket] (", "raw[", raw.length, "]) >>>>>");
        //logs.log("["+this._name+":depacket] (", "raw[", raw, "]) >>>>>");

        if (false == helper.isNullOrUndefined(raw) && raw.length > 0) {
            if (raw.length >= HEAD_SIZE) {
                let len = raw.readUInt32BE(0);
                //logs.log("["+this._name+":depacket] len:", len);

                if (raw.length >= len) {
                    let by_head = raw.slice(0, HEAD_SIZE);
                    let by_key = by_head.slice(-4);
                    //logs.log("["+this._name+":depacket] by_key:", by_key);
                    let key = by_key.toString();
                    //logs.logYellow("["+this._name+":depacket] key:", key);
                    
                    let by_buf = raw.slice(HEAD_SIZE, len);
                    //logs.log("["+this._name+":depacket] buf:", by_buf);

                    let by_msg = helper.decipher(by_buf, this.ALGORITHM, key);

                    //logs.log("["+this._name+":depacket] msg 2:", by_msg);
                    //logs.log("["+this._name+":depacket] msg 3:", by_msg.toString());

                    return {buf:by_buf, msg:by_msg, len};
                } else {
                    //logYellow("["+this._name+":depacket] raw < len.");
                }
            } else {
                //logYellow("["+this._name+":depacket] raw < HEAD_SIZE.");
            }
        }
        return {buf:null,msg:null,len:-1};
    }
}

module.exports = protopacket;

