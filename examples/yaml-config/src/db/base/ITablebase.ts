'use strict';

/**
* Copyright (c) 2017 Copyright tj All Rights Reserved.
* Author: lipengxiang
* Date: 2017-06-16
* Desc: 定义数据表基类.
*/



import * as febs from 'febs';
import * as febsdb from 'febs-db';


/**
* @desc: 除 addItem, updateItem, updateItemById 外, 其他方法有默认实现.
*/
export default interface ITableBase {
  /**
  * @desc: 获取数据条数. 会根据 is_delete 字段来获取.
  */
  count(where?: string): Promise<number>;

  /**
  * @desc: 判断id是否存在, is_delete=1的数据不参与查询.
  */
  exist(id: any): Promise<boolean>;
  /**
   * @desc: 判断条件是否存在, is_delete=1的数据不参与查询.
   */
  existWhere(where: string): Promise<boolean>;

  /**
  * @desc: 查询; is_delete=1的数据不参与查询.
  */
  select(where: string, opt?: febsdb.select_opt): Promise<Array<any>>;
  /**
  * @desc: 查询; is_delete=1的数据参与查询.
  */
  select_containDel(where: string, opt?: febsdb.select_opt): Promise<Array<any>>;
  /**
  * @desc: 通过id查询. is_delete=1的数据不参与查询.
  *        (优先在cache中查询.)
  */
  selectById(id: any, cols?: Array<string>): Promise<any>;
  /**
   * @desc: select by id and lock row for update (use in transaction)
   *        is_delete=1的数据不参与查询.
   *        (优先在cache中查询.)
   * @exception: InSyncException
   */
  selectLockRow(id: any, cols?: Array<string>): Promise<any>;

  /**
  * @desc: 查询第一个. is_delete=1的数据不参与查询.
  */
  selectTop(where: string, opts?: febsdb.select_opt): Promise<any>;

  /**
  * @desc: 是否有效.
  * @return: 
  */
  isAvailable(id:ID, where?:string):Promise<{available:boolean, is_forbid?:boolean}>;

  /**
  * @desc: 构造查询可用的条件语句. ' (xxx) '
  * @return: string.
  */
  makeAvailableCondition(alias?:string):string;

  /**
   * @desc: 带日志模块. 禁用, 使用is_forbid字段标记. (带tick字段, tick字段自动设置为当前全表最大).
   * @return: 
   */
  setForbid(operator:ID, id:ID, forbid:boolean): Promise<boolean>;

  /**
   * @desc: 带日志模块.
   *        自增主键如果是字符串型, 则使用 identify.nextId() 生成id.
   * @return: 
   */
  add(operator : ID, item : any) : Promise < boolean >;

  
  /**
   * @desc: 带日志模块.
   *     tick_self字段 - 会自动设置为tick_self+1.
   * @summary
   *     如果此表为cache表, 则会清理缓存中的值.
   * @return: 
   */
  update(operator: ID, item: any, where ? : string) : Promise < boolean >;

  
  /**
   * @desc: 带日志模块.
   *     tick字段 - 会自动设置为全表最大.
   *     tick_self字段 - 会自动设置为tick_self+1.
   * @return: 
   */
  updateById(operator: ID, id: ID, item: any, where ? : string) : Promise < boolean >;

  
  /**
   * @desc: 删除数据. 
   *        假删 设置 is_delete 字段 = true.
   * @warning: 
   *     如果使用了缓存, 不能使用此接口.
   */
  remove(operator: ID, where: string) : Promise < boolean >;

  /**
   * @desc: 删除数据. 
   *        根据配置进行真删或假删除.
   *        (会进行cache操作.)
   */
  removeById(operator: ID, id: any, where: string) : Promise < boolean >;
}
