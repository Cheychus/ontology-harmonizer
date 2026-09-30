export function extractPrefixFromObjectId(objectId: string) {
    const separator = objectId.indexOf(":");
    const prefix = separator === -1 ? null : objectId.slice(0, separator);
    if (!prefix) {
        return null;
    }
    return prefix;
}

export function extractLocalIdFromObjectId(objectId: string) {
    const separator = objectId.indexOf(":");
    const localId = separator === -1 ? objectId : objectId.slice(separator + 1);
    if (!localId) {
        return null;
    }
    return localId;
}

export function extractBaseIri(objectId: string, fullIri: string) {
    const localId = extractLocalIdFromObjectId(objectId);
    if (!localId) {
        return null;
    }

    if (fullIri.endsWith(localId)) {
        const baseUrl = fullIri.slice(0, -localId.length)
        return baseUrl;
    }

    return null;
}

export function isCurieMapDetailsValid(fullIri: string, objectId: string, prefix: string, baseIri: string): boolean {
    const localId = extractLocalIdFromObjectId(objectId);
    if (!prefix || !baseIri || !localId) {
        return false;
    }

    return fullIri === baseIri + localId;
}