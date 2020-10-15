'use strict'

/**
 * Copyright (c) 2019 Copyright bp All Rights Reserved.
 * Author: lipengxiang
 * Date: 2019-11-26 18:52
 * Desc: 定时任务.
 */

import * as febs from 'febs';
import { CronJob, CronTime } from 'cron'
import { getLogger } from '../../logger'
import { getErrorMessage } from '../../utils'

const LOG_TAG = '[CronTask] '
const log_interval = 1000 * 60 * 5

export default class CronTask {
  private _cronJob: CronJob
  private _index: number
  private _onTick: any
  private _first: boolean = true
  private _logTimestamp: number = 0
  private _initialDelay: number = 0;

  constructor(
    cronTime: string | Date,
    interval: number,
    intervalType: 'cron' | 'fixedDelay' | 'fixedRate',
    initialDelay: number,
    onTick: () => Promise<false|void>,
    moduleName: string
  ) {
    this._initialDelay = initialDelay;

    let ctx = this
    this._index = 0

    this._onTick = () => {
      ctx._index++
      if (Date.now() - ctx._logTimestamp > log_interval) {
        ctx._logTimestamp = Date.now()
        getLogger().info(LOG_TAG, `${moduleName}: ${ctx._index}`)
      }

      ctx.stop()

      let newTimestap:number;
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
            // fixedRate.
            if (intervalType == 'fixedRate') {
              newTimestap = Date.now() - newTimestap;
              let surplus = Math.max(interval - newTimestap, 1);
              ctx._cronJob.setTime(new CronTime(new Date(Date.now() + surplus)));
            }
            // fixedDelay.
            else if (intervalType == 'fixedDelay') {
              ctx._cronJob.setTime(new CronTime(new Date(Date.now() + interval)));
            }
            ctx.start()
          }
        })
        .catch((err) => {
          getLogger().error(
            LOG_TAG, `${moduleName}: ` + getErrorMessage(err),
          )

          if (!ctx.isRunning()) {
            // fixedRate.
            if (intervalType == 'fixedRate') {
              newTimestap = Date.now() - newTimestap;
              let surplus = Math.max(interval - newTimestap, 1);
              ctx._cronJob.setTime(new CronTime(new Date(Date.now() + surplus)));
            }
            // fixedDelay.
            else if (intervalType == 'fixedDelay') {
              ctx._cronJob.setTime(new CronTime(new Date(Date.now() + interval)));
            }
            ctx.start()
          }
        })
    }

    let realCronTime;
    if (intervalType == 'cron') {
      realCronTime = cronTime;
    }
    else {
      realCronTime = new Date();
      realCronTime.setTime(9999999999999);
    }

    this._cronJob = new CronJob(
      realCronTime,
      this._onTick,
      null,
      false,
      null,
      null,
      false
    )
  }

  start() {
    if (this._first) {
      this._first = false
      if (this._initialDelay == 0) {
        this._onTick()
      }
      else {
        febs.utils.sleep(this._initialDelay).then(() => {
          this._onTick();
        });
      }
      return
    }
    if (this._cronJob) this._cronJob.start()
  }
  stop() {
    if (this._cronJob) this._cronJob.stop()
  }
  isRunning() {
    return this._cronJob ? this._cronJob.running : false
  }
}
