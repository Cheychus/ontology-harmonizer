export interface Collection {
    id: string;
    creator: string;
    description: string;
    label: string;
    terminologies: Terminology[];
}

export interface Terminology {
    label: string;
    source: string;
    type?: string;
    uri: string;
}