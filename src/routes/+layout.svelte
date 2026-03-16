<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import type { LayoutProps } from "./$types";
	import GitLabUser from "$lib/components/gitlab/GitLabUser.svelte";

	let { data, children }: LayoutProps = $props();

	$inspect("data:", data);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="w-full flex">
	<GitLabUser user={data.user} />
</div>
<div class="flex flex-col justify-center items-center w-full md:max-w-5xl mx-auto">
	{@render children()}
</div>
