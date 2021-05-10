'use strict'

/**
 * Copyright (c) 2017 Copyright tj All Rights Reserved.
 * Author: lipengxiang
 * Desc:
 */

import * as febs from 'febs'
import {identity} from '@originforest/common'
import logger from '@/common/libs/logger'
import * as database from 'febs-db'

export default class Database extends database.database {
  /**
   * @desc: 生成id.
   */
  static generateId(): string {
    let id = identity.nextId();

    if(identity.isValidId(id))
      return id;

    return this.generateId();
  }

  /**
   * @desc: 日志回调.
   */
  static logCallback(err: any, sql: string, isTransactionBeginOrEnd: boolean) {
    // logger.db_log(null, sql)
    if (err) {
      // logger.db_err(null, err);
    } else {
      // 记录事务开始结束.
      if (isTransactionBeginOrEnd) {
        logger.db_log(
          null,
          sql + '\r\n[TRANSACTION]==============================='
        )
      }
      // if (__debug)
      //   moduleLog.db_log(null, sql);
    }
  }

  constructor(cfg: any) {
    // create.
    super(cfg.type, cfg, Database.generateId)
    this.sqlLogCallback = Database.logCallback
  }
}
