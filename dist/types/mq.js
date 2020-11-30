"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rabbitmq = void 0;
var rabbitmq;
(function (rabbitmq) {
    let ExchangeType;
    (function (ExchangeType) {
        ExchangeType["direct"] = "direct";
        ExchangeType["topic"] = "topic";
        ExchangeType["headers"] = "headers";
        ExchangeType["fanout"] = "fanout";
    })(ExchangeType = rabbitmq.ExchangeType || (rabbitmq.ExchangeType = {}));
})(rabbitmq = exports.rabbitmq || (exports.rabbitmq = {}));
//# sourceMappingURL=mq.js.map