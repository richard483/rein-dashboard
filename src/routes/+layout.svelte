<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore, isAuthenticated, currentUser } from '$lib/modules/shared/auth';
	import Toast from '$lib/modules/shared/components/Toast.svelte';
	import '../lib/styles/global.css';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	onMount(() => {
		authStore.init();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<Toast />

{@render children()}
