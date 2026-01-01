<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface Props {
		currentPage: number;
		totalPages: number;
		pageSize?: number;
		totalItems?: number;
	}

	let { currentPage, totalPages, pageSize, totalItems }: Props = $props();

	const dispatch = createEventDispatcher();

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages && page !== currentPage) {
			dispatch('pagechange', page);
		}
	}

	function nextPage() {
		goToPage(currentPage + 1);
	}

	function prevPage() {
		goToPage(currentPage - 1);
	}

	const pages = $derived.by(() => {
		const maxVisible = 5;
		const half = Math.floor(maxVisible / 2);
		let start = Math.max(1, currentPage - half);
		let end = Math.min(totalPages, start + maxVisible - 1);

		if (end - start < maxVisible - 1) {
			start = Math.max(1, end - maxVisible + 1);
		}

		const result = [];
		for (let i = start; i <= end; i++) {
			result.push(i);
		}
		return result;
	});
</script>

<div class="pagination">
	<div class="info">
		{#if totalItems && pageSize}
			<span>
				Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to
				{Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
			</span>
		{/if}
	</div>

	<div class="controls">
		<button onclick={prevPage} disabled={currentPage === 1} class="btn-page">
			Previous
		</button>

		{#if pages[0] > 1}
			<button onclick={() => goToPage(1)} class="btn-page">1</button>
			{#if pages[0] > 2}
				<span class="ellipsis">...</span>
			{/if}
		{/if}

		{#each pages as page}
			<button
				onclick={() => goToPage(page)}
				class="btn-page"
				class:active={page === currentPage}
			>
				{page}
			</button>
		{/each}

		{#if pages[pages.length - 1] < totalPages}
			{#if pages[pages.length - 1] < totalPages - 1}
				<span class="ellipsis">...</span>
			{/if}
			<button onclick={() => goToPage(totalPages)} class="btn-page">
				{totalPages}
			</button>
		{/if}

		<button onclick={nextPage} disabled={currentPage === totalPages} class="btn-page">
			Next
		</button>
	</div>
</div>

<style>
	.pagination {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.info {
		font-size: 0.875rem;
		color: #666;
	}

	.controls {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.btn-page {
		padding: 0.375rem 0.75rem;
		border: 1px solid #ddd;
		background: #fff;
		cursor: pointer;
		font-size: 0.875rem;
		border-radius: 4px;
		min-width: 2.5rem;
	}

	.btn-page:hover:not(:disabled) {
		background: #f5f5f5;
	}

	.btn-page:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-page.active {
		background: #333;
		color: #fff;
		border-color: #333;
	}

	.ellipsis {
		padding: 0 0.25rem;
		color: #666;
	}
</style>
