'use strict'

/**
 * Copyright (c) 2020 Copyright bp All Rights Reserved.
 */

import {
  Service,
  RestControllerConfigure,
  RestControllerConfigureInfo,
  RestControllerResponseData,
  RestRequest,
  RestResponse,
} from 'bpframework'
import febs from 'febs';

@Service()
class DemoRestControllerConfigure {
  @RestControllerConfigure
  onConfigure(): RestControllerConfigureInfo {
    return {
      /** @desc Headers that is appended by default every response to client. */
      defaultHeaders: {
        'content-type': 'application/json;charset=utf-8',
        'X-Costom-Header': 'xxx',
      },
      /** @desc Processing the data of the response, and return the response data. */
      filterResponseCallback(data: RestControllerResponseData): any {
        return {  // to wrap response data.
          err: 'ok',
          data: data.returnMessage
        }
      },
      /** @desc Error handling, such as data type, occurred while process the request. */
      errorRequestCallback(
        error: Error,
        request: RestRequest,
        response: RestResponse
      ): void {
        response.body = error.message;
      },
      /** @desc Error handling, such as data type, occurred while process the response. */
      errorResponseCallback (
        error: Error,
        request: RestRequest,
        response: RestResponse
      ): void {
        if (!this.errorHandler(error, response)) {
          response.body = error.message;
        }
      },
      /** 404. */
      notFoundCallback: (
        request: RestRequest,
        response: RestResponse
      ): void => {
        response.body = '404'
      },
    } //
  }

  private errorHandler(error: Error, response: RestResponse) {
    // febs.exception.
    if (febs.exception.isInstance(error)) {
      // timeout.
      if (error.code === 'NetworkFailed') {
        response.body = 'NetworkFailed';
      } else if (error.code === 'NetworkTimeout') {
        response.body = 'NetworkTimeout';
      } else {
        response.body = error.message;
      }

      return true;
    }
  }
}

