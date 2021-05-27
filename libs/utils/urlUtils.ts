'use strict';

/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
* Author: brian.li
* Date: 2020-11-18 11:05
* Desc: 
*/

export default {
  join,
}

/**
* @desc: 连接url地址.
*/
function join(...args: string[]):string {

  let u: string = '';

  for (let index = 0; index < args.length; index++) {
    const p = args[index];
    if (!p) { continue; }

    if (u[u.length - 1] == '/' || u.length == 0) {
      if (p[0] == '/') { u += p.substring(1); }
      else { u += p; }
    }
    else {
      if (p[0] == '/') { u += p; }
      else { u += '/' + p; }  
    }
  }

  return u;
}