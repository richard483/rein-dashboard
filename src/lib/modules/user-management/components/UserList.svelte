<script lang="ts">
	import type { User } from '$lib/modules/shared/types';
	import Table from '$lib/modules/shared/components/Table.svelte';

	interface Props {
		users: User[];
		loading?: boolean;
		onEdit?: (user: User) => void;
		onDelete?: (user: User) => void;
		onViewRoles?: (user: User) => void;
	}

	let { users, loading = false, onEdit, onDelete, onViewRoles }: Props = $props();
</script>

<Table headers={['Username', 'Status', 'Created At']} data={users} {loading} actions={true}>
	{#each users as user}
		<tr>
			<td>{user.username}</td>
			<td>
				<span class="status-badge" class:active={user.is_active}>
					{user.is_active ? 'Active' : 'Inactive'}
				</span>
			</td>
			<td>
				{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
			</td>
			<td class="actions">
				{#if onEdit}
					<button class="btn-action" onclick={() => onEdit(user)}>Edit</button>
				{/if}
				{#if onViewRoles}
					<button class="btn-action" onclick={() => onViewRoles(user)}>Roles</button>
				{/if}
				{#if onDelete}
					<button class="btn-action btn-danger" onclick={() => onDelete(user)}>Delete</button>
				{/if}
			</td>
		</tr>
	{/each}
</Table>

<style>
	.status-badge {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		background: #f5f5f5;
		color: #666;
		border: 1px solid #ddd;
	}

	.status-badge.active {
		background: #d4edda;
		color: #155724;
		border-color: #c3e6cb;
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
