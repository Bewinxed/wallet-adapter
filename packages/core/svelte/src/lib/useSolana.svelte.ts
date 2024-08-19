import type {
	Adapter,
	MessageSignerWalletAdapterProps,
	SignInMessageSignerWalletAdapterProps,
	SignerWalletAdapterProps,
	WalletAdapterProps,
	WalletName,
	WalletReadyState
} from '@solana/wallet-adapter-base';
import type { createSolanaRpc } from "@solana/web3.js";
import { getContext, hasContext, setContext } from 'svelte';
import type { WalletContext } from './useWallet.svelte';

export interface WalletType {
	adapter: Adapter;
	readyState: WalletReadyState;
}

type RpcFromTransport = ReturnType<typeof createSolanaRpc>

export interface SolanaProvider {
    connection: ReturnType<typeof createSolanaRpc>
    context: WalletContext;
}

const SOLANA_CONTEXT_KEY = Symbol('solana');

class Solana implements SolanaProvider {
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    connection = $state<RpcFromTransport>()!
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    context = $state<WalletContext>()!

    constructor(
        connection: RpcFromTransport,
        wallet: WalletContext
    ) {
        this.connection = connection;
        this.context = wallet;
    }
}

export function setSolanaContext({
    connection,
    context: wallet
}: SolanaProvider) {
	return setContext(SOLANA_CONTEXT_KEY, new Solana(connection, wallet));
}

export function useSolana(): SolanaProvider {
	if (!hasContext(SOLANA_CONTEXT_KEY)) {
		throw new Error('useSolana must be used within a SolanaProvider');
	}
	return getContext<SolanaProvider>(SOLANA_CONTEXT_KEY)
}