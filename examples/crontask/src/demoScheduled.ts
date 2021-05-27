'use strict';


/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-11 14:42
* Desc: 
*/

import { Scheduled, Service } from "bpframework";

@Service()
class DemoScheduled {

  /**
   * 使用cron参数来定义定时器.
   */
  @Scheduled({cron: '0 * * * * *'})
  onTaskByCron(): Promise<false|any> {
    console.log('onTaskByCron tick', new Date().toISOString());
    return null;  // 明确返回 false 时, task将停止; 否则周期性进入方法.
  }

  /**
   * 使用fixedDelay参数来定义定时器.
   * 指定一个task结束后到下一次task开始的固定间隔; milliseconds
   */
  @Scheduled({fixedDelay: 1000})
  onTaskByFixedDelay(): Promise<false|any> {
    console.log('onTaskByFixedDelay tick', new Date().toISOString());
    return null;
  }

  /**
   * 使用fixedRate参数来定义定时器.
   * 指定两次task执行的固定间隔, 此间隔时间包含task的执行时间, 如果执行时间超过fixedRate, 则task结束时立即执行下一次task; milliseconds
   */
  @Scheduled({fixedRate: 2000})
  onTaskByFixedRate(): Promise<false|any> {
    console.log('onTaskByFixedRate tick', new Date().toISOString());
    return null;
  }

  /**
   * 使用initialDelay指定首次执行所需的等待时间.
   */
  @Scheduled({fixedRate: 3000, initialDelay: 5000})
  onTaskByInitialDelay(): Promise<false|any> {
    console.log('onTaskByInitialDelay tick', new Date().toISOString());
    return null;
  }
}
