import { goto } from "$app/navigation";
import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
import { redirect } from "@sveltejs/kit";


export function load({ url }) {
    const expectedRoute = applicationStore.getCurrentStep();

    const currentIndex = applicationStore.getStepIndex(url.pathname);
    const expectedIndex = applicationStore.getStepIndex(expectedRoute);

    if (currentIndex > expectedIndex) {
        throw redirect(302, expectedRoute);
    }
}