export interface CurieMapEntry {
    prefix: string;
    iri: string;
}
export type CurieMap = CurieMapEntry[];

/** Complete document returned by the SSSOM parser, retained for a future merge/export. */
export interface ParsedSssomDocument {
    mappings: Record<string, unknown>[];
    [headerKey: string]: unknown;
}

export type SupportedPredicate = "skos:exactMatch" | "skos:relatedMatch" | "skos:closeMatch";
export type MappingJustification = "semapv:ManualMappingCuration";

export interface MappingSet {
    formatVersion: '1.0';
    metadata: {
        mappingSetId: string;
        license: string;
        curieMap: CurieMap;
        title?: string;
        description?: string;
        version?: string;
        comment?: string;
    };
    assertions: MappingAssertion[];
}

export interface MappingAssertion {
    id: string;     // internal ID
    subjectId: string;
    subjectLabel?: string;
    predicateId: SupportedPredicate;
    objectId: string;
    objectLabel?: string;
    mappingJustification: MappingJustification;
    confidence?: number;
    comment?: string;
    authorIds?: string[];
    reviewerIds?: string[];
    mappingDate?: string;
}
