'use strict'

// use koa.
import * as koa from 'koa'
import { BpApplication, Application, LogLevel } from 'bpframework'
import './demoRestController'
import './demoRestControllerConfigure'

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
    })
  }
}