'use strict'

import * as koa from 'koa'
import { BpApplication, Application, LogLevel } from 'bpframework'
import './DemoService'

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
