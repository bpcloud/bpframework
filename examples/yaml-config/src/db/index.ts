'use strict';

/**
 * Copyright (c) 2017 Copyright tj All Rights Reserved.
 * Author: lipengxiang
 * Desc:
 */

import * as febs from 'febs';
import {dbdatabase} from './base';


import v_admin from './v_admin';

/**
* @desc: Database
*/
export default class Database extends dbdatabase {

  constructor(cfg: any) {
    
    // create.
    super(febs.utils.mergeMap(cfg));

    this.v_admin = new (v_admin)();
    this.registerTable(this.v_admin);
  }

  v_admin: v_admin;
}

