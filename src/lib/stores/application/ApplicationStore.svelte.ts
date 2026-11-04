import type { IGitLabUser } from "$lib/types/gitLab";
import type { MappingContributor } from "$lib/types/mapping";

// Control flow state
class ApplicationStore {
    steps = [
        {
            label: "Select ARC",
            href: "/select-arc",
        },
        {
            label: "Configure mapping",
            href: "/mapping",
        },
        {
            label: "Map Ontology Values",
            href: "/map",
        },
        {
            label: "Review & save",
            href: "/apply",
        },
    ];

    currentStep = $state(0);

    isAuthenticated = $state(false);

    stepState = $state({
        isLoggedIn: false,
        arcSelected: false,
        mappingConfigured: false,
        mappingApplied: false,
        committed: false
    });

    getCurrentStep() {
        if (!this.stepState.arcSelected) return "/select-arc";
        if (!this.stepState.mappingConfigured) return "/mapping";
        if (!this.stepState.mappingApplied) return "/apply";
        return "/apply";
    }

    getStepIndex(path: string) {
        return this.steps.findIndex((s) => s.href === path)
    }

    gitLabUser = $state<IGitLabUser | null>(null);

    defaultMappingContributors = $state<MappingContributor[]>([
        { role: "author", id: "" },
    ]);




}

export const applicationStore = new ApplicationStore();
