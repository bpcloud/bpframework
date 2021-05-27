'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.BpApplication = void 0;
const Service_1 = require("../springframework/Service");
function BpApplication() {
    let fooService = Service_1.ImmediatelyService();
    return (target) => {
        fooService(target);
        let instance = Service_1.getServiceInstances(target).instance;
        let main = instance['main'];
        if (typeof main !== 'function') {
            throw new Error('@BpApplication class haven\'t a function named: main()');
        }
        let f = main.apply(instance);
        if (f instanceof Promise) {
            f.then();
        }
    };
}
exports.BpApplication = BpApplication;
//# sourceMappingURL=BpApplication.js.map