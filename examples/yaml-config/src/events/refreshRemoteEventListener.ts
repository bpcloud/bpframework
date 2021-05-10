'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { Service, RefreshRemoteEvent, RefreshRemoteEventListener } from "bpframework";
import { Initiator } from "./initiator";

@Service()
class Events {

  /**
   * 远程配置更新事件.
   * @param ev 
   */
  @RefreshRemoteEventListener
  async onRefreshRemoteEvent(ev: RefreshRemoteEvent) {

    if (ev.latestConfigs['spring.profiles.active'] == 'dev') {
      __debug = true;
    }
    else {
      __debug = false;
    }

    await new Initiator().init(ev.latestConfigs);
  }
}