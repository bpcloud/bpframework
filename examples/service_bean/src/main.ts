'use strict'

// use koa.
import * as koa from 'koa'
import { BpApplication, Application, LogLevel, Autowired } from 'bpframework'
import './demoService'
import './demoImmediatelyService'
import './demoBeanFactory'
import './contextRefreshedEventListener'

@BpApplication()
class App {

  @Autowired('ImmediateService')
  immediateService: any;

  constructor() {
    console.log(this.immediateService);
  }

  /**
   * @desc main entry.
   */
  main() {
    // run.
    Application.runKoa({
      logLevel: LogLevel.DEBUG,
      app: new koa(),
    })
  }
}
