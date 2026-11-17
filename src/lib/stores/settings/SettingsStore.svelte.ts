import { browser } from "$app/environment";
import type { TerminologyProviderId } from "$lib/api/terminology";
import type { matchingType } from "$lib/types/terminologyService";

const STORAGE_KEY = "ontologyHarmonizer";

export class SettingsStore {
    // matching service
    loaded = $state(false);
    showHelpHints = $state(true);
    enablePythonMatchingService = $state(false);
    pythonMatchingServiceUrl = $state("http://localhost:8000");
    automaticMatching = $state(true);
    matchingMethod: matchingType = $state("terminology");
    terminologyProvider: TerminologyProviderId = $state("base4nfdi");
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
        }
    }

    private setupAutoSave() {
        $effect(() => {
            if (!this.loaded) return;

            const data = {
                settings: {
                    showHelpHints: this.showHelpHints,
                    enablePythonMatchingService: this.enablePythonMatchingService,
                    pythonMatchingServiceUrl: this.pythonMatchingServiceUrl,
                    automaticMatching: this.automaticMatching,
                    matchingMethod: this.matchingMethod,
                    terminologyProvider: this.terminologyProvider,
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
