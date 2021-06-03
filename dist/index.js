'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitmq = exports.getErrorMessage = exports.LogLevel = void 0;
const debugFeignClientValue = Symbol('debugFeignClientValue');
const enableScheduled = Symbol('enableScheduled');
let old__debugFeignClient = global['__debugFeignClient'];
if (!global.hasOwnProperty('__debugFeignClient')) {
    Object.defineProperty(global, '__debugFeignClient', {
        get: function () {
            if (typeof global[debugFeignClientValue] !== 'boolean') {
                return old__debugFeignClient;
            }
            else {
                return !!global[debugFeignClientValue];
            }
        },
        set: function (isDebug) {
            global[debugFeignClientValue] = isDebug;
        }
    });
}
let old__enableScheduled = global['__enableScheduled'];
if (!global.hasOwnProperty('__enableScheduled')) {
    Object.defineProperty(global, '__enableScheduled', {
        get: function () {
            if (typeof global[enableScheduled] !== 'boolean') {
                return old__enableScheduled;
            }
            else {
                return !!global[enableScheduled];
            }
        },
        set: function (isDebug) {
            global[enableScheduled] = !!isDebug;
        }
    });
}
__exportStar(require("./Application"), exports);
__exportStar(require("./decorators/configure"), exports);
__exportStar(require("./decorators/events"), exports);
__exportStar(require("./decorators/scheduling"), exports);
__exportStar(require("./decorators/BpApplication"), exports);
var logger_1 = require("./logger");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logger_1.LogLevel; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "getErrorMessage", { enumerable: true, get: function () { return utils_1.getErrorMessage; } });
var mq_1 = require("./mq");
Object.defineProperty(exports, "rabbitmq", { enumerable: true, get: function () { return mq_1.rabbitmq; } });
__exportStar(require("./springframework"), exports);
//# sourceMappingURL=index.js.map