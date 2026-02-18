<script lang="ts">
    import { parseOntologyFile, addTerm, writeOntologyFile, OboParseError } from "$lib/services/oboFiles/oboFile.service";
    import type { OboFile, OboSynonym } from "$lib/types/oboFiles";
    import { onMount } from "svelte";

    interface Props {
        oboFile: string;
    }

    let { oboFile }: Props = $props();

    onMount(() => {
        try {
            const file: OboFile = parseOntologyFile(oboFile);
            console.log(file);
            const syns: OboSynonym[] = [
                { synonymText: "synName", scopeIdentifier: "EXACT" },
                { synonymText: "synName1", scopeIdentifier: "EXACT" },
            ];
            const newTerm = addTerm(file, "Test Name", syns, ["HEY:00001", "HEY:00002"]);

            const oboString = writeOntologyFile(file);
            console.log(oboString);
            // downloadObo(oboString);
        } catch (error) {
            if (error instanceof OboParseError) {
                console.error("OBO Parse error:", error.message, error.line);
            } else {
                console.error("Unknown error: ", error);
            }
        }
    });
</script>

<div class="shadow rounded w-full h-full p-4">
    <h3 class="font-bold text-lg underline py-2">Ontology Mapping</h3>
    <textarea rows="16" disabled class="w-full h-full resize-none">{oboFile}</textarea>
</div>
