<script lang="ts">
    interface Props {
        oboFile: OboFile;
    }

    let { oboFile }: Props = $props();
</script>

<div class="shadow rounded w-full h-full p-4">
    <h3 class="font-bold text-lg underline py-2">Ontology Mapping</h3>
    <textarea rows="16" disabled class="w-full h-full resize-none">{oboFile}</textarea>
</div>
