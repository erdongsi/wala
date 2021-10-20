const net = require("net");
//const events = require("events");

const helper = require("../common/helper");
const logs = require("../common/logs");

class protoformat {
    static _name = "protoformat";
    //constructor() {
    //    super();
    //    this.lst_clients = [];
    //    this.hb_timeout = 10000;
    //}
    static enformat(raw) {
        //logs.log("["+this._name+":enformat] (", "raw[",raw.length,"]) >>>>>");

        let s = null;
        try {
            s = JSON.stringify(raw);
        } catch (e) {
            logs.logRed("["+this._name+":enformat] e:", e.message);
        }
        return s;
    }
    static deformat(raw) {
        //logs.log("["+this._name+":deformat] (", "raw[",raw.length,"]) >>>>>");

        let jso = null;
        try {
            let s_raw = raw.toString();
            //logs.log("["+this._name+":deformat] s_raw:", s_raw);
            jso = JSON.parse(s_raw);
        } catch (e) {
            logs.logRed("["+this._name+":deformat] e:", e.message);
        }
        return jso;
    }
}

module.exports = protoformat;

