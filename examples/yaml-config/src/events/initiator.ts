'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import * as febs from 'febs';
import { ImmutableKeyMap } from 'bpframework';
import { logger } from '@/libs/logger';

/**
* @desc 系统初始化器.
*/
export class Initiator {
  init(cfg: ImmutableKeyMap<any>): Promise<void> {

    //
    // uncaughtException
    process.on('uncaughtException', function (err) {
      console.error(err);
    });
    
    //
    // initial.
    logger.install(cfg['spring.application.name'], cfg['bp.loggerDir']);

    return;
  }
}