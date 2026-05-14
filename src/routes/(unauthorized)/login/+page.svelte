<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import { setTokens } from '$lib/modules/shared/api/client';
	import { env } from '$env/dynamic/public';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	const API_BASE_URL = env.PUBLIC_API_BASE_URL || 'http://localhost:8080';

	let username = $state('');
	let password = $state('');
	let loading = $state(false);
	let oauthLoading = $state<string | null>(null);

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
				password
			});

			showToast('Login successful', 'success');
			goto('/');
		} catch (error: any) {
			showToast(error.message || 'Login failed', 'error');
		} finally {
			loading = false;
		}
	}

	async function handleOAuthLogin(provider: 'google') {
		oauthLoading = provider;

		try {
			const popup = window.open(
				`${API_BASE_URL}/auth/oauth/${provider}`,
				`${provider} login`,
				'width=500,height=600,scrollbars=yes'
			);

			if (!popup) {
				showToast('Please allow popups for OAuth login', 'error');
				oauthLoading = null;
				return;
			}

			const receiveMessage = async (event: MessageEvent) => {
				const allowedOrigins = [API_BASE_URL, 'https://auth.nephren.xyz'];
				if (!allowedOrigins.some((origin) => event.origin.startsWith(origin))) return;
				if (!event.data) return;

				const response = event.data;
				const data = response.data || response;

				if (data?.access_token) {
					setTokens(data.access_token, data.refresh_token);
					await authStore.fetchUser();
					showToast('Login successful', 'success');
					popup.close();
					goto('/');
				} else if (data?.error || response?.error) {
					showToast(data.message || response.message || 'OAuth login failed', 'error');
					popup.close();
				}
			};

			window.addEventListener('message', receiveMessage);

			const checkClosed = setInterval(() => {
				if (popup.closed) {
					clearInterval(checkClosed);
					window.removeEventListener('message', receiveMessage);
					oauthLoading = null;
				}
			}, 500);
		} catch (error: any) {
			showToast(error.message || 'OAuth login failed', 'error');
			oauthLoading = null;
		}
	}
</script>

<div class="login-container">
	<div class="login-card card">
		<h1>Login</h1>
		<p class="text-muted mb-3">Sign in to Rein Management</p>

		<div class="oauth-buttons">
			<Button variant="outline" disabled={!!oauthLoading} onclick={() => handleOAuthLogin('google')}>
				{#if oauthLoading === 'google'}
					Loading...
				{:else}
					<svg class="oauth-icon" viewBox="0 0 24 24" width="20" height="20">
						<path
							fill="#4285F4"
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
						<path
							fill="#34A853"
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
						/>
						<path
							fill="#FBBC05"
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
						/>
						<path
							fill="#EA4335"
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
						/>
					</svg>
					Continue with Google
				{/if}
			</Button>
		</div>

		<div class="divider">
			<span>or</span>
		</div>

		<form onsubmit={handleSubmit}>
			<Input label="Username" type="text" bind:value={username} placeholder="Enter your username" required />
			<Input label="Password" type="password" bind:value={password} placeholder="Enter your password" required />

			<Button type="submit" variant="primary" {loading}>
				{loading ? 'Logging in...' : 'Login'}
			</Button>
		</form>

		<div class="mt-3 text-center">
			<p class="text-muted">
				Don't have an account?
				<a href="/register">Sign up</a>
			</p>
			<p class="text-muted mt-2">
				<a href="/forgot-password">Forgot your password?</a>
			</p>
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

	form,
	.oauth-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	:global(.login-card .btn) {
		width: 100%;
		margin-top: 0.5rem;
	}

	.oauth-buttons :global(.btn) {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
	}

	.oauth-icon {
		flex-shrink: 0;
	}

	.divider {
		display: flex;
		align-items: center;
		margin: 1rem 0;
		color: var(--text-muted, #6b7280);
	}

	.divider::before,
	.divider::after {
		content: '';
		flex: 1;
		height: 1px;
		background-color: var(--border-color, #e5e7eb);
	}

	.divider span {
		padding: 0 0.75rem;
		font-size: 0.875rem;
	}
</style>
