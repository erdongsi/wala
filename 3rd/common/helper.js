const crypto = require("crypto");
//const util = require("util");
//const http = require("http");
//const readline = require("readline");
//const child_process = require('child_process');
//const fs = require("fs");
//const zlib = require("zlib");

let helper = {};

// 判断 非空
helper.isNullOrUndefined = function (obj) {
    return (null==obj || undefined==obj) ? true : false;
}
// 转换 datetime 格式为 (本地时间) 字符串
helper.getTimeString = function (dt, dot, noms) {
    if (this.isNullOrUndefined(dt)) {
        dt = new Date();
    }
    if (this.isNullOrUndefined(dot)) {
        dot = ".";
    }
    let time = dt.getFullYear()+this.fillZero(2,dt.getMonth()+1)+this.fillZero(2,dt.getDate())+dot+this.fillZero(2,dt.getHours())+this.fillZero(2,dt.getMinutes())+this.fillZero(2,dt.getSeconds());
    if (true == noms) {
    } else {
        time = time + dot + this.fillZero(3,dt.getMilliseconds());
    }
    return time;
}
// 获得本机 ip4
helper.getLocalIpv4Address = function () {
    let _ret = "";
    let interfaces = require('os').networkInterfaces();
    for(let devName in interfaces) {
          let iface = interfaces[devName];
          for (let i=0; i<iface.length; i++){
               let alias = iface[i];
               if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
                     _ret = alias.address;
               }
          }
    }
    return _ret;
}
// 以 fillchar 来 补齐数字，并转为 字符串
helper.fillZero = function (num, value, fillchar){
    let ret = value.toString();
    let len = ret.length;
    let cha = "0";
    if (false == this.isNullOrUndefined(fillchar)) {
        cha = fillchar.toString();
    }
    while(len < num) {
        ret = cha + ret;
        len++;
    }
    return ret;
}
// 在 [start,end] 之间 随机 获得一个整数
helper.randomNum = function (start,end) {
    let w = Math.max(0, end-start);
    let r = Math.random()*w + start;
    let ret = Math.round(r);
    return ret;
}
// return N个随机字符
const ALPHA = ['0','1','2','3','4','5','6','7','8','9'
    ,'a','b','c','d','e','f','g'
    ,'h','i','j','k','l','m','n'
    ,'o','p','q','r','s','t'
    ,'u','v','w','x','y','z'
    ,'A','B','C','D','E','F','G'
    ,'H','I','J','K','L','M','N'
    ,'O','P','Q','R','S','T'
    ,'U','V','W','X','Y','Z'];
helper.randomKey = function (size) {
    let key = "";
    while (key.length < size) {
        let n = this.randomNum(0, ALPHA.length-1);
        let c = ALPHA[n];
        key += c;
    }
    return key;
}
// 可逆加密，例如 cipher(buf, 'rc4', 'a password'); cipher(buf, 'aes192', 'a password');
helper.cipher = function (buf, algorithm, key) {
    //log("[helper:cipher] (", "buf[",buf.length,"],", algorithm+",", key,") >>>>>");
    //console.time("cipher");
    let cip = crypto.createCipheriv(algorithm, key, null);
    let by_upd = cip.update(Buffer.from(buf));
    //log("by_upd:", by_upd);
    let by_fin = cip.final();
    //log("by_fin:", by_fin);
    //console.timeEnd("cipher");
    return Buffer.concat([by_upd,by_fin], by_upd.length+by_fin.length);
}
// 可逆解密, 例如 decipher(buf, 'rc4', 'a password'); decipher(buf, 'aes192', 'a password');
helper.decipher = function (buf, algorithm, key) {
    //log("[helper:decipher] (", "buf[",buf.length,"],", algorithm+",", key,") >>>>>");
    //console.time("decipher");
    let decip = crypto.createDecipheriv(algorithm, key, null);
    let by_upd = decip.update(Buffer.from(buf));
    //log("by_upd:", by_upd);
    let by_fin = decip.final();
    //log("by_fin:", by_fin);
    //console.timeEnd("decipher");
    return Buffer.concat([by_upd,by_fin], by_upd.length+by_fin.length); 
}

/*helper.setCookie = function (key, value) {
    let jso = {};
    let src = document.cookie;
    //src = "name=abcd";
    let ss = src.split(';');
    ss.forEach((f,i,ary)=>{
        i;
        ary;
        let ff = f.split('=');
        if (ff.length >= 2) {
            jso[ff[0]] = ff[1];
        }
    });
    jso[key] = value;
    let ret = "";
    for (let k in jso) {
        ret += (k+"="+jso[k]+";");
    }
    document.cookie = ret;
}
helper.getCookie = function (key) {
    let jso = {};
    let src = document.cookie;
    //src = "name=abcd";
    let ss = src.split(';');
    ss.forEach((f,i,ary)=>{
        i;
        ary;
        let ff = f.split('=');
        if (ff.length >= 2) {
            jso[ff[0]] = ff[1];
        }
    });
    let ret = "";
    if (helper.isNullOrUndefined(jso[key])) {
        ret = jso[key];
    }
    return ret;
}*/
/*
const HEAD_SIZE = 16;

// 给数字加上千位符
function comdify(num,fixnum) {
    if (null == num) {
        return "";
    }
    if (null == fixnum) {
        fixnum = 0;
    }
    //if (isNaN(num)) {
    //  return "0";
    //}
    var re = /\d{1,3}(?=(\d{3})+$)/g;
    var ret = num.toFixed(fixnum).replace(/^(\d+)((\.\d+)?)$/,function(s,s1,s2){ return s1.replace(re,"$&,")+s2;});
    return ret;
}
// 从content中截取 begin 和 end 之间的 内容
function getPartString(content, begin, end, include_begin, include_end) {

    let v_ret = "";

    if (false == isNullOrUndefined(content) && false == isNullOrUndefined(begin)) {
        let v_begin_index = content.indexOf(begin);
        if (v_begin_index >= 0) {   // 先获得 包含 begin 的 string

            let v_begin_string = content.substring(v_begin_index);
            

            if (isNullOrUndefined(end)) {  // end 有 参数
                
                if (true === include_begin) {
                    v_ret = v_begin_string;
                } else {
                    v_ret = v_begin_string.substring(begin.length);
                }

            } else {    // end 无 参数

                let v_end_index = v_begin_string.indexOf(end, begin.length);

                if (v_end_index < 0) {  // 没有找到 end，按照 无end参数 的情况处理

                    if (true === include_begin) {
                        v_ret = v_begin_string;
                    } else {
                        v_ret = v_begin_string.substring(begin.length);
                    }

                } else {    // 找到 end

                    // v_temp_string: 是 begin 和 end 之间的字串，不包括 begin，不包括 end
                    let v_temp_string = v_begin_string.substring(begin.length, v_end_index);

                    if (true === include_begin) {

                        if (true === include_end) {
                            v_ret = begin.concat(v_temp_string, end);
                        } else {
                            v_ret = begin.concat(v_temp_string);
                        }

                    } else {

                        if (true === include_end) {
                            v_ret = v_temp_string.concat(end);
                        } else {
                            v_ret = v_temp_string;
                        }
                    }

                }
            }
        }
    }

    return v_ret;
}
// 通过 get 方式获取 http 内容
function getHttp(url, timeout, callback) {
    //log("[helper:getHttp](",url,",callback) >>>>>");

    let is_timeout = false;
    let is_error = false;
    let is_res = false;

    http.get(url, (res)=>{
        //log("[helper:getHttp] web res:", res["headers"]);

        //log("[helper:getHttp] res.statusCode:", res.statusCode);

        if (true == is_timeout) {
            logYellow("[helper:getHttp]",url,"timeout, then cancel data!");
            return;
        }
        if (true == is_error) {
            logYellow("[helper:getHttp]",url,"error, then cancel data!");
            return;   
        }

        is_res = true;

        if (200 != res.statusCode) {
            logRed("[helper:getHttp]",url,":", res.statusCode);
            res.resume();
            callback(null, {code:res.statusCode, data:null});
            return;
        }

        //res.setEncoding("utf8");

        let rawData = Buffer.alloc(0);
        res.on("data", (chunk)=>{
            let tot_len = rawData.length + chunk.length;
            rawData = Buffer.concat([rawData,chunk], tot_len);
        });

        res.on("end", ()=>{
            if (true == is_timeout) {
                logYellow("[helper:getHttp]",url,"timeout, [2]then cancel data!");
                return;
            }
            if (true == is_error) {
                logYellow("[helper:getHttp]",url,"error, [2]then cancel data!");
                return;   
            }
            callback(null, {code:res.statusCode, data:rawData});

        }).on("error", (e)=>{
            logRed("[helper:getHttp] e:", e.message);
            is_error = true;
            callback(e, {code:500, data:null});
        });
    }).on("error", (e)=>{
        logRed("[helper:getHttp] e2:", e.message);
        if (is_res) {
            return;
        }
        if (is_timeout) {
            return;
        }
        is_error = true;
        callback(e, {code:501, data:null});
    }).setTimeout(timeout,()=>{
        logYellow("[helper:getHttp] timeout!");
        if (is_res) {
            return;
        }
        if (is_error) {
            return;
        }
        is_timeout = true;
        callback(new Error("timeout"), {code:500, data:null});
    });
}
// 在 [start,end] 之间 随机 获得一个整数
function randomNum(start,end) {
    let w = Math.max(0, end-start);
    let r = Math.random()*w + start;
    let ret = Math.round(r);
    return ret;
}

// 获得 http request 的 ip
function getRequestIp(req) {  
    let ipAddress;  
    let forwardedIpsStr = req.headers['x-forwarded-for'];   
    if (forwardedIpsStr) {  
        let forwardedIps = forwardedIpsStr.split(',');  
        ipAddress = forwardedIps[0];  
    }  
    if (!ipAddress) {  
        ipAddress = req.connection.remoteAddress;  
    }  
    return ipAddress;  
}  
function callApp(param, callback) {
    log("[helper:callApp](", param, ",callback) >>>>>");

    log("process.platform:",process.platform);
    if (process.platform == 'win32') {
        child_process.exec(param, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                //return;
            } else {
                //console.log(`stdout: ${stdout}`);
                //console.log(`stderr: ${stderr}`);
            }
            callback();
        });
    //} else if (process.platform == 'linux') {
    //  cmd = 'xdg-open';
    //} else if (process.platform == 'darwin') {
    //  cmd = 'open';
    } else {
        callback();
    }
}
// 打印内存使用量
function printMem(short) {
    let ret = "";
    let mem = process.memoryUsage();
    if (isNullOrUndefined(short)) {
        ret = (mem.heapTotal/(1000*1000)).toFixed(2)+"M";
        //logYellow(JSON.stringify(mem), ret);
    } else {
        ret = (mem.heapTotal/(1000*1000)).toFixed(2)+"M";
        //logYellow(ret);
    }
    return ret;
}*/
// 不可逆加密，例如 md5加密： data = encrypt('md5', content);
/*helper.encrypt = function (type, content) {
    let ecp = crypto.createHash(type);//定义加密方式:md5不可逆,此处的md5可以换成任意hash加密的方法名称；
    ecp.update(content);
    let ret = ecp.digest('hex');  //加密后的值d
    return ret;
}*/
/*
// buf/string 打包， return buf = head(HEAD_SIZE) + buf;  head = lenSize(4) + key(4) + otherHead;
function enpacket(msg) {
    //log("[helper:enpacket] (", "msg[",msg.length,"]) >>>>>");

    let algorithm = 'rc4';
    let key = randomKey(4);
    //logYellow("[helper:enpacket] key:", key);

    let by_msg = cipher(msg, algorithm, key);
    //by_msg = Buffer.from(by_msg);
    //log("[helper:enpacket] by_msg:", by_msg.length);

    let len = HEAD_SIZE + by_msg.length;
    //log("len:", len);
    let by_len = Buffer.alloc(HEAD_SIZE-4);
    by_len.writeUInt32BE(len, 0);
    //log("by_len:", by_len);
    let by_key = Buffer.from(key);
    //log("by_key:", by_key);
    let by_head = Buffer.concat([by_len,by_key], by_len.length+by_key.length);
    //log("by_head:", by_head);
    let by_send = Buffer.concat([by_head,by_msg], len);
    //log("[helper:enpacket] by_send:", by_send.length);
    //log("[helper:enpacket] by_send:", by_send.toString());

    return by_send;
}
function depacket(recv) {
    //log("[helper:depacket] (","recv[",recv.length+"]) >>>>>");

    let algorithm = 'rc4';    

    if (false == isNullOrUndefined(recv) && recv.length > 0) {
        //log("[helper:depacket] recv:", recv);
        if (recv.length >= HEAD_SIZE) {
            let len = recv.readUInt32BE(0);
            //log("[helper:depacket] len:", len);

            if (recv.length >= len) {
                let by_head = recv.slice(0, HEAD_SIZE);
                let by_key = by_head.slice(-4);
                //log("[helper:depacket] by_key:", by_key);
                let key = by_key.toString();
                //logYellow("[helper:depacket] key:", key);
                
                let by_msg = recv.slice(HEAD_SIZE, len);
                //log("[helper:depacket] msg:", by_msg);

                by_msg = decipher(by_msg, algorithm, key);

                //log("[helper:depacket] msg 2:", by_msg);
                //log("[helper:depacket] msg 3:", by_msg.toString());

                return {buf:by_msg, len};
            } else {
                //logYellow("[helper:depacket] recv < len.");
            }
        } else {
            //logYellow("[helper:depacket] recv < HEAD_SIZE.");
        }
    }
    return {buf:null,len:-1};
}
function gzipFile(filepath, callback) {
    log("[helper:gzipFile] (",filepath+",","callback) >>>>>");

    let inp = fs.createReadStream(filepath);
    let out = fs.createWriteStream(filepath+".gz");
    inp.on('error', (e_inp)=>{
        logRed("[helper:gzipFile] e_inp:", e_inp.message);
        callback(e_inp);
    });
    inp.on('close', ()=>{
        //log("[helper:gzipFile] inp close.");
    });
    inp.on('data', (chunk)=>{
        //log("[helper:gzipFile] inp data:", chunk.length);
    });
    inp.on('end', ()=>{
        log("[helper:gzipFile] inp end.");
    });
    out.on('error', (e_out)=>{
        logRed("[helper:gzipFile] e_out:", e_out.message);
        callback(e_out);
    });
    out.on('drain', ()=>{
        //log("[helper:gzipFile] out drain.");
    });
    out.on('finish', ()=>{
        log("[helper:gzipFile] out finish.");
        callback(null);
    });
    out.on('pipe', ()=>{
        //log("[helper:gzipFile] out pipe.");
    });
    out.on('unpipe', ()=>{
        //log("[helper:gzipFile] out unpipe.");
    });
    inp.pipe(zlib.createGzip()).pipe(out);
}
function sleep(ms) {
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{ resolve(); }, ms);
    });
}
*/

module.exports = helper;
