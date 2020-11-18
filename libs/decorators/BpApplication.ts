'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-04 15:48
* Desc: 
*/


import * as febs from 'febs';
import { getServiceInstances, Service } from 'febs-decorator';

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
  let fooService = Service(true);

  return (target: Function): void => {
    fooService(target);
    let instance:any = getServiceInstances(target);
    instance = instance[instance.length - 1];

    let main = instance['main'];
    if (typeof main !== 'function') {
      throw new Error('@BpApplication class haven\'t a function named: main()');
    }

    main.apply(instance);
  }
}
