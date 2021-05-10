
/**
* Copyright (c) 2019 Copyright bp All Rights Reserved.
* Author: lipengxiang
* Date: 2019-08-14 15:57
* Desc: server config types.
*/

import { database } from "@/db/base";


declare global {

  /**
  * @desc 指向boostrap配置中的application配置项下的信息.
  */
  export interface ServerConfig {
    port: number;

    /**
    * @desc: 用于检查跨域等.
    */
    website_url: string;

    /**
     * @desc: 日志目录.
     */
    logDir: string;

    /**
    * @desc: 数据库配置.
    */
    database: database.database_opt;

    // /**
    //  * @desc: 缓存配置.
    //  */
    // redis: CacheCfg;

    // /**
    //  * @desc 本地目录及文件信息
    //  */
    // dir: DirCfg;

    /**
     * @desc 分页信息.
     */
    pager: {
      /** 每页最大item数 */
      max_items_per_page: number
    }
  }
}