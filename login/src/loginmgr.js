// 支持开启多个nodejs进程来 处理 client 的消息
const os = require("os");
const path = require("path");
const events = require("events");

const helper = require("../../3rd/common/helper");
const logs = require("../../3rd/common/logs");
const protopacket = require("../../3rd/protopacket/protopacket");
const protoformat = require("../../3rd/protoformat/protoformat");
const defines = require("../../3rd/defines/defines");

class loginmgr extends events {
    static _name = "loginmgr";
    static getInst() {
        if (helper.isNullOrUndefined(loginmgr.inst)) {
            loginmgr.inst = new loginmgr();
        }
        return loginmgr.inst;
    }
    constructor() {
        super();
        this.on('connection', this.doConnection);
        this.on('data', this.doData);
        this.on('end', this.doEnd);
        this.on('error', this.doError);
        this.on('server.error', this.doServerError);
        this._clients = {};
    }
    doConnection(c) {
        c.name = c.connection.remoteAddress + ":" + c.connection.remotePort;
        this._clients[c.name] = c;
        this.updateLoad();
    }
    doData(c) {
        while (c.packets.length > 0) {
            let pack = c.packets.shift();
            setTimeout(()=>{
                this.processClientPack(c, pack);
            },0);
        }
    }
    doEnd(c) {
        if (false == helper.isNullOrUndefined(this._clients[c.name])) {
            this._clients[c.name].destroy();
            delete this._clients[c.name];
        }
        this.updateLoad();
    }
    doError(args) {
        if (false == helper.isNullOrUndefined(this._clients[c.name])) {
            this._clients[c.name].destroy();
            delete this._clients[c.name];
        }
        this.updateLoad();
    }
    doServerError() {
        for (let n in this._clients) {
            doError(this._clients[n]);
        }
        this.updateLoad();
    }
    processClientPack(client, pack) {
        logs.log("["+this._name+":processClientPack] client:", client.name, "pack:", pack);
        let fmt = pack.fmt;
        if (defines.LOGIN.REGISTER == fmt.cmd) {
            this.clientResponse(client, {result:'register ok'});
        }
        if (defines.LOGIN.MESSAGE == fmt.cmd) {
            this.clientResponse(client, {result:'message got'});
        }
    }
    clientResponse(client, jso) {
        let raw = JSON.stringify(jso);
        let buf = protopacket.enpacket(raw);
        logs.log("writable:", client);
        if (client.connection.writable) {
            logs.log("write", jso);
            client.connection.write(buf);
        }
    }
    updateLoad() {
        setTimeout(()=>{ 
            load2mgr.load = Objecet.keys(this._clients).length;
            load2mgr.broadcastLoad();
        },1);
    }
}

module.exports = loginmgr;