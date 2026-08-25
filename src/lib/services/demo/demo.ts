import demoArc from "$lib/assets/demoArc/demo-arc.json";
import { arcStore } from "$lib/stores/arcs/ArcStore.svelte";
import { notification } from "../toasts/toastService";

export function startDemo() {
    arcStore.init(demoArc);
    arcStore.arcProjectId = null;

    notification(
        "Search for ontology terms with the Search button or enter a specific term. Browse results with the arrow buttons or keyboard arrow keys. The IRI and short form are filled automatically but can be edited for manual mappings. Select Map to save a result, choose another queued value, or skip values that do not need an ontology mapping."
    );

    notification(
        "Demo ARC loaded. You can explore and map ontology values, but GitLab features such as selecting projects or committing changes require an account."
    );


}