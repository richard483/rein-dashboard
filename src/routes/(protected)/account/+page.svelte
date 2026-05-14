<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore, currentUser } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Button from '$lib/modules/shared/components/Button.svelte';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import * as karasuApi from '$lib/modules/karasu';
	import type { ApiKeyInfo, CreateApiKeyResponse, Session } from '$lib/modules/shared/types';

	let sessions = $state<Session[]>([]);
	let apiKeys = $state<ApiKeyInfo[]>([]);
	let providers = $state<string[]>([]);
	let loading = $state(false);
	let keyName = $state('');
	let keyExpiresIn = $state<number | ''>('');
	let createdKey = $state<CreateApiKeyResponse | null>(null);

	onMount(() => {
		loadAccountData();
	});

	async function loadAccountData() {
		loading = true;
		try {
			const [sessionResponse, keyResponse, providerResponse] = await Promise.all([
				karasuApi.getSessions(),
				karasuApi.listApiKeys(),
				karasuApi.getOAuthProviders()
			]);
			sessions = sessionResponse.sessions || [];
			apiKeys = keyResponse.api_keys || [];
			providers = providerResponse || [];
		} catch (error: any) {
			showToast(error.message || 'Failed to load account data', 'error');
		} finally {
			loading = false;
		}
	}

	async function createKey(e: Event) {
		e.preventDefault();
		if (!keyName) {
			showToast('API key name is required', 'error');
			return;
		}

		try {
			createdKey = await karasuApi.createApiKey({
				name: keyName,
				expires_in: keyExpiresIn === '' ? null : Number(keyExpiresIn)
			});
			keyName = '';
			keyExpiresIn = '';
			showToast('API key created', 'success');
			await loadAccountData();
		} catch (error: any) {
			showToast(error.message || 'Failed to create API key', 'error');
		}
	}

	async function deleteKey(id: string) {
		try {
			await karasuApi.deleteApiKey(id);
			showToast('API key deleted', 'success');
			await loadAccountData();
		} catch (error: any) {
			showToast(error.message || 'Failed to delete API key', 'error');
		}
	}

	async function deleteSession(id: string) {
		try {
			await karasuApi.deleteSession(id);
			showToast('Session deactivated', 'success');
			await loadAccountData();
		} catch (error: any) {
			showToast(error.message || 'Failed to deactivate session', 'error');
		}
	}

	async function logoutAll() {
		try {
			await karasuApi.logoutAll();
			await authStore.logout();
			showToast('All sessions terminated', 'success');
		} catch (error: any) {
			showToast(error.message || 'Failed to terminate sessions', 'error');
		}
	}
</script>

<div class="page">
	<div class="page-header">
		<div>
			<h1>Account & Auth Tools</h1>
			<p class="text-muted">Logged in as {$currentUser?.username}</p>
		</div>
		<Button variant="danger" onclick={logoutAll}>Logout All Sessions</Button>
	</div>

	{#if loading}
		<div class="card">Loading account data...</div>
	{/if}

	<div class="grid-two">
		<section class="card">
			<h2>OAuth Providers</h2>
			{#if providers.length}
				<div class="chips">
					{#each providers as provider}
						<span>{provider}</span>
					{/each}
				</div>
			{:else}
				<p class="text-muted">No OAuth providers are configured.</p>
			{/if}
		</section>

		<section class="card">
			<h2>Create API Key</h2>
			<form onsubmit={createKey}>
				<Input label="Name" bind:value={keyName} placeholder="Automation key" required />
				<Input label="Expires In Days" type="number" bind:value={keyExpiresIn} placeholder="Blank for no expiration" />
				<Button type="submit">Create Key</Button>
			</form>
			{#if createdKey}
				<div class="secret-box">
					<strong>Copy this key now:</strong>
					<code>{createdKey.api_key}</code>
				</div>
			{/if}
		</section>
	</div>

	<section class="card mt-4">
		<h2>API Keys</h2>
		<table>
			<thead>
				<tr>
					<th>Name</th>
					<th>Created</th>
					<th>Expires</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each apiKeys as key}
					<tr>
						<td>{key.name}</td>
						<td>{key.created_at}</td>
						<td>{key.expires_at || 'Never'}</td>
						<td><Button variant="danger" onclick={() => deleteKey(key.id)}>Delete</Button></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section class="card mt-4">
		<h2>Sessions</h2>
		<table>
			<thead>
				<tr>
					<th>Device</th>
					<th>IP</th>
					<th>Last Activity</th>
					<th>Expires</th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each sessions as session}
					<tr>
						<td>{session.device_info}</td>
						<td>{session.ip_address}</td>
						<td>{session.last_activity_at}</td>
						<td>{session.expires_at}</td>
						<td><Button variant="danger" onclick={() => deleteSession(session.id)}>Deactivate</Button></td>
					</tr>
				{/each}
			</tbody>
		</table>
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
		gap: 1rem;
		align-items: center;
		margin-bottom: 2rem;
	}

	.grid-two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 1rem;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	td {
		padding: 0.75rem;
		border-bottom: 1px solid #eee;
		text-align: left;
		vertical-align: top;
	}

	.chips {
		display: flex;
		gap: 0.5rem;
	}

	.chips span {
		border: 1px solid #ddd;
		border-radius: 999px;
		padding: 0.25rem 0.75rem;
		background: #f8f9fa;
	}

	.secret-box {
		margin-top: 1rem;
		padding: 1rem;
		background: #fff8e1;
		border: 1px solid #ffe08a;
		border-radius: 4px;
	}

	code {
		display: block;
		margin-top: 0.5rem;
		word-break: break-all;
	}
</style>
