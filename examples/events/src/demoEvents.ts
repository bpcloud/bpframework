'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { Service, ContextRefreshedEvent, ContextRefreshedEventListener, RefreshRemoteEventListener, RefreshRemoteEvent, InstanceRegisteredEventListener, InstanceRegisteredEvent } from "bpframework";
@Service()
class DemoEvents {

  /**
   * 系统加载完成事件.
   * @param ev 
   */
  @ContextRefreshedEventListener
  async onContextRefreshedEvent(ev: ContextRefreshedEvent) {
    // ev.configs 当前的配置.
    console.log('onContextRefreshedEvent')
  }

  /**
   * 远程配置更新事件.
   * @param ev 
   */
  @RefreshRemoteEventListener
  async onRefreshRemoteEvent(ev: RefreshRemoteEvent) {
    // ev.updatedConfigs 更新后改变的配置项.
    // ev.latestConfigs  最新的所有配置项.
    // ev.isContainUpdated('xxx') 指定的配置项是否在更新配置项里.
    console.log('onRefreshRemoteEvent')
  }

  /**
   * 实例注册至注册中心事件.
   * @param ev 
   */
  @InstanceRegisteredEventListener
  async onInstanceRegistered(ev: InstanceRegisteredEvent) {
    console.log('InstanceRegisteredEventListener')
  }
}