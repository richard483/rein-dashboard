<script lang="ts">
	import { goto } from '$app/navigation';
	import { RoleForm } from '$lib/modules/rbac-management/components';
	import { roleStore } from '$lib/modules/rbac-management/stores';
	import { showToast } from '$lib/modules/shared/components';
	import type { CreateRoleRequest, UpdateRoleRequest } from '$lib/modules/shared/types';

	let loading = $state(false);

	async function handleSubmit(data: CreateRoleRequest | UpdateRoleRequest) {
		loading = true;

		try {
			await roleStore.createRole(data as CreateRoleRequest);
			showToast('Role created successfully', 'success');
			goto('/rbac/roles');
		} catch (error: any) {
			showToast(error.message || 'Failed to create role', 'error');
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		goto('/rbac/roles');
	}
</script>

<div class="create-role-page">
	<div class="page-header">
		<h1>Create Role</h1>
	</div>

	<div class="card">
		<RoleForm onSubmit={handleSubmit} onCancel={handleCancel} {loading} />
	</div>
</div>

<style>
	.create-role-page {
		max-width: 600px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 2rem;
	}

	.page-header h1 {
		margin: 0;
	}
</style>
