<script lang="ts">
	import type { ButtonProps } from '$lib/button.js';
	import type { PublicKey } from '@solana/web3.js';
	import { fade, slide } from 'svelte/transition';
	import { useWalletModal } from '../useWalletModal.svelte.js';
	import {
		setWalletMutliButtonContext,
		useWalletMultiButton
	} from '../useWalletMultiButton.svelte.js';
	import BaseWalletConnectionButton from './BaseWalletConnectionButton.svelte';
	import Button from './Button.svelte';
	import WalletIcon from './WalletIcon.svelte';
	import { clickOutside } from '$lib/ui/clickOutside.js';

	let {
		children,
		onconnect,
		ondisconnect,
		onselectwallet,
		...props
	}: ButtonProps & {
		labels?: Omit<
			{ [TButtonState in ReturnType<typeof useWalletMultiButton>['buttonState']]: string },
			'connected' | 'disconnecting'
		> & {
			'copy-address': string;
			copied: string;
			'change-wallet': string;
			disconnect: string;
		};
		onconnect?: (publicKey: PublicKey) => void;
		ondisconnect?: () => void;
		onselectwallet?: () => void;
	} = $props();

	let walletModal = useWalletModal();
	setWalletMutliButtonContext({
		onselectwallet() {
			walletModal.visible = true;
		}
	});
	let walletMultiButton = useWalletMultiButton();
	const { buttonState, wallet, walletIcon, walletName } = $derived(walletMultiButton);

	let copied = $state(false);
	let menuOpen = $state(true);

	let menuElement = $state<HTMLUListElement>();

	const labels = {
		'change-wallet': 'Change wallet',
		connecting: 'Connecting ...',
		'copy-address': 'Copy address',
		copied: 'Copied',
		disconnect: 'Disconnect',
		'has-wallet': 'Connect',
		'no-wallet': 'Select Wallet'
	} as const;

	let content = $derived(
		wallet?.publicKey
			? `${wallet.publicKey.toBase58().slice(0, 4)}..${wallet.publicKey.toBase58().slice(-4)}`
			: buttonState === 'connecting' || buttonState === 'has-wallet'
				? labels[buttonState]
				: labels['no-wallet']
	);

	$effect(() => {
		if (wallet) {
			if (onselectwallet) {
				onselectwallet();
			}
			if (onconnect) {
				wallet.adapter.on('connect', onconnect);
			}
			if (ondisconnect) {
				wallet.adapter.on('disconnect', ondisconnect);
			}
		}
	});
</script>

<div class="wallet-adapter-dropdown">
	<div class="group cursor-pointer inline-flex">
		<Button
			{...props}
			class="{buttonState === 'connected' ? ' ' : ''} bg-white"
			popovertarget="#wallet-adapter-dropdown-list"
			aria-haspopup="menu"
			aria-expanded={menuOpen}
			style={{ pointerEvents: menuOpen ? 'none' : 'auto', ...props.style }}
			onclick={async () => {
				switch (buttonState) {
					case 'no-wallet':
						walletModal.visible = true;
						break;
					case 'has-wallet':
						await wallet?.connect();
						break;
					case 'connected':
						menuOpen = !menuOpen;
						break;
				}
			}}
		>
			{#if walletIcon}
				<div
					style:box-shadow="var(--chin-shadow)"
					class:p-0.5={buttonState === 'connected'}
					transition:slide={{ axis: 'x' }}
					class="rounded-lg border w-8 aspect-square relative transition-all"
				>
					{#if buttonState === 'connected'}
						<div
							transition:fade
							class="absolute -inset-0 animate-tilt bg-gradient-to-r from-purple-500 to-green-500 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"
						>
							<div class="inset-1 w-[80%] h-[80%] bg-white"></div>
						</div>
					{/if}
					<i class="wallet-adapter-button-start-icon mix-blend-multiply">
						<WalletIcon wallet={{ adapter: { icon: walletIcon, name: '' } }} />
					</i>
				</div>
			{/if}
			{#if children}
				{@render children()}
			{:else}
				{content}
			{/if}
		</Button>
	</div>

	{#if menuOpen}
		<ul
			use:clickOutside
			onclickoutside={() => {
				menuOpen = false;
			}}
			id="wallet-adapter-dropdown-list"
			aria-label="dropdown-list"
			class="wallet-adapter-dropdown-list flex flex-col divide-y mt-1 flex-1 max-w-xs border rounded-xl {menuOpen &&
				'wallet-adapter-dropdown-list-active'}"
			bind:this={menuElement}
			role="menu"
			transition:slide={{ axis: 'y' }}
		>
			{#if wallet?.publicKey}
				<li class="contents">
					<button
						class="wallet-adapter-dropdown-list-item hover:bg-gray-100 ease-in-out transition-colors duration-200 hover:shadow-md flex gap-2 items-center p-2 flex-1 rounded-md"
						onclick={async () => {
							await navigator.clipboard.writeText(wallet.publicKey!.toBase58());
							copied = true;
							setTimeout(() => (copied = false), 400);
						}}
						role="menuitem"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4">
							<g fill="none" fill-rule="evenodd">
								<path
									d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"
								/>
								<path
									fill="currentColor"
									d="M9 2a2 2 0 0 0-2 2v2h2V4h11v11h-2v2h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM4 7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zm0 2h11v11H4z"
								/>
							</g>
						</svg>
						{#if copied}
							{labels['copied']}
						{:else}
							{labels['copy-address']}
						{/if}
					</button>
				</li>
			{/if}
			<li class="contents">
				<button
					class="wallet-adapter-dropdown-list-item hover:bg-gray-100 ease-in-out transition-colors duration-200 hover:shadow-md flex gap-2 items-center p-2 flex-1 rounded-md"
					onclick={() => {
						walletModal.visible = true;
						menuOpen = false;
					}}
					role="menuitem"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4">
						<g fill="none">
							<path
								d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"
							/>
							<path
								fill="currentColor"
								d="M16 4a1 1 0 0 1 .117 1.993L16 6H5.5a.5.5 0 0 0-.09.992L5.5 7H19a2 2 0 0 1 1.995 1.85L21 9v9a2 2 0 0 1-1.85 1.995L19 20H5a2 2 0 0 1-1.995-1.85L3 18V6.5a2.5 2.5 0 0 1 2.336-2.495L5.5 4zM5 8.95V18h14V9H5.5q-.171 0-.337-.022zM15.5 12a1.5 1.5 0 1 1 0 3a1.5 1.5 0 0 1 0-3"
							/>
						</g>
					</svg>
					{labels['change-wallet']}
				</button>
			</li>

			<li class="contents">
				<button
					class="wallet-adapter-dropdown-list-item hover:bg-gray-100 ease-in-out transition-colors duration-200 hover:shadow-md flex gap-2 items-center p-2 flex-1 rounded-md"
					onclick={async () => {
						if (ondisconnect) {
							ondisconnect();
						}
						await wallet?.disconnect();
						menuOpen = false;
					}}
					role="menuitem"
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4">
						<g fill="none">
							<path
								d="M24 0v24H0V0zM12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"
							/>
							<path
								fill="currentColor"
								d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 2a8 8 0 1 0 0 16a8 8 0 0 0 0-16M9.879 8.464L12 10.586l2.121-2.122a1 1 0 1 1 1.415 1.415l-2.122 2.12l2.122 2.122a1 1 0 0 1-1.415 1.415L12 13.414l-2.121 2.122a1 1 0 0 1-1.415-1.415L10.586 12L8.465 9.879a1 1 0 0 1 1.414-1.415"
							/>
						</g>
					</svg>
					{labels['disconnect']}
				</button>
			</li>
		</ul>
	{/if}
</div>

<style>
	.connected {
		animation: tilt 5s infinite linear;
	}

	@keyframes tilt {
		0% {
			transform: rotate(0deg);
		}
		25% {
			transform: rotate(5deg);
		}
		50% {
			transform: rotate(0deg);
		}
		75% {
			transform: rotate(-5deg);
		}
		100% {
			transform: rotate(0deg);
		}
	}
</style>
