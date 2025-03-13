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
exports._callRefreshRemoteEvent = exports._addRefreshRemoteEventListener = exports.RefreshRemoteEventListener = void 0;
const decoratorGlobal_1 = require("../decoratorGlobal");
const SYM_LISTENER = Symbol("SYM_LISTENER");
function isContainUpdated(key) {
    let all = this.updatedConfigs;
    if (all) {
        for (const k in all) {
            if (k == key || k.indexOf(key + '.') == 0 || k.indexOf(key + '[') == 0) {
                return true;
            }
        }
    }
    return false;
}
function RefreshRemoteEventListener(target, propertyKey, descriptor) {
    (0, decoratorGlobal_1.pushEvent)('RefreshRemoteEventListener', { target, propertyKey, method: descriptor.value });
}
exports.RefreshRemoteEventListener = RefreshRemoteEventListener;
function _addRefreshRemoteEventListener(l) {
    if (!global[SYM_LISTENER]) {
        global[SYM_LISTENER] = [l];
    }
    else {
        global[SYM_LISTENER].push(l);
    }
}
exports._addRefreshRemoteEventListener = _addRefreshRemoteEventListener;
function _callRefreshRemoteEvent(ev) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ev) {
            ev.isContainUpdated = isContainUpdated.bind(ev);
        }
        let events = (0, decoratorGlobal_1.getEvents)('RefreshRemoteEventListener');
        for (let i in events) {
            let f = events[i].method.apply(events[i].target, [ev]);
            if (f instanceof Promise) {
                yield f;
            }
        }
        let listeners = global[SYM_LISTENER];
        if (listeners) {
            for (let i in listeners) {
                let f = listeners[i](ev);
                if (f instanceof Promise) {
                    yield f;
                }
            }
        }
    });
}
exports._callRefreshRemoteEvent = _callRefreshRemoteEvent;
//# sourceMappingURL=RefreshRemoteEvent.js.map