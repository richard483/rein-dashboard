<script lang="ts">
	import { onMount } from 'svelte';
	import { showToast } from '$lib/modules/shared/components';
	import Button from '$lib/modules/shared/components/Button.svelte';
	import * as karasuApi from '$lib/modules/karasu';
	import type { HealthStatus, JwksResponse, OAuthIntrospectionResponse } from '$lib/modules/shared/types';

	let health = $state<HealthStatus | null>(null);
	let live = $state<HealthStatus | null>(null);
	let ready = $state<HealthStatus | null>(null);
	let jwks = $state<JwksResponse | null>(null);
	let token = $state('');
	let introspection = $state<OAuthIntrospectionResponse | null>(null);
	let loading = $state(false);

	onMount(() => {
		loadHealth();
		loadJWKS();
	});

	async function loadHealth() {
		loading = true;
		try {
			[health, live, ready] = await Promise.all([
				karasuApi.getHealth(),
				karasuApi.getLiveness(),
				karasuApi.getReadiness()
			]);
		} catch (error: any) {
			showToast(error.message || 'Failed to load health checks', 'error');
		} finally {
			loading = false;
		}
	}

	async function loadJWKS() {
		try {
			jwks = await karasuApi.getJWKS();
		} catch (error: any) {
			showToast(error.message || 'Failed to load JWKS', 'error');
		}
	}

	async function introspect(e: Event) {
		e.preventDefault();
		if (!token) {
			showToast('Token is required', 'error');
			return;
		}
		try {
			introspection = await karasuApi.introspectToken(token);
		} catch (error: any) {
			showToast(error.message || 'Failed to introspect token', 'error');
		}
	}
</script>

<div class="page">
	<div class="page-header">
		<h1>Health & Token Tools</h1>
		<Button onclick={loadHealth}>Refresh Health</Button>
	</div>

	<div class="grid-three">
		<div class="card">
			<h2>Health</h2>
			<pre>{JSON.stringify(health, null, 2)}</pre>
		</div>
		<div class="card">
			<h2>Live</h2>
			<pre>{JSON.stringify(live, null, 2)}</pre>
		</div>
		<div class="card">
			<h2>Ready</h2>
			<pre>{JSON.stringify(ready, null, 2)}</pre>
		</div>
	</div>

	<section class="card mt-4">
		<div class="page-header compact">
			<h2>JWKS</h2>
			<Button variant="outline" onclick={loadJWKS}>Refresh Keys</Button>
		</div>
		<pre>{JSON.stringify(jwks, null, 2)}</pre>
	</section>

	<section class="card mt-4">
		<h2>Introspect Token</h2>
		<form onsubmit={introspect}>
			<textarea bind:value={token} placeholder="Paste Karasu access token"></textarea>
			<Button type="submit">Introspect</Button>
		</form>
		{#if introspection}
			<pre>{JSON.stringify(introspection, null, 2)}</pre>
		{/if}
	</section>
</div>

<style>
	.page {
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.page-header.compact {
		margin-bottom: 1rem;
	}

	.grid-three {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
	}

	pre {
		white-space: pre-wrap;
		word-break: break-word;
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 4px;
		max-height: 420px;
		overflow: auto;
	}

	textarea {
		width: 100%;
		min-height: 140px;
		margin-bottom: 1rem;
		padding: 0.75rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
	}
</style>
