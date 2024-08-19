<script lang="ts">
	import type { ButtonProps } from '$lib/button';
	import type { Snippet } from 'svelte';
	import WalletIcon from './WalletIcon.svelte';
	import { useStyles } from '../../types/css';
	import { slide } from 'svelte/transition';

	let {
		headless,
		class: className,
		disabled,
		endIcon,
		onclick,
		startIcon,
		style,
		tabIndex,
		children,
		...props
	}: ButtonProps = $props();
</script>

{#snippet icon(snippet: Snippet | string, className: string)}
	{#if typeof snippet === 'string'}
		<div
			style:box-shadow="var(--chin-shadow)"
			transition:slide={{ axis: 'x' }}
			class="p-0.5 rounded-lg w-8 aspect-square"
		>
			<i class={className}>
				<WalletIcon wallet={{ adapter: { icon: snippet, name: '' } }} />
			</i>
		</div>
	{:else}
		{@render snippet()}
	{/if}
{/snippet}

<button
	{...props}
	use:useStyles={{ ...style }}
	class="{className} {headless
		? ''
		: `flex p-1 px-1.5 gap-2 place-items-center place-content-start rounded-lg border  transition-[box-shadow] duration-200`} hover:shadow-md ease-in-out"
	{disabled}
	{onclick}
	tabindex={tabIndex}
	type="button"
>
	{#if startIcon}
		{@render icon(startIcon, 'wallet-adapter-button-start-icon')}
	{/if}
	{#if children}
		{@render children()}
	{/if}
	{#if endIcon}
		{@render icon(endIcon, 'wallet-adapter-button-end-icon')}
	{/if}
</button>
