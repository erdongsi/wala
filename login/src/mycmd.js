
const fs = require("fs");

const logs = require("../../3rd/common/logs");

function doCmd(args) {
    let _ret = [];
    try {
        switch(args[0]){
            default:
                _ret = args;
                break;
        }
    } catch(e) {
        logs.logRed("[mycmder:doCmd] event(line) e:", e.message);
    }
    return _ret;
}

exports.doCmd = doCmd;