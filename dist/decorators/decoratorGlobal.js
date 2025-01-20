'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEvents = getEvents;
exports.pushEvent = pushEvent;
const Decorator_event = Symbol('Decorator_event');
function getEvents(eventType) {
    let obj = global[Decorator_event];
    if (!obj) {
        obj = {};
        global[Decorator_event] = obj;
    }
    return obj[eventType] || [];
}
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
//# sourceMappingURL=decoratorGlobal.js.map