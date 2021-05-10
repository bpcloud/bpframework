'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2017-06-16
* Desc: 定义数据表基类.
*/


import * as febs from 'febs';
import dbtablebase from './tablebase';
import ITableBase from './ITablebase';
import Database from './database';

/**
* @desc: 
*/
export default class extends dbtablebase implements ITableBase {
  get db(): Database {
    return <Database>super.db;
  }
}
