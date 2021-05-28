'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.consumeMessage = exports.subscribe = void 0;
const amqp = require("amqplib");
const febs = require("febs");
const utils_1 = require("../../utils");
const logger_1 = require("../../logger");
var qs = require('../../utils/qs/dist');
function subscribe(opt) {
    return __awaiter(this, void 0, void 0, function* () {
        let conn = {
            close: function () {
                if (this._conn) {
                    this._conn.close();
                }
            }
        };
        opt.reconnect = opt.reconnect || 10000;
        opt.heartbeat = opt.heartbeat || 10;
        let param = qs.stringify({
            'heartbeat': opt.heartbeat,
        });
        yield connect(opt, param, conn);
        return conn;
    });
}
exports.subscribe = subscribe;
function consumeMessage(...args) {
    if (args.length > 1) {
        let conn = args[0];
        let cb = args[1];
        conn._ch.prefetch(1);
        conn._ch.consume(conn._q, function (msg) {
            if (msg && msg.content) {
                cb(null, msg.content.toString('utf8'));
            }
        }, { noAck: true })
            .then(() => {
        })
            .catch((e) => {
            cb(e, null);
        });
    }
    else {
        let conn = args[0];
        conn._ch.prefetch(1);
        return new Promise((resolve, reject) => {
            conn._ch.consume(conn._q, function (msg) {
                if (msg && msg.content) {
                    resolve(msg.content.toString('utf8'));
                }
            }, { noAck: true })
                .then(() => {
            })
                .catch((e) => {
                reject(e);
            });
        });
    }
}
exports.consumeMessage = consumeMessage;
function connect(opt, param, _conn) {
    return __awaiter(this, void 0, void 0, function* () {
        _conn._ch = null;
        _conn._q = null;
        _conn._conn = null;
        while (true) {
            try {
                let conn = yield amqp.connect(opt.url + '?' + param);
                process.once('SIGINT', () => {
                    conn.on('error', (err) => { });
                    conn.close();
                    conn = null;
                });
                let ch = yield conn.createChannel();
                yield ch.assertExchange(opt.exchangeCfg.exchangeName, opt.exchangeCfg.exchangeType, {
                    durable: opt.exchangeCfg.durable,
                    autoDelete: opt.exchangeCfg.autoDelete
                });
                let q = yield ch.assertQueue(opt.queueCfg.queueName || '', opt.queueCfg);
                yield ch.bindQueue(q.queue, opt.exchangeCfg.exchangeName, opt.queueCfg.queuePattern || '');
                conn.on('error', (err) => {
                    logger_1.getLogger().error(logger_1.LOG_TAG, '[rabbitmq] subscribe error: ' + utils_1.getErrorMessage(err));
                    setTimeout(() => {
                        connect(opt, param, _conn).then(() => { });
                    }, opt.reconnect);
                });
                _conn._ch = ch;
                _conn._q = q.queue;
                _conn._conn = conn;
                return _conn;
            }
            catch (e) {
                logger_1.getLogger().error(logger_1.LOG_TAG, '[rabbitmq] reconnect: ' + opt.url + '\r\n' + utils_1.getErrorMessage(e));
                yield febs.utils.sleep(opt.reconnect);
            }
        }
    });
}
//# sourceMappingURL=subscribe.js.map