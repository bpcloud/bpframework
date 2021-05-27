'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-04 15:48
* Desc: 
*/


import * as febs from 'febs';
import { getServiceInstances, ImmediatelyService } from '../springframework/Service';

/**
 * 定义Application.
 * 
 * @example
 *    ﹫BpApplication()
 *    class App{
        main() {
          Application.runKoa({
            app: koajs.createApp(),
          });
        }
 *    }
 */
export function BpApplication(): ClassDecorator {
  let fooService = ImmediatelyService();

  return (target: Function): void => {
    fooService(target);
    let instance = getServiceInstances(target).instance;

    let main = instance['main'];
    if (typeof main !== 'function') {
      throw new Error('@BpApplication class haven\'t a function named: main()');
    }

    let f = main.apply(instance);
    if (f instanceof Promise) {
      f.then();
    }
  }
}
