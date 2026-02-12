export async function readJsonFile<T>(file: File): Promise<T> {
    const text = await file.text();
    try {
        return JSON.parse(text) as T;
    } catch (error) {
        console.error(error);
        throw new Error("Invalid JSON File");
    }
}

export async function loadArcFile(file: File): Promise<ARC_RO_JSON> {
    const json = await readJsonFile<ARC_RO_JSON>(file);
    return json;
}

