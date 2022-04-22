import {Logger} from '../logger/index';

export class Validate {
  static string(arg: string, name: string): void {
    Logger.verbose('Validate.string');
    Validate.parameters([arg, name], 2);
    Validate.type(arg, 'string', name);
  }

  static object(arg: Object, name: string): void {
    Logger.verbose('Validate.object');
    Validate.parameters([arg, name], 2);
    Validate.type(arg, 'object', name);
  }

  static number(arg: number, name: string): void {
    Logger.verbose('Validate.number');
    Validate.parameters([arg, name], 2);
    Validate.type(arg, 'number', name);
  }

  static boolean(arg: boolean, name: string): void {
    Logger.verbose('Validate.boolean');
    Validate.parameters([arg, name], 2);
    Validate.type(arg, 'boolean', name);
  }

  static parameters(args: any[], expected: number): void {
    Logger.verbose('Validate.parameters');
    if (args.length !== expected) {
      const message = `Expected ${expected} arguments but received ${args.length} arguments!`;
      Logger.error(500, message);
      throw new SyntaxError(message);
    }
  }

  private static type(value: any, type: string, name: string): void {
    Logger.verbose('Validate.#type');
    if (typeof value !== type || value === null) {
      const message = `Argument '${name}' is not a ${type}! Instead received ${typeof value} as ${JSON.stringify(value)}.`;
      Logger.error(400, message);
      throw new Error(message);
    }
  }
}
