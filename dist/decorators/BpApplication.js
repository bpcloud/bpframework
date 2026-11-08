'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.BpApplication = void 0;
const Service_1 = require("../springframework/Service");
const logger_1 = require("../logger");
const utils_1 = require("../utils");
function BpApplication() {
    let fooService = (0, Service_1.ImmediatelyService)();
    return (target) => {
        fooService(target);
        let instance = (0, Service_1.getServiceInstances)(target).instance;
        let main = instance['main'];
        if (typeof main !== 'function') {
            throw new Error('@BpApplication class haven\'t a function named: main()');
        }
        let f = main.apply(instance);
        if (f instanceof Promise) {
            f.catch((e) => {
                (0, logger_1.getLogger)().error('[@BpApplication] main() error: ' + (0, utils_1.getErrorMessage)(e));
            });
        }
    };
}
exports.BpApplication = BpApplication;
//# sourceMappingURL=BpApplication.js.map