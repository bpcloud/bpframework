// Type definitions for febs

/// <reference types="node" />


export type Headers = { [field: string]: string | string[] };

export interface RestRequest {
  /**
   * Return request header
   */
  headers: Headers;
  /**
   * Get/Set request URL.
   */
  url: string;
  /**
   * Get origin of URL.
   */
  origin: string;
  /**
   * Get/Set request method.
   */
  method: string;
  /**
   * Parse the "Host" header field host
   * and support X-Forwarded-Host when a
   * proxy is enabled.
   */
  host: string;
  /**
   * Return the protocol string "http" or "https"
   * when requested with TLS. When the proxy setting
   * is enabled the "X-Forwarded-Proto" header
   * field will be trusted. If you're running behind
   * a reverse proxy that supplies https for you this
   * may be enabled.
   */
  protocol: string;
  /**
   * Request remote address. Supports X-Forwarded-For when app.proxy is true.
   */
  ip: string;
  /**
   * Request body.
   */
  body: any;
}


export interface RestResponse {
  /**
   * response headers
   */
  headers: Headers;
  /**
   * Get/Set response status code.
   */
  status: number;
  /**
   * Request body.
   */
  body: any;
}