<script lang="ts">
	import { goto } from '$app/navigation';
	import { PermissionForm } from '$lib/modules/rbac-management/components';
	import { permissionStore } from '$lib/modules/rbac-management/stores';
	import { showToast } from '$lib/modules/shared/components';
	import type { CreatePermissionRequest } from '$lib/modules/shared/types';

	let loading = $state(false);

	async function handleSubmit(data: CreatePermissionRequest) {
		loading = true;

		try {
			await permissionStore.createPermission(data);
			showToast('Permission created successfully', 'success');
			goto('/rbac/permissions');
		} catch (error: any) {
			showToast(error.message || 'Failed to create permission', 'error');
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		goto('/rbac/permissions');
	}
</script>

<div class="create-permission-page">
	<div class="page-header">
		<h1>Create Permission</h1>
	</div>

	<div class="card">
		<PermissionForm onSubmit={handleSubmit} onCancel={handleCancel} {loading} />
	</div>
</div>

<style>
	.create-permission-page {
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
