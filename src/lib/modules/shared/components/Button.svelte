<script lang="ts">
	interface Props {
		variant?: 'primary' | 'secondary' | 'danger';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		loading?: boolean;
		onclick?: () => void;
		children?: any;
	}

	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		loading = false,
		onclick,
		children
	}: Props = $props();
</script>

<button
	{type}
	class="btn btn-{variant}"
	disabled={disabled || loading}
	onclick={onclick}
>
	{#if loading}
		<span class="spinner"></span>
	{/if}
	{@render children?.()}
</button>

<style>
	.btn {
		padding: 0.5rem 1rem;
		border: 1px solid #ccc;
		background: #fff;
		cursor: pointer;
		font-size: 0.875rem;
		border-radius: 4px;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.btn:hover:not(:disabled) {
		background: #f5f5f5;
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: #333;
		color: #fff;
		border-color: #333;
	}

	.btn-primary:hover:not(:disabled) {
		background: #555;
	}

	.btn-danger {
		background: #dc3545;
		color: #fff;
		border-color: #dc3545;
	}

	.btn-danger:hover:not(:disabled) {
		background: #c82333;
	}

	.spinner {
		width: 1rem;
		height: 1rem;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: 50%;
		display: inline-block;
		animation: spin 0.75s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
