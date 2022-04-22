import {SSMClient, GetParameterCommand} from '@aws-sdk/client-ssm';
import {Validate} from '../validate/index';
import {Logger} from '../logger/index';

const STAGE = process.env.STAGE ?? process.env.stage ?? 'dev';

const ssmClient = new SSMClient({region: 'eu-west-1'});

export interface GetParameterOptions {
  parseJson?: boolean;
}

export class SSM {
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
    const value = response.Parameter.Value;
    if (!value) {
      const message = `Parameter does not have a value. Received: ${JSON.stringify(value)}`;
      Logger.error(500, message);
      throw new Error(message);
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
