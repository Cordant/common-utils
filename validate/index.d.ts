/**
 * @description This class is used to ensure that parameters passed has the required value and type.
 */
export declare class Validate {
    /**
     * @description Ensures that a string is received.
     * @param arg The value to test.
     * @param name The name of the value. if the variable that you passed is named userDetails, this value should be a string with 'userDetails'.
     */
    static string(arg: string, name: string): void;
    /**
     * @description Ensures that an object is received.
     * @param arg The value to test.
     * @param name The name of the value. if the variable that you passed is named userDetails, this value should be a string with 'userDetails'.
     */
    static object(arg: Object, name: string): void;
    /**
     * @description Ensures that a number is received.
     * @param arg The value to test.
     * @param name The name of the value. if the variable that you passed is named userDetails, this value should be a string with 'userDetails'.
     */
    static number(arg: number, name: string): void;
    /**
     * @description Ensures that a boolean is received.
     * @param arg The value to test.
     * @param name The name of the value. if the variable that you passed is named userDetails, this value should be a string with 'userDetails'.
     */
    static boolean(arg: boolean, name: string): void;
    static parameters(args: any[], expected: number): void;
    private static type;
}
