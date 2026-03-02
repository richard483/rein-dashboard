<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let sessions: any[] = $state([]);
	let loading = $state(true);
	let loggingOut = $state<string | null>(null);

	onMount(() => {
		loadSessions();
	});

	async function loadSessions() {
		loading = true;
		try {
			const response = await authStore.getSessions();
			sessions = response.data?.sessions || [];
		} catch (error: any) {
			showToast(error.message || 'Failed to load sessions', 'error');
		} finally {
			loading = false;
		}
	}

	async function logoutSession(sessionId: string) {
		loggingOut = sessionId;
		try {
			await authStore.logoutSession(sessionId);
			showToast('Session logged out', 'success');
			await loadSessions();
		} catch (error: any) {
			showToast(error.message || 'Failed to logout session', 'error');
		} finally {
			loggingOut = null;
		}
	}

	async function logoutAll() {
		if (!confirm('Are you sure you want to logout from all devices?')) return;
		
		loading = true;
		try {
			await authStore.logoutAll();
			showToast('Logged out from all devices', 'success');
			await loadSessions();
		} catch (error: any) {
			showToast(error.message || 'Failed to logout', 'error');
		} finally {
			loading = false;
		}
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="page-container">
	<div class="header">
		<h1>Sessions</h1>
		<Button variant="danger" onclick={logoutAll} {loading}>
			Logout All Devices
		</Button>
	</div>

	<p class="text-muted mb-3">Manage your active sessions.</p>

	{#if loading}
		<p>Loading sessions...</p>
	{:else if sessions.length === 0}
		<p>No active sessions found.</p>
	{:else}
		<div class="sessions-list">
			{#each sessions as session}
				<div class="session-card card">
					<div class="session-info">
						<p><strong>Device:</strong> {session.device_info || 'Unknown'}</p>
						<p><strong>IP:</strong> {session.ip_address || 'Unknown'}</p>
						<p><strong>Created:</strong> {formatDate(session.created_at)}</p>
						<p><strong>Expires:</strong> {formatDate(session.expires_at)}</p>
					</div>
					<Button 
						variant="secondary" 
						onclick={() => logoutSession(session.id)}
						loading={loggingOut === session.id}
					>
						Logout
					</Button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.page-container {
		padding: 2rem;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.sessions-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.session-card {
		background: var(--card-bg, #1e293b);
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.session-info p {
		margin: 0.25rem 0;
		font-size: 0.875rem;
	}
</style>
