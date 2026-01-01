<script lang="ts">
	import type { Permission } from '$lib/modules/shared/types';
	import Button from '$lib/modules/shared/components/Button.svelte';
	import Spinner from '$lib/modules/shared/components/Spinner.svelte';

	interface Props {
		availablePermissions: Permission[];
		assignedPermissions: Permission[];
		loading?: boolean;
		onAssign: (permissionIds: string[]) => void;
		onRemove: (permissionId: string) => void;
	}

	let {
		availablePermissions,
		assignedPermissions,
		loading = false,
		onAssign,
		onRemove
	}: Props = $props();

	let selectedPermissionIds = $state<Set<string>>(new Set());

	const assignedPermissionIds = $derived(new Set(assignedPermissions.map((p) => p.id)));

	const unassignedPermissions = $derived(
		availablePermissions.filter((perm) => !assignedPermissionIds.has(perm.id))
	);

	// Group permissions by resource
	const groupedAssigned = $derived(
		assignedPermissions.reduce(
			(acc, perm) => {
				if (!acc[perm.resource]) {
					acc[perm.resource] = [];
				}
				acc[perm.resource].push(perm);
				return acc;
			},
			{} as Record<string, Permission[]>
		)
	);

	const groupedUnassigned = $derived(
		unassignedPermissions.reduce(
			(acc, perm) => {
				if (!acc[perm.resource]) {
					acc[perm.resource] = [];
				}
				acc[perm.resource].push(perm);
				return acc;
			},
			{} as Record<string, Permission[]>
		)
	);

	function handleAssign() {
		if (selectedPermissionIds.size > 0) {
			onAssign(Array.from(selectedPermissionIds));
			selectedPermissionIds = new Set();
		}
	}

	function togglePermissionSelection(permissionId: string) {
		if (selectedPermissionIds.has(permissionId)) {
			selectedPermissionIds.delete(permissionId);
		} else {
			selectedPermissionIds.add(permissionId);
		}
		selectedPermissionIds = selectedPermissionIds; // Trigger reactivity
	}
</script>

<div class="permission-selector">
	{#if loading}
		<Spinner />
	{:else}
		<div class="section">
			<h3>Assigned Permissions</h3>
			{#if assignedPermissions.length === 0}
				<p class="text-muted">No permissions assigned</p>
			{:else}
				<div class="permission-groups">
					{#each Object.entries(groupedAssigned) as [resource, perms]}
						<div class="permission-group">
							<h4>{resource}</h4>
							<div class="permission-list">
								{#each perms as perm}
									<div class="permission-item">
										<div class="permission-info">
											<span class="permission-action">{perm.action}</span>
											{#if perm.description}
												<span class="text-muted">{perm.description}</span>
											{/if}
										</div>
										<button class="btn-remove" onclick={() => onRemove(perm.id)}>
											Remove
										</button>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<div class="section">
			<h3>Available Permissions</h3>
			{#if unassignedPermissions.length === 0}
				<p class="text-muted">No available permissions to assign</p>
			{:else}
				<div class="permission-groups">
					{#each Object.entries(groupedUnassigned) as [resource, perms]}
						<div class="permission-group">
							<h4>{resource}</h4>
							<div class="permission-list">
								{#each perms as perm}
									<div class="permission-item">
										<label class="permission-checkbox">
											<input
												type="checkbox"
												checked={selectedPermissionIds.has(perm.id)}
												onchange={() => togglePermissionSelection(perm.id)}
											/>
											<div class="permission-info">
												<span class="permission-action">{perm.action}</span>
												{#if perm.description}
													<span class="text-muted">{perm.description}</span>
												{/if}
											</div>
										</label>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>

				{#if selectedPermissionIds.size > 0}
					<div class="actions">
						<Button onclick={handleAssign}>
							Assign {selectedPermissionIds.size} Permission{selectedPermissionIds.size > 1
								? 's'
								: ''}
						</Button>
					</div>
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style>
	.permission-selector {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.section h3 {
		margin-bottom: 1rem;
		font-size: 1.125rem;
	}

	.permission-groups {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.permission-group {
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 1rem;
	}

	.permission-group h4 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		font-weight: 600;
		text-transform: capitalize;
	}

	.permission-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.permission-item {
		padding: 0.5rem;
		background: #f9f9f9;
		border-radius: 4px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	.permission-checkbox {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		flex: 1;
	}

	.permission-checkbox input[type='checkbox'] {
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
		flex-shrink: 0;
	}

	.permission-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		flex: 1;
	}

	.permission-action {
		font-weight: 600;
		font-size: 0.875rem;
	}

	.text-muted {
		font-size: 0.75rem;
		color: #666;
	}

	.btn-remove {
		padding: 0.375rem 0.75rem;
		border: 1px solid #dc3545;
		background: #fff;
		color: #dc3545;
		cursor: pointer;
		font-size: 0.75rem;
		border-radius: 4px;
		white-space: nowrap;
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
