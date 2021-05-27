'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-01 22:49
* Desc: 
*/

const debugFeignClientValue = Symbol('debugFeignClientValue');

//
// define the __debugFeignClient.
let old__debugFeignClient = (<any>global)['__debugFeignClient'];
if (!global.hasOwnProperty('__debugFeignClient')) {
  Object.defineProperty(global, '__debugFeignClient', {
    get: function () {
      if (typeof (<any>global)[debugFeignClientValue] !== 'boolean') {
        return old__debugFeignClient;
      }
      else {
        return !!(<any>global)[debugFeignClientValue];
      }
   },
   set: function(isDebug) {
     (<any>global)[debugFeignClientValue] = isDebug;
   }
  });
}

//
// define the __enableScheduled.
let old__enableScheduled = (<any>global)['__enableScheduled'];
if (!global.hasOwnProperty('__enableScheduled')) {
  Object.defineProperty(global, '__enableScheduled', {
    get: function () {
      if (typeof (<any>global)[debugFeignClientValue] !== 'boolean') {
        return old__enableScheduled;
      }
      else {
        return !!(<any>global)[debugFeignClientValue];
      }
   },
   set: function(isDebug) {
     (<any>global)[debugFeignClientValue] = !!isDebug;
   }
  });
}

export * from './Application';
export * from './decorators/configure';
export * from './decorators/events';
export * from './decorators/scheduling';
export * from './decorators/BpApplication';
export { LogLevel } from './logger';
export { getErrorMessage } from './utils';
export { rabbitmq } from './mq';

export * from './springframework';



