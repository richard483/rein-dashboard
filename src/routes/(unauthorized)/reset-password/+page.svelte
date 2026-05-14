<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let token = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let success = $state(false);

	$effect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		token = urlParams.get('token') || token;
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!token || !newPassword || !confirmPassword) {
			showToast('Please fill in all fields', 'error');
			return;
		}

		if (newPassword !== confirmPassword) {
			showToast('Passwords do not match', 'error');
			return;
		}

		loading = true;

		try {
			await authStore.resetPassword({
				token,
				password: newPassword,
				confirm_password: confirmPassword
			});

			success = true;
			showToast('Password reset successful! You can now login with your new password.', 'success');
			setTimeout(() => goto('/login'), 2000);
		} catch (error: any) {
			showToast(error.message || 'Failed to reset password', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="reset-container">
	<div class="reset-card card">
		<h1>Reset Password</h1>
		<p class="text-muted mb-3">Enter the reset token from your email and create a new password.</p>

		{#if success}
			<div class="alert alert-success">
				<p>Password reset successful! Redirecting to login...</p>
			</div>
		{:else}
			<form onsubmit={handleSubmit}>
				<Input label="Reset Token" type="text" bind:value={token} placeholder="Paste reset token" required />
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
					{loading ? 'Resetting...' : 'Reset Password'}
				</Button>
			</form>
		{/if}
	</div>
</div>

<style>
	.reset-container {
		min-height: calc(100vh - 4rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.reset-card {
		width: 100%;
		max-width: 400px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.alert-success {
		background-color: #d4edda;
		border: 1px solid #c3e6cb;
		color: #155724;
		padding: 1rem;
		border-radius: 4px;
	}
</style>
