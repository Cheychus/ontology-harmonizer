<script lang="ts">
    import { arcStore } from "$lib/stores/ArcStore.svelte";
    import * as Table from "$lib/components/ui/table/index.js";

    interface Props {
        fileName: string;
    }

    let { fileName = $bindable() }: Props = $props();

    let statusLog: string[] = $state([]);
</script>

<div class="shadow p-4 flex w-full flex-col gap-2 py-4 font-bold">
    <h2 class="">Status:</h2>
    <p>Filename: {fileName}</p>
    <Table.Root>
        <Table.Caption></Table.Caption>
        <Table.Header>
            <Table.Row>
                <Table.Head class="">Ontologies</Table.Head>
                <Table.Head>Defined</Table.Head>
                <Table.Head>Undefined</Table.Head>
                <Table.Head class="">Mappable</Table.Head>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            <Table.Row>
                <Table.Cell class="font-medium">{arcStore.ontologiesCount}</Table.Cell>
                <Table.Cell>{arcStore.definedOntologies.size}</Table.Cell>
                <Table.Cell>{arcStore.undefinedOntologies.size}</Table.Cell>
                <Table.Cell class="text-green-400">0</Table.Cell>
            </Table.Row>
        </Table.Body>
    </Table.Root>
    <h4 class="underline">Status Messages</h4>
    {#each statusLog as log}
        <p class="text-green-400">{log}</p>
    {/each}
</div>
