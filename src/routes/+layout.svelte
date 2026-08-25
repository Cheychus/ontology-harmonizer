<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import type { LayoutProps } from "./$types";
	import { SvelteToast } from "@zerodevx/svelte-toast";
	import Stepper from "$lib/components/application/Stepper.svelte";
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import { settingsStore } from "$lib/stores/settings/SettingsStore.svelte";

	let { children }: LayoutProps = $props();

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
{#if page.url.pathname !== "/"}
	<Stepper></Stepper>
{/if}

<main class="pt-25 flex flex-col justify-start items-center w-full min-h-screen md:max-w-5xl mx-auto pb-32">
	{@render children()}
</main>
