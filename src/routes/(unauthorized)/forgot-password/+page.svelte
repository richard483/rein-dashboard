<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let email = $state('');
	let redirectUrl = $state('');
	let loading = $state(false);
	let emailSent = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!email) {
			showToast('Please enter your email', 'error');
			return;
		}

		loading = true;

		try {
			const resetUrl = redirectUrl || `${window.location.origin}/reset-password`;
			await authStore.forgotPassword({ email, redirect_url: resetUrl });
			emailSent = true;
			showToast('If an account exists with this email, you will receive a password reset link.', 'success');
		} catch (error: any) {
			showToast(error.message || 'Failed to send reset email', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="forgot-container">
	<div class="forgot-card card">
		<h1>Forgot Password</h1>
		<p class="text-muted mb-3">
			Enter your email address and we'll send you a link to reset your password.
		</p>

		{#if emailSent}
			<div class="alert alert-success">
				<p>If an account exists with this email, you will receive a password reset link shortly.</p>
				<p class="mt-2">Didn't receive the email? <button class="btn-link" onclick={() => { emailSent = false; }}>Try again</button></p>
			</div>
		{:else}
			<form onsubmit={handleSubmit}>
				<Input
					label="Email"
					type="email"
					bind:value={email}
					placeholder="Enter your registered email"
					required
				/>

				<Input
					label="Reset Redirect URL"
					type="text"
					bind:value={redirectUrl}
					placeholder="Defaults to this dashboard reset page"
				/>

				<Button type="submit" variant="primary" {loading}>
					{loading ? 'Sending...' : 'Send Reset Link'}
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
	.forgot-container {
		min-height: calc(100vh - 4rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.forgot-card {
		width: 100%;
		max-width: 400px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	:global(.forgot-card .btn) {
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

	.btn-link {
		background: none;
		border: none;
		color: #007bff;
		cursor: pointer;
		text-decoration: underline;
		padding: 0;
	}
</style>
