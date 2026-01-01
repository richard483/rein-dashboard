<script lang="ts">
	import type { CreateUserRequest, UpdateUserRequest } from '$lib/modules/shared/types';
	import Input from '$lib/modules/shared/components/Input.svelte';
	import Button from '$lib/modules/shared/components/Button.svelte';

	interface Props {
		initialData?: {
			user_name?: string;
			is_active?: boolean;
		};
		isEdit?: boolean;
		loading?: boolean;
		onSubmit: (data: CreateUserRequest | UpdateUserRequest) => void;
		onCancel?: () => void;
	}

	let { initialData, isEdit = false, loading = false, onSubmit, onCancel }: Props = $props();

	let formData = $state({
		user_name: '',
		pass_phrase: '',
		confirm_password: '',
		is_active: true
	});

	// Initialize form data from props
	$effect(() => {
		if (initialData) {
			formData.user_name = initialData.user_name || '';
			formData.is_active = initialData.is_active ?? true;
		}
	});

	let errors = $state({
		user_name: '',
		pass_phrase: '',
		confirm_password: ''
	});

	function validate() {
		let isValid = true;
		errors = { user_name: '', pass_phrase: '', confirm_password: '' };

		if (!formData.user_name.trim()) {
			errors.user_name = 'Username is required';
			isValid = false;
		} else if (formData.user_name.length < 3) {
			errors.user_name = 'Username must be at least 3 characters';
			isValid = false;
		}

		if (!isEdit || formData.pass_phrase) {
			if (!formData.pass_phrase) {
				errors.pass_phrase = 'Password is required';
				isValid = false;
			} else if (formData.pass_phrase.length < 6) {
				errors.pass_phrase = 'Password must be at least 6 characters';
				isValid = false;
			}

			if (formData.pass_phrase !== formData.confirm_password) {
				errors.confirm_password = 'Passwords do not match';
				isValid = false;
			}
		}

		return isValid;
	}

	function handleSubmit(e: Event) {
		e.preventDefault();

		if (!validate()) {
			return;
		}

		const submitData: any = {
			user_name: formData.user_name
		};

		if (isEdit) {
			if (formData.pass_phrase) {
				submitData.pass_phrase = formData.pass_phrase;
			}
			submitData.is_active = formData.is_active;
		} else {
			submitData.pass_phrase = formData.pass_phrase;
		}

		onSubmit(submitData);
	}
</script>

<form onsubmit={handleSubmit}>
	<Input
		label="Username"
		type="text"
		bind:value={formData.user_name}
		placeholder="Enter username"
		required
		error={errors.user_name}
		disabled={isEdit}
	/>

	<Input
		label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
		type="password"
		bind:value={formData.pass_phrase}
		placeholder="Enter password"
		required={!isEdit}
		error={errors.pass_phrase}
	/>

	<Input
		label="Confirm Password"
		type="password"
		bind:value={formData.confirm_password}
		placeholder="Confirm password"
		required={!isEdit || !!formData.pass_phrase}
		error={errors.confirm_password}
	/>

	{#if isEdit}
		<div class="checkbox-group">
			<label>
				<input type="checkbox" bind:checked={formData.is_active} />
				Active User
			</label>
		</div>
	{/if}

	<div class="form-actions">
		{#if onCancel}
			<Button type="button" variant="secondary" onclick={onCancel}>Cancel</Button>
		{/if}
		<Button type="submit" variant="primary" {loading}>
			{isEdit ? 'Update User' : 'Create User'}
		</Button>
	</div>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.checkbox-group {
		margin-bottom: 1rem;
	}

	.checkbox-group label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		cursor: pointer;
	}

	.checkbox-group input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		cursor: pointer;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: 1rem;
	}
</style>
