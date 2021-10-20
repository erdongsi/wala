// 对 comm 的模块化封装
// 实现 自动断线重连
// 暴露简单的 connect， send， recv callback

const fs = require("fs");

const helper = require("../../3rd/common/helper");
const logs = require("../../3rd/common/logs");
const cmd = require("../../3rd/common/cmd");
const comm = require("../../3rd/common/comm");

const protopacket = require("../../3rd/protopacket/protopacket");
const protoformat = require("../../3rd/protoformat/protoformat");

const MOD_NAME = "connector";

class connector {
    constructor(owner, cfg) {
        this._owner = owner;
        this._cfg = cfg;
        this.checkCfg(this._cfg, "reconnect_times", 5);
        this.checkCfg(this._cfg, 'reconnect_ms', 3000);
        this._reconnect_times = this._cfg.reconnect_times;
        this._comm = null;
        this._recv = null;
        this._packets = null;
    }
    connect(ip, port) {
        if (false == helper.isNullOrUndefined(this._comm)) {
            this._comm.disconnect();
            this._comm = null;
            this._recv = null;
            this._packets = null;
        }
        setTimeout(()=>{ this.doConnect(ip,port); }, 1);
    }
    doConnect(ip, port) {
        this._comm = new comm();
        this._recv = Buffer.alloc(0);
        this._packets = [];
        this._comm.connect(ip, port, (b)=>{
            logs.log("["+MOD_NAME+":connect]", "connect:", b);
            if (false == b) {
                logs.log("["+MOD_NAME+":connect]", "re-connect after", this._cfg.reconnect_ms, "ms");
                this._reconnect_times -= 1;
                if (this._reconnect_times >= 0) {
                    setTimeout(()=>{ this.connect(ip, port); }, this._cfg.reconnect_ms);
                }
            } else {
                this._reconnect_times = this._cfg.reconnect_times;
            }
            this._owner.emit('connector.connect', this._cfg.idx, b);
        }, (recv)=>{
            logs.log("["+MOD_NAME+":connect] recv data:", recv.length);
            //logs.log("["+MOD_NAME+":connect] recv data:", recv);

            let by_dat = Buffer.from(recv);
            this._recv = Buffer.concat([this._recv, by_dat], this._recv.length + by_dat.length);

            this.doPacket();

            this.loopPackets();
        });
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
    loopPackets() {
        while (this._packets.length > 0) {
            let pack = this._packets.shift();
            this._owner.emit('connector.msg', this._cfg.idx, pack);
        }
    }
    send(buf) {
        logs.log("["+MOD_NAME+":send]", buf);
        try {
            let by = protopacket.enpacket(buf);
            this._comm.send(by);
        } catch (e) {
            logs.log("["+MOD_NAME+":send] e:", e.message);
        }
    }
    destroy() {
        if (false == helper.isNullOrUndefined(this._comm)) {
            this._comm.disconnect();
            this._comm = null;
            this._recv = null;
        }
    }
    checkCfg(cfg, key, default_value) {
        if (helper.isNullOrUndefined(cfg[key])) { cfg[key] = default_value; }
    }
}

module.exports = connector;


