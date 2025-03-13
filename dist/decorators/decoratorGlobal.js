'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.pushEvent = exports.getEvents = void 0;
const Decorator_event = Symbol('Decorator_event');
function getEvents(eventType) {
    let obj = global[Decorator_event];
    if (!obj) {
        obj = {};
        global[Decorator_event] = obj;
    }
    return obj[eventType] || [];
}
exports.getEvents = getEvents;
function pushEvent(eventType, data, singleton) {
    let obj = global[Decorator_event];
    if (!obj) {
        obj = {};
        global[Decorator_event] = obj;
    }
    obj[eventType] = obj[eventType] || [];
    if (singleton && obj[eventType].length > 0) {
        throw new Error(`'@${eventType}': There can only be one instance`);
    }
    obj[eventType].push(data);
}
exports.pushEvent = pushEvent;
//# sourceMappingURL=decoratorGlobal.js.map