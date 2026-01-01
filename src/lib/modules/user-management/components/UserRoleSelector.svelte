<script lang="ts">
	import type { Role, UserRole } from '$lib/modules/shared/types';
	import Button from '$lib/modules/shared/components/Button.svelte';
	import Spinner from '$lib/modules/shared/components/Spinner.svelte';

	interface Props {
		availableRoles: Role[];
		assignedRoles: UserRole[];
		loading?: boolean;
		onAssign: (roleIds: string[]) => void;
		onRemove: (roleIds: string[]) => void;
	}

	let { availableRoles, assignedRoles, loading = false, onAssign, onRemove }: Props = $props();

	let selectedRoleIds = $state<Set<string>>(new Set());

	const assignedRoleIds = $derived(new Set(assignedRoles.map((r) => r.role_id)));

	const unassignedRoles = $derived(
		availableRoles.filter((role) => !assignedRoleIds.has(role.id))
	);

	function handleAssign() {
		if (selectedRoleIds.size > 0) {
			onAssign(Array.from(selectedRoleIds));
			selectedRoleIds = new Set();
		}
	}

	function handleRemove(roleId: string) {
		onRemove([roleId]);
	}

	function toggleRoleSelection(roleId: string) {
		if (selectedRoleIds.has(roleId)) {
			selectedRoleIds.delete(roleId);
		} else {
			selectedRoleIds.add(roleId);
		}
		selectedRoleIds = selectedRoleIds; // Trigger reactivity
	}
</script>

<div class="role-selector">
	{#if loading}
		<Spinner />
	{:else}
		<div class="section">
			<h3>Assigned Roles</h3>
			{#if assignedRoles.length === 0}
				<p class="text-muted">No roles assigned</p>
			{:else}
				<div class="role-list">
					{#each assignedRoles as role}
						<div class="role-item">
							<div>
								<strong>{role.role_name}</strong>
								{#if role.description}
									<p class="text-muted">{role.description}</p>
								{/if}
							</div>
							<button class="btn-remove" onclick={() => handleRemove(role.role_id)}>
								Remove
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="section">
			<h3>Available Roles</h3>
			{#if unassignedRoles.length === 0}
				<p class="text-muted">No available roles to assign</p>
			{:else}
				<div class="role-list">
					{#each unassignedRoles as role}
						<div class="role-item">
							<label class="role-checkbox">
								<input
									type="checkbox"
									checked={selectedRoleIds.has(role.id)}
									onchange={() => toggleRoleSelection(role.id)}
								/>
								<div>
									<strong>{role.name}</strong>
									{#if role.description}
										<p class="text-muted">{role.description}</p>
									{/if}
								</div>
							</label>
						</div>
					{/each}
				</div>

				{#if selectedRoleIds.size > 0}
					<div class="actions">
						<Button onclick={handleAssign}>
							Assign {selectedRoleIds.size} Role{selectedRoleIds.size > 1 ? 's' : ''}
						</Button>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.role-selector {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.section h3 {
		margin-bottom: 1rem;
		font-size: 1.125rem;
	}

	.role-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.role-item {
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.role-item strong {
		display: block;
		margin-bottom: 0.25rem;
	}

	.role-item p {
		margin: 0;
		font-size: 0.875rem;
	}

	.role-checkbox {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		flex: 1;
	}

	.role-checkbox input[type='checkbox'] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
		flex-shrink: 0;
	}

	.btn-remove {
		padding: 0.375rem 0.75rem;
		border: 1px solid #dc3545;
		background: #fff;
		color: #dc3545;
		cursor: pointer;
		font-size: 0.75rem;
		border-radius: 4px;
	}

	.btn-remove:hover {
		background: #dc3545;
		color: #fff;
	}

	.actions {
		margin-top: 1rem;
		display: flex;
		justify-content: flex-end;
	}
</style>
