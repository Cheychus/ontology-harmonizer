import { type OboSynonym, type OboTerm, type OboFile, type ScopeIdentifier, isScopeIdentifier } from "$lib/types/oboFiles";

const OBO_VERSION = "1.4";

export class OboParseError extends Error {
    constructor(message: string, public line?: string) {
        super(message);
        this.name = "OboParseError";
    }
}

export function createOntologyTerm(id: string, name: string, xrefs: string[], synonyms: OboSynonym[]): OboTerm {
    return {
        id,
        name,
        synonyms,
        xrefs,
    };
}

export function parseOntologyFile(oboFile: string): OboFile {
    const ontologyFile: OboFile = {
        ontology: "mapping",
        formatVersion: "",
        terms: [],
    };

    const terms = oboFile.split("[Term]").map((term) => term.trim());
    const header = terms[0].split("\n");

    // First lines are header files
    for (const line of header) {
        const [key, value] = line.split(":").map(s => s.trim());
        if (!key || !value) {
            continue;
        }
        if (key === "format-version") {
            ontologyFile.formatVersion = value;
        }
        if (key === "ontology") {
            ontologyFile.ontology = value;
        }
        if (!ontologyFile.formatVersion) {
            throw new OboParseError("Missing format version in header");
        }
        if (!ontologyFile.ontology) {
            throw new OboParseError("Missing ontology name in header");
        }
    }

    const termBlocks = terms.slice(1); // remove the header

    for (const block of termBlocks) {
        const lines = block.split("\n");

        const term: OboTerm = {
            id: "",
            name: "",
            synonyms: [],
            xrefs: []
        }

        for (const line of lines) {
            if (line.startsWith("id:")) {
                const value = line.split("id:").pop()?.trim();
                if (!value) {
                    throw new OboParseError("Missing Term ID value", line);
                }
                term.id = value;

            }
            if (line.startsWith("name:")) {
                const value = line.split("name:").pop()?.trim() ?? "ERROR: Undefined name";
                if (!value) {
                    throw new OboParseError("Missing Term name", line);
                }
                term.name = value;
            }
            if (line.startsWith("synonym:")) {
                const syn = line.split("synonym:").pop()?.trim();

                if (!syn) {
                    throw new OboParseError("Synonyms are undefined", line);
                }
                const synonym = extractSynonym(syn);
                term.synonyms.push(synonym);
            }
            if (line.startsWith("xref:")) {
                const value = line.split("xref:").pop()?.trim();
                if (!value) {
                    throw new OboParseError("Xrefs are not defined", line);
                }
                term.xrefs.push(value);
            }
        }
        ontologyFile.terms.push(term);
    }
    return ontologyFile;
}

function extractSynonym(synonym: string): OboSynonym {
    // extract text first    
    let synonymText = "";
    const textStartIdx = synonym.indexOf('"');
    const textEndIdx = synonym.lastIndexOf('"');

    if (textStartIdx === -1 || textEndIdx === -1 || textStartIdx > textEndIdx) {
        throw new OboParseError("Invalid synonym format (missing text)", synonym);
    }
    synonymText = synonym.substring(textStartIdx + 1, textEndIdx);

    // extract optional xrefs
    let xrefList: string[] | null = null;
    const xrefStart = synonym.indexOf("[");
    const xrefEnd = synonym.indexOf("]");

    if (xrefStart !== -1 && xrefEnd !== -1 && xrefEnd > xrefStart) {
        const xrefRaw = synonym.substring(xrefStart + 1, xrefEnd);
        if (xrefRaw.length > 0) {
            xrefList = xrefRaw.split(",").map(x => x.trim());
        } else {
            xrefList = [];
        }
    }

    const metaStart = textEndIdx + 1;
    const metaEnd = xrefStart !== -1 ? xrefStart : synonym.length;
    const metaPart = synonym.substring(metaStart, metaEnd).trim();
    const metaTokens = metaPart.split(/\s+/).filter(Boolean);

    if (metaTokens.length === 0) {
        throw new OboParseError("Missing scope identifier in synonym", synonym);
    }

    const scopeIdentifier = metaTokens[0];

    if (!isScopeIdentifier(scopeIdentifier)) {
        throw new OboParseError(
            `Invalid scope identifier: ${scopeIdentifier}`,
            synonym
        );
    }

    const oboSyn: OboSynonym = {
        synonymText,
        scopeIdentifier
    };
    // Add optional attributes
    if (metaTokens.length > 1) {
        oboSyn.synonymTypeName = metaTokens[1];
    }
    if (xrefList) {
        oboSyn.xrefList = xrefList;
    }

    return oboSyn;
}

export function writeOntologyFile(obo: OboFile): string {
    const lines: string[] = [];
    lines.push(`format-version: ${OBO_VERSION}`);
    lines.push(`ontology: ${obo.ontology}`);
    lines.push("");

    obo.terms.forEach((term) => {
        lines.push("[Term]");
        lines.push(`id: ${term.id}`);
        lines.push(`name: ${term.name}`);
        const synonyms = term.synonyms.map((syn) => {
            let synString = `synonym: "${syn.synonymText}" ${syn.scopeIdentifier}`;
            const synType = syn.synonymTypeName;
            const synXrefs = syn.xrefList;

            if (synType) {
                synString += " " + synType;
            }
            if (synXrefs) {
                synString += " [" + synXrefs.join(",") + "]";
            }
            return synString;
        });
        lines.push(synonyms.join("\n"));
        const xrefs = term.xrefs.map((xref) => `xref: ${xref}`).join("\n");
        lines.push(xrefs);
        lines.push(""); // Line break between terms
    });

    const oboString = lines.join("\n");
    return oboString;
}

export function downloadObo(oboString: string, fileName = "mapping.obo") {
    const blob = new Blob([oboString], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

export function getNextId(terms: OboTerm[], prefix: string): string {
    const numbers = terms
        .filter(t => t.id.startsWith(prefix + ":"))
        .map(t => parseInt(t.id.split(":")[1], 10))
        .filter(n => !isNaN(n));

    const max = numbers.length ? Math.max(...numbers) : 0;
    const next = (max + 1).toString().padStart(7, "0");

    return `${prefix}:${next}`;
}
export function createPrefix(oboFile: OboFile): string {
    const name = oboFile.ontology;
    const prefix = name.replace(/[^\w\s]/gi, '').toUpperCase();
    return prefix;
}

export function addTerm(oboFile: OboFile, termName: string, synonyms: OboSynonym[], xrefs: string[]): OboTerm {
    const oboTerm: OboTerm = {
        id: getNextId(oboFile.terms, createPrefix(oboFile)),
        name: termName,
        synonyms,
        xrefs
    }
    oboFile.terms.push(oboTerm);
    return oboTerm;
}




