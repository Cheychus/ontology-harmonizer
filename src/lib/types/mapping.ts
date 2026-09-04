export interface CurieMapEntry {
    prefix: string;
    iri: string;
}
export type CurieMap = CurieMapEntry[];
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
