'use strict';


/**
* Copyright (c) 2020 Copyright bp All Rights Reserved.
*/

import { RestControllerConfigure } from "bpframework";
import { RestRequest, RestResponse, Service } from "bpframework";
import { RestControllerConfigureInfo, RestControllerResponseData } from "bpframework";

import * as febs from 'febs';
import { logger } from "@/libs/logger";
import { errorCode, isErrorCode, Msg } from "@originforest/common";

@Service()
class Configure {
  @RestControllerConfigure
  onConfigure(): RestControllerConfigureInfo {
    return {
      // 默认headers.
      defaultHeaders: {'content-type': 'application/json;charset=utf-8'},
      // 消息过滤.
      filterResponseCallback: (data: RestControllerResponseData): any => {
        return data.returnMessage;
      },
      /** 接收消息时发生数据类型等错误. */
      errorRequestCallback: (error: Error, request: RestRequest, response: RestResponse): void => {
        if (febs.exception.isInstance(error)) {
          let code = Number.parseInt(error.code);
          let isCode = isErrorCode(code);
          if (!isCode) {
            logger.error(logger.getErrorMessage(error));
          }
          response.body = {
            err: error.code,
            err_code: isCode? code: ( error.code == febs.exception.PARAM? errorCode.PARAMETER_ERROR: errorCode.SERVICE_UNAVAILABLE),
            err_msg: error.msg,
          } as Msg;
        }
        else {
          logger.error(logger.getErrorMessage(error));
          response.body = {
            err_code: errorCode.SERVICE_ERROR,
            err_msg: error.message
          } as Msg;
        }
      },
      /** 响应消息时发生错误. */
      errorResponseCallback: (error: Error, request: RestRequest, response: RestResponse): void => {
        logger.error(logger.getErrorMessage(error));

        //
        // febs.exception.
        if (febs.exception.isInstance(error)) {
          // timeout.
          if (error.code === 'NetworkFailed') {
            response.body = {
              err_code: errorCode.SERVICE_UNAVAILABLE,
              err_msg: 'network failed',
            }
          }
          else if (error.code === 'NetworkTimeout') {
            response.body = {
              err_code: errorCode.SERVICE_UNAVAILABLE,
              err_msg: 'network timeout',
            }
          }
          else {
            let code = Number.parseInt(error.code);
            response.body = {
              err_code: isErrorCode(code)? code: errorCode.SERVICE_UNAVAILABLE,
              err_msg: error.msg,
            } as any
          }
        }
        //
        // default.
        else {
          response.body = {
            err: errorCode.SERVICE_ERROR,
          }
        }
      },
      /** 404. */
      notFoundCallback: (request: RestRequest, response: RestResponse): void => {
        console.log('404');
        response.body = "404";
      }
    } // 
  }
}
