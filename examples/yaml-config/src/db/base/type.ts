'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2017-06-12
* Desc: 
*/

import * as febsdb  from 'febs-db';
import * as febs from 'febs';

export default {
  NULL        : febsdb.dataType.NULL(),
  ID          : febsdb.dataType.Char(20),
  TICK        : febsdb.dataType.BigInt(false),
  URL         : febsdb.dataType.NVarChar(512),
  IP          : febsdb.dataType.NVarChar(40),
  CURRENCY    : febsdb.dataType.BigInt(),
  TIME        : febsdb.dataType.DateTime(),
  ...febsdb.dataType,
};