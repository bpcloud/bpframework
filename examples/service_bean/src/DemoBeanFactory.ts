'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { Bean, RefreshScope, Service, Value } from "bpframework";

@Service()
class DemoBeanFactory {

  @Value('${test}')
  testValue: string;
  
  /**
   * 当云配置变更时，会自动进行刷新
   */
  @RefreshScope
  @Bean()
  beanValue(): any {
    return this.testValue;
  }

  /**
   * use the method name.
   */
  @Bean()
  bean1(): any {
    return "bean1";
  }

  /**
   * To spacify a name.
   */
  @Bean({name: "Bean2"})
  bean2(): any {
    return "bean2";
  }

  /**
   * Create a un-singleton bean.
   * <default singleton bean>
   */
  @Bean({name: "un-singleton", singleton: false})
  unSingletonBean(): any {
    // console.log("unSingletonBean created");
    return { name: "unSingletonBean" };
  }
}