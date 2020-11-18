'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusId = exports.getBusIdServiceName = void 0;
const febs = require("febs");
function getBusIdServiceName(config) {
    let name = config["vcap.application.name"];
    if (febs.string.isEmpty(name)) {
        name = config["spring.application.name"];
        if (febs.string.isEmpty(name)) {
            name = "application";
        }
    }
    return name;
}
exports.getBusIdServiceName = getBusIdServiceName;
function getBusId(config) {
    let name = getBusIdServiceName(config);
    let index = config["vcap.application.instance_index"];
    if (febs.utils.isNull(index)) {
        index = config["spring.application.index"];
        if (febs.utils.isNull(index)) {
            index = config["local.server.port"];
            if (febs.utils.isNull(index)) {
                index = config["server.port"];
                if (febs.utils.isNull(index)) {
                    index = 0;
                }
            }
        }
    }
    let instanceId = config["vcap.application.instance_id"];
    if (febs.string.isEmpty(instanceId)) {
        instanceId = febs.crypt.uuid();
        instanceId = febs.string.replace(instanceId, '-', '');
    }
    return name + ":" + index + ":" + instanceId;
}
exports.getBusId = getBusId;
//# sourceMappingURL=busId.js.map