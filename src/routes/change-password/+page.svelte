<script lang="ts">
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let success = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (newPassword !== confirmPassword) {
			showToast('Passwords do not match', 'error');
			return;
		}

		loading = true;

		try {
			await authStore.changePassword(currentPassword, newPassword);
			success = true;
			showToast('Password changed successfully', 'success');
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (error: any) {
			showToast(error.message || 'Failed to change password', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="change-container">
	<div class="change-card card">
		<h1>Change Password</h1>
		<p class="text-muted mb-3">Enter your current password and choose a new one.</p>

		{#if success}
			<div class="alert alert-success mb-3">
				Password changed successfully! All other sessions have been logged out.
			</div>
		{/if}

		<form onsubmit={handleSubmit}>
			<Input
				label="Current Password"
				type="password"
				bind:value={currentPassword}
				placeholder="Enter current password"
				required
			/>

			<Input
				label="New Password"
				type="password"
				bind:value={newPassword}
				placeholder="Enter new password"
				required
			/>

			<Input
				label="Confirm New Password"
				type="password"
				bind:value={confirmPassword}
				placeholder="Confirm new password"
				required
			/>

			<Button type="submit" variant="primary" {loading}>
				{loading ? 'Changing...' : 'Change Password'}
			</Button>
		</form>
	</div>
</div>

<style>
	.change-container {
		min-height: calc(100vh - 4rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.change-card {
		width: 100%;
		max-width: 400px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	:global(.change-card .btn) {
		width: 100%;
		margin-top: 0.5rem;
	}

	.alert {
		padding: 0.75rem;
		border-radius: 0.375rem;
	}

	.alert-success {
		background-color: #d1fae5;
		color: #065f46;
	}
</style>
