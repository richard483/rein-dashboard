<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore, authError } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import { setTokens, getAccessToken } from '$lib/modules/shared/api/client';
	import { env } from '$env/dynamic-public';
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
				password: password
			});

			showToast('Login successful', 'success');
			goto('/');
		} catch (error: any) {
			showToast(error.message || 'Login failed', 'error');
		} finally {
			loading = false;
		}
	}

	async function handleOAuthLogin(provider: 'google' | 'github' | 'microsoft') {
		oauthLoading = provider;
		
		try {
			// Open OAuth popup
			const popup = window.open(
				`${API_BASE_URL}/auth/oauth/${provider}`,
				`${provider} login`,
				'width=500,height=600,scrollbars=yes'
			);

			if (!popup) {
				showToast('Please allow popups for OAuth login', 'error');
				return;
			}

			// Listen for OAuth callback message
			const receiveMessage = (event: MessageEvent) => {
				// Verify origin
				if (!event.origin.startsWith(API_BASE_URL)) {
					return;
				}

				const data = event.data;
				
				if (data.access_token) {
					// Set tokens
					setTokens(data.access_token, data.refresh_token);
					showToast('Login successful', 'success');
					popup.close();
					goto('/');
				} else if (data.error) {
					showToast(data.message || 'OAuth login failed', 'error');
					popup.close();
				}
			};

			window.addEventListener('message', receiveMessage);

			// Cleanup after popup closes
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

		<!-- OAuth Buttons -->
		<div class="oauth-buttons">
			<Button 
				variant="outline" 
				disabled={!!oauthLoading}
				onclick={() => handleOAuthLogin('google')}
			>
				{#if oauthLoading === 'google'}
					Loading...
				{:else}
					<svg class="oauth-icon" viewBox="0 0 24 24" width="20" height="20">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
					</svg>
					Continue with Google
				{/if}
			</Button>

			<Button 
				variant="outline" 
				disabled={!!oauthLoading}
				onclick={() => handleOAuthLogin('github')}
			>
				{#if oauthLoading === 'github'}
					Loading...
				{:else}
					<svg class="oauth-icon" viewBox="0 0 24 24" width="20" height="20">
						<path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
					</svg>
					Continue with GitHub
				{/if}
			</Button>

			<Button 
				variant="outline" 
				disabled={!!oauthLoading}
				onclick={() => handleOAuthLogin('microsoft')}
			>
				{#if oauthLoading === 'microsoft'}
					Loading...
				{:else}
					<svg class="oauth-icon" viewBox="0 0 24 24" width="20" height="20">
						<path fill="#F25022" d="M1 1h10v10H1z"/>
						<path fill="#00A4EF" d="M1 13h10v10H1z"/>
						<path fill="#7FBA00" d="M13 1h10v10H13z"/>
						<path fill="#FFB900" d="M13 13h10v10H13z"/>
					</svg>
					Continue with Microsoft
				{/if}
			</Button>
		</div>

		<div class="divider">
			<span>or</span>
		</div>

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

	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	:global(.login-card .btn) {
		width: 100%;
		margin-top: 0.5rem;
	}

	.oauth-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: 1rem;
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
