<script lang="ts">
    import {type createDefaultRpcTransport, createSolanaRpc } from '@solana/web3.js';
    import type { Snippet } from 'svelte';
	import { setSolanaContext, useSolana } from '../useSolana.svelte.js';
	import { WalletContext } from '../useWallet.svelte.js';

    const {
        endpoint,
        config,
        children
    }: {
        endpoint: string,
        config: Omit<Parameters<typeof createDefaultRpcTransport>[0], 'url'>,
        children: Snippet
    } = $props()

    setSolanaContext({
        connection: createSolanaRpc(endpoint, config),
        context: new WalletContext()
    })
</script>

{@render children()}