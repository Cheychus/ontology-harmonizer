import type { CurieMap, MappingSet, ParsedSssomDocument, SssomMapping } from "$lib/types/mapping";
import type { ParsedSssomMapping } from "sssom-js";
import { iriToCurie } from "./curieMap";

export async function parseSssomInServer(file: File) {
  let content = await file.text();
  content = normalizeSssom(content);

  const response = await fetch("/api/sssom", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    throw new Error("SSSOM parsing failed");
  }

  return await response.json();
}

export function createMappingSetFromSssom(
  sssom: ParsedSssomDocument,
): MappingSet {
  const defaults = createDefaultMappingSet();
  const curieMap = sssom.curie_map
    ? Object.entries(sssom.curie_map as Record<string, string>).map(([prefix, iri]) => ({ prefix, iri }))
    : [];

  return {
    ...defaults,
    metadata: {
      ...defaults.metadata,
      mappingSetId: sssom.mapping_set_id as string,
      license: sssom.license as string,
      curieMap,
      title: (sssom.mapping_set_title as string | undefined) ?? "",
      description: (sssom.mapping_set_description as string | undefined) ?? "",
      version: (sssom.mapping_set_version as string | undefined) ?? "",
      comment: (sssom.comment as string | undefined) ?? "",
    },
    mappings: convertImportedMappings(sssom.mappings as ParsedSssomMapping[], curieMap),
  };
}

export function createDefaultMappingSet(): MappingSet {
  return {
    formatVersion: "1.0",
    metadata: {
      mappingSetId: "https://example.org/mapping.sssom.tsv",
      license: "https://creativecommons.org/licenses/by/4.0/",
      curieMap: [
        {
          prefix: "skos",
          iri: "http://www.w3.org/2004/02/skos/core#",
        },
        {
          prefix: "semapv",
          iri: "https://w3id.org/semapv/vocab/",
        },
        {
          prefix: "orcid",
          iri: "https://orcid.org/",
        },
        {
          prefix: "mailto",
          iri: "mailto:",
        },
      ],
      title: "",
      description: "",
      version: "1.0.0",
      comment: "",
    },
    mappings: [],
  };
}

function convertImportedMappings(mappings: ParsedSssomMapping[], curieMap: CurieMap): SssomMapping[] {
  return mappings.flatMap((raw) => {
    if (!raw.subject_id || !raw.predicate_id || !raw.object_id) {
      return [];
    }
    // sssom-js expands CURIEs to IRIs during parsing.
    // Convert them back using the imported prefix map because our internal mapping model uses CURIEs for mapping creation and SSSOM TSV export.
    return {
      subjectId: iriToCurie(raw.subject_id, curieMap),
      subjectLabel: raw.subject_label,
      predicateId: iriToCurie(raw.predicate_id, curieMap),
      objectId: iriToCurie(raw.object_id, curieMap),
      objectLabel: raw.object_label,
      mappingJustification: iriToCurie(raw.mapping_justification ?? "", curieMap) ?? "",
      confidence: raw.confidence,
      comment: raw.comment,
      authorIds: (raw.author_id ?? []).map(id => iriToCurie(id, curieMap)),
      mappingDate: raw.mapping_date,
      reviewerIds: (raw.reviewer_id ?? []).map(id => iriToCurie(id, curieMap)),
    };
  });
}

// SSSOM-Parser will fail to parse tsv files containing \n at the end, so this function removes them. 
function normalizeSssom(content: string): string {
  return content
    .replace(/^\uFEFF/, "")       // remove optional UTF-8 BOM
    .replace(/\r\n/g, "\n")       // normalize Windows line endings
    .replace(/\n+$/, "");         // remove one or more final newlines
}
