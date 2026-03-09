import { getCollections } from "$lib/api/terminology";
import { terminologyStore } from "$lib/stores/terminologyService/TerminologyStore.svelte.js";
import type { ICollection } from "$lib/types/terminologyService.js";
import type { PageLoad } from "./$types.js";

export const load: PageLoad = async ({ fetch }) => {
    console.log("I RUN");
    if (terminologyStore.collections.length > 0) {
        return {
            collections: terminologyStore.collections
        }
    }
    const collections: ICollection[] = await getCollections(fetch);
    return {
        collections: collections
    };
}