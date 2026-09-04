declare module "sssom-js" {
    export function parseSSSOMString(input: string, options?: Record<string, unknown>): Promise<Record<string, unknown>>;
}
