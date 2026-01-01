<script lang="ts">
	interface Props {
		open?: boolean;
		title?: string;
		message: string;
		confirmText?: string;
		cancelText?: string;
		onconfirm: () => void;
		oncancel?: () => void;
	}

	let {
		open = $bindable(false),
		title = 'Confirm',
		message,
		confirmText = 'Confirm',
		cancelText = 'Cancel',
		onconfirm,
		oncancel
	}: Props = $props();

	function handleConfirm() {
		open = false;
		onconfirm();
	}

	function handleCancel() {
		open = false;
		oncancel?.();
	}
</script>

{#if open}
	<div class="modal-backdrop">
		<div class="modal-content">
			<div class="modal-header">
				<h3>{title}</h3>
			</div>
			<div class="modal-body">
				<p>{message}</p>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={handleCancel}>
					{cancelText}
				</button>
				<button class="btn btn-danger" onclick={handleConfirm}>
					{confirmText}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-content {
		background: #fff;
		border-radius: 4px;
		min-width: 400px;
		max-width: 90vw;
	}

	.modal-header {
		padding: 1rem;
		border-bottom: 1px solid #ddd;
	}

	.modal-header h3 {
		margin: 0;
		font-size: 1.25rem;
	}

	.modal-body {
		padding: 1rem;
	}

	.modal-body p {
		margin: 0;
	}

	.modal-footer {
		padding: 1rem;
		border-top: 1px solid #ddd;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: 1px solid #ccc;
		background: #fff;
		cursor: pointer;
		font-size: 0.875rem;
		border-radius: 4px;
	}

	.btn-secondary {
		background: #f5f5f5;
	}

	.btn-secondary:hover {
		background: #e0e0e0;
	}

	.btn-danger {
		background: #dc3545;
		color: #fff;
		border-color: #dc3545;
	}

	.btn-danger:hover {
		background: #c82333;
	}
</style>
