<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import type { LayoutProps } from "./$types";
	import { SvelteToast } from "@zerodevx/svelte-toast";
	import Stepper from "$lib/components/application/Stepper.svelte";
	import { page } from "$app/state";
	import { onMount, untrack } from "svelte";
	import { settingsStore } from "$lib/stores/settings/SettingsStore.svelte";
	import { applicationStore } from "$lib/stores/application/ApplicationStore.svelte";
	import { Button } from "$lib/components/ui/button";
	import { invalidate } from "$app/navigation";
	import { refreshGitLabSession } from "$lib/services/gitlab/gitlab";
	import { ApiError } from "$lib/api/api";
	import { success } from "$lib/services/toasts/toastService";
	import { ExternalLink } from "lucide-svelte";

	let { children, data }: LayoutProps = $props();
	$effect(() => {
		const user = data.user;
		// Navigation may reuse layout data loaded before the session expired.
		if (user && untrack(() => applicationStore.sessionExpired)) return;
		applicationStore.setGitLabUser(user);
	});
	let hasWorkflowFooter = $derived(["/select-arc", "/filter-terms", "/mapping", "/apply"].includes(page.url.pathname));
	let checkingSession = $state(false);
	let connectionCheckMessage = $state("");

	async function checkConnection() {
		if (checkingSession) return;
		checkingSession = true;
		connectionCheckMessage = "";
		try {
			await refreshGitLabSession();
			// Refresh only the server-provided user data; keep this page and its stores mounted.
			await invalidate("/api/gitlab/user");
			success("Connected to DataHUB");
		} catch (error) {
			connectionCheckMessage = error instanceof ApiError && error.status === 401
				? "You are still signed out. Finish signing in in the new tab, then check again."
				: "Could not check the connection. Please try again.";
		} finally {
			checkingSession = false;
		}
	}

	// Optionally set default options here
	const options = {
		duration: 6000,
		classes: ["toast"],
		pausable: true,
	};

	onMount(() => {
		settingsStore.init();
	});

</script>

<SvelteToast {options} />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{#if page.url.pathname !== "/" && page.url.pathname !== "/auth/gitlab/reconnected"}
	<Stepper></Stepper>
{/if}

<main class={`pt-25 flex flex-col justify-start items-center w-full min-h-screen mx-auto ${page.url.pathname === "/map" ? "px-4 md:px-8" : `md:max-w-5xl ${hasWorkflowFooter ? "pb-8" : "pb-32"}`}`}>
	{#if applicationStore.sessionExpired}
		<div role="alert" class="mb-4 flex w-full flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-500/50 bg-amber-50 p-4">
			<div>
				<p class="text-sm font-medium">Your DataHUB session has expired.</p>
				<p class="text-sm text-muted-foreground">Sign in in a new tab, then return here and check the connection. Keep this tab open to retain your work.</p>
				{#if connectionCheckMessage}<p class="mt-2 text-sm" role="status">{connectionCheckMessage}</p>{/if}
			</div>
			<div class="flex flex-wrap gap-2">
				<Button href="/auth/gitlab?reconnect=true" target="_blank" rel="noopener noreferrer" variant="outline">Reconnect to DataHUB <ExternalLink class="size-4" /></Button>
				<Button disabled={checkingSession} onclick={checkConnection}>{checkingSession ? "Checking..." : "Check connection"}</Button>
			</div>
		</div>
	{/if}
	{@render children()}
</main>
