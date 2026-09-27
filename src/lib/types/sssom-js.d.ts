declare module "sssom-js" {
    export function parseSSSOMString(input: string, options?: Record<string, unknown>): Promise<Record<string, unknown>>;
    export interface ParsedSssomMapping {
        subject_id?: string;
        subject_label?: string;
        predicate_id?: string;
        object_id?: string;
        object_label?: string;
        mapping_justification?: string;
        confidence?: number;
        comment?: string;
        author_id?: string;
    }
}
