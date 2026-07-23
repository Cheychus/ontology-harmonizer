import { browser } from "$app/environment";
import type { matchingType } from "$lib/components/ontologies/OntologyMapCard.svelte";
import { failure } from "$lib/services/toasts/toastService";
import { mappingStore } from "../mapping/MappingStore.svelte";

const STORAGE_KEY = "ontologyHarmonizer";

export class SettingsStore {
    // matching service
    loaded = $state(false);
    enablePythonMatchingService = $state(true);
    pythonMatchingServiceUrl = $state("http://localhost:8000");
    automaticMatching = $state(true);
    matchingMethod: matchingType = $state("terminology");
    matchingServiceAvailable: boolean | null = $state(null);


    init() {
        if (!browser) return;
        this.loadAll();
        this.setupAutoSave();
        this.loaded = true;

        $effect(() => {
            if (this.enablePythonMatchingService && this.pythonMatchingServiceUrl !== "") {
                this.checkService();
            } else {
                this.matchingServiceAvailable = null;
            }
        })
    }

    private loadAll() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            if (data.settings) {
                Object.assign(this, data.settings);
            }
            if (data.mapping && data.mappingName) {
                mappingStore.load(data.mapping);
                mappingStore.fileName = data.mappingName;
            }
        }
    }

    private setupAutoSave() {
        $effect(() => {
            if (!this.loaded) return;

            const data = {
                mapping: mappingStore.mappingJson,
                mappingName: mappingStore.fileName,
                settings: {
                    enablePythonMatchingService: this.enablePythonMatchingService,
                    pythonMatchingServiceUrl: this.pythonMatchingServiceUrl,
                    automaticMatching: this.automaticMatching,
                    matchingMethod: this.matchingMethod,
                }

            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        });
    }

    async checkService() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);

            const res = await fetch(
                `/api?target=${settingsStore.pythonMatchingServiceUrl}`,
                { signal: controller.signal }
            );

            clearTimeout(timeout);

            this.matchingServiceAvailable = res.ok;
        } catch (e) {
            this.matchingServiceAvailable = false;
        } finally {
            return this.matchingServiceAvailable;
        }
    }

}

export const settingsStore = new SettingsStore();