'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.castBoolean = castBoolean;
exports.getErrorMessage = getErrorMessage;
function castBoolean(v) {
    return v === 'TRUE' || v === 'true' || v === true ? true : false;
}
function getErrorMessage(e) {
    if (e instanceof Error) {
        e = `${e.message}\n${e.stack}`;
    }
    else if (typeof e === 'object') {
        try {
            e = JSON.stringify(e);
        }
        catch (err) {
            e = 'LOG catch in JSON.stringify';
        }
    }
    else {
        e = (e ? e.toString() : '');
    }
    return e;
}
//# sourceMappingURL=index.js.map