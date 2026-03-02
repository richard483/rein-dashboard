<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { authStore } from '$lib/modules/shared/auth';
	import { showToast } from '$lib/modules/shared/components';
	import Button from '$lib/modules/shared/components/Button.svelte';

	let token = $state('');
	let loading = $state(true);
	let verified = $state(false);
	let error = $state('');

	onMount(() => {
		const url = new URL(window.location.href);
		token = url.searchParams.get('token')?.trim() ?? '';
		
		if (!token) {
			error = 'Verification token is missing. Please use the verification link from your email.';
			loading = false;
			return;
		}

		verifyEmail();
	});

	async function verifyEmail() {
		loading = true;
		error = '';

		try {
			await authStore.verifyEmail(token);
			verified = true;
			showToast('Email verified successfully!', 'success');
		} catch (err: any) {
			error = err.message || 'Failed to verify email. The link may be invalid or expired.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="verify-container">
	<div class="verify-card card">
		{#if loading}
			<h1>Verifying...</h1>
			<p class="text-muted">Please wait while we verify your email.</p>
		{:else if verified}
			<h1>Email Verified!</h1>
			<p class="text-muted mb-3">Your email has been verified successfully. You can now log in to your account.</p>
			<Button variant="primary" onclick={() => goto('/login')}>
				Go to Login
			</Button>
		{:else}
			<h1>Verification Failed</h1>
			<p class="text-muted mb-3">{error}</p>
			<Button variant="primary" onclick={() => goto('/login')}>
				Go to Login
			</Button>
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
		text-align: center;
	}

	:global(.verify-card .btn) {
		width: 100%;
		margin-top: 0.5rem;
	}
</style>
