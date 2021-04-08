'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLogLevel = exports.getLogLevel = exports.setLogger = exports.getLogger = exports.LogLevel = exports.LOG_TAG = void 0;
const utils_1 = require("./utils");
const BP_LOGGER_INSTANCE = Symbol('BP_LOGGER_INSTANCE');
const BP_LOG_LEVEL = Symbol('BP_LOG_LEVEL');
exports.LOG_TAG = '[bpframework] ';
const DefaultLogger = {
    error(...msg) {
        console.error(...msg);
    },
    info(...msg) {
        console.log(...msg);
    },
    warn(...msg) {
        console.warn(...msg);
    },
    debug(...msg) {
        console.debug(...msg);
    }
};
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
function getLogger() {
    return getLoggerInstance();
}
exports.getLogger = getLogger;
function setLogger(logger) {
    global[BP_LOGGER_INSTANCE] = logger;
}
exports.setLogger = setLogger;
function getLogLevel() {
    return global[BP_LOG_LEVEL] || LogLevel.DEBUG;
}
exports.getLogLevel = getLogLevel;
function setLogLevel(level) {
    global[BP_LOG_LEVEL] = level || LogLevel.DEBUG;
}
exports.setLogLevel = setLogLevel;
function getLoggerInstance() {
    return {
        error(...msg) {
            const logger = global[BP_LOGGER_INSTANCE] || DefaultLogger;
            let m = '';
            for (let i = 0; i < msg.length; i++) {
                m += utils_1.getErrorMessage(msg[i]) + ' ';
            }
            logger.error(m);
        },
        info(...msg) {
            const logLevel = global[BP_LOG_LEVEL];
            if (logLevel == LogLevel.WARN || logLevel == LogLevel.ERROR) {
                return;
            }
            const logger = global[BP_LOGGER_INSTANCE] || DefaultLogger;
            let m = '';
            for (let i = 0; i < msg.length; i++) {
                m += utils_1.getErrorMessage(msg[i]) + ' ';
            }
            logger.info(m);
        },
        warn(...msg) {
            const logLevel = global[BP_LOG_LEVEL];
            if (logLevel == LogLevel.ERROR) {
                return;
            }
            const logger = global[BP_LOGGER_INSTANCE] || DefaultLogger;
            let m = '';
            for (let i = 0; i < msg.length; i++) {
                m += utils_1.getErrorMessage(msg[i]) + ' ';
            }
            logger.warn(m);
        },
        debug(...msg) {
            const logLevel = global[BP_LOG_LEVEL];
            if (logLevel == LogLevel.DEBUG) {
                const logger = global[BP_LOGGER_INSTANCE] || DefaultLogger;
                let m = '';
                for (let i = 0; i < msg.length; i++) {
                    m += utils_1.getErrorMessage(msg[i]) + ' ';
                }
                logger.debug(m);
            }
        }
    };
}
//# sourceMappingURL=logger.js.map