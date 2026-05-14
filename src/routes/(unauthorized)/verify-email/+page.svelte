<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let email = $state('');
	let token = $state('');
	let loading = $state(false);
	let verified = $state(false);

	$effect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		token = urlParams.get('token') || token;
		email = urlParams.get('email') || email;
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!token) {
			showToast('Please enter the verification token', 'error');
			return;
		}

		loading = true;

		try {
			await authStore.verifyEmail({ token });
			verified = true;
			showToast('Email verified successfully! You can now login.', 'success');
			setTimeout(() => goto('/login'), 2000);
		} catch (err: any) {
			showToast(err.message || 'Verification failed', 'error');
		} finally {
			loading = false;
		}
	}

	async function handleResend(e: Event) {
		e.preventDefault();

		if (!email) {
			showToast('Please enter your email', 'error');
			return;
		}

		loading = true;

		try {
			await authStore.resendVerification({ email });
			showToast('Verification email sent! Please check your inbox.', 'success');
		} catch (err: any) {
			showToast(err.message || 'Failed to resend verification email', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="verify-container">
	<div class="verify-card card">
		<h1>Verify Email</h1>
		<p class="text-muted mb-3">Paste the verification token from your email.</p>

		{#if verified}
			<div class="alert alert-success">
				<p>Email verified successfully! Redirecting to login...</p>
			</div>
		{:else}
			<form onsubmit={handleSubmit}>
				<Input label="Verification Token" type="text" bind:value={token} placeholder="Paste token" required />
				<Button type="submit" variant="primary" {loading}>
					{loading ? 'Verifying...' : 'Verify Email'}
				</Button>
			</form>

			<div class="resend-section mt-3">
				<Input label="Email" type="email" bind:value={email} placeholder="Email for resend" />
				<button class="btn-link" onclick={handleResend} disabled={loading || !email}>
					Resend Verification Email
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.verify-container {
		min-height: calc(100vh - 4rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.verify-card {
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

	.btn-link {
		background: none;
		border: none;
		color: #007bff;
		cursor: pointer;
		text-decoration: underline;
		padding: 0;
		font-size: 0.9rem;
	}

	.resend-section {
		text-align: center;
		padding-top: 1rem;
		border-top: 1px solid #dee2e6;
	}
</style>
