<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore, currentUser, isSuperAdmin, isAuthenticated } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const currentPath = $derived($page.url.pathname);

	onMount(() => {
		// Check authentication
		if (!$isAuthenticated) {
			showToast('Please login to continue', 'error');
			goto('/login');
			return;
		}

		// Check superadmin access for protected routes
		if (!$isSuperAdmin) {
			showToast('Access denied. Superadmin privileges required.', 'error');
			goto('/');
			return;
		}
	});

	async function handleLogout() {
		try {
			await authStore.logout();
			showToast('Logged out successfully', 'success');
			goto('/login');
		} catch (error) {
			showToast('Logout failed', 'error');
		}
	}

	function isActive(path: string): boolean {
		if (path === '/users') {
			return currentPath.startsWith('/users');
		}
		if (path === '/rbac/roles') {
			return currentPath.startsWith('/rbac/roles');
		}
		if (path === '/rbac/permissions') {
			return currentPath.startsWith('/rbac/permissions');
		}
		return currentPath === path;
	}
</script>

<div class="layout">
	<header class="header">
		<div class="container">
			<div class="header-content">
				<div class="logo">
					<a href="/">Rein Management</a>
				</div>

				{#if $currentUser}
					<nav class="nav">
						{#if $isSuperAdmin}
							<a href="/users" class:active={isActive('/users')}>Users</a>
							<a href="/rbac/roles" class:active={isActive('/rbac/roles')}>Roles</a>
							<a href="/rbac/permissions" class:active={isActive('/rbac/permissions')}>Permissions</a>
						{/if}
					</nav>

					<div class="user-menu">
						<span class="user-name">{$currentUser.username}</span>
						<button class="btn-logout" onclick={handleLogout}>Logout</button>
					</div>
				{/if}
			</div>
		</div>
	</header>

	<main class="main">
		<div class="container">
			{@render children()}
		</div>
	</main>
</div>

<style>
	.layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.header {
		background: #fff;
		border-bottom: 1px solid #ddd;
		padding: 1rem 0;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
	}

	.logo a {
		font-size: 1.25rem;
		font-weight: 600;
		text-decoration: none;
		color: #333;
	}

	.nav {
		display: flex;
		gap: 1.5rem;
		flex: 1;
	}

	.nav a {
		text-decoration: none;
		color: #666;
		font-size: 0.875rem;
		padding: 0.5rem 0.75rem;
		border-radius: 4px;
		transition: all 0.2s;
	}

	.nav a:hover {
		color: #333;
		background: #f5f5f5;
		text-decoration: none;
	}

	.nav a.active {
		color: #333;
		font-weight: 500;
		background: #e9ecef;
	}

	.user-menu {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-name {
		font-size: 0.875rem;
		color: #666;
	}

	.btn-logout {
		padding: 0.375rem 0.75rem;
		border: 1px solid #ddd;
		background: #fff;
		cursor: pointer;
		font-size: 0.875rem;
		border-radius: 4px;
	}

	.btn-logout:hover {
		background: #f5f5f5;
	}

	.main {
		flex: 1;
		padding: 2rem 0;
	}
</style>
