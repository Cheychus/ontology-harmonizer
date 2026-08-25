import demoArc from "$lib/assets/demoArc/demo-arc.json";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { notification } from "../toasts/toastService";

export function startDemo() {
    arcStore.init(demoArc);

    notification(
        "Demo ARC loaded. You can explore and map ontology values, but GitLab features such as selecting projects or committing changes require an account."
    );
}