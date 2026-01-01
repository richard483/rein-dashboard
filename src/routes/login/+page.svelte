<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore, authError } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let username = $state('');
	let password = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!username || !password) {
			showToast('Please fill in all fields', 'error');
			return;
		}

		loading = true;

		try {
			await authStore.login({
				user_name: username,
				pass_phrase: password
			});

			showToast('Login successful', 'success');
			goto('/');
		} catch (error: any) {
			showToast(error.message || 'Login failed', 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="login-container">
	<div class="login-card card">
		<h1>Login</h1>
		<p class="text-muted mb-3">Sign in to Rein Management</p>

		<form onsubmit={handleSubmit}>
			<Input
				label="Username"
				type="text"
				bind:value={username}
				placeholder="Enter your username"
				required
			/>

			<Input
				label="Password"
				type="password"
				bind:value={password}
				placeholder="Enter your password"
				required
			/>

			<Button type="submit" variant="primary" {loading}>
				{loading ? 'Logging in...' : 'Login'}
			</Button>
		</form>
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
</style>
