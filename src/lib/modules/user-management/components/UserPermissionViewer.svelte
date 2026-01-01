<script lang="ts">
	import type { UserPermission } from '$lib/modules/shared/types';
	import Spinner from '$lib/modules/shared/components/Spinner.svelte';

	interface Props {
		permissions: UserPermission[];
		loading?: boolean;
	}

	let { permissions, loading = false }: Props = $props();

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
			{} as Record<string, UserPermission[]>
		)
	);
</script>

<div class="permission-viewer">
	{#if loading}
		<Spinner />
	{:else if permissions.length === 0}
		<p class="text-muted">No permissions assigned</p>
	{:else}
		<div class="permission-groups">
			{#each Object.entries(groupedPermissions) as [resource, perms]}
				<div class="permission-group">
					<h4>{resource}</h4>
					<div class="permission-list">
						{#each perms as perm}
							<div class="permission-item">
								<span class="permission-action">{perm.action}</span>
								{#if perm.description}
									<span class="text-muted">{perm.description}</span>
								{/if}
								{#if perm.source_role}
									<span class="source-role">via {perm.source_role}</span>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.permission-viewer {
		width: 100%;
	}

	.permission-groups {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.permission-group {
		border: 1px solid #ddd;
		border-radius: 4px;
		padding: 1rem;
	}

	.permission-group h4 {
		margin: 0 0 1rem 0;
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
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
		font-size: 0.875rem;
	}

	.permission-action {
		font-weight: 600;
		padding: 0.25rem 0.5rem;
		background: #fff;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.source-role {
		margin-left: auto;
		font-size: 0.75rem;
		color: #666;
		font-style: italic;
	}
</style>
