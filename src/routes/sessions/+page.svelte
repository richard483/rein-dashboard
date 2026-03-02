<script lang="ts">
	import { onMount } from 'svelte';
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Button from '$lib/modules/shared/components/Button.svelte';

	interface Session {
		id: string;
		device_info: string;
		ip_address: string;
		created_at: string;
		last_activity_at: string;
		expires_at: string;
	}

	let sessions = $state<Session[]>([]);
	let loading = $state(true);
	let loggingOut = $state(false);

	onMount(() => {
		loadSessions();
	});

	async function loadSessions() {
		loading = true;
		try {
			const response = await authStore.getSessions();
			if (response.data?.sessions) {
				sessions = response.data.sessions;
			}
		} catch (error: any) {
			showToast('Failed to load sessions', 'error');
		} finally {
			loading = false;
		}
	}

	async function logoutSession(sessionId: string) {
		if (!confirm('Are you sure you want to logout from this session?')) {
			return;
		}

		loggingOut = true;
		try {
			await authStore.logoutSession(sessionId);
			showToast('Session logged out', 'success');
			await loadSessions();
		} catch (error: any) {
			showToast('Failed to logout session', 'error');
		} finally {
			loggingOut = false;
		}
	}

	async function logoutAll() {
		if (!confirm('Are you sure you want to logout from ALL sessions? This will logout all your devices.')) {
			return;
		}

		loggingOut = true;
		try {
			await authStore.logoutAll();
			showToast('All sessions logged out', 'success');
			await loadSessions();
		} catch (error: any) {
			showToast('Failed to logout all sessions', 'error');
		} finally {
			loggingOut = false;
		}
	}
</script>

<div class="sessions-container">
	<div class="sessions-card card">
		<div class="header">
			<h1>Active Sessions</h1>
			<Button variant="danger" onclick={logoutAll} loading={loggingOut}>
				Logout All
			</Button>
		</div>

		{#if loading}
			<p class="text-muted">Loading sessions...</p>
		{:else if sessions.length === 0}
			<p class="text-muted">No active sessions found.</p>
		{:else}
			<div class="sessions-list">
				{#each sessions as session}
					<div class="session-item">
						<div class="session-info">
							<p><strong>Device:</strong> {session.device_info || 'Unknown'}</p>
							<p><strong>IP:</strong> {session.ip_address || 'Unknown'}</p>
							<p><strong>Last Activity:</strong> {new Date(session.last_activity_at).toLocaleString()}</p>
							<p><strong>Expires:</strong> {new Date(session.expires_at).toLocaleString()}</p>
						</div>
						<Button variant="danger" onclick={() => logoutSession(session.id)} loading={loggingOut}>
							Logout
						</Button>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.sessions-container {
		min-height: calc(100vh - 4rem);
		padding: 2rem;
	}

	.sessions-card {
		max-width: 600px;
		margin: 0 auto;
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.sessions-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.session-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border: 1px solid #e5e7eb;
		border-radius: 0.5rem;
	}

	.session-info p {
		margin: 0.25rem 0;
		font-size: 0.875rem;
	}
</style>
