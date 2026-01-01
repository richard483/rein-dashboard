<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { roleStore, permissionStore } from '$lib/modules/rbac-management/stores';
	import { RolePermissionSelector } from '$lib/modules/rbac-management/components';
	import { showToast } from '$lib/modules/shared/components';
	import Button from '$lib/modules/shared/components/Button.svelte';

	const roleId = $derived($page.params.id as string);

	let loading = $state(false);

	onMount(() => {
		loadData();
	});

	async function loadData() {
		loading = true;
		try {
			await Promise.all([roleStore.fetchRole(roleId), permissionStore.fetchPermissions()]);
		} catch (error: any) {
			showToast(error.message || 'Failed to load data', 'error');
		} finally {
			loading = false;
		}
	}

	async function handleAssignPermissions(permissionIds: string[]) {
		try {
			await roleStore.assignPermissions(roleId, permissionIds);
			showToast('Permissions assigned successfully', 'success');
		} catch (error: any) {
			showToast(error.message || 'Failed to assign permissions', 'error');
		}
	}

	async function handleRemovePermission(permissionId: string) {
		try {
			await roleStore.removePermission(roleId, permissionId);
			showToast('Permission removed successfully', 'success');
		} catch (error: any) {
			showToast(error.message || 'Failed to remove permission', 'error');
		}
	}

	function handleBack() {
		goto(`/rbac/roles/${roleId}`);
	}
</script>

<div class="role-permissions-page">
	<div class="page-header">
		<h1>Manage Role Permissions</h1>
		<Button onclick={handleBack} variant="secondary">Back to Role</Button>
	</div>

	{#if $roleStore.currentRole}
		<div class="role-info card">
			<h3>{$roleStore.currentRole.name}</h3>
			{#if $roleStore.currentRole.description}
				<p class="text-muted">{$roleStore.currentRole.description}</p>
			{/if}
			{#if $roleStore.currentRole.is_system_role}
				<p class="text-muted"><strong>Note:</strong> This is a system role</p>
			{/if}
		</div>
	{/if}

	<div class="card">
		<RolePermissionSelector
			availablePermissions={$permissionStore.permissions}
			assignedPermissions={$roleStore.currentRole?.permissions || []}
			{loading}
			onAssign={handleAssignPermissions}
			onRemove={handleRemovePermission}
		/>
	</div>
</div>

<style>
	.role-permissions-page {
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

	.role-info {
		margin-bottom: 2rem;
	}

	.role-info h3 {
		margin: 0 0 0.5rem 0;
	}

	.role-info p {
		margin: 0;
	}
</style>
