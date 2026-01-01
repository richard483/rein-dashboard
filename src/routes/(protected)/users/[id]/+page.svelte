<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { UserForm } from '$lib/modules/user-management/components';
	import { userDetailStore } from '$lib/modules/user-management/stores';
	import { showToast } from '$lib/modules/shared/components';
	import Spinner from '$lib/modules/shared/components/Spinner.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';
	import type { UpdateUserRequest } from '$lib/modules/shared/types';

	const userId = $derived(page.params.id as string);

	let loading = $state(false);

	onMount(() => {
		loadUser();
	});

	async function loadUser() {
		try {
			await userDetailStore.fetchUser(userId);
		} catch (error: any) {
			showToast(error.message || 'Failed to load user', 'error');
			goto('/users');
		}
	}

	async function handleSubmit(data: UpdateUserRequest) {
		loading = true;

		try {
			await userDetailStore.updateUser(userId, data);
			showToast('User updated successfully', 'success');
			goto('/users');
		} catch (error: any) {
			showToast(error.message || 'Failed to update user', 'error');
		} finally {
			loading = false;
		}
	}

	function handleCancel() {
		goto('/users');
	}

	function handleViewRoles() {
		goto(`/users/${userId}/roles`);
	}
</script>

<div class="edit-user-page">
	<div class="page-header">
		<h1>Edit User</h1>
		{#if $userDetailStore.user}
			<Button onclick={handleViewRoles}>Manage Roles</Button>
		{/if}
	</div>

	{#if $userDetailStore.loading && !$userDetailStore.user}
		<div class="card">
			<Spinner />
		</div>
	{:else if $userDetailStore.user}
		<div class="card">
			<UserForm
				initialData={{
					user_name: $userDetailStore.user.UserName,
					is_active: $userDetailStore.user.IsActive
				}}
				isEdit={true}
				onSubmit={handleSubmit}
				onCancel={handleCancel}
				{loading}
			/>
		</div>
	{/if}
</div>

<style>
	.edit-user-page {
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
