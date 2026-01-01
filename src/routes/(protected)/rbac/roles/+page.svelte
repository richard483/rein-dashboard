<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { roleStore } from '$lib/modules/rbac-management/stores';
	import { RoleList } from '$lib/modules/rbac-management/components';
	import { showToast } from '$lib/modules/shared/components';
	import Button from '$lib/modules/shared/components/Button.svelte';
	import ConfirmDialog from '$lib/modules/shared/components/ConfirmDialog.svelte';
	import type { Role } from '$lib/modules/shared/types';

	let showDeleteConfirm = $state(false);
	let roleToDelete = $state<Role | null>(null);

	onMount(() => {
		loadRoles();
	});

	async function loadRoles() {
		try {
			await roleStore.fetchRoles();
		} catch (error: any) {
			showToast(error.message || 'Failed to load roles', 'error');
		}
	}

	function handleCreateRole() {
		goto('/rbac/roles/create');
	}

	function handleEditRole(role: Role) {
		goto(`/rbac/roles/${role.id}`);
	}

	function handleManagePermissions(role: Role) {
		goto(`/rbac/roles/${role.id}/permissions`);
	}

	function handleDeleteClick(role: Role) {
		if (role.is_system) {
			showToast('Cannot delete system roles', 'error');
			return;
		}
		roleToDelete = role;
		showDeleteConfirm = true;
	}

	async function handleDeleteConfirm() {
		if (!roleToDelete) return;

		try {
			await roleStore.deleteRole(roleToDelete.id);
			showToast('Role deleted successfully', 'success');
			loadRoles();
		} catch (error: any) {
			showToast(error.message || 'Failed to delete role', 'error');
		} finally {
			roleToDelete = null;
		}
	}

	function handleDeleteCancel() {
		roleToDelete = null;
	}
</script>

<div class="roles-page">
	<div class="page-header">
		<h1>Role Management</h1>
		<Button onclick={handleCreateRole}>Create Role</Button>
	</div>

	<div class="card">
		<RoleList
			roles={$roleStore.roles}
			loading={$roleStore.loading}
			onEdit={handleEditRole}
			onDelete={handleDeleteClick}
			onManagePermissions={handleManagePermissions}
		/>
	</div>
</div>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete Role"
	message="Are you sure you want to delete this role? This action cannot be undone."
	confirmText="Delete"
	onconfirm={handleDeleteConfirm}
	oncancel={handleDeleteCancel}
/>

<style>
	.roles-page {
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
