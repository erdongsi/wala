
const helper = require("../3rd/common/helper");
const cmd = require("../3rd/common/cmd");
const logs = require("../3rd/common/logs");

const dataserver = require("../3rd/dataserver/dataserver");

const mycmd = require("./src/mycmd");

const clientmgr = require("./src/clientmgr");

const MOD_NAME = "wala.clientmgr";

logs.getInst().setID(MOD_NAME,2);

// 0.make mycmd
cmd.start(mycmd.doCmd);

// 1.create data server
let _ip = helper.getLocalIpv4Address();
let _port = 9000;
let _data_server = new dataserver();
_data_server.create(_ip, _port);

// n.register modules.
_data_server.registerApplication(clientmgr.getInst());

logs.log("["+MOD_NAME+"]", "running:", _ip, _port);
