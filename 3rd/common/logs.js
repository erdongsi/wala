const fs = require("fs");
const path = require("path");
const util = require("util");

const helper = require('./helper');

const ANSI_VT100_COLOR = {
    'bold'      : '\x1B[1m',
    'dim'       : '\x1B[2m',  
    'underlined'    : '\x1B[4m',
    'blink'     : '\x1B[5m',    // 闪烁
    'inverted'  : '\x1B[7m',
    'hidden'    : '\x1B[8m',

    'ret all'   : '\x1B[0m',  // 重置
    'normal'    : '\x1B[21m',
    'normal22'  : '\x1B[22m',
    'normal24'  : '\x1B[24m',
    'normal25'  : '\x1B[25m',
    'normal27'  : '\x1B[27m',
    'normal28'  : '\x1B[28m',

    'default'   : '\x1B[39m',
    'black'     : '\x1B[30m',
    'red'       : '\x1B[31m',
    'green'     : '\x1B[32m',
    'yellow'    : '\x1B[33m',
    'blue'      : '\x1B[34m',
    'magenta'   : '\x1B[35m',
    'cyan'      : '\x1B[36m',
    'lightgray' : '\x1B[37m',
    'darkgray'  : '\x1B[90m',
    'lightred'  : '\x1B[91m',
    'lightgreen'    : '\x1B[92m',
    'lightyellow'   : '\x1B[93m',
    'lightblue' : '\x1B[94m',
    'lightmagenta'  : '\x1B[95m',
    'lightcyan' : '\x1B[96m',
    'white'     : '\x1B[97m',

    'bgdefault'   : '\x1B[49m',
    'bgblack'     : '\x1B[40m',
    'bgred'       : '\x1B[41m',
    'bggreen'     : '\x1B[42m',
    'bgyellow'    : '\x1B[43m',
    'bgblue'      : '\x1B[44m',
    'bgmagenta'   : '\x1B[45m',
    'bgcyan'      : '\x1B[46m',
    'bglightgray' : '\x1B[47m',
    'bgdarkgray'  : '\x1B[100m',
    'bglightred'  : '\x1B[101m',
    'bglightgreen'    : '\x1B[102m',
    'bglightyellow'   : '\x1B[103m',
    'bglightblue' : '\x1B[104m',
    'bglightmagenta'  : '\x1B[105m',
    'bglightcyan' : '\x1B[106m',
    'bgwhite'     : '\x1B[107m',
}

class logs {

    static getInst() {
        if (helper.isNullOrUndefined(logs.inst)) {
            logs.inst = new logs();
        }
        return logs.inst;
    }
    constructor() {
        this._name = "logs";
        this._lst = [];
        this._logger = null;
        this.stream_output = null;
        this._logging = false;
        this._MAX_LOG = 1000*1000;    // if one log is about 128 bytes, 1000*128 = 128K, 128k*100 = 12.8M.
        this._log_num = 0;
        this._history_logs = [];
        this._ids = "";
        this._clean_log_num = 36;
    }
    setID(ids, cln) {
        if (false == helper.isNullOrUndefined(ids)) {
            if (this._ids != ids) {
                this._ids = ids;
                this._logger = null;
            }
        }
        if (false == helper.isNullOrUndefined(cln)) {
            this._clean_log_num = cln;
        }
    }
    log(ary) {
        this._lst.push(ary);

        setImmediate(()=>{ this.doLogs(); });
    }
    doLogs() {
        //console.log("[logs:doLogs] () >>>>>", this._logging, this._lst.length);
        if (this._logging) {
            return;
        }
        this._logging = true;

        if (helper.isNullOrUndefined(this._logger)) {
            this.createLogger((e_chk)=>{
                if (e_chk) { this.logRed("[logs:doLogs] e_chk:", e_chk.message); }

                this._logging = false;

                //console.log("[logs:doLogs] () ------- 0:", this._logging, this._lst.length);
            });
        } else {
            while(this._lst.length > 0) {
                let ary = this._lst.shift();
                let s = "";
                ary.forEach((f)=>{
                    try {
                        s += (f + " ");
                    } catch (e) {
                        s += ("[object.no.string]" + " ");
                    }
                });
                this._logger.log(s);

                //this._logger.log(ary);

                this._log_num += 1;
                
                //helper.log("log_cnt:", log_cnt, ", lst", lst.length);
                if (this._log_num >= this._MAX_LOG) {
                    this._logger = null;
                    break;
                }
            }
            this._logging = false;
            //console.log("[logs:doLogs] _log_num:", this._log_num);
            //console.log("[logs:doLogs] () -------- 1:", this._logging, this._lst.length);
        }
    }
    createLogger(callback) {
        //helper.log("[logs:createLogger] (callback) >>>>>");
        let folder = path.resolve(__dirname,'../../logs/');
        if (false == fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
        if (false == fs.existsSync(folder)) {
            callback(new Error("Log folder not exist:", folder));
        } else {
            let log_file = folder + "/" + "log_" + this._ids +"_" + helper.getTimeString();
            logs.logYellow("[logs:createLogger] new log_file:", log_file);

            this._history_logs.push(log_file);
            setTimeout(()=>{ this.cleanHistory(); }, 1000);

            if (false == helper.isNullOrUndefined(this.stream_output)) {
                this.stream_output.end();
                let h_tmp = this.stream_output;
                setTimeout(()=>{
                    h_tmp.destroy();
                },1000);
            }
            this.stream_output = fs.createWriteStream(log_file);

            this._logger = new console.Console(this.stream_output);
            this._log_num = 0;

            callback(null);
        }
    }
    cleanHistory() {
        let more = this._history_logs.length - this._clean_log_num;
        if (more > 0 && more < this._history_logs.length-1) {
            for (let i = 0; i < more; i++) {
                let f = this._history_logs.shift();
                if (false == helper.isNullOrUndefined(f)) {
                    fs.unlink(f, (e_unl)=>{
                        if (e_unl) {
                            this.logRed("["+this._name+":cleanHistory] e_unl:", e_unl.message);
                        } else {
                            this.log("["+this._name+":cleanHistory] remove:", f);
                        }
                    });
                }
            }
        }
    }
    static logConsole() {
        let sfmt = util.format.apply(null, arguments);
        console.log(ANSI_VT100_COLOR['white'], sfmt, ANSI_VT100_COLOR['white']);

        logs.getInst().log([sfmt]);
    }
    static logConsoleGreen() {
        let sfmt = util.format.apply(null, arguments);
        console.log(ANSI_VT100_COLOR['lightgreen'], sfmt, ANSI_VT100_COLOR['white']);

        logs.getInst().log([sfmt]);
    }
    static logConsoleRed() {
        let sfmt = util.format.apply(null, arguments);
        console.log(ANSI_VT100_COLOR['lightred'], sfmt, ANSI_VT100_COLOR['white']);

        logs.getInst().log([sfmt]);
    }
    static logConsoleYellow() {
        let sfmt = util.format.apply(null, arguments);
        console.log(ANSI_VT100_COLOR['lightyellow'], sfmt, ANSI_VT100_COLOR['white']);

        logs.getInst().log([sfmt]);
    }
    static logLine() {
        let stdout = process.stdout;
        readline.clearLine(stdout, 0);
        readline.cursorTo(stdout, 0);
        let op = "";
        for (let i = 0; i < arguments.length; i++) {
            op += (arguments[i]);
        }
        stdout.write(op);
    }
    static log() {
        let sfmt = util.format.apply(null,arguments);
        let t = helper.getTimeString();
        console.log(ANSI_VT100_COLOR['white'], t, ANSI_VT100_COLOR['white'], sfmt);

        logs.getInst().log([t, sfmt]);
    }
    static logGreen() {
        let sfmt = util.format.apply(null,arguments);
        let t = helper.getTimeString();
        console.log(ANSI_VT100_COLOR['white'], t, ANSI_VT100_COLOR['lightgreen'], sfmt, ANSI_VT100_COLOR['white']);

        logs.getInst().log([t, sfmt]);
    }
    static logRed() {
        let sfmt = util.format.apply(null,arguments);
        let t = helper.getTimeString();
        console.log(ANSI_VT100_COLOR['white'], t, ANSI_VT100_COLOR['lightred'], sfmt, ANSI_VT100_COLOR['white']);

        logs.getInst().log([t, sfmt]);
    }
    static logYellow() {
        let sfmt = util.format.apply(null,arguments);
        let t = helper.getTimeString();
        console.log(ANSI_VT100_COLOR['white'], t, ANSI_VT100_COLOR['lightyellow'], sfmt, ANSI_VT100_COLOR['white']);

        logs.getInst().log([t, sfmt]);
    }
}

module.exports = logs;
