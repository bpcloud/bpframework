'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const qs = require("querystring");
exports.default = {
    getClassNameByObject,
    getClassNameByClass,
    getParameterName,
    castType,
};
function getClassNameByObject(obj) {
    if (obj && obj.constructor && obj.constructor.toString()) {
        if (obj.constructor.name) {
            return obj.constructor.name;
        }
        var str = obj.constructor.toString();
        if (str.charAt(0) == '[') {
            var arr = str.match(/\[\w+\s*(\w+)\]/);
        }
        else {
            var arr = str.match(/function\s*(\w+)/);
        }
        if (arr && arr.length == 2) {
            return arr[1];
        }
    }
    return undefined;
}
function getClassNameByClass(obj) {
    if (obj) {
        return obj.name;
    }
    return undefined;
}
function getParameterName(fn) {
    try {
        if (typeof fn !== 'object' && typeof fn !== 'function')
            return;
        const COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
        const DEFAULT_PARAMS = /=[^,)]+/mg;
        const FAT_ARROWS = /=>.*$/mg;
        let code = fn.prototype ? fn.prototype.constructor.toString() : fn.toString();
        code = code
            .replace(COMMENTS, '')
            .replace(FAT_ARROWS, '')
            .replace(DEFAULT_PARAMS, '');
        let result = code.slice(code.indexOf('(') + 1, code.indexOf(')')).match(/([^\s,]+)/g);
        return result === null ? [] : result;
    }
    catch (e) {
        return [];
    }
}
function castType(content, castTypeD, contentIsRaw) {
    try {
        let data;
        if (!castTypeD || castTypeD.name === 'String') {
            data = content;
        }
        else if (castTypeD.name === 'Number') {
            data = Number(content);
        }
        else if (castTypeD.name === 'Boolean') {
            data = (content === 'true' || content === '1' || content === true || content === 1);
        }
        else {
            data = new castTypeD();
            if (contentIsRaw) {
                content = qs.parse(content);
            }
            for (const key in content) {
                data[key] = content[key];
            }
        }
        return { data };
    }
    catch (e) {
        return { e };
    }
}
//# sourceMappingURL=objectUtils.js.map