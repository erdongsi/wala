// 对 net.socket 的封装
// 处理 socket 的生命周期
// 暴露简单的 connect callback， recv callback， 和 send

const net = require("net");

const helper = require("./helper");
const logs = require("./logs");

class comm {

    constructor() {
        this._socket = null;
    }

    connect(ip, port, connectcb, recvcb) {
        logs.log("[comm:connect] (",ip,",",port,",connectcb[",(helper.isNullOrUndefined(connectcb)?"null":"func"),"],recvcb[",(helper.isNullOrUndefined(recvcb)?"null":"func"),"]) >>>>>");

        if (false == helper.isNullOrUndefined(this._socket)){
            logs.log("[comm:connect] last socket is exist!");
            return;
        }

        this._socket = new net.Socket({
            //fd: null,
            readable: false,
            writable: false,
            allowHalfOpen: false
        });

        logs.log("[comm:connect] connect(",ip,":",port,") ...");
        this._socket.connect({
            port: parseInt(port), 
            host: ip
        });

        this._socket.setKeepAlive(true);

        this._socket.setNoDelay(true);

        this._socket.on("close", ()=>{
            logs.log("[comm:connect] event(close)")

            setTimeout(()=>{
                if (false == helper.isNullOrUndefined(connectcb)) {
                    connectcb(false);
                }
            })
        });

        this._socket.on("connect", ()=>{
            logs.log("[comm:connect] event(connect)");
            if (false == helper.isNullOrUndefined(connectcb)) {
                connectcb(true);
            }
        });

        this._socket.on("data", (dat)=>{
            //logs.log("[comm:connect] event(data)[", dat.length,"]");

            if (false == helper.isNullOrUndefined(recvcb)){
                recvcb(dat);
            }
        });

        this._socket.on("drain", ()=>{
            logs.log("[comm:connect] event(drain)");
        });

        this._socket.on("end", ()=>{
            logs.log("[comm:connect] event(end)");
        });

        this._socket.on("error", (err)=>{
            logs.log("[comm:connect] event(error):", err.toString());

            this.disconnect();
        });

        this._socket.on("timeout", ()=>{
            logs.log("[comm:connect] event(timeout)");

            this.disconnect();
        });
    }

    disconnect() {
        logs.log("[comm:disconnect] () >>>");

        if (helper.isNullOrUndefined(this._socket)) {
            logs.log("[comm:disconnect] socket is null.");
            return helper.ERR_SOCK_NULL;
        }

        // Using end(), event(close) will be emitted after 20s. Don't know why.
        //this._socket.end();

        // Using destroy(), event(close) will be emitted immediately.
        this._socket.destroy();
        // Do not reuse old socket, old-socket maybe still working on something.
        this._socket = null;
        return helper.ERR_SOCK_CONNECTING;
    }

    send(bytes) {
        //logs.log("[comm:send] (",bytes,"[",bytes.length,"]) >>>>>");

        if (helper.isNullOrUndefined(this._socket)){
            logs.log("[comm:send] socket is null.");
            return helper.ERR_SOCK_NULL;
        }
        if (this._socket.connecting) {
            logs.log("[comm:send] socket is connecting.");
            return helper.ERR_SOCK_CONNECTING;
        }

        //logs.log("[comm:send] typeof(bytes) is ", typeof(bytes));

        let _buf = Buffer.from(bytes);

        if (true == this._socket.write(_buf)) {
            return helper.ERR_OK;
        } else {
            return helper.ERR_WRITE_FAIL;
        }
    }
}

module.exports = comm;

