// 支持开启多个nodejs进程来 处理 client 的消息
const os = require("os");
const path = require("path");
const events = require("events");

const helper = require("../../3rd/common/helper");
const logs = require("../../3rd/common/logs");
const protopacket = require("../../3rd/protopacket/protopacket");
const protoformat = require("../../3rd/protoformat/protoformat");

const defines = require("../../3rd/defines/defines");

class clientmgr extends events {
    static getInst() {
        if (helper.isNullOrUndefined(clientmgr.inst)) {
            clientmgr.inst = new clientmgr();
        }
        return clientmgr.inst;
    }
    get name() { return this.constructor.name; }
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
    }
    doData(c) {
        //logs.log("["+this.name+"]", "c.packets:", c.packets);
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
    }
    doError(args) {
        if (false == helper.isNullOrUndefined(this._clients[c.name])) {
            this._clients[c.name].destroy();
            delete this._clients[c.name];
        }
    }
    doServerError() {
        for (let n in this._clients) {
            doError(this._clients[n]);
        }
    }
    processClientPack(client, pack) {
        //logs.log("["+this.name+":processClientPack] client:", client.name, "pack:", pack);
        logs.log("["+this.name+":processClientPack] client:", client.name, "pack.fmt:", pack.fmt);
        let fmt = pack.fmt;
        if (helper.isNullOrUndefined(fmt.cmd)) {
            return;
        }
        if (defines.LOGINMGR.LOGIN.INFO == fmt.cmd) {
            client.type = "login";
            client.info = fmt.info;
            this.clientResponse(client, {result:'ok'});
        }
        if (defines.LOGINMGR.CLIENT.GETFREELOGIN == fmt.cmd) {
            let lst = [];
            for (let name in this._clients) {
                if ("login" == this._clients[name].type) {
                    lst.push(this._clients[name]);
                }
            }
            lst = lst.sort((a,b)=>{ return Number(a.info) > Number(a.info) ? -1 : 1; });
            if (lst.length > 0) {
                this.clientResponse(client, {result:lst[0].name, info:lst[0].info});
            } else {
                this.clientResponse(client, {});
            }
        }
        if (defines.LOGINMGR.CLIENT.LISTLOGIN == fmt.cmd) {
            logs.log("["+this.name+":processClientPack]", "start listing logins");
            for (let name in this._clients) {
                if ("login" == this._clients[name].type) {
                    logs.log(name, this._clients[name].info);
                }
            }
            logs.log("["+this.name+":processClientPack]", "end listing logins");
        }
    }
    clientResponse(client, jso) {
        //logs.log("["+this.name+":clientResponse]", jso);
        let raw = JSON.stringify(jso);
        let buf = protopacket.enpacket(raw);
        //logs.log("writable:", client);
        if (client.connection.writable) {
            logs.log("["+this.name+":clientResponse]", "write", client.name, ":", jso);
            //logs.log("["+this.name+":clientResponse]", "buf:", buf.length, buf);
            client.connection.write(buf);
        }
    }
}

module.exports = clientmgr;


