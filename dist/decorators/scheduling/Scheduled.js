'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduled = void 0;
const global_1 = require("../../global");
const decoratorGlobal_1 = require("../decoratorGlobal");
const crontab_1 = require("./crontab");
function Scheduled(cfg) {
    let cronnum = (!!cfg.cron ? 1 : 0) + (!!cfg.fixedDelay ? 1 : 0) + (!!cfg.fixedRate ? 1 : 0);
    if (cronnum > 1 || cronnum <= 0) {
        throw new Error('@Scheduled must only use one schedule type');
    }
    return (target, propertyKey, descriptor) => {
        if (!global_1.getEnableScheduled()) {
            return;
        }
        let method = descriptor.value;
        let type = !!cfg.cron ? 'cron' : (!!cfg.fixedDelay ? 'fixedDelay' : 'fixedRate');
        let cron = new crontab_1.default(cfg.cron, !!cfg.fixedDelay ? cfg.fixedDelay : cfg.fixedRate, type, cfg.initialDelay || 0, () => __awaiter(this, void 0, void 0, function* () {
            let f = method.apply(target);
            if (f instanceof Promise) {
                f = yield f;
            }
            return f;
        }), propertyKey.toString());
        decoratorGlobal_1.pushEvent('Scheduled', cron);
        cron.start();
    };
}
exports.Scheduled = Scheduled;
//# sourceMappingURL=Scheduled.js.map