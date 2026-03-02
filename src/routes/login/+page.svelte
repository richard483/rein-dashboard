<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore, authError } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let mode: 'login' | 'register' | 'forgot-password' | 'reset-password' | 'resend-verification' = $state('login');
	let username = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let email = $state('');
	let resetToken = $state('');
	let loading = $state(false);
	let successMessage = $state('');

	function getPasswordResetRedirectUrl() {
		const redirectUrl = new URL('/reset-password', window.location.origin);
		redirectUrl.searchParams.delete('token');
		return redirectUrl.toString();
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		successMessage = '';
		loading = true;

		try {
			if (mode === 'register' && password !== confirmPassword) {
				showToast('Passwords do not match', 'error');
				loading = false;
				return;
			}

			if (mode === 'login') {
				await authStore.login({
					user_name: username,
					password: password
				});
				showToast('Login successful', 'success');
				goto('/');
			} else if (mode === 'register') {
				await authStore.register({
					user_name: username,
					password,
					confirm_password: confirmPassword,
					email
				});
				successMessage = 'Registration successful! Please check your email to verify your account.';
				setTimeout(() => {
					mode = 'login';
					successMessage = '';
				}, 3000);
			} else if (mode === 'forgot-password') {
				await authStore.forgotPassword(email, getPasswordResetRedirectUrl());
				successMessage = 'If an account exists with this email, you will receive a password reset link.';
			} else if (mode === 'reset-password') {
				await authStore.resetPassword(resetToken, password);
				successMessage = 'Password reset successful! Please login with your new password.';
				setTimeout(() => {
					mode = 'login';
					successMessage = '';
				}, 3000);
			} else if (mode === 'resend-verification') {
				await authStore.resendVerification(email);
				successMessage = 'If your email is registered and not verified, you will receive a verification link.';
			}
		} catch (error: any) {
			showToast(error.message || 'An error occurred', 'error');
		} finally {
			loading = false;
		}
	}

	function switchMode(newMode: typeof mode) {
		mode = newMode;
		successMessage = '';
	}
</script>

<div class="login-container">
	<div class="login-card card">
		<h1>
			{#if mode === 'login'}
				Login
			{:else if mode === 'register'}
				Register
			{:else if mode === 'forgot-password'}
				Reset Password
			{:else if mode === 'reset-password'}
				New Password
			{:else if mode === 'resend-verification'}
				Resend Verification
			{/if}
		</h1>
		<p class="text-muted mb-3">
			{#if mode === 'login'}
				Sign in to Rein Management
			{:else if mode === 'register'}
				Create a new account
			{:else if mode === 'forgot-password'}
				Enter your email to reset password
			{:else if mode === 'reset-password'}
				Enter your reset token and new password
			{:else if mode === 'resend-verification'}
				Enter your email to resend verification link
			{/if}
		</p>

		<form onsubmit={handleSubmit}>
			{#if mode === 'register' || mode === 'forgot-password' || mode === 'resend-verification'}
				<Input
					label="Email"
					type="email"
					bind:value={email}
					placeholder="Enter your email"
					required
				/>
			{/if}

			{#if mode === 'reset-password'}
				<Input
					label="Reset Token"
					type="text"
					bind:value={resetToken}
					placeholder="Enter reset token from email"
					required
				/>
			{/if}

			{#if mode !== 'forgot-password' && mode !== 'reset-password' && mode !== 'resend-verification'}
				<Input
					label="Username"
					type="text"
					bind:value={username}
					placeholder="Enter your username"
					required
				/>
			{/if}

			{#if mode !== 'forgot-password' && mode !== 'resend-verification'}
				<Input
					label="Password"
					type="password"
					bind:value={password}
					placeholder="Enter your password"
					required
				/>
			{/if}

			{#if mode === 'register'}
				<Input
					label="Confirm Password"
					type="password"
					bind:value={confirmPassword}
					placeholder="Confirm your password"
					required
				/>
			{/if}

			{#if successMessage}
				<div class="alert alert-success">{successMessage}</div>
			{/if}

			<Button type="submit" variant="primary" {loading}>
				{#if mode === 'login'}
					{loading ? 'Logging in...' : 'Login'}
				{:else if mode === 'register'}
					{loading ? 'Creating account...' : 'Create Account'}
				{:else if mode === 'forgot-password'}
					{loading ? 'Sending...' : 'Send Reset Link'}
				{:else if mode === 'reset-password'}
					{loading ? 'Resetting...' : 'Reset Password'}
				{:else if mode === 'resend-verification'}
					{loading ? 'Sending...' : 'Send Verification'}
				{/if}
			</Button>
		</form>

		<div class="auth-switch">
			{#if mode === 'login'}
				<p>
					Don't have an account?
					<button type="button" class="link-btn" onclick={() => switchMode('register')}>Sign up</button>
				</p>
				<p>
					<button type="button" class="link-btn" onclick={() => switchMode('forgot-password')}>Forgot Password?</button>
				</p>
				<p>
					<button type="button" class="link-btn" onclick={() => switchMode('resend-verification')}>Resend Verification?</button>
				</p>
			{:else if mode === 'register'}
				<p>
					Already have an account?
					<button type="button" class="link-btn" onclick={() => switchMode('login')}>Sign in</button>
				</p>
			{:else}
				<p>
					<button type="button" class="link-btn" onclick={() => switchMode('login')}>Back to Login</button>
				</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.login-container {
		min-height: calc(100vh - 4rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.login-card {
		width: 100%;
		max-width: 400px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	:global(.login-card .btn) {
		width: 100%;
		margin-top: 0.5rem;
	}

	.auth-switch {
		margin-top: 1rem;
		text-align: center;
	}

	.auth-switch p {
		margin: 0.5rem 0;
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--primary-color, #137fec);
		cursor: pointer;
		text-decoration: underline;
	}

	.alert {
		padding: 0.75rem;
		border-radius: 0.375rem;
		margin: 0.5rem 0;
	}

	.alert-success {
		background-color: #d1fae5;
		color: #065f46;
	}
</style>
