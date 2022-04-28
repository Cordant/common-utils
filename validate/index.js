"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = void 0;
const index_1 = require("../logger/index");
/**
 * @description This class is used to ensure that parameters passed has the required value and type.
 */
class Validate {
    /**
     * @description Ensures that a string is received.
     * @param arg The value to test.
     * @param name The name of the value. if the variable that you passed is named userDetails, this value should be a string with 'userDetails'.
     */
    static string(arg, name) {
        index_1.Logger.verbose('Validate.string');
        Validate.parameters([arg, name], 2);
        Validate.type(arg, 'string', name);
    }
    /**
     * @description Ensures that an object is received.
     * @param arg The value to test.
     * @param name The name of the value. if the variable that you passed is named userDetails, this value should be a string with 'userDetails'.
     */
    static object(arg, name) {
        index_1.Logger.verbose('Validate.object');
        Validate.parameters([arg, name], 2);
        Validate.type(arg, 'object', name);
    }
    /**
     * @description Ensures that a number is received.
     * @param arg The value to test.
     * @param name The name of the value. if the variable that you passed is named userDetails, this value should be a string with 'userDetails'.
     */
    static number(arg, name) {
        index_1.Logger.verbose('Validate.number');
        Validate.parameters([arg, name], 2);
        Validate.type(arg, 'number', name);
    }
    /**
     * @description Ensures that a boolean is received.
     * @param arg The value to test.
     * @param name The name of the value. if the variable that you passed is named userDetails, this value should be a string with 'userDetails'.
     */
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
