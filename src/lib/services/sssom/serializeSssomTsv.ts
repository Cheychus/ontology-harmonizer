import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";
import type { MappingSet } from "$lib/types/mapping";


export function serializeSssomTsv(mappingSet: MappingSet): string {
    const header = [
        `# mapping_set_id: ${JSON.stringify(mappingSet.metadata.mappingSetId)}`,
        `# license: ${JSON.stringify(mappingSet.metadata.license)}`,
        `# mapping_set_title: ${JSON.stringify(mappingSet.metadata.title ?? "")}`,
        `# mapping_set_description: ${JSON.stringify(mappingSet.metadata.description ?? "")}`,
        `# mapping_set_version: ${JSON.stringify(mappingSet.metadata.version ?? "")}`,
        `# comment: ${JSON.stringify(mappingSet.metadata.comment ?? "")}`,
        mappingSet.metadata.curieMap.length > 0 ? "# curie_map:" : "# curie_map: {}",
        ...mappingSet.metadata.curieMap.map((entry) =>
            `#   ${JSON.stringify(entry.prefix)}: ${JSON.stringify(entry.iri)}`
        ),
    ];


    const columns = [
        "subject_id",
        "subject_label",
        "predicate_id",
        "object_id",
        "object_label",
        "author_id",
        "author_label",
        "reviewer_id",
        "reviewer_label",
        "mapping_justification",
        "confidence",
        "comment",
        "mapping_date",
    ];

    const rows = mappingSet.mappings.map((mapping) => {
        return [
            mapping.subjectId,
            mapping.subjectLabel,
            mapping.predicateId,
            mapping.objectId,
            mapping.objectLabel,
            (mapping.authorIds ?? []).join("|"),
            (mapping.authorLabels ?? []).join("|"),
            (mapping.reviewerIds ?? []).join("|"),
            (mapping.reviewerLabels ?? []).join("|"),
            mapping.mappingJustification,
            mapping.confidence,
            mapping.comment,
            mapping.mappingDate,
        ].map(serializeCell).join("\t");
    });

    return [
        ...header,
        columns.join("\t"),
        ...rows,
    ].join("\n");
}

function serializeCell(value: string | number | undefined): string {
    const text = String(value ?? "");
    // Quote cells containing TSV delimiters or quotes, doubling embedded quotes.
    return /[\t\r\n"]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}


export function exportMapping() {
    const content = serializeSssomTsv(mappingStore.mappingSet);

    const blob = new Blob([content], {
        type: "text/tab-separated-values;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mapping.sssom.tsv";
    link.click();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
