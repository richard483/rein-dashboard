<script lang="ts" context="module">
	export type ToastType = 'success' | 'error' | 'info' | 'warning';

	export interface Toast {
		id: string;
		type: ToastType;
		message: string;
		duration?: number;
	}

	import { writable } from 'svelte/store';

	const toasts = writable<Toast[]>([]);

	export function showToast(message: string, type: ToastType = 'info', duration = 3000) {
		const id = Math.random().toString(36).substr(2, 9);
		const toast: Toast = { id, message, type, duration };

		toasts.update((all) => [...all, toast]);

		if (duration > 0) {
			setTimeout(() => {
				removeToast(id);
			}, duration);
		}
	}

	export function removeToast(id: string) {
		toasts.update((all) => all.filter((t) => t.id !== id));
	}
</script>

<script lang="ts">
</script>

<div class="toast-container">
	{#each $toasts as toast (toast.id)}
		<div class="toast toast-{toast.type}">
			<span class="toast-message">{toast.message}</span>
			<button class="toast-close" onclick={() => removeToast(toast.id)}>&times;</button>
		</div>
	{/each}
</div>

<style>
	.toast-container {
		position: fixed;
		top: 1rem;
		right: 1rem;
		z-index: 9999;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.toast {
		min-width: 300px;
		padding: 1rem;
		border-radius: 4px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		animation: slideIn 0.3s ease;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.toast-success {
		background: #d4edda;
		color: #155724;
		border: 1px solid #c3e6cb;
	}

	.toast-error {
		background: #f8d7da;
		color: #721c24;
		border: 1px solid #f5c6cb;
	}

	.toast-warning {
		background: #fff3cd;
		color: #856404;
		border: 1px solid #ffeaa7;
	}

	.toast-info {
		background: #d1ecf1;
		color: #0c5460;
		border: 1px solid #bee5eb;
	}

	.toast-message {
		flex: 1;
		font-size: 0.875rem;
	}

	.toast-close {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.7;
	}

	.toast-close:hover {
		opacity: 1;
	}
</style>
