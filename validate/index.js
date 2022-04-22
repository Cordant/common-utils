"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = void 0;
const index_1 = require("../logger/index");
class Validate {
    static string(arg, name) {
        index_1.Logger.verbose('Validate.string');
        Validate.parameters([arg, name], 2);
        Validate.type(arg, 'string', name);
    }
    static object(arg, name) {
        index_1.Logger.verbose('Validate.object');
        Validate.parameters([arg, name], 2);
        Validate.type(arg, 'object', name);
    }
    static number(arg, name) {
        index_1.Logger.verbose('Validate.number');
        Validate.parameters([arg, name], 2);
        Validate.type(arg, 'number', name);
    }
    static boolean(arg, name) {
        index_1.Logger.verbose('Validate.boolean');
        Validate.parameters([arg, name], 2);
        Validate.type(arg, 'boolean', name);
    }
    static parameters(args, expected) {
        index_1.Logger.verbose('Validate.parameters');
        if (args.length !== expected) {
            const message = `Expected ${expected} arguments but received ${args.length} arguments!`;
            index_1.Logger.error(500, message);
            throw new SyntaxError(message);
        }
    }
    static type(value, type, name) {
        index_1.Logger.verbose('Validate.#type');
        if (typeof value !== type || value === null) {
            const message = `Argument '${name}' is not a ${type}! Instead received ${typeof value} as ${JSON.stringify(value)}.`;
            index_1.Logger.error(400, message);
            throw new Error(message);
        }
    }
}
exports.Validate = Validate;
