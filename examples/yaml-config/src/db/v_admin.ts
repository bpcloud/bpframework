'use strict';

/**
 * Copyright (c) 2015 Copyright citongs All Rights Reserved.
 * Author: lipengxiang
 * Desc:
 */

import * as febs from 'febs';
import * as assert from 'assert';
import * as path from 'path';
import {
  dbtype,
  dbtableHelper,
  database,
  dbtablebase
} from '@/db/base';


const dataType = database.dataType;


export interface AdminInfo {
  id: ID;
  username: string;
  nickname: string;
  realname: string;
  phone: string;
  email: string;
  avatar: string;
}

//--------------------------------------------------------
// 用户基础表.
//--------------------------------------------------------
export default class extends dbtablebase /*implements ITablebase*/ {
  constructor() {
    super('v_admin', 'id',
    {
      id:               {type: dbtype.ID, key: true}, // the auto-incrementing primary key
      tick:             {type: dataType.BigInt(true)},
      username:         {type: dataType.NVarChar(60)},
      nickname:         {type: dataType.NVarChar(60)},
      realname:         {type: dataType.NVarChar(60)},
      phone:            {type: dataType.NVarChar(20)},
      email:            {type: dataType.NVarChar(255)},
      avatar:           {type: dataType.NVarChar(1024)},
      sex:              {type: dataType.Char(1)},
      id_card:          { type: dataType.NVarChar(60) }, // 身份证.
    });
  }

  // /**
  // * @desc: 注册用户, 成功返回id.
  // * @deprecated:  name和phone必须是唯一的.
  // */
  // async register(operator:ID, item:{
  //   username:string,
  //   nickname:string,
  //   realname:string,
  //   email:string,
  //   phone:string,
  //   password:string,
  //   id_card?:string,
  // }) : Promise<MsgBean> {

  //   let ret:MsgBean = {err:errCode.Service_Error};

  //   // 特别的手机号规则.
  //   let phone = item.phone||'_'+item.username;


  //   let condi = '';
  //   condi += this.condition.equal('username', item.username);
  //   condi += 'OR';
  //   condi += this.condition.equal('phone', phone);

  //   // 事务处理.
  //   let retdb = await this.db.transaction(database.isolationLevel.Repeatable_read, async (db:Database) :Promise<boolean> => {
      
  //     if (await db.v_admin.existWhere(condi)) {
  //       ret.err = errCode.Operator_Error;
  //       ret.err_msg = '同样的用户名或手机号已存在';
  //       return false;
  //     }

  //     let mod:any = {
  //       username: item.username,
  //       nickname: item.nickname,
  //       realname: item.realname,
  //       phone: phone,
  //       email: item.email,
  //       id_card: item.id_card,
  //     };

  //     // 插入用户.
  //     if (!(await db.v_admin.add(operator, mod))) {
  //       return false;
  //     }

  //     // 插入安全信息.
  //     if (!(await db.v_user_security.add(operator, {id:mod.id, password:item.password}))) {
  //       return false;
  //     }

  //     ret.id = mod.id;
  //     return true;
  //   });

  //   return ret;
  // }

  // /**
  // * @desc: 使用手机号or用户名, 及密码登录. 返回详细信息.
  // * @param key: 参与密钥计算, 增加安全性.
  // */
  // async getInfoByPassword( account:string, pwd:string, key:string ):Promise<AdminInfo> {
  //   assert(account != null && account != undefined);

  //   let join = this.join_left(this.db.v_user_security)
  //       .set_alias1('TU')
  //       .set_alias2('TUS')
  //       .set_on(`TU.id = TUS.id`);

  //   let condi;
  //   if (febs.string.isPhoneMobile(account))
  //     condi = this.condition.equal('phone', account, 'TU');
  //   else
  //     condi = this.condition.equal('username', account, 'TU');

  //   condi += 'AND' + this.makeAvailableCondition('TU');
  //   condi += 'AND' + this.db.v_user_security.makeAvailableCondition('TUS');

  //   let ret = await this.db.exec(join.sql_select(condi, {limit: 1}));
  //   if (!ret && ret.rowsAffected == 0) {
  //     return null;
  //   }
  //   this.db.ret_data_cvt(ret.rows, this, this.db.v_user_security);

  //   let r = ret.rows[0];
  //   if (r && febs.crypt.sha1(r.password.toUpperCase()+key).toUpperCase() == pwd) {
  //     return r;
  //   }
  //   return null;
  // }

    
  // /**
  // * @desc: 设置用户信息.
  // */
  // async setInfo(operator:ID, id:ID, data:{
  //   email: string,
  //   nickname: string,
  //   sex: Sex,
  //   avatar: string,
  //   id_card?:string,
  // }):Promise<MsgBean> {

  //   let item: any = {};
  //   if (!febs.string.isEmpty(data.email))     item.email = data.email;
  //   if (!febs.string.isEmpty(data.nickname))  item.nickname = data.nickname;
  //   if (!febs.string.isEmpty(data.sex))       item.sex = data.sex;
  //   if (!febs.string.isEmpty(data.avatar))    item.avatar = data.avatar;
  //   if (!febs.string.isEmpty(data.id_card))   item.id_card = data.id_card;

  //   if (item.email && !febs.string.isEmail(item.email)) {
  //     return {err:errCode.Parameter_Error, err_msg: 'Email格式不正确'};
  //   }
  
  //   // 图片处理.
  //   let ret_image:SaveInfo;
  //   if (!febs.string.isEmpty(item.avatar)) {
  //     let dest_path = libs.path.dir_admin_avatar(true);
  //     ret_image = await file.begin_saveTmpImage(operator, item.avatar, dest_path, '.jpg', operator);
  //     item.avatar = ret_image.files[0];
  //   }

  //   let ret:MsgBean = {err:errCode.Operator_Error};

  //   // 事务处理.
  //   let retdb = await this.db.transaction(database.isolationLevel.Repeatable_read, async (db:Database) :Promise<boolean> => {
      
  //     if (item.email) {
  //       let condi = db.v_admin.condition.equal('email', item.email);
  //       condi += 'AND';
  //       condi += db.v_admin.condition.not_equal('id', id);
        
  //       if (await db.v_admin.existWhere(condi)) {
  //         ret.err = errCode.Operator_Error;
  //         ret.err_msg = 'Email已存在';
  //         return false;
  //       }
  //     }

  //     return await db.v_admin.updateById(
  //       operator,
  //       id,
  //       item
  //     );
  //   });
  
  //   //
  //   // 更新缓存.
  //   if (retdb) {
  //     // TODO: 需优化, 默认认为成功.
  //     file.finish_save(ret_image);

  //     ret.err = errCode.OK;
  //     ret.avatar = item.avatar;
  //   }
  //   else {
  //     file.fail_save(ret_image);
  //   }
  
  //   return ret;
  // }
};
