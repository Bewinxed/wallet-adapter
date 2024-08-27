import { IAccountMeta, IInstruction } from '@solana/instructions';
import { CompilableTransactionMessage, Transaction, TransactionMessage, TransactionVersion } from '@solana/web3.js';

export type BaseTransactionMessage<TVersion extends TransactionVersion = TransactionVersion, TInstruction extends IInstruction = IInstruction> = Readonly<{
    instructions: readonly TInstruction[];
    version: TVersion;
}>;

type ILegacyInstruction<TProgramAddress extends string = string> = IInstruction<TProgramAddress, readonly IAccountMeta[]>;
type LegacyTransactionMessage = BaseTransactionMessage<'legacy', ILegacyInstruction>;
type V0TransactionMessage = BaseTransactionMessage<0, IInstruction>;

export type SupportedTransactionVersions = ReadonlySet<TransactionVersion> | null | undefined;

export function isLegacyTransaction(
    transaction: TransactionMessage
): transaction is LegacyTransactionMessage {
    return transaction.version === 'legacy';
}

export function isVersionedTransaction(
    transaction: TransactionMessage
): transaction is V0TransactionMessage {
    return transaction.version === 0;
}

// Helper function to get the version of a transaction message
export function getTransactionVersion(transaction: TransactionMessage): TransactionVersion {
    return transaction.version;
}

export function extractTransactionVersion(transaction: Transaction): TransactionVersion {
    // The first byte of the message encodes the version
    const versionByte = transaction.messageBytes[0];
    
    // Check if it's a legacy transaction (no explicit version byte)
    if ((versionByte & 0x80) === 0) {
      return 'legacy';
    }
    
    // Extract the version number
    const version = versionByte & 0x7f;
    
    // Currently, only version 0 is supported for versioned transactions
    if (version === 0) {
      return 0;
    }
    
    // If we encounter an unknown version, we might want to throw an error
    // or return a special value. For now, let's return 'unknown'.
    return 'unknown' as TransactionVersion;
  }
  