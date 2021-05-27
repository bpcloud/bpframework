'use strict';

// enable @Scheduled
(global as any).__enableScheduled = true;

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
      logLevel: LogLevel.DEBUG,
      app: new koa(),
    })
  }
}
