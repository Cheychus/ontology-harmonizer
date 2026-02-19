import type { OboFile, OboSynonym, OboTerm } from "$lib/types/oboFiles";
import rawOboString from "$lib/assets/mappings/testmapping.obo?raw";
import { addTerm, OboParseError, parseOntologyFile, writeOntologyFile } from "$lib/services/oboFiles/oboFile.service";

class OboFileStore {

    rawOboString: string = $state("");
    oboJson: OboFile | null = $state(null);

    constructor() {
        this.rawOboString = rawOboString;

        try {
            this.oboJson = parseOntologyFile(this.rawOboString);
        } catch (error) {
            if (error instanceof OboParseError) {
                console.error("OBO Parse error:", error.message, error.line);
            } else {
                console.error("Unknown error: ", error);
            }
            this.oboJson = null;
        }
    }

    sync() {
        if (this.oboJson) {
            this.rawOboString = writeOntologyFile(this.oboJson);
        }
    }

    removeTerm(index: number): OboTerm[] {
        const deleted = this.oboJson!.terms.splice(index, 1) ?? null;
        this.sync();
        return deleted;
    }

    removeSynonym(term: OboTerm, synonymIndex: number): OboSynonym[] {
        const deleted = term.synonyms.splice(synonymIndex, 1);
        this.sync();
        return deleted;
    }

    addSynonym(term: OboTerm, synonym: OboSynonym): boolean {
        if (term.synonyms.some((s) => s.synonymText === synonym.synonymText)) {
            console.error("Synonym already exists:", synonym.synonymText);
            return false;
        }

        term.synonyms.push(synonym);
        this.sync();
        return true;
    }

    removeXref(term: OboTerm, xrefIndex: number): string[] {
        const deleted = term.xrefs.splice(xrefIndex, 1);
        this.sync();
        return deleted;
    }

    addXref(term: OboTerm, xref: string): boolean {
        if (term.xrefs.some((x) => x === xref)) {
            console.error("Xref already exists:", xref);
            return false;
        }
        term.xrefs.push(xref);
        this.sync();
        return true;
    }

}

export const oboFileStore = new OboFileStore();