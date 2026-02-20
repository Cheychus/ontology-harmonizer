import { fromLocalStorage, removeItem, toLocalStorage } from "$lib/helpers/localStorage";
import type { Collection } from "$lib/types/terminologyService";

class TerminologyStore {

    collections: Collection[] = $state([]);
    selectedCollection: Collection | null = $state(null);

    constructor() {
        this.selectedCollection = this.getLocal();
    }

    saveLocal() {
        if (this.selectedCollection) {
            toLocalStorage("collection", this.selectedCollection);
        }
    }

    getLocal(): Collection | null {
        const col = fromLocalStorage<Collection>("collection");
        if (col) {
            return col;
        } else {
            return this.selectedCollection;
        }
    }

    selectCollection(collection: Collection) {
        this.selectedCollection = collection;
        this.saveLocal();
    }

    removeSelection() {
        removeItem("collection");
        this.selectedCollection = null;
    }

}

export const terminologyStore = new TerminologyStore();