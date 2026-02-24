export interface OboTerm {
    id: string;
    name: string;
    synonyms: OboSynonym[];
    xrefs: string[];
}

export interface OboFile {
    ontology: string;
    formatVersion: string;
    terms: OboTerm[];
}

const allowedScopes = ["EXACT", "BROAD", "NARROW", "RELATED"] as const;

export type ScopeIdentifier = typeof allowedScopes[number];

export function isScopeIdentifier(value: string): value is ScopeIdentifier {
    return allowedScopes.includes(value as ScopeIdentifier);
}

export interface OboSynonym {
    synonymText: string;
    scopeIdentifier: ScopeIdentifier;
    synonymTypeName?: string;
    xrefList?: string[];
}