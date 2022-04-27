import {SSMClient, GetParameterCommand} from '@aws-sdk/client-ssm';
import {Validate} from '../validate/index';
import {Logger} from '../logger/index';

const STAGE = process.env.STAGE ?? process.env.stage ?? 'dev';

const ssmClient = new SSMClient({region: 'eu-west-1'});

/**
 * @description Optional parameters to manipulate the output response.
 */
export interface GetParameterOptions {
  /**
   * @description Tries to decrypt the response as a Base64 string, if it fails it will default to the raw value. If both parseBase64 and parseJson is true. This parameter will be parsed first.
   */
  parseBase64?: boolean;

  /**
   * @description Tries to parse the response as a JSON, if it fails it will default to the raw value. If both parseBase64 and parseJson is true. This parameter will be parsed only after parseBase64 is done.
   */
  parseJson?: boolean;
}

/**
 * @description A helper class to retrieve an SSM parameter based on stages. It ensures that the standard format for the parameter is correct.
 */
export class SSM {

  /**
   *
   * @description Retrieves the SSM parameter from AWS and ensures the key follows the format `/app/stage/parameter`. In case there is an extra parameter you should pass it via the `parameter` property. ei. `parameter1/parameter2` resulting in `/app/stage/parameter1/parameter2`
   *
   * @param app The app that you are retrieving the SSM parameter for.
   * @param parameter The parameter that you are retrieving.
   * @param options Optional parameters to manipulate the output response.
   */
  static async getParameter(app: string, parameter: string, options?: GetParameterOptions): Promise<string> {
    Validate.string(app, 'app');
    Validate.string(parameter, 'parameter');

    const key = `/${app}/${STAGE}/${parameter}`;
    Logger.debug(`SSM Parameter passed ${key}`);
    const command = new GetParameterCommand({
      Name: key,
      WithDecryption: true,
    });

    const response = await ssmClient.send(command).catch(err => {
      Logger.awsError(err);
      throw err;
    });
    if (!response?.Parameter) {
      const message = `Response from SSM Client doesn't have object Parameter or is null. Received: ${JSON.stringify(response)}`;
      Logger.error(500, message);
      throw new Error(message);
    }
    let value = response.Parameter.Value;
    if (!value) {
      const message = `Parameter does not have a value. Received: ${JSON.stringify(value)}`;
      Logger.error(500, message);
      throw new Error(message);
    }
    if (options?.parseBase64) {
      try {
        value = Buffer.from(value, 'base64').toString();
      } catch (e) {
        Logger.warning(`Failed to parse response as Base64! returning raw response instead! Reason for failure was ${JSON.stringify(e)}`);
      }
    }
    if (options?.parseJson) {
      Logger.debug('Trying to parse response as JSON!');
      try {
        return JSON.parse(value);
      } catch (e) {
        Logger.warning(`Failed to parse response as JSON! Return raw response instead! Reason for failure was ${JSON.stringify(e)}`);
        return value;
      }
    }
    return value;
  }
}
