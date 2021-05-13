'use strict'

// use koa.
import * as koa from 'koa'
import { BpApplication, Application, LogLevel } from 'bpframework'
import './demoFeignClient'
import './demoFeignClientConfigure'

@BpApplication()
class App {
  /**
   * @desc main entry.
   */
  main() {
    // run.
    Application.runKoa({
      logLevel: LogLevel.DEBUG,
      app: new koa(),
      // The default config is: 'spring.rabbitmq'
      springCloudBusConfigurePrefix: 'spring.rabbitmq'
    })
  }
}
