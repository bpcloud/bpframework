'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-17 17:07
* Desc: 
*/

import * as febs from 'febs';

export function getBusIdServiceName(config:any): string {
  let name:string = config["vcap.application.name"];
  if (febs.string.isEmpty(name)) {
      name = config["spring.application.name"];
      if (febs.string.isEmpty(name)) {
          name = "application";
      }
  }

  return name;
}

export function getBusId(config:any): string {
  let name: string = getBusIdServiceName(config);

  let index = config["vcap.application.instance_index"];
  if (febs.utils.isNull(index)) {
      index = config["spring.application.index"];
      if (febs.utils.isNull(index)) {
          index = config["local.server.port"];
          if (febs.utils.isNull(index)) {
              index = config["server.port"];
              if (febs.utils.isNull(index)) {
                  index = 0;
              }
          }
      }
  }

  let instanceId = config["vcap.application.instance_id"];
  if (febs.string.isEmpty(instanceId)) {
    instanceId = febs.crypt.uuid();
    instanceId = febs.string.replace(instanceId, '-', '');
  }

  return name + ":" + index + ":" + instanceId;
}