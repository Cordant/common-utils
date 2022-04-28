"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSM = void 0;
const client_ssm_1 = require("@aws-sdk/client-ssm");
const index_1 = require("../validate/index");
const index_2 = require("../logger/index");
const STAGE = (_b = (_a = process.env.STAGE) !== null && _a !== void 0 ? _a : process.env.stage) !== null && _b !== void 0 ? _b : 'dev';
const ssmClient = new client_ssm_1.SSMClient({ region: 'eu-west-1' });
/**
 * @description A helper class to retrieve an SSM parameter based on stages. It ensures that the standard format for the parameter is correct.
 */
class SSM {
    /**
     *
     * @description Retrieves the SSM parameter from AWS and ensures the key follows the format `/app/stage/parameter`. In case there is an extra parameter you should pass it via the `parameter` property. ei. `parameter1/parameter2` resulting in `/app/stage/parameter1/parameter2`
     *
     * @param app The app that you are retrieving the SSM parameter for.
     * @param parameter The parameter that you are retrieving.
     * @param options Optional parameters to manipulate the output response.
     */
    static getParameter(app, parameter, options) {
        return __awaiter(this, void 0, void 0, function* () {
            index_1.Validate.string(app, 'app');
            index_1.Validate.string(parameter, 'parameter');
            const key = `/${app}/${STAGE}/${parameter}`;
            index_2.Logger.debug(`SSM Parameter passed ${key}`);
            const command = new client_ssm_1.GetParameterCommand({
                Name: key,
                WithDecryption: true,
            });
            const response = yield ssmClient.send(command).catch(err => {
                index_2.Logger.awsError(err);
                throw err;
            });
            if (!(response === null || response === void 0 ? void 0 : response.Parameter)) {
                const message = `Response from SSM Client doesn't have object Parameter or is null. Received: ${JSON.stringify(response)}`;
                index_2.Logger.error(500, message);
                throw new Error(message);
            }
            let value = response.Parameter.Value;
            if (!value) {
                const message = `Parameter does not have a value. Received: ${JSON.stringify(value)}`;
                index_2.Logger.error(500, message);
                throw new Error(message);
            }
            if (options === null || options === void 0 ? void 0 : options.parseBase64) {
                try {
                    value = Buffer.from(value, 'base64').toString();
                }
                catch (e) {
                    index_2.Logger.warning(`Failed to parse response as Base64! returning raw response instead! Reason for failure was ${JSON.stringify(e)}`);
                }
            }
            if (options === null || options === void 0 ? void 0 : options.parseJson) {
                index_2.Logger.debug('Trying to parse response as JSON!');
                try {
                    return JSON.parse(value);
                }
                catch (e) {
                    index_2.Logger.warning(`Failed to parse response as JSON! Return raw response instead! Reason for failure was ${JSON.stringify(e)}`);
                    return value;
                }
            }
            return value;
        });
    }
}
exports.SSM = SSM;
