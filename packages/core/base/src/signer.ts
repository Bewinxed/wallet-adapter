import type { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import {
    Address,
    Blockhash,
    Rpc,
    Signature,
    TransactionVersion,
    TransactionMessage,
    Transaction,
    SolanaRpcApi,
    lamports,
    pipe,
    createTransactionMessage,
    setTransactionMessageFeePayer,
    appendTransactionMessageInstructions,
    setTransactionMessageLifetimeUsingBlockhash,
    compileTransaction,
    getBase64EncodedWireTransaction,
    FullySignedTransaction,
    partiallySignTransactionMessageWithSigners,
    partiallySignTransaction,
    signTransaction,
    BaseTransactionMessage,
    addSignersToTransactionMessage,
    TransactionMessageWithDurableNonceLifetime,
    TransactionWithBlockhashLifetime,
    TransactionWithLifetime,
    TransactionMessageWithBlockhashLifetime,
    decodeTransactionMessage,
} from '@solana/web3.js';

import {
    BaseWalletAdapter,
    type SendTransactionConfig,
    type WalletAdapter,
    type WalletAdapterProps,
} from './adapter.js';
import { WalletSendTransactionError, WalletSignTransactionError } from './errors.js';
import { extractTransactionVersion, isLegacyTransaction, isVersionedTransaction } from './transaction.js';

export interface SignerWalletAdapterProps<Name extends string = string> extends WalletAdapterProps<Name> {
    signTransaction<T extends Transaction & TransactionWithLifetime>(
        transaction: T
    ): Promise<FullySignedTransaction>;
    signAllTransactions<T extends Transaction & TransactionWithLifetime>(
        transactions: T[]
    ): Promise<FullySignedTransaction[]>;
}


export type SignerWalletAdapter<Name extends string = string> = WalletAdapter<Name> & SignerWalletAdapterProps<Name>;

export type TransactionMessageWithLifetime = BaseTransactionMessage | BaseTransactionMessage & TransactionMessageWithDurableNonceLifetime | BaseTransactionMessage & TransactionMessageWithBlockhashLifetime

export abstract class BaseSignerWalletAdapter<Name extends string = string>
    extends BaseWalletAdapter<Name>
    implements SignerWalletAdapter<Name>
{
    async sendTransaction(
        transaction: TransactionMessageWithLifetime,
        rpc: Rpc<SolanaRpcApi>,
        options: SendTransactionConfig = {
            encoding: 'base64',
        }
    ): Promise<Signature> {
        let emit = true;

        async function getOrPassBlockhash<T extends TransactionMessageWithLifetime>(transaction: T) {
            return 'lifetimeConstraint' in transaction && 'blockhash' in transaction.lifetimeConstraint && 'blockhash' in transaction.lifetimeConstraint ? transaction.lifetimeConstraint : await rpc.getLatestBlockhash({
                commitment: options.preflightCommitment,
                minContextSlot: options.minContextSlot,
            }).send().then((res) => res.value);
        }
        try {
            if (!isLegacyTransaction(transaction)) {
                if (!this.supportedTransactionVersions)
                    throw new WalletSendTransactionError(
                        `Sending versioned transactions isn't supported by this wallet`
                    );

                if (!this.supportedTransactionVersions.has(transaction.version))
                    throw new WalletSendTransactionError(
                        `Sending transaction version ${transaction.version} isn't supported by this wallet`
                    );

                try {
                    const blockhashOpts = await getOrPassBlockhash(transaction)
                    const tx = await pipe(
                        transaction,
                        async (msg) => this.prepareTransaction(msg, blockhashOpts),
                        async (msg) => compileTransaction(await msg),
                        async (msg) => await this.signTransaction(await msg),
                        async (msg) => getBase64EncodedWireTransaction(await msg),
                    )
                    return await rpc.sendTransaction(tx, options).send();
                } catch (error: any) {
                    if (error instanceof WalletSignTransactionError) {
                        emit = false;
                        throw error;
                    }
                    throw new WalletSendTransactionError(error?.message, error);
                }
            } else {
                try {
                    const { signers, ...sendOptions } = options;
                    const blockhashOpts = await getOrPassBlockhash(transaction)
                    const tx = await pipe(
                        transaction,
                        async (msg) => this.prepareTransaction(msg, blockhashOpts),
                        async (msg) => compileTransaction(await msg),
                        async (msg) => signers?.length ? await partiallySignTransaction(signers.map(s => s.keyPair), await msg) : await msg,
                        async (msg) => await this.signTransaction(await msg),
                        async (msg) => getBase64EncodedWireTransaction(await msg),
                    )
                    return await rpc.sendTransaction(tx, sendOptions).send();
                } catch (error: any) {
                    if (error instanceof WalletSignTransactionError) {
                        emit = false;
                        throw error;
                    }
                    throw new WalletSendTransactionError(error?.message, error);
                }
            }
        } catch (error: any) {
            if (emit) {
                this.emit('error', error);
            }
            throw error;
        }
    }

    abstract signTransaction<T extends Transaction & TransactionWithLifetime>(
        transaction: T
    ): Promise<FullySignedTransaction>; 

    async signAllTransactions<T extends Transaction & TransactionWithLifetime>(
        transactions: T[]
    ): Promise<FullySignedTransaction[]> {
        for (const transaction of transactions) {
            const version = extractTransactionVersion(transaction);
            if (version === 0) {
                if (!this.supportedTransactionVersions)
                    throw new WalletSignTransactionError(
                        `Signing versioned transactions isn't supported by this wallet`
                    );

                if (!this.supportedTransactionVersions.has(version))
                    throw new WalletSignTransactionError(
                        `Signing transaction version ${version} isn't supported by this wallet`
                    );
            }
        }
        return await Promise.all(transactions.map(async (transaction) => await this.signTransaction(transaction)));
    }
}

export interface MessageSignerWalletAdapterProps<Name extends string = string> extends WalletAdapterProps<Name> {
    signMessage(message: Uint8Array): Promise<Uint8Array>;
}

export type MessageSignerWalletAdapter<Name extends string = string> = WalletAdapter<Name> &
    MessageSignerWalletAdapterProps<Name>;

export abstract class BaseMessageSignerWalletAdapter<Name extends string = string>
    extends BaseSignerWalletAdapter<Name>
    implements MessageSignerWalletAdapter<Name>
{
    abstract signMessage(message: Uint8Array): Promise<Uint8Array>;
}

export interface SignInMessageSignerWalletAdapterProps<Name extends string = string> extends WalletAdapterProps<Name> {
    signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput>;
}

export type SignInMessageSignerWalletAdapter<Name extends string = string> = WalletAdapter<Name> &
    SignInMessageSignerWalletAdapterProps<Name>;

export abstract class BaseSignInMessageSignerWalletAdapter<Name extends string = string>
    extends BaseMessageSignerWalletAdapter<Name>
    implements SignInMessageSignerWalletAdapter<Name>
{
    abstract signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput>;
}
