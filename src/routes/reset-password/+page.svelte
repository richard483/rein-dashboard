<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let success = $state(false);

	const token = $page.url.searchParams.get('token');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		
		if (!token) {
			showToast('Invalid reset token', 'error');
			return;
		}

		if (password !== confirmPassword) {
			showToast('Passwords do not match', 'error');
			return;
		}

		loading = true;

		try {
			await authStore.resetPassword(token, password);
			success = true;
			showToast('Password reset successful!', 'success');
		} catch (error: any) {
			showToast(error.message || 'Failed to reset password', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="reset-container">
	<div class="reset-card card">
		{#if success}
			<h1>Password Reset Successful!</h1>
			<p class="text-muted mb-3">Your password has been reset. You can now login with your new password.</p>
			<Button variant="primary" onclick={() => goto('/login')}>
				Go to Login
			</Button>
		{:else if !token}
			<h1>Invalid Link</h1>
			<p class="text-muted mb-3">This password reset link is invalid or has expired.</p>
			<Button variant="primary" onclick={() => goto('/login')}>
				Go to Login
			</Button>
		{:else}
			<h1>Reset Password</h1>
			<p class="text-muted mb-3">Enter your new password below.</p>

			<form onsubmit={handleSubmit}>
				<Input
					label="New Password"
					type="password"
					bind:value={password}
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

	:global(.reset-card .btn) {
		width: 100%;
		margin-top: 0.5rem;
	}
</style>
