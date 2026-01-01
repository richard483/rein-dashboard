<script lang="ts">
	import type { Permission } from '$lib/modules/shared/types';
	import Table from '$lib/modules/shared/components/Table.svelte';

	interface Props {
		permissions: Permission[];
		loading?: boolean;
		onDelete?: (permission: Permission) => void;
	}

	let { permissions, loading = false, onDelete }: Props = $props();

	// Group permissions by resource
	const groupedPermissions = $derived(
		permissions.reduce(
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
</script>

<div class="permission-list-container">
	{#if loading}
		<div class="loading">Loading...</div>
	{:else if permissions.length === 0}
		<div class="empty">No permissions available</div>
	{:else}
		{#each Object.entries(groupedPermissions) as [resource, perms]}
			<div class="resource-group">
				<h3>{resource}</h3>
				<Table
					headers={['Action', 'Description', 'Created At']}
					data={perms}
					actions={!!onDelete}
				>
					{#each perms as perm}
						<tr>
							<td><strong>{perm.action}</strong></td>
							<td>{perm.description || '-'}</td>
							<td>
								{perm.created_at ? new Date(perm.created_at).toLocaleDateString() : '-'}
							</td>
							{#if onDelete}
								<td class="actions">
									<button class="btn-action btn-danger" onclick={() => onDelete(perm)}>
										Delete
									</button>
								</td>
							{/if}
						</tr>
					{/each}
				</Table>
			</div>
		{/each}
	{/if}
</div>

<style>
	.permission-list-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.resource-group h3 {
		margin-bottom: 1rem;
		font-size: 1.125rem;
		text-transform: capitalize;
	}

	.loading,
	.empty {
		padding: 2rem;
		text-align: center;
		color: #666;
	}

	:global(.actions) {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.btn-action {
		padding: 0.25rem 0.5rem;
		border: 1px solid #ddd;
		background: #fff;
		cursor: pointer;
		font-size: 0.75rem;
		border-radius: 4px;
	}

	.btn-action:hover {
		background: #f5f5f5;
	}

	.btn-danger {
		color: #dc3545;
		border-color: #dc3545;
	}

	.btn-danger:hover {
		background: #dc3545;
		color: #fff;
	}
</style>
