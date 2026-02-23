import type { OboFile, OboSynonym, OboTerm } from "$lib/types/oboFiles";
import rawOboString from "$lib/assets/mappings/testmapping.obo?raw";
import { addTerm, OboParseError, parseOntologyFile, writeOntologyFile } from "$lib/services/oboFiles/oboFile.service";

export class OboFileStore {

    rawOboString: string = $state("");
    oboJson: OboFile | null = $state(null);

    constructor(rawOboString: string = "") {
        if (rawOboString) {
            this.load(rawOboString);
        }
    }

    load(rawOboString: string) {
        this.rawOboString = rawOboString;

        try {
            this.oboJson = parseOntologyFile(rawOboString);
        } catch (error) {
            if (error instanceof OboParseError) {
                console.error("OBO Parse error:", error.message, error.line);
            } else {
                console.error("Unknown error:", error);
            }
            this.oboJson = null;
        }
    }

    private sync() {
        if (this.oboJson) {
            this.rawOboString = writeOntologyFile(this.oboJson);
        }
    }

    public removeTerm(index: number): OboTerm[] {
        const deleted = this.oboJson!.terms.splice(index, 1) ?? null;
        this.sync();
        return deleted;
    }

    public removeSynonym(term: OboTerm, synonymIndex: number): OboSynonym[] {
        const deleted = term.synonyms.splice(synonymIndex, 1);
        this.sync();
        return deleted;
    }

    public addSynonym(term: OboTerm, synonymName: string): OboSynonym | null {
        if (term.synonyms.some((s) => s.synonymText === synonymName)) {
            return null;
        }
        const newSyn: OboSynonym = {
            synonymText: synonymName,
            scopeIdentifier: "EXACT",
        }

        term.synonyms.push(newSyn);
        this.sync();
        return newSyn;
    }

    public removeXref(term: OboTerm, xrefIndex: number): string[] {
        const deleted = term.xrefs.splice(xrefIndex, 1);
        this.sync();
        return deleted;
    }

    public addXref(term: OboTerm, xref: string): boolean {
        if (term.xrefs.some((x) => x === xref)) {
            console.error("Xref already exists:", xref);
            return false;
        }
        term.xrefs.push(xref);
        this.sync();
        return true;
    }

    public findTerm(name: string): OboTerm | null {
        const term = this.oboJson?.terms.find((term) => {
            if (term.name === name) {
                return term;
            } else if (term.synonyms.find((syn) => syn.synonymText === name)) {
                return term;
            }
        });

        return term ?? null;
    }

    public addTerm(termName: string, synonyms: OboSynonym[] = [], xrefs: string[]): OboTerm {
        const oboTerm: OboTerm = {
            id: this.getNextId(),
            name: termName,
            synonyms,
            xrefs
        }
        this.oboJson?.terms.push(oboTerm);
        this.sync();
        return oboTerm;
    }

    private createPrefix(): string {
        if (!this.oboJson) throw new Error("No obo Json defined");

        const name = this.oboJson.ontology;
        const prefix = name.replace(/[^\w\s]/gi, '').toUpperCase();
        return prefix;
    }

    private getNextId(): string {
        if (!this.oboJson) throw new Error("No obo Json defined");

        const prefix = this.createPrefix();
        const numbers = this.oboJson.terms
            .filter(t => t.id.startsWith(prefix + ":"))
            .map(t => parseInt(t.id.split(":")[1], 10))
            .filter(n => !isNaN(n));

        const max = numbers.length ? Math.max(...numbers) : 0;
        const next = (max + 1).toString().padStart(7, "0");

        return `${prefix}:${next}`;
    }



}

export let oboFileStore = new OboFileStore(rawOboString);