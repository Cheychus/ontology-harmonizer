import { arcStore } from "$lib/stores/ArcStore.svelte";

export async function readJsonFile<T>(file: File): Promise<T> {
    const text = await file.text();
    try {
        return JSON.parse(text) as T;
    } catch (error) {
        console.error(error);
        throw new Error("Invalid JSON File");
    }
}

export async function loadArcFile(file: File): Promise<void> {
    const json = await readJsonFile<ARC_RO_JSON>(file);
    arcStore.init(json);
}

export function downloadJson(data: unknown, fileName: string) {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
}

