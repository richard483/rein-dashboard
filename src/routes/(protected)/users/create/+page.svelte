<script lang="ts">
	import { goto } from '$app/navigation';
	import { UserForm } from '$lib/modules/user-management/components';
	import { userListStore } from '$lib/modules/user-management/stores';
	import { showToast } from '$lib/modules/shared/components';
	import type { CreateUserRequest, UpdateUserRequest } from '$lib/modules/shared/types';

	let loading = $state(false);

	async function handleSubmit(data: CreateUserRequest | UpdateUserRequest) {
		loading = true;

		try {
			await userListStore.createUser(data as CreateUserRequest);
			showToast('User created successfully', 'success');
			goto('/users');
		} catch (error: any) {
			showToast(error.message || 'Failed to create user', 'error');
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		goto('/users');
	}
</script>

<div class="create-user-page">
	<div class="page-header">
		<h1>Create User</h1>
	</div>

	<div class="card">
		<UserForm onSubmit={handleSubmit} onCancel={handleCancel} {loading} />
	</div>
</div>

<style>
	.create-user-page {
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
