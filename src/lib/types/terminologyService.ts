export interface ICollection {
    id: string;
    creator: string;
    description: string;
    label: string;
    terminologies: ITerminology[];
}

export interface ITerminology {
    label: string;
    source: string;
    type?: string;
    uri: string;
}

export interface ITerminologySearchResult {
    label: string;
    short_form: string;
    descriptions: string[];
}