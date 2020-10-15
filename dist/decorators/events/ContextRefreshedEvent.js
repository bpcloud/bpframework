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
exports._callContextRefreshedEvent = exports.ContextRefreshedEventListener = void 0;
const decoratorGlobal_1 = require("../decoratorGlobal");
function ContextRefreshedEventListener(target, propertyKey, descriptor) {
    decoratorGlobal_1.pushEvent('ContextRefreshedEventListener', { target, propertyKey, method: descriptor.value });
}
exports.ContextRefreshedEventListener = ContextRefreshedEventListener;
function _callContextRefreshedEvent(ev) {
    return __awaiter(this, void 0, void 0, function* () {
        let events = decoratorGlobal_1.getEvents('ContextRefreshedEventListener');
        for (let i in events) {
            let f = events[i].method.apply(events[i].target, [ev]);
            if (f instanceof Promise) {
                yield f;
            }
        }
    });
}
exports._callContextRefreshedEvent = _callContextRefreshedEvent;
//# sourceMappingURL=ContextRefreshedEvent.js.map