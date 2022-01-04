'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { Service, ContextRefreshedEvent, ContextRefreshedEventListener, Autowired } from "bpframework";
import { DemoService } from "./demoService";

@Service()
class Events {

  @Autowired("bean1")
  bean1: any;

  @Autowired("beanValue")
  beanValue: any;

  @Autowired("Bean2")
  bean2: any;

  @Autowired("un-singleton")
  beanUnSingletonBean1: any;
  
  @Autowired("un-singleton")
  beanUnSingletonBean2: any;

  @Autowired(DemoService)
  demoService: DemoService;

  @Autowired("DemoServiceByName")
  demoServiceByName: any;

  @Autowired("DemoServiceUnSingleton")
  demoServiceUnSingleton1: any;

  @Autowired("DemoServiceUnSingleton")
  demoServiceUnSingleton2: any;

  /**
   * All beans are autowired.
   * @param ev 
   */
  @ContextRefreshedEventListener
  async onContextRefreshedEvent(ev: ContextRefreshedEvent) {
    // console.log(this.beanValue);
    // console.log(this.bean1);
    // console.log(this.bean2);

    // console.log(this.beanUnSingletonBean1);
    // console.log(this.beanUnSingletonBean2);
    this.beanUnSingletonBean1.name = "beanUnSingletonBean1";
    // console.log(this.beanUnSingletonBean1);
    // console.log(this.beanUnSingletonBean2);

    // setInterval(() => {
    //   console.log(this.beanValue);
    // }, 3000);
  }
}