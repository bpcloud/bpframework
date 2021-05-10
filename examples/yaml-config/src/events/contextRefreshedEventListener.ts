'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { Service, ContextRefreshedEvent, ContextRefreshedEventListener } from "bpframework";
import { Initiator } from "./initiator";

@Service()
class Events {

  /**
   * 系统加载完成事件.
   * @param ev 
   */
  @ContextRefreshedEventListener
  async onContextRefreshedEvent(ev: ContextRefreshedEvent) {

    if (ev.configs['spring.profiles.active'] == 'dev') {
      __debug = true;
    }
    else {
      __debug = false;
    }

    await new Initiator().init(ev.configs);
  }
}