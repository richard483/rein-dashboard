<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { userDetailStore } from '$lib/modules/user-management/stores';
	import { roleStore } from '$lib/modules/rbac-management/stores';
	import { UserRoleSelector, UserPermissionViewer } from '$lib/modules/user-management/components';
	import { showToast } from '$lib/modules/shared/components';
	import Button from '$lib/modules/shared/components/Button.svelte';
	import Spinner from '$lib/modules/shared/components/Spinner.svelte';

	const userId = $derived(page.params.id as string);

	let loadingRoles = $state(false);
	let loadingPermissions = $state(false);

	onMount(() => {
		loadUserData();
	});

	async function loadUserData() {
		try {
			await userDetailStore.fetchUser(userId);
			await loadUserRoles();
			await loadUserPermissions();
		} catch (error: any) {
			showToast(error.message || 'Failed to load user data', 'error');
		}
	}

	async function loadUserRoles() {
		loadingRoles = true;
		try {
			await Promise.all([
				userDetailStore.fetchUserRoles(userId),
				roleStore.fetchRoles()
			]);
		} catch (error: any) {
			showToast(error.message || 'Failed to load roles', 'error');
		} finally {
			loadingRoles = false;
		}
	}

	async function loadUserPermissions() {
		loadingPermissions = true;
		try {
			await userDetailStore.fetchUserPermissions(userId);
		} catch (error: any) {
			showToast(error.message || 'Failed to load permissions', 'error');
		} finally {
			loadingPermissions = false;
		}
	}

	async function handleAssignRoles(roleIds: string[]) {
		try {
			await userDetailStore.assignRoles(userId, roleIds);
			showToast('Roles assigned successfully', 'success');
		} catch (error: any) {
			showToast(error.message || 'Failed to assign roles', 'error');
		}
	}

	async function handleRemoveRoles(roleIds: string[]) {
		try {
			await userDetailStore.removeRoles(userId, roleIds);
			showToast('Roles removed successfully', 'success');
		} catch (error: any) {
			showToast(error.message || 'Failed to remove roles', 'error');
		}
	}

	function handleBack() {
		goto(`/users/${userId}`);
	}
</script>

<div class="user-roles-page">
	<div class="page-header">
		<h1>Manage User Roles</h1>
		<Button onclick={handleBack} variant="secondary">Back to User</Button>
	</div>

	{#if $userDetailStore.user}
		<div class="user-info card">
			<h3>{$userDetailStore.user.UserName}</h3>
			<p class="text-muted">
				Status: {$userDetailStore.user.IsActive ? 'Active' : 'Inactive'}
			</p>
		</div>
	{/if}

	<div class="card">
		<h2>Roles</h2>
		<UserRoleSelector
			availableRoles={$roleStore.roles}
			assignedRoles={$userDetailStore.roles}
			loading={loadingRoles}
			onAssign={handleAssignRoles}
			onRemove={handleRemoveRoles}
		/>
	</div>

	<div class="card">
		<h2>Effective Permissions</h2>
		<UserPermissionViewer
			permissions={$userDetailStore.permissions}
			loading={loadingPermissions}
		/>
	</div>
</div>

<style>
	.user-roles-page {
		max-width: 900px;
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
	}

	.page-header h1 {
		margin: 0;
	}

	.user-info {
		margin-bottom: 2rem;
	}

	.user-info h3 {
		margin: 0 0 0.5rem 0;
	}

	.user-info p {
		margin: 0;
	}

	.card {
		margin-bottom: 2rem;
	}

	.card h2 {
		margin-top: 0;
		margin-bottom: 1.5rem;
		font-size: 1.25rem;
	}
</style>
