'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { Bean, Service } from "febs-decorator";

@Service()
class DemoBeanFactory {

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
    console.log("unSingletonBean created");
    return { name: "unSingletonBean" };
  }
}