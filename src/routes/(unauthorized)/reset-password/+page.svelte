<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let email = $state('');
	let verificationCode = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let success = $state(false);

	// Get email from URL query params if available
	$effect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		email = urlParams.get('email') || '';
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!email || !verificationCode || !newPassword || !confirmPassword) {
			showToast('Please fill in all fields', 'error');
			return;
		}

		if (newPassword !== confirmPassword) {
			showToast('Passwords do not match', 'error');
			return;
		}

		if (newPassword.length < 8) {
			showToast('Password must be at least 8 characters', 'error');
			return;
		}

		loading = true;

		try {
			await authStore.resetPassword({
				email,
				verification_code: verificationCode,
				new_password: newPassword
			});

			success = true;
			showToast('Password reset successful! You can now login with your new password.', 'success');
			
			// Redirect to login after a short delay
			setTimeout(() => {
				goto('/login');
			}, 2000);
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
		<p class="text-muted mb-3">
			Enter the verification code sent to your email and create a new password.
		</p>

		{#if success}
			<div class="alert alert-success">
				<p>Password reset successful! Redirecting to login...</p>
			</div>
		{:else}
			<form onsubmit={handleSubmit}>
				<Input
					label="Email"
					type="email"
					bind:value={email}
					placeholder="Enter your email"
					required
				/>

				<Input
					label="Verification Code"
					type="text"
					bind:value={verificationCode}
					placeholder="Enter the code from your email"
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
					{loading ? 'Resetting...' : 'Reset Password'}
				</Button>
			</form>
		{/if}

		<div class="mt-3 text-center">
			<p class="text-muted">
				Remember your password? 
				<a href="/login">Login</a>
			</p>
		</div>
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

	.alert-success {
		background-color: #d4edda;
		border: 1px solid #c3e6cb;
		color: #155724;
		padding: 1rem;
		border-radius: 4px;
	}
</style>
