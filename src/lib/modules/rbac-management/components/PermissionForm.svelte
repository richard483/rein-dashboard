<script lang="ts">
	import type { CreatePermissionRequest } from '$lib/modules/shared/types';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	interface Props {
		loading?: boolean;
		onSubmit: (data: CreatePermissionRequest) => void;
		onCancel?: () => void;
	}

	let { loading = false, onSubmit, onCancel }: Props = $props();

	let formData = $state({
		resource: '',
		action: '',
		description: ''
	});

	let errors = $state({
		resource: '',
		action: '',
		description: ''
	});

	function validate() {
		let isValid = true;
		errors = { resource: '', action: '', description: '' };

		if (!formData.resource.trim()) {
			errors.resource = 'Resource is required';
			isValid = false;
		}

		if (!formData.action.trim()) {
			errors.action = 'Action is required';
			isValid = false;
		}

		return isValid;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validate()) {
			return;
		}

		onSubmit({
			resource: formData.resource,
			action: formData.action,
			description: formData.description || undefined
		});

		// Reset form
		formData = {
			resource: '',
			action: '',
			description: ''
		};
	}
</script>

<form onsubmit={handleSubmit}>
	<Input
		label="Resource"
		type="text"
		bind:value={formData.resource}
		placeholder="e.g., users, posts, settings"
		required
		error={errors.resource}
	/>

	<Input
		label="Action"
		type="text"
		bind:value={formData.action}
		placeholder="e.g., read, write, delete"
		required
		error={errors.action}
	/>

	<Input
		label="Description"
		type="text"
		bind:value={formData.description}
		placeholder="Enter permission description (optional)"
		error={errors.description}
	/>

	<div class="form-actions">
		{#if onCancel}
			<Button type="button" variant="secondary" onclick={onCancel}>Cancel</Button>
		{/if}
		<Button type="submit" variant="primary" {loading}>Create Permission</Button>
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1rem;
	}
</style>
