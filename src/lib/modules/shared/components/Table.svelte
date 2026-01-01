<script lang="ts">
	interface Props {
		headers: string[];
		data: any[];
		actions?: boolean;
		loading?: boolean;
		empty?: string;
		children?: any;
	}

	let {
		headers,
		data,
		actions = false,
		loading = false,
		empty = 'No data available',
		children
	}: Props = $props();
</script>

<div class="table-container">
	{#if loading}
		<div class="loading">Loading...</div>
	{:else if data.length === 0}
		<div class="empty">{empty}</div>
	{:else}
		<table>
			<thead>
				<tr>
					{#each headers as header}
						<th>{header}</th>
					{/each}
					{#if actions}
						<th>Actions</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{@render children?.()}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.table-container {
		overflow-x: auto;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
	}

	th,
	:global(td) {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #ddd;
	}

	th {
		background: #f5f5f5;
		font-weight: 600;
		font-size: 0.875rem;
	}

	:global(tbody tr:hover) {
		background: #f9f9f9;
	}

	:global(tbody tr:last-child td) {
		border-bottom: none;
	}

	.loading,
	.empty {
		padding: 2rem;
		text-align: center;
		color: #666;
	}
</style>
