const fs = require("fs");

const helper = require("../3rd/common/helper");
const logs = require("../3rd/common/logs");
const cmd = require("../3rd/common/cmd");
const comm = require("../3rd/common/comm");

const protopacket = require("../3rd/protopacket/protopacket");
const protoformat = require("../3rd/protoformat/protoformat");
const defines = require("../3rd/defines/defines");

const mycmd = require("./src/mycmd");

cmd.start(mycmd.doCmd);

let _ip = helper.getLocalIpv4Address();
let _port = 9000;

let _comm = new comm();

function connect() {
    _comm.connect(_ip, _port, (b)=>{
        logs.log("[test:connect] connect:", b);
    }, (recv)=>{
        //logs.log("[test] recv data:", recv.length);
        logs.log("[test] recv data:", recv.length, recv);

        let pack = protopacket.depacket(recv);
        if (pack.len > 0) {
            let fmt = protoformat.deformat(pack.msg);
            if (false == helper.isNullOrUndefined(fmt)) {
                pack.fmt = fmt;
            }
            logs.log("[test:recv]", pack);
        }
    });
}
function send(args) {
    let jso = {};
    args.forEach((arg,i,a)=>{
        let kv = arg.split('=');
        jso[kv[0]] = helper.isNullOrUndefined(kv[1]) ? "" : kv[1];
    });
    //logs.log("[test:send] jso", jso);
    //logs.log("[test:send] s_jso:", JSON.stringify(jso));
    sendJson(jso);
}
function sendJson(jso) {
    let raw = JSON.stringify(jso);
    logs.log("[test:sendJson] jso:", raw);
    let buf = protopacket.enpacket(raw);
    logs.log("[test:sendJson] buf:", buf.length, buf);
    _comm.send(buf);
    //let pack = protopacket.depacket(buf);
    //logs.log("[test:send] pack:", pack);
    //let msg = protoformat.deformat(pack.buf);
    //logs.log("[test:send] msg:", msg);
}
function test(args) {
    if ("login" == args[0]) {
        setTimeout(()=>{ sendJson({cmd:defines.LOGINMGR.LOGIN.REGISTER}); }, 1);
    }
    if ("info" == args[0]) {
        setTimeout(()=>{ sendJson({cmd:defines.LOGINMGR.LOGIN.INFO, info:helper.randomNum(0,100)}); }, 1);
    }
    if ("client" == args[0]) {
        setTimeout(()=>{ sendJson({cmd:defines.LOGINMGR.CLIENT.REGISTER}); }, 1);
        setTimeout(()=>{ sendJson({cmd:defines.LOGINMGR.CLIENT.LISTLOGIN}); }, 3000);
    }
    if ("get" == args[0]) {
        setTimeout(()=>{ sendJson({cmd:defines.LOGINMGR.CLIENT.GETFREELOGIN}); }, 1);
    }
}
function close() {
    _comm.disconnect();
}

exports.connect = connect;
exports.send = send;
exports.test = test;
exports.close = close;

