<script lang="ts">
	import { goto } from '$app/navigation';
	import { isAuthenticated, currentUser, isSuperAdmin, isLoading } from '$lib/modules/shared/auth';
	import { roleStore, permissionStore } from '$lib/modules/rbac-management';
	import { userListStore } from '$lib/modules/user-management/stores';
	import { listOAuthClients } from '$lib/modules/karasu';
	import Spinner from '$lib/modules/shared/components/Spinner.svelte';

	let loading = $state(false);
	let statsLoaded = $state(false);
	let stats = $state({
		totalUsers: 0,
		totalRoles: 0,
		totalPermissions: 0,
		totalClients: 0
	});

	// Use $effect to reactively respond to auth state changes
	$effect(() => {
		// Wait for auth to finish loading
		if (!$isLoading) {
			if (!$isAuthenticated) {
				goto('/login');
			} else if ($isSuperAdmin && !statsLoaded) {
				statsLoaded = true;
				loadStats();
			}
		}
	});

	async function loadStats() {
		loading = true;
		try {
			// Fetch data in parallel
			const [, roles, permissions, clients] = await Promise.all([
				userListStore.fetchUsers(1, 10), // Get first page
				roleStore.fetchRoles(),
				permissionStore.fetchPermissions(),
				listOAuthClients()
			]);

			stats = {
				totalUsers: $userListStore.totalItems,
				totalRoles: roles.length,
				totalPermissions: permissions.length,
				totalClients: clients.count
			};
		} catch (error) {
			console.error('Failed to load stats:', error);
		} finally {
			loading = false;
		}
	}
</script>

<div class="home">
	<h1>Welcome to Rein Management</h1>

	{#if $isLoading}
		<div class="loading-container">
			<Spinner />
			<p class="text-muted">Loading...</p>
		</div>
	{:else if $currentUser}
		<p class="text-muted">Logged in as: <strong>{$currentUser.username}</strong></p>

		{#if $isSuperAdmin}
			{#if loading}
				<div class="loading-container">
					<Spinner />
				</div>
			{:else}
				<div class="card mt-4">
					<h2>System Overview</h2>
					<div class="stats">
						<div class="stat-card">
							<div class="stat-value">{stats.totalUsers}</div>
							<div class="stat-label">Users</div>
						</div>
						<div class="stat-card">
							<div class="stat-value">{stats.totalRoles}</div>
							<div class="stat-label">Roles</div>
						</div>
						<div class="stat-card">
							<div class="stat-value">{stats.totalPermissions}</div>
							<div class="stat-label">Permissions</div>
						</div>
						<div class="stat-card">
							<div class="stat-value">{stats.totalClients}</div>
							<div class="stat-label">App Clients</div>
						</div>
					</div>
				</div>

				<div class="card mt-4">
					<h2>Quick Actions</h2>
					<div class="actions">
						<a href="/users" class="action-link card">
							<h3>User Management</h3>
							<p class="text-muted">Manage users, assign roles, and view permissions</p>
						</a>
						<a href="/rbac/roles" class="action-link card">
							<h3>Role Management</h3>
							<p class="text-muted">Create and manage roles with permissions</p>
						</a>
						<a href="/rbac/permissions" class="action-link card">
							<h3>Permission Management</h3>
							<p class="text-muted">Define and manage system permissions</p>
						</a>
						<a href="/app-clients" class="action-link card">
							<h3>App-to-App Integrations</h3>
							<p class="text-muted">Register clients, rotate public keys, and test machine tokens</p>
						</a>
						<a href="/account" class="action-link card">
							<h3>Account Tools</h3>
							<p class="text-muted">Manage sessions, API keys, and OAuth providers</p>
						</a>
						<a href="/health" class="action-link card">
							<h3>Health & Token Tools</h3>
							<p class="text-muted">Inspect Karasu health, JWKS, and token introspection</p>
						</a>
					</div>
				</div>
			{/if}
		{:else}
			<div class="card mt-4">
				<p class="text-muted">You don't have superadmin access.</p>
			</div>
		{/if}
	{:else}
		<p>Please <a href="/login">login</a> to continue.</p>
	{/if}
</div>

<style>
	.home {
		max-width: 900px;
		margin: 0 auto;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		padding: 3rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.stat-card {
		background: #f8f9fa;
		padding: 1.5rem;
		border-radius: 4px;
		text-align: center;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 600;
		color: #333;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #666;
		margin-top: 0.5rem;
	}

	.actions {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.action-link {
		text-decoration: none;
		color: #333;
		transition: transform 0.2s;
	}

	.action-link:hover {
		transform: translateY(-2px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		text-decoration: none;
	}

	.action-link h3 {
		margin-bottom: 0.5rem;
		font-size: 1.125rem;
	}

	.action-link p {
		margin: 0;
		font-size: 0.875rem;
	}
</style>
