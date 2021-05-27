'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    join,
};
function join(...args) {
    let u = '';
    for (let index = 0; index < args.length; index++) {
        const p = args[index];
        if (!p) {
            continue;
        }
        if (u[u.length - 1] == '/' || u.length == 0) {
            if (p[0] == '/') {
                u += p.substring(1);
            }
            else {
                u += p;
            }
        }
        else {
            if (p[0] == '/') {
                u += p;
            }
            else {
                u += '/' + p;
            }
        }
    }
    return u;
}
//# sourceMappingURL=urlUtils.js.map