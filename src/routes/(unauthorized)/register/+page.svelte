<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!username || !email || !password || !confirmPassword) {
			showToast('Please fill in all fields', 'error');
			return;
		}

		if (password !== confirmPassword) {
			showToast('Passwords do not match', 'error');
			return;
		}

		if (password.length < 8) {
			showToast('Password must be at least 8 characters', 'error');
			return;
		}

		loading = true;

		try {
			await authStore.register({
				user_name: username,
				email,
				password,
				confirm_password: confirmPassword
			});

			showToast('Registration successful! Please check your email to verify your account.', 'success');
			goto('/login');
		} catch (error: any) {
			showToast(error.message || 'Registration failed', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="register-container">
	<div class="register-card card">
		<h1>Create Account</h1>
		<p class="text-muted mb-3">Sign up for Rein Management</p>

		<form onsubmit={handleSubmit}>
			<Input
				label="Username"
				type="text"
				bind:value={username}
				placeholder="Enter your username"
				required
			/>

			<Input
				label="Email"
				type="email"
				bind:value={email}
				placeholder="Enter your email"
				required
			/>

			<Input
				label="Password"
				type="password"
				bind:value={password}
				placeholder="Enter your password (min 8 characters)"
				required
			/>

			<Input
				label="Confirm Password"
				type="password"
				bind:value={confirmPassword}
				placeholder="Confirm your password"
				required
			/>

			<Button type="submit" variant="primary" {loading}>
				{loading ? 'Creating Account...' : 'Sign Up'}
			</Button>
		</form>

		<div class="mt-3 text-center">
			<p class="text-muted">
				Already have an account? 
				<a href="/login">Login</a>
			</p>
		</div>
	</div>
</div>

<style>
	.register-container {
		min-height: calc(100vh - 4rem);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.register-card {
		width: 100%;
		max-width: 400px;
	}

	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	:global(.register-card .btn) {
		width: 100%;
		margin-top: 0.5rem;
	}
</style>
