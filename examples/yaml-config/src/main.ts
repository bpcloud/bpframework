'use strict';

import { BpApplication, Application, LogLevel } from 'bpframework';
import './configure';
import './events';
import './controllers';
import './crons';

// use koa.
import * as koa from 'koa';
import * as middleware_i18n from '@bpframework/middleware-koa-i18n';
import * as middleware_redis from '@bpframework/middleware-redis';

@BpApplication()
class App {
  /**
  * @desc main entry.
  */
  main() {

    // middlewares.
    Application.use(middleware_i18n.middleware())
    Application.use(middleware_redis.middleware)


    setTimeout(() => {
      serverSign();
    }, 5000);
  

    // run.
    Application.runKoa({
      logLevel: LogLevel.DEBUG,
      enableScheduled: !!(global as any).enableScheduled,
      springCloudBusConfigurePrefix: 'spring.cloud.config.bus.rabbitmq',
      app: new koa(),
    });
  }
}

import { SignFeignClient } from "./feignclients/SignFeignClient";

async function serverSign(){
  let rsa_algorithm = "RSA";
  let sing_algorithm = "SHA1withRSA";

  let service_id = "notification-service";

  let n = await new SignFeignClient().associationsWithKey();

  console.log(n);
}