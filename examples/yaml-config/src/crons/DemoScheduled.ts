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

  @Scheduled({cron: '* 0 * * * *'})
  onTask(): Promise<false|any> {
    console.log('tick');
    return null;
  }
}