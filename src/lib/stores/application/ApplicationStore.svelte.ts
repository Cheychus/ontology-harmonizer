


// Control flow state
class ApplicationStore {
    steps = [
        {
            label: "Login",
            href: "/login",
        },
        {
            label: "Select ARC",
            href: "/select-arc",
        },
        {
            label: "Select Mapping",
            href: "/mapping",
        },
        {
            label: "Map Ontology Values",
            href: "/",
        },
        {
            label: "Apply Mapping",
            href: "/",
        },
        {
            label: "Commit",
            href: "/commit",
        },
    ];


    currentStep = $state(0);

    stepState = $state({
        isLoggedIn: false,
        arcSelected: false,
        mappingConfigured: false,
        mappingApplied: false,
        committed: false
    });

    getCurrentStep() {
        if (!this.stepState.isLoggedIn) return "/login";
        if (!this.stepState.arcSelected) return "/select-arc";
        if (!this.stepState.mappingConfigured) return "/mapping";
        if (!this.stepState.mappingApplied) return "/apply";
        if (!this.stepState.committed) return "/commit";

        return "/select-arc";
    }

    getStepIndex(path: string) {
        return this.steps.findIndex((s) => s.href === path)
    }


}

export const applicationStore = new ApplicationStore();