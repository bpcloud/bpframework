'use strict';


/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-03 14:54
* Desc: 
*/

import * as febs from 'febs';
import { getEnableScheduled } from '../../global';
import { pushEvent } from "../decoratorGlobal";
import CronTask from './crontab';

/**
 * 定义定时任务. 修饰的方法必须返回 Promise
 * 
 * @example
 * 
 *    class Task {
 *      // 返回false则停止任务.
 *      ﹫Scheduled()
 *      onScheduled(): Promise<false|any> {
 *      }
 *    }
 * @param cfg cron,fixedDelay,fixedRate必须且仅使用一种.
 */
export function Scheduled(cfg: {
  /** task执行的间隔时间 (按照crontask间隔时间格式指定, 例如: * 0 * * * *) */
  cron?: string,
  /** 指定一个task结束后到下一次task开始的固定间隔; milliseconds */
  fixedDelay?: number,
  /** 指定两次task执行的固定间隔, 此间隔时间包含task的执行时间, 如果执行时间超过fixedRate, 则task结束时立即执行下一次task; milliseconds */
  fixedRate?: number,
  /** 首次执行task需要等待的时间; milliseconds */
  initialDelay?: number,
}): MethodDecorator {

  let cronnum = (!!cfg.cron ? 1 : 0) + (!!cfg.fixedDelay ? 1 : 0) + (!!cfg.fixedRate ? 1 : 0);
  if (cronnum > 1 || cronnum <= 0) {
    throw new Error('@Scheduled must only use one schedule type')
  }

  return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {

    if (!getEnableScheduled()) {
      return;
    }
    
    let method = descriptor.value;
    let type: any = !!cfg.cron ? 'cron' : (!!cfg.fixedDelay ? 'fixedDelay' : 'fixedRate');
    
    let cron = new CronTask(
      cfg.cron,
      !!cfg.fixedDelay ? cfg.fixedDelay : cfg.fixedRate,
      type,
      cfg.initialDelay || 0, 
      async () => { 
        let f = method.apply(target);
        if (f instanceof Promise) {
          f = await f;
        }
        return f;
      },
      propertyKey.toString(),
    );
    pushEvent('Scheduled', cron);
    cron.start();
  };
}