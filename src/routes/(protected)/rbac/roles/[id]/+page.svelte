<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { RoleForm } from '$lib/modules/rbac-management/components';
	import { roleStore } from '$lib/modules/rbac-management/stores';
	import { showToast } from '$lib/modules/shared/components';
	import Spinner from '$lib/modules/shared/components/Spinner.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';
	import type { UpdateRoleRequest, CreateRoleRequest } from '$lib/modules/shared/types';

	const roleId = $derived($page.params.id as string);

	let loading = $state(false);

	onMount(() => {
		loadRole();
	});

	async function loadRole() {
		try {
			await roleStore.fetchRole(roleId);
		} catch (error: any) {
			showToast(error.message || 'Failed to load role', 'error');
			goto('/rbac/roles');
		}
	}

	async function handleSubmit(data: CreateRoleRequest | UpdateRoleRequest) {
		loading = true;

		try {
			await roleStore.updateRole(roleId, data as UpdateRoleRequest);
			showToast('Role updated successfully', 'success');
			goto('/rbac/roles');
		} catch (error: any) {
			showToast(error.message || 'Failed to update role', 'error');
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		goto('/rbac/roles');
	}

	function handleManagePermissions() {
		goto(`/rbac/roles/${roleId}/permissions`);
	}
</script>

<div class="edit-role-page">
	<div class="page-header">
		<h1>Edit Role</h1>
		{#if $roleStore.currentRole}
			<Button onclick={handleManagePermissions}>Manage Permissions</Button>
		{/if}
	</div>

	{#if $roleStore.loading && !$roleStore.currentRole}
		<div class="card">
			<Spinner />
		</div>
	{:else if $roleStore.currentRole}
		{#if $roleStore.currentRole.is_system_role}
			<div class="card">
				<p class="text-error">System roles cannot be edited.</p>
				<Button onclick={() => goto('/rbac/roles')} variant="secondary">Back to Roles</Button>
			</div>
		{:else}
			<div class="card">
				<RoleForm
					initialData={{
						name: $roleStore.currentRole.name,
						description: $roleStore.currentRole.description
					}}
					isEdit={true}
					onSubmit={handleSubmit}
					onCancel={handleCancel}
					{loading}
				/>
			</div>
		{/if}
	{/if}
</div>

<style>
	.edit-role-page {
		max-width: 600px;
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
