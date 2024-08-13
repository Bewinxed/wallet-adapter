<script lang="ts">
	import WalletModalProvider from '$lib/components/WalletModalProvider.svelte';
	import { ConnectionProvider, WalletProvider } from '@bewinxed/wallet-adapter-svelte';
	import {
		PhantomWalletAdapter,
		SolflareWalletAdapter,
		UnsafeBurnerWalletAdapter
	} from '@solana/wallet-adapter-wallets';
	// import '../styles.css';
	import '$lib/app.css';
	import type { Snippet } from 'svelte';

	let {
		children
	}: {
		children: Snippet;
	} = $props();

	const wallets = [
		new UnsafeBurnerWalletAdapter(),
		new PhantomWalletAdapter(),
		new SolflareWalletAdapter()
	];
</script>

<ConnectionProvider config={{}} endpoint="https://api.devnet.solana.com">
	<WalletProvider autoConnect {wallets}>
		<WalletModalProvider>
			{@render children()}
		</WalletModalProvider>
	</WalletProvider>
</ConnectionProvider>
