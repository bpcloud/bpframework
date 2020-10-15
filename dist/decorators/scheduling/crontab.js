'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const febs = require("febs");
const cron_1 = require("cron");
const logger_1 = require("../../logger");
const utils_1 = require("../../utils");
const LOG_TAG = '[CronTask] ';
const log_interval = 1000 * 60 * 5;
class CronTask {
    constructor(cronTime, interval, intervalType, initialDelay, onTick, moduleName) {
        this._first = true;
        this._logTimestamp = 0;
        this._initialDelay = 0;
        this._initialDelay = initialDelay;
        let ctx = this;
        this._index = 0;
        this._onTick = () => {
            ctx._index++;
            if (Date.now() - ctx._logTimestamp > log_interval) {
                ctx._logTimestamp = Date.now();
                logger_1.getLogger().info(LOG_TAG, `${moduleName}: ${ctx._index}`);
            }
            ctx.stop();
            let newTimestap;
            if (intervalType == 'fixedRate') {
                newTimestap = Date.now();
            }
            onTick()
                .then((res) => {
                if (res === false) {
                    ctx._cronJob = null;
                    ctx._onTick = null;
                    return;
                }
                if (!ctx.isRunning()) {
                    if (intervalType == 'fixedRate') {
                        newTimestap = Date.now() - newTimestap;
                        let surplus = Math.max(interval - newTimestap, 1);
                        ctx._cronJob.setTime(new cron_1.CronTime(new Date(Date.now() + surplus)));
                    }
                    else if (intervalType == 'fixedDelay') {
                        ctx._cronJob.setTime(new cron_1.CronTime(new Date(Date.now() + interval)));
                    }
                    ctx.start();
                }
            })
                .catch((err) => {
                logger_1.getLogger().error(LOG_TAG, `${moduleName}: ` + utils_1.getErrorMessage(err));
                if (!ctx.isRunning()) {
                    if (intervalType == 'fixedRate') {
                        newTimestap = Date.now() - newTimestap;
                        let surplus = Math.max(interval - newTimestap, 1);
                        ctx._cronJob.setTime(new cron_1.CronTime(new Date(Date.now() + surplus)));
                    }
                    else if (intervalType == 'fixedDelay') {
                        ctx._cronJob.setTime(new cron_1.CronTime(new Date(Date.now() + interval)));
                    }
                    ctx.start();
                }
            });
        };
        let realCronTime;
        if (intervalType == 'cron') {
            realCronTime = cronTime;
        }
        else {
            realCronTime = new Date();
            realCronTime.setTime(9999999999999);
        }
        this._cronJob = new cron_1.CronJob(realCronTime, this._onTick, null, false, null, null, false);
    }
    start() {
        if (this._first) {
            this._first = false;
            if (this._initialDelay == 0) {
                this._onTick();
            }
            else {
                febs.utils.sleep(this._initialDelay).then(() => {
                    this._onTick();
                });
            }
            return;
        }
        if (this._cronJob)
            this._cronJob.start();
    }
    stop() {
        if (this._cronJob)
            this._cronJob.stop();
    }
    isRunning() {
        return this._cronJob ? this._cronJob.running : false;
    }
}
exports.default = CronTask;
//# sourceMappingURL=crontab.js.map