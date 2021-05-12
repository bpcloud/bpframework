'use strict'

// use koa.
import * as koa from 'koa'
import { BpApplication, Application, LogLevel } from 'bpframework'
import './demoScheduled'

@BpApplication()
class App {
  /**
   * @desc main entry.
   */
  main() {
    // run.
    Application.runKoa({
      enableScheduled: true,    // To enabled crontask.
      logLevel: LogLevel.DEBUG,
      app: new koa(),
    })
  }
}
