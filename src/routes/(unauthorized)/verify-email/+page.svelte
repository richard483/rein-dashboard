<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let email = $state('');
	let verificationCode = $state('');
	let loading = $state(false);
	let verified = $state(false);
	let error = $state('');

	// Get email from URL query params if available
	$effect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		email = urlParams.get('email') || '';
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!email || !verificationCode) {
			showToast('Please fill in all fields', 'error');
			return;
		}

		loading = true;
		error = '';

		try {
			const response = await authStore.verifyEmail({
				email,
				verification_code: verificationCode
			});

			if (response.is_verified) {
				verified = true;
				showToast('Email verified successfully! You can now login.', 'success');
				
				// Redirect to login after a short delay
				setTimeout(() => {
					goto('/login');
				}, 2000);
			}
		} catch (err: any) {
			error = err.message || 'Verification failed';
			showToast(error, 'error');
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
		<p class="text-muted mb-3">
			Enter the verification code sent to your email to verify your account.
		</p>

		{#if verified}
			<div class="alert alert-success">
				<p>Email verified successfully! Redirecting to login...</p>
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

				<Button type="submit" variant="primary" {loading}>
					{loading ? 'Verifying...' : 'Verify Email'}
				</Button>
			</form>

			<div class="resend-section mt-3">
				<p class="text-muted">Didn't receive the code?</p>
				<button class="btn-link" onclick={handleResend} disabled={loading || !email}>
					Resend Verification Email
				</button>
			</div>
		{/if}

		<div class="mt-3 text-center">
			<p class="text-muted">
				Already verified? 
				<a href="/login">Login</a>
			</p>
		</div>
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

	:global(.verify-card .btn) {
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
		font-size: 0.9rem;
	}

	.btn-link:disabled {
		color: #6c757d;
		cursor: not-allowed;
	}

	.resend-section {
		text-align: center;
		padding-top: 1rem;
		border-top: 1px solid #dee2e6;
	}
</style>
