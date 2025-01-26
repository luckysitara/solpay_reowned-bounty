import { createTransferCheckedInstruction, getAssociatedTokenAddress, getMint } from "@solana/spl-token"
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base"
import {
  type Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js"
import bs58 from "bs58"
import { getTokenPublicKey } from "../config/constants"

export async function createTransaction(
  connection: Connection,
  payer: PublicKey,
  recipient: PublicKey,
  amount: number,
  tokenSymbol = "SOL",
  reference: PublicKey | undefined = undefined,
  memo: string | undefined = undefined,
): Promise<Transaction> {
  const tokenMint = getTokenPublicKey(tokenSymbol)

  if (!tokenMint) {
    throw new Error(`Invalid token symbol: ${tokenSymbol}`)
  }

  const transaction = new Transaction()

  if (tokenSymbol === "SOL") {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: recipient,
        lamports: amount * LAMPORTS_PER_SOL,
      }),
    )
  } else {
    const mint = await getMint(connection, tokenMint)
    const payerAta = await getAssociatedTokenAddress(tokenMint, payer)
    const recipientAta = await getAssociatedTokenAddress(tokenMint, recipient)

    transaction.add(
      createTransferCheckedInstruction(
        payerAta,
        tokenMint,
        recipientAta,
        payer,
        amount * Math.pow(10, mint.decimals),
        mint.decimals,
      ),
    )
  }

  if (reference) {
    transaction.add(
      new TransactionInstruction({
        keys: [{ pubkey: reference, isSigner: false, isWritable: false }],
        data: Buffer.from([]),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      }),
    )
  }

  if (memo) {
    transaction.add(
      new TransactionInstruction({
        keys: [],
        data: Buffer.from(memo, "utf-8"),
        programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      }),
    )
  }

  return transaction
}

export async function signAndConfirmTransaction(
  connection: Connection,
  transaction: Transaction,
  payer: PublicKey,
): Promise<string> {
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = payer

  const signed = await window.solana.signTransaction(transaction)
  const signature = await connection.sendRawTransaction(signed.serialize())
  await connection.confirmTransaction(signature)

  return signature
}

export async function verifyTransactionSignature(
  connection: Connection,
  signature: string,
  expectedPayer: PublicKey,
  expectedRecipient: PublicKey,
  expectedAmount: number,
  expectedToken?: PublicKey,
) {
  const transaction = await connection.getTransaction(signature)

  if (!transaction) {
    throw new Error("Transaction not found")
  }

  // Verify the transaction was signed by the expected payer
  if (!transaction.signatures.some((sig) => sig === bs58.encode(expectedPayer.toBytes()))) {
    throw new Error("Transaction was not signed by the expected payer")
  }

  // Verify the recipient and amount
  const instruction = transaction.transaction.message.instructions[0]
  if (expectedToken) {
    // Token transfer
    if (instruction.programId.equals(SystemProgram.programId)) {
      throw new Error("Expected a token transfer, but found a SOL transfer")
    }
    const decodedData = bs58.decode(instruction.data)
    const amount = decodedData.readBigUInt64LE(1)
    if (amount !== BigInt(expectedAmount)) {
      throw new Error("Transfer amount does not match expected amount")
    }
    // Verify recipient (this assumes the instruction format of SPL token transfers)
    if (!instruction.keys[1].pubkey.equals(expectedRecipient)) {
      throw new Error("Recipient does not match expected recipient")
    }
  } else {
    // SOL transfer
    if (!instruction.programId.equals(SystemProgram.programId)) {
      throw new Error("Expected a SOL transfer, but found a different instruction")
    }
    const decodedData = bs58.decode(instruction.data)
    const amount = decodedData.readBigUInt64LE(4)
    if (amount !== BigInt(expectedAmount * LAMPORTS_PER_SOL)) {
      throw new Error("Transfer amount does not match expected amount")
    }
    if (!instruction.keys[1].pubkey.equals(expectedRecipient)) {
      throw new Error("Recipient does not match expected recipient")
    }
  }

  return true
}

