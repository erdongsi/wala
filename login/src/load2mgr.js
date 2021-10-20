const os = require("os");
const path = require("path");
const events = require("events");

const helper = require("../../3rd/common/helper");
const logs = require("../../3rd/common/logs");
const protopacket = require("../../3rd/protopacket/protopacket");
const protoformat = require("../../3rd/protoformat/protoformat");
const connector = require("../../3rd/connector/connector");
const defines = require("../../3rd/defines/defines");

const MOD_NAME = "load2mgr";

class load2mgr extends events {
    static getInst() {
        if (helper.isNullOrUndefined(load2mgr.inst)) {
            load2mgr.inst = new load2mgr();
        }
        return load2mgr.inst;
    }
    constructor(cfg) {
        super();
        this._cfg = cfg;
        this._connector = null;
        this.on('connector.connect', this.doConnect);
        this.on('connector.msg', this.doMsg);
        this._load = 0;
    }
    get load() { return this._load; }
    set load(value) { this._load = value; setTimeout(()=>{ this.broadcastLoad(); },1); }
    init(cfg) {
        this._cfg = cfg;
        setTimeout(()=>{ this.initConnector(); }, 1);
    }
    initConnector() {
        if (false == helper.isNullOrUndefined(this._connector)) {
            this._connector.destroy();
            this._connector = null;
        }
        let cfg_connector = {};
        cfg_connector.idx = "idx.connector.of.load2mgr";
        cfg_connector.reconnect_ms = 3000;
        cfg_connector.reconnect_times = 20;
        this._connector = new connector(this, cfg_connector);
        this._connector.connect(this._cfg.mgr_ip, this._cfg.mgr_port);
    }
    doConnect(idx, isconnect) {
        logs.log("["+MOD_NAME+":doConnect]", idx, isconnect);
        if (isconnect) {
            this.info2mgr();
        }
    }
    doMsg(idx, pack) {
        logs.log("["+MOD_NAME+":doMsg]", idx, pack);
    }
    info2mgr() {
        this._connector.send(JSON.stringify({cmd:defines.LOGINMGR.LOGIN.INFO, info:{ip:this._cfg.self_ip, load:this._load}}));
    }
}

module.exports = load2mgr;

