<script lang="ts">
	import type { Role } from '$lib/modules/shared/types';
	import Table from '$lib/modules/shared/components/Table.svelte';

	interface Props {
		roles: Role[];
		loading?: boolean;
		onEdit?: (role: Role) => void;
		onDelete?: (role: Role) => void;
		onManagePermissions?: (role: Role) => void;
	}

	let { roles, loading = false, onEdit, onDelete, onManagePermissions }: Props = $props();
</script>

<Table headers={['Name', 'Description', 'Type', 'Permissions']} data={roles} {loading} actions={true}>
	{#each roles as role}
		<tr>
			<td>
				<strong>{role.name}</strong>
			</td>
			<td>{role.description || '-'}</td>
			<td>
				{#if role.is_system_role}
					<span class="badge badge-system">System</span>
				{:else}
					<span class="badge badge-custom">Custom</span>
				{/if}
			</td>
			<td>{role.permissions?.length || 0}</td>
			<td class="actions">
				{#if onManagePermissions}
					<button class="btn-action" onclick={() => onManagePermissions(role)}>
						Permissions
					</button>
				{/if}
				{#if onEdit && !role.is_system_role}
					<button class="btn-action" onclick={() => onEdit(role)}>Edit</button>
				{/if}
			{#if onDelete && !role.is_system_role}
					<button class="btn-action btn-danger" onclick={() => onDelete(role)}>Delete</button>
				{/if}
			</td>
		</tr>
	{/each}
</Table>

<style>
	.badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		border: 1px solid;
	}

	.badge-system {
		background: #e3f2fd;
		color: #1565c0;
		border-color: #90caf9;
	}

	.badge-custom {
		background: #f3e5f5;
		color: #6a1b9a;
		border-color: #ce93d8;
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
