<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { permissionStore } from '$lib/modules/rbac-management/stores';
	import { PermissionList } from '$lib/modules/rbac-management/components';
	import { showToast } from '$lib/modules/shared/components';
	import Button from '$lib/modules/shared/components/Button.svelte';
	import ConfirmDialog from '$lib/modules/shared/components/ConfirmDialog.svelte';
	import type { Permission } from '$lib/modules/shared/types';

	let showDeleteConfirm = $state(false);
	let permissionToDelete = $state<Permission | null>(null);

	onMount(() => {
		loadPermissions();
	});

	async function loadPermissions() {
		try {
			await permissionStore.fetchPermissions();
		} catch (error: any) {
			showToast(error.message || 'Failed to load permissions', 'error');
		}
	}

	function handleCreatePermission() {
		goto('/rbac/permissions/create');
	}

	function handleDeleteClick(permission: Permission) {
		permissionToDelete = permission;
		showDeleteConfirm = true;
	}

	async function handleDeleteConfirm() {
		if (!permissionToDelete) return;

		try {
			await permissionStore.deletePermission(permissionToDelete.id);
			showToast('Permission deleted successfully', 'success');
			loadPermissions();
		} catch (error: any) {
			showToast(error.message || 'Failed to delete permission', 'error');
		} finally {
			permissionToDelete = null;
		}
	}

	function handleDeleteCancel() {
		permissionToDelete = null;
	}
</script>

<div class="permissions-page">
	<div class="page-header">
		<h1>Permission Management</h1>
		<Button onclick={handleCreatePermission}>Create Permission</Button>
	</div>

	<div class="card">
		<PermissionList
			permissions={$permissionStore.permissions}
			loading={$permissionStore.loading}
			onDelete={handleDeleteClick}
		/>
	</div>
</div>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete Permission"
	message="Are you sure you want to delete this permission? This will remove it from all roles."
	confirmText="Delete"
	onconfirm={handleDeleteConfirm}
	oncancel={handleDeleteCancel}
/>

<style>
	.permissions-page {
		max-width: 1200px;
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
</style>
