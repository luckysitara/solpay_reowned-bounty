import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

const connection = new Connection("https://api.mainnet-beta.solana.com")

export async function getTransactionHistory(address: string) {
  const pubKey = new PublicKey(address)
  const transactions = await connection.getSignaturesForAddress(pubKey, {
    limit: 10,
  })

  return transactions.map((tx) => ({
    signature: tx.signature,
    timestamp: new Date(tx.blockTime! * 1000).toLocaleString(),
    status: tx.confirmationStatus,
  }))
}

export async function getBalance(address: string) {
  const pubKey = new PublicKey(address)
  const balance = await connection.getBalance(pubKey)
  return balance / LAMPORTS_PER_SOL
}

