export function extractPrefixFromCurie(curie: string) {
    const separator = curie.indexOf(":");
    const prefix = separator === -1 ? null : curie.slice(0, separator);
    if (!prefix) {
        return null;
    }
    return prefix;
}

export function extractLocalIdFromCurie(curie: string) {
    const separator = curie.indexOf(":");
    const localId = separator === -1 ? null : curie.slice(separator + 1);
    if (!localId) {
        return null;
    }
    return localId;
}

export function extractBaseIri(curie: string, fullIri: string) {
    const localId = extractLocalIdFromCurie(curie);
    if (!localId) {
        return null;
    }

    if (fullIri.endsWith(localId)) {
        const baseUrl = fullIri.slice(0, -localId.length)
        return baseUrl;
    }

    return null;

}