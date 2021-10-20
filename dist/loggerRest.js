'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.logFeignClient = exports.logRest = exports.setRestLoggerLevel = exports.setFeignLoggerLevel = exports.RestLogLevel = void 0;
const febs = require("febs");
const bplogger = require("./logger");
const utils_1 = require("./utils");
const BP_LOG_LEVEL_REST = Symbol('BP_LOG_LEVEL_REST');
const BP_LOG_LEVEL_FEIGN = Symbol('BP_LOG_LEVEL_FEIGN');
var RestLogLevel;
(function (RestLogLevel) {
    RestLogLevel["NONE"] = "NONE";
    RestLogLevel["BASIC"] = "BASIC";
    RestLogLevel["HEADERS"] = "HEADERS";
    RestLogLevel["FULL"] = "FULL";
})(RestLogLevel = exports.RestLogLevel || (exports.RestLogLevel = {}));
function setFeignLoggerLevel(level) {
    global[BP_LOG_LEVEL_FEIGN] = (level || RestLogLevel.BASIC).toUpperCase();
}
exports.setFeignLoggerLevel = setFeignLoggerLevel;
function setRestLoggerLevel(level) {
    global[BP_LOG_LEVEL_REST] = (level || RestLogLevel.BASIC).toUpperCase();
}
exports.setRestLoggerLevel = setRestLoggerLevel;
function logRest(request, response, interval) {
    const logger = bplogger.getLogger();
    const logLevel = global[BP_LOG_LEVEL_REST] || RestLogLevel.BASIC;
    try {
        if (logLevel == RestLogLevel.NONE) {
            return;
        }
        else if (logLevel == RestLogLevel.BASIC) {
            logger.info(logBasic('[RestController]', request.ip, request, response, interval, null));
        }
        else if (logLevel == RestLogLevel.HEADERS) {
            logger.info(logHeaders('[RestController]', request.ip, request, response, interval, null));
        }
        if (logLevel == RestLogLevel.FULL) {
            if (response && response.body) {
                response = febs.utils.mergeMap(response, { body: (0, utils_1.getErrorMessage)(response.body) });
            }
            logger.info(logFull('[RestController]', request.ip, request, response, interval));
        }
    }
    catch (e) {
        console.error('logFeignClient error');
        console.error(e);
    }
}
exports.logRest = logRest;
function logFeignClient(request, response, interval) {
    const logger = bplogger.getLogger();
    const logLevel = global[BP_LOG_LEVEL_FEIGN] || RestLogLevel.BASIC;
    try {
        if (logLevel == RestLogLevel.NONE) {
            return;
        }
        else if (logLevel == RestLogLevel.BASIC) {
            logger.info(logBasic('[FeignClient]', '0.0.0.0', request, response, interval, null));
        }
        else if (logLevel == RestLogLevel.HEADERS) {
            logger.info(logHeaders('[FeignClient]', '0.0.0.0', request, response, interval, null));
        }
        else if (logLevel == RestLogLevel.FULL) {
            logger.info(logFull('[FeignClient]', '0.0.0.0', request, response, interval));
        }
    }
    catch (e) {
        console.error('logFeignClient error');
        console.error(e);
    }
}
exports.logFeignClient = logFeignClient;
function logBasic(prefix, ip, request, response, interval, cb) {
    let msg = prefix + '\n' + `[${ip}] ---> ${request.method} ${decodeURIComponent(request.url)} HTTP/1.1\n`;
    if (cb) {
        msg = cb(msg);
    }
    if (!response.err) {
        msg += `[${ip}] <--- HTTP/1.1 ${response.status} (${interval}ms)\n`;
    }
    else {
        msg += (0, utils_1.getErrorMessage)(response.err);
    }
    return msg;
}
function logHeaders(prefix, ip, request, response, interval, cb) {
    let msg = logBasic(prefix, ip, request, response, interval, (msg1) => {
        if (request.headers) {
            for (const key in request.headers) {
                let val = request.headers[key];
                if (!Array.isArray(val))
                    val = [val];
                for (let i = 0; i < val.length; i++) {
                    msg1 += ` ${key}: ${val[i]}\n`;
                }
            }
        }
        msg1 += `[${ip}] ---> END HTTP\n`;
        return msg1;
    });
    if (response.err) {
        return msg;
    }
    if (response.headers) {
        if (typeof response.headers.forEach === 'function') {
            response.headers.forEach(function (val, key) {
                if (!Array.isArray(val))
                    val = [val];
                for (let i = 0; i < val.length; i++) {
                    msg += (` ${key}: ${val[i]}\n`);
                }
            });
        }
        else {
            for (const key in response.headers) {
                let val = response.headers[key];
                if (!Array.isArray(val))
                    val = [val];
                for (let i = 0; i < val.length; i++) {
                    msg += (` ${key}: ${val[i]}\n`);
                }
            }
        }
    }
    if (cb) {
        msg = cb(msg);
    }
    msg += `[${ip}] <--- END HTTP\n`;
    return msg;
}
function logFull(prefix, ip, request, response, interval) {
    return logHeaders(prefix, ip, request, response, interval, (msg) => {
        if (response.err) {
            return msg;
        }
        msg += (`[content]\n`);
        if (response.body) {
            if (typeof response.body === 'object') {
                let contentType;
                if (typeof response.headers.get === 'function') {
                    contentType = response.headers.get('content-type') || null;
                }
                else {
                    contentType = response.headers['content-type'] || null;
                }
                if (Array.isArray(contentType)) {
                    contentType = contentType[0];
                }
                contentType = contentType ? contentType.toLowerCase() : contentType;
                if (contentType.indexOf('application/json') >= 0) {
                    msg += JSON.stringify(response.body) + '\n';
                }
                else {
                    msg += (` blob...\n`);
                }
            }
            else {
                msg += (response.body) + '\n';
            }
        }
        return msg;
    });
}
//# sourceMappingURL=loggerRest.js.map