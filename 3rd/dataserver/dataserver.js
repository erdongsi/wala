const net = require("net");

const helper = require("../../3rd/common/helper");
const logs = require("../../3rd/common/logs");
const protopacket = require("../../3rd/protopacket/protopacket");
const protoformat = require("../../3rd/protoformat/protoformat");
const baseconnection = require("./baseconnection");

class dataserver {
    constructor() {
        this._name = "dataserver";
        this._app = null;
    }
    registerApplication(app) {
        if (false == helper.isNullOrUndefined(this._app)) {
            logs.log("["+this._name+":registerApplication] app has already resigstered.");
            return false;
        }
        this._app = app;
    }
    create(ip, port) {
        logs.log("["+this._name+":create] (", ip+",", port, ") >>>>>");

        let _server = net.createServer();

        _server.on("connection", (c)=>{ // c: is a socket
            c.name = c.remoteAddress + ":" + c.remotePort;
            //logs.log("["+this._name+":create] c:", c);
            logs.log("["+this._name+":create] new connection:", c.name);

            let con = new baseconnection(c);

            this._app.emit('connection', con);

            c.on("data", (dat)=>{
                logs.log("["+this._name+":create]", c.name, "get data:", dat.length);
                con.doData(dat);

                this._app.emit('data', con);
            });

            c.on("end", ()=>{
                logs.log("["+this._name+":create] end:", c.name);
                this._app.emit('end', con);
            });

            c.on("error", (e)=>{
                logs.log("["+this._name+":create] error:", c.name);
                this._app.emit('error', con);
            });
        });

        _server.listen(port);

        _server.on("error", (e)=>{
            logs.logRed("["+this._name+":create] server error:",e.message);
            this._app.emit('server.error');
        });
    }
}
module.exports = dataserver;

