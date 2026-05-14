<script lang="ts">
	import { onMount } from 'svelte';
	import { showToast } from '$lib/modules/shared/components';
	import Button from '$lib/modules/shared/components/Button.svelte';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import * as karasuApi from '$lib/modules/karasu';
	import type { MachineTokenResponse, OAuthClient } from '$lib/modules/shared/types';

	let clients = $state<OAuthClient[]>([]);
	let loading = $state(false);
	let selected = $state<OAuthClient | null>(null);
	let name = $state('');
	let publicKey = $state('');
	let scopes = $state('pg-client:execute');
	let audiences = $state('pg-client-api');
	let isActive = $state(true);

	let tokenClientId = $state('');
	let tokenAudience = $state('pg-client-api');
	let tokenScope = $state('pg-client:execute');
	let clientAssertion = $state('');
	let tokenResponse = $state<MachineTokenResponse | null>(null);

	onMount(() => {
		loadClients();
	});

	async function loadClients() {
		loading = true;
		try {
			const response = await karasuApi.listOAuthClients();
			clients = response.clients || [];
		} catch (error: any) {
			showToast(error.message || 'Failed to load OAuth clients', 'error');
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		selected = null;
		name = '';
		publicKey = '';
		scopes = 'pg-client:execute';
		audiences = 'pg-client-api';
		isActive = true;
	}

	function editClient(client: OAuthClient) {
		selected = client;
		name = client.name;
		publicKey = '';
		scopes = client.allowed_scopes.join('\n');
		audiences = client.allowed_audiences.join('\n');
		isActive = client.is_active;
	}

	function listFromText(value: string) {
		return value
			.split(/[\n,]/)
			.map((item) => item.trim())
			.filter(Boolean);
	}

	async function saveClient(e: Event) {
		e.preventDefault();
		if (!name) {
			showToast('Client name is required', 'error');
			return;
		}

		try {
			if (selected) {
				const updated = await karasuApi.updateOAuthClient(selected.id, {
					name,
					allowed_scopes: listFromText(scopes),
					allowed_audiences: listFromText(audiences),
					is_active: isActive
				});
				if (publicKey.trim()) {
					await karasuApi.updateOAuthClientPublicKey(updated.id, { public_key_pem: publicKey });
				}
				showToast('OAuth client updated', 'success');
			} else {
				if (!publicKey.trim()) {
					showToast('Public key is required for new clients', 'error');
					return;
				}
				await karasuApi.createOAuthClient({
					name,
					public_key_pem: publicKey,
					allowed_scopes: listFromText(scopes),
					allowed_audiences: listFromText(audiences)
				});
				showToast('OAuth client created', 'success');
			}
			resetForm();
			await loadClients();
		} catch (error: any) {
			showToast(error.message || 'Failed to save OAuth client', 'error');
		}
	}

	async function deleteClient(client: OAuthClient) {
		try {
			await karasuApi.deleteOAuthClient(client.id);
			showToast('OAuth client deleted', 'success');
			if (selected?.id === client.id) resetForm();
			await loadClients();
		} catch (error: any) {
			showToast(error.message || 'Failed to delete OAuth client', 'error');
		}
	}

	async function requestToken(e: Event) {
		e.preventDefault();
		if (!tokenClientId || !tokenAudience || !tokenScope || !clientAssertion) {
			showToast('Client ID, audience, scope, and assertion are required', 'error');
			return;
		}

		try {
			tokenResponse = await karasuApi.requestMachineToken({
				grant_type: 'client_credentials',
				client_id: tokenClientId,
				audience: tokenAudience,
				scope: tokenScope,
				client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
				client_assertion: clientAssertion
			});
			showToast('Machine token issued', 'success');
		} catch (error: any) {
			showToast(error.message || 'Failed to request machine token', 'error');
		}
	}
</script>

<div class="page">
	<div class="page-header">
		<div>
			<h1>App-to-App Integration</h1>
			<p class="text-muted">Manage OAuth clients used by machine-to-machine integrations.</p>
		</div>
		<Button variant="outline" onclick={resetForm}>New Client</Button>
	</div>

	<div class="grid-two">
		<section class="card">
			<h2>{selected ? 'Edit OAuth Client' : 'Create OAuth Client'}</h2>
			<form onsubmit={saveClient}>
				<Input label="Name" bind:value={name} placeholder="pg-client" required />
				<label>
					Allowed Scopes
					<textarea bind:value={scopes} placeholder="One scope per line"></textarea>
				</label>
				<label>
					Allowed Audiences
					<textarea bind:value={audiences} placeholder="One audience per line"></textarea>
				</label>
				<label>
					RSA Public Key PEM
					<textarea bind:value={publicKey} placeholder="-----BEGIN PUBLIC KEY-----"></textarea>
				</label>
				{#if selected}
					<label class="checkbox">
						<input type="checkbox" bind:checked={isActive} />
						Active
					</label>
				{/if}
				<Button type="submit">{selected ? 'Update Client' : 'Create Client'}</Button>
			</form>
		</section>

		<section class="card">
			<h2>Machine Token Test</h2>
			<form onsubmit={requestToken}>
				<Input label="Client ID" bind:value={tokenClientId} placeholder="app_..." required />
				<Input label="Audience" bind:value={tokenAudience} required />
				<Input label="Scope" bind:value={tokenScope} required />
				<label>
					Client Assertion JWT
					<textarea bind:value={clientAssertion} placeholder="Paste signed client_assertion JWT"></textarea>
				</label>
				<Button type="submit">Request Token</Button>
			</form>
			{#if tokenResponse}
				<pre>{JSON.stringify(tokenResponse, null, 2)}</pre>
			{/if}
		</section>
	</div>

	<section class="card mt-4">
		<div class="page-header compact">
			<h2>Registered Clients</h2>
			<Button variant="outline" onclick={loadClients}>Refresh</Button>
		</div>

		{#if loading}
			<p class="text-muted">Loading clients...</p>
		{:else}
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Client ID</th>
						<th>Scopes</th>
						<th>Audiences</th>
						<th>Status</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{#each clients as client}
						<tr>
							<td>{client.name}</td>
							<td><code>{client.client_id}</code></td>
							<td>{client.allowed_scopes.join(', ')}</td>
							<td>{client.allowed_audiences.join(', ')}</td>
							<td>{client.is_active ? 'Active' : 'Inactive'}</td>
							<td class="actions">
								<Button variant="outline" onclick={() => editClient(client)}>Edit</Button>
								<Button variant="danger" onclick={() => deleteClient(client)}>Delete</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
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
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.page-header.compact {
		margin-bottom: 1rem;
	}

	.grid-two {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
		gap: 1rem;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.875rem;
		font-weight: 500;
	}

	.checkbox {
		flex-direction: row;
		align-items: center;
	}

	textarea {
		width: 100%;
		min-height: 110px;
		padding: 0.75rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
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

	.actions {
		display: flex;
		gap: 0.5rem;
	}

	code {
		word-break: break-all;
	}

	pre {
		margin-top: 1rem;
		white-space: pre-wrap;
		word-break: break-word;
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 4px;
	}
</style>
