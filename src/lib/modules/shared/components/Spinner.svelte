<script lang="ts">
	interface Props {
		size?: 'small' | 'medium' | 'large';
	}

	let { size = 'medium' }: Props = $props();
</script>

<div class="spinner spinner-{size}"></div>

<style>
	.spinner {
		border: 2px solid #f3f3f3;
		border-top: 2px solid #333;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 2rem auto;
	}

	.spinner-small {
		width: 1rem;
		height: 1rem;
		border-width: 2px;
	}

	.spinner-medium {
		width: 2rem;
		height: 2rem;
		border-width: 3px;
	}

	.spinner-large {
		width: 3rem;
		height: 3rem;
		border-width: 4px;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
