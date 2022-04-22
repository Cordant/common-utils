export declare class Validate {
    static string(arg: string, name: string): void;
    static object(arg: Object, name: string): void;
    static number(arg: number, name: string): void;
    static boolean(arg: boolean, name: string): void;
    static parameters(args: any[], expected: number): void;
    private static type;
}
