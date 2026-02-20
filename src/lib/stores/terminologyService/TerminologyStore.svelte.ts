import { fromLocalStorage, removeItem, toLocalStorage } from "$lib/helpers/localStorage";
import type { ICollection } from "$lib/types/terminologyService";

class TerminologyStore {

    collections: ICollection[] = $state([]);
    selectedCollection: ICollection | null = $state(null);

    constructor() {
        this.selectedCollection = this.getLocal();
    }

    saveLocal() {
        if (this.selectedCollection) {
            toLocalStorage("collection", this.selectedCollection);
        }
    }

    getLocal(): ICollection | null {
        const col = fromLocalStorage<ICollection>("collection");
        if (col) {
            return col;
        } else {
            return this.selectedCollection;
        }
    }

    selectCollection(collection: ICollection) {
        this.selectedCollection = collection;
        this.saveLocal();
    }

    removeSelection() {
        removeItem("collection");
        this.selectedCollection = null;
    }

}

export const terminologyStore = new TerminologyStore();