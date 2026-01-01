<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userListStore } from '$lib/modules/user-management/stores';
	import { UserList } from '$lib/modules/user-management/components';
	import { showToast } from '$lib/modules/shared/components';
	import Button from '$lib/modules/shared/components/Button.svelte';
	import Pagination from '$lib/modules/shared/components/Pagination.svelte';
	import ConfirmDialog from '$lib/modules/shared/components/ConfirmDialog.svelte';
	import type { User } from '$lib/modules/shared/types';

	let currentPage = $state(1);
	let pageSize = $state(10);
	let showDeleteConfirm = $state(false);
	let userToDelete = $state<User | null>(null);

	onMount(() => {
		loadUsers();
	});

	async function loadUsers() {
		try {
			await userListStore.fetchUsers(currentPage, pageSize);
		} catch (error: any) {
			showToast(error.message || 'Failed to load users', 'error');
		}
	}

	function handlePageChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		loadUsers();
	}

	function handleCreateUser() {
		goto('/users/create');
	}

	function handleEditUser(user: User) {
		goto(`/users/${user.ID}`);
	}

	function handleViewRoles(user: User) {
		goto(`/users/${user.ID}/roles`);
	}

	function handleDeleteClick(user: User) {
		userToDelete = user;
		showDeleteConfirm = true;
	}

	async function handleDeleteConfirm() {
		if (!userToDelete) return;

		try {
			await userListStore.deleteUser(userToDelete.ID);
			showToast('User deleted successfully', 'success');
			loadUsers();
		} catch (error: any) {
			showToast(error.message || 'Failed to delete user', 'error');
		} finally {
			userToDelete = null;
		}
	}

	function handleDeleteCancel() {
		userToDelete = null;
	}
</script>

<div class="users-page">
	<div class="page-header">
		<h1>User Management</h1>
		<Button onclick={handleCreateUser}>Create User</Button>
	</div>

	<div class="card">
		<UserList
			users={$userListStore.users}
			loading={$userListStore.loading}
			onEdit={handleEditUser}
			onDelete={handleDeleteClick}
			onViewRoles={handleViewRoles}
		/>

		{#if $userListStore.totalPages > 1}
			<Pagination
				currentPage={$userListStore.currentPage}
				totalPages={$userListStore.totalPages}
				pageSize={$userListStore.pageSize}
				totalItems={$userListStore.totalItems}
				on:pagechange={handlePageChange}
			/>
		{/if}
	</div>
</div>

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete User"
	message="Are you sure you want to delete this user? This action cannot be undone."
	confirmText="Delete"
	onconfirm={handleDeleteConfirm}
	oncancel={handleDeleteCancel}
/>

<style>
	.users-page {
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
