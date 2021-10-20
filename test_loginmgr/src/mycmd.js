
const fs = require("fs");

const logs = require("../../3rd/common/logs");
const test = require("../test");

function doCmd(args) {
    let _ret = [];
    try {
        switch(args[0]){
            case 'connect':
                setTimeout(()=>{ test.connect(); }, 1);
                break;
            case 'send':
                setTimeout(()=>{ test.send(args.slice(1)); }, 1);
                break;
            case 'close':
                setTimeout(()=>{ test.close(); }, 1);
                break;
            case 'test':
                setTimeout(()=>{ test.test(args.slice(1)); }, 1);
                break;
            default:
                _ret = args;
                break;
        }
    } catch(e) {
        logs.logRed("[mycmd:doCmd] event(line) e:", e.message);
    }
    return _ret;
}

exports.doCmd = doCmd;