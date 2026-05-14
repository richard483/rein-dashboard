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

		if (!currentPassword || !newPassword || !confirmPassword) {
			showToast('Please fill in all fields', 'error');
			return;
		}

		if (newPassword !== confirmPassword) {
			showToast('New passwords do not match', 'error');
			return;
		}

		if (newPassword.length < 8) {
			showToast('Password must be at least 8 characters', 'error');
			return;
		}

		if (currentPassword === newPassword) {
			showToast('New password must be different from current password', 'error');
			return;
		}

		loading = true;

		try {
			await authStore.changePassword({
				current_password: currentPassword,
				new_password: newPassword,
				confirm_new_password: confirmPassword
			});

			success = true;
			showToast('Password changed successfully!', 'success');
			
			// Reset form
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

<div class="change-password-container">
	<div class="change-password-card card">
		<h1>Change Password</h1>
		<p class="text-muted mb-3">
			Update your account password.
		</p>

		{#if success}
			<div class="alert alert-success">
				<p>Your password has been changed successfully!</p>
			</div>
		{/if}

		<form onsubmit={handleSubmit}>
			<Input
				label="Current Password"
				type="password"
				bind:value={currentPassword}
				placeholder="Enter your current password"
				required
			/>

			<Input
				label="New Password"
				type="password"
				bind:value={newPassword}
				placeholder="Enter new password (min 8 characters)"
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
				{loading ? 'Changing Password...' : 'Change Password'}
			</Button>
		</form>

		<div class="mt-3 text-center">
			<p class="text-muted">
				Forgot your password? 
				<a href="/forgot-password">Reset it here</a>
			</p>
		</div>
	</div>
</div>

<style>
	.change-password-container {
		min-height: calc(100vh - 4rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.change-password-card {
		width: 100%;
		max-width: 400px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	:global(.change-password-card .btn) {
		width: 100%;
		margin-top: 0.5rem;
	}

	.alert-success {
		background-color: #d4edda;
		border: 1px solid #c3e6cb;
		color: #155724;
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
	}
</style>
