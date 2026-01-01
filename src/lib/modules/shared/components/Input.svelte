<script lang="ts">
	interface Props {
		id?: string;
		name?: string;
		label?: string;
		type?: 'text' | 'password' | 'email' | 'number';
		value?: string | number;
		placeholder?: string;
		required?: boolean;
		disabled?: boolean;
		error?: string;
		oninput?: (e: Event) => void;
	}

	let {
		id,
		name,
		label,
		type = 'text',
		value = $bindable(''),
		placeholder,
		required = false,
		disabled = false,
		error,
		oninput
	}: Props = $props();
</script>

<div class="input-group">
	{#if label}
		<label for={id} class:required>
			{label}
		</label>
	{/if}
	<input
		{id}
		{name}
		{type}
		bind:value
		{placeholder}
		{required}
		{disabled}
		class:error
		{oninput}
	/>
	{#if error}
		<span class="error-message">{error}</span>
	{/if}
</div>

<style>
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	label.required::after {
		content: ' *';
		color: #dc3545;
	}

	input {
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	input:focus {
		outline: none;
		border-color: #333;
	}

	input.error {
		border-color: #dc3545;
	}

	input:disabled {
		background: #f5f5f5;
		cursor: not-allowed;
	}

	.error-message {
		color: #dc3545;
		font-size: 0.75rem;
	}
</style>
