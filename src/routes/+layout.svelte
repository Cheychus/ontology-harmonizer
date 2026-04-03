<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import type { LayoutProps } from "./$types";
	import GitLabUser from "$lib/components/gitlab/GitLabUser.svelte";
	import Button from "$lib/components/ui/button/button.svelte";
	import { goto } from "$app/navigation";
	import { SvelteToast } from "@zerodevx/svelte-toast";

	let { data, children }: LayoutProps = $props();

	// Optionally set default options here
	const options = {
		pausable: true,
	};

	// 	$inspect("data:", data);
</script>

<SvelteToast {options} />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="w-full flex">
	<GitLabUser user={data.user} />
	<Button variant="link" onclick={() => goto("/commit")}>Commit</Button>
</div>
<div class="flex flex-col justify-center items-center w-full md:max-w-5xl mx-auto pb-32">
	{@render children()}
</div>
