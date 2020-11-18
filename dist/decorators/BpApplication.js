'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.BpApplication = void 0;
const febs_decorator_1 = require("febs-decorator");
function BpApplication() {
    let fooService = febs_decorator_1.Service(true);
    return (target) => {
        fooService(target);
        let instance = febs_decorator_1.getServiceInstances(target);
        instance = instance[instance.length - 1];
        let main = instance['main'];
        if (typeof main !== 'function') {
            throw new Error('@BpApplication class haven\'t a function named: main()');
        }
        main.apply(instance);
    };
}
exports.BpApplication = BpApplication;
//# sourceMappingURL=BpApplication.js.map