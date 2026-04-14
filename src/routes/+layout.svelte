<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import type { LayoutProps } from "./$types";
	import GitLabUser from "$lib/components/gitlab/GitLabUser.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { goto } from "$app/navigation";
	import { SvelteToast } from "@zerodevx/svelte-toast";
	import Stepper from "$lib/components/application/Stepper.svelte";

	let { data, children }: LayoutProps = $props();

	// Optionally set default options here
	const options = {
		pausable: true,
	};

	// 	$inspect("data:", data);
</script>

<SvelteToast {options} />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Stepper></Stepper>

<main class="pt-32 flex flex-col justify-start items-center w-full h-screen md:max-w-5xl mx-auto pb-32">
	<div class="w-full h-full">
		{@render children()}
	</div>
</main>
