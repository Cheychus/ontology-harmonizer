import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ARC, ArcStudy, ArcAssay, ArcTable, CompositeHeader, CompositeCell, IOType, OntologyAnnotation } from "@nfdi4plants/arctrl";
import Excel from "@nfdi4plants/exceljs";
import { pushToGitlab } from "$lib/services/arcs/arctrl";
import { createMergeRequest, updateProject } from "$lib/api/gitlab";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { mappingStore } from "$lib/stores/mapping/MappingStore.svelte";

vi.mock("$lib/api/gitlab", () => ({
    updateProject: vi.fn().mockResolvedValue({ web_url: "https://example.org/commit" }),
    createMergeRequest: vi.fn().mockResolvedValue({ web_url: "https://example.org/merge-request" }),
}));

vi.mock("@zerodevx/svelte-toast", () => ({
    toast: { push: vi.fn(() => 1), set: vi.fn(), pop: vi.fn() },
}));

function createCrate(): ARC_RO_JSON {
    const arc = new ARC("export-test", "Export test");
    const study = ArcStudy.create("study", "Study");
    const assay = ArcAssay.create("assay", "Assay");
    const table = ArcTable.init("Metadata");
    table.AddColumn(CompositeHeader.input(IOType.source()), [CompositeCell.createFreeText("source-1")]);
    table.AddColumn(CompositeHeader.characteristic(OntologyAnnotation.create("Organism")), [CompositeCell.createTermFromString("Hordeum vulgare")]);
    table.AddColumn(CompositeHeader.output(IOType.sample()), [CompositeCell.createFreeText("sample-1")]);
    assay.AddTable(table);
    arc.AddStudy(study);
    arc.AddAssay(assay, [study]);
    return JSON.parse(arc.ToROCrateJsonString());
}

beforeEach(() => {
    vi.clearAllMocks();
    mappingStore.createMappingSet();
});

afterEach(() => {
    arcStore.init({ "@context": [], "@graph": [] });
    arcStore.initialised = false;
    arcStore.project = null;
    mappingStore.reset();
});

describe("ARC-RO-Crate to GitLab spreadsheet export", () => {
    it.each(["1.2", "1.1", "1.2-DRAFT"])(
        "exports mapped values with RO-Crate context %s and preserves sample identifiers",
        async (version) => {
            const crate = createCrate();
            crate["@context"][0] = `https://w3id.org/ro/crate/${version}/context`;
            arcStore.init(crate);
            arcStore.project = {
                id: "42", name: "Export test", name_with_namespace: "test/export",
                description: null, default_branch: "main", visibility: "private",
            };
            mappingStore.addCurieMapEntry("EX", "https://example.org/");
            mappingStore.addCurieMapEntry("NCBITaxon", "http://purl.obolibrary.org/obo/NCBITaxon_");
            mappingStore.addSssomMapping({
                subjectId: "EX:barley", subjectLabel: "Hordeum vulgare", objectId: "NCBITaxon:4513",
                predicateId: "skos:exactMatch", mappingJustification: "semapv:ManualMappingCuration",
            });
            expect(arcStore.applyMapping()).toBe(1);

            const result = await pushToGitlab();
            expect(result).toEqual({ commitUrl: "https://example.org/commit", mergeUrl: "https://example.org/merge-request" });
            expect(updateProject).toHaveBeenCalledTimes(1);
            expect(createMergeRequest).toHaveBeenCalledTimes(1);
            const actions = vi.mocked(updateProject).mock.calls[0][2];
            expect(actions.map((action) => action.file_path)).toEqual([
                "isa.investigation.xlsx", "assays/assay/isa.assay.xlsx", "studies/study/isa.study.xlsx",
            ]);
            const assayAction = actions.find((action) => action.file_path === "assays/assay/isa.assay.xlsx")!;
            expect(assayAction).toMatchObject({ action: "update", encoding: "base64" });

            // Read the actual XLSX payload that would be sent to GitLab, without making network requests.
            const workbook = new Excel.Workbook();
            const bytes = Uint8Array.from(Buffer.from(assayAction.content, "base64"));
            await workbook.xlsx.load(bytes.buffer);
            const sheet = workbook.getWorksheet("Metadata")!;
            expect(sheet.getCell("A2").value).toBe("source-1");
            expect(sheet.getCell("B2").value).toBe("Hordeum vulgare");
            expect(sheet.getCell("D2").value).toBe("http://purl.obolibrary.org/obo/NCBITaxon_4513");
            expect(sheet.getCell("E2").value).toBe("sample-1");
            expect(crate["@context"][0]).toBe(`https://w3id.org/ro/crate/${version}/context`);
        },
    );
});
