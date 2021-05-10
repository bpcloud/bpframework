'use strict'

import { BpApplication, Application, LogLevel } from 'bpframework'
import './controllers'

// use koa.
import * as koa from 'koa'
import * as middleware_i18n from '@bpframework/middleware-koa-i18n'

@BpApplication()
class App {
  /**
   * @desc main entry.
   */
  main() {
    // middlewares.
    let cfg = {
      defaultLocale: 'zh-CN',
      queryField: 'locale', // querystring - `/?locale=en-US`
      cookieField: 'locale',
    }
    Application.use(middleware_i18n.middleware(cfg))

    // run.
    Application.runKoa({
      logLevel: LogLevel.DEBUG,
      app: new koa(),
    })
  }
}
