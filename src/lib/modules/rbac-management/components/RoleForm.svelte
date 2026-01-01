<script lang="ts">
	import type { CreateRoleRequest, UpdateRoleRequest } from '$lib/modules/shared/types';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	interface Props {
		initialData?: {
			name?: string;
			description?: string;
		};
		isEdit?: boolean;
		loading?: boolean;
		onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => void;
		onCancel?: () => void;
	}

	let { initialData, isEdit = false, loading = false, onSubmit, onCancel }: Props = $props();

	let formData = $state({
		name: '',
		description: ''
	});

	// Initialize form data from props
	$effect(() => {
		if (initialData) {
			formData.name = initialData.name || '';
			formData.description = initialData.description || '';
		}
	});

	let errors = $state({
		name: '',
		description: ''
	});

	function validate() {
		let isValid = true;
		errors = { name: '', description: '' };

		if (!formData.name.trim()) {
			errors.name = 'Role name is required';
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
			name: formData.name,
			description: formData.description || undefined
		});
	}
</script>

<form onsubmit={handleSubmit}>
	<Input
		label="Role Name"
		type="text"
		bind:value={formData.name}
		placeholder="Enter role name"
		required
		error={errors.name}
		disabled={isEdit}
	/>

	<Input
		label="Description"
		type="text"
		bind:value={formData.description}
		placeholder="Enter role description (optional)"
		error={errors.description}
	/>

	<div class="form-actions">
		{#if onCancel}
			<Button type="button" variant="secondary" onclick={onCancel}>Cancel</Button>
		{/if}
		<Button type="submit" variant="primary" {loading}>
			{isEdit ? 'Update Role' : 'Create Role'}
		</Button>
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
