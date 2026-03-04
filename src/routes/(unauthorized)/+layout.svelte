<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated } from '$lib/modules/shared/auth';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		// If user is already authenticated, redirect to home
		if ($isAuthenticated) {
			goto('/');
		}
	});
</script>

{@render children()}
