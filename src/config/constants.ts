import { PublicKey } from "@solana/web3.js"

export const RPC_URL = "https://mainnet.helius-rpc.com/?api-key=58fcffd5-d2bb-4247-bf8d-69e902d395b8"

export const TOKENS = [
  { symbol: "SOL", address: "So11111111111111111111111111111111111111112" },
  { symbol: "USDC", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
  { symbol: "USDT", address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" },
  { symbol: "RAY", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R" },
  { symbol: "SRM", address: "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt" },
  { symbol: "MNGO", address: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac" },
  { symbol: "ORCA", address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE" },
  { symbol: "STEP", address: "StepAscQoEioFxxWGnh2sLBDFp9d8rvKz2Yp39iDpyT" },
  { symbol: "SAMO", address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU" },
  { symbol: "ATLAS", address: "ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx" },
  { symbol: "POLIS", address: "poLisWXnNRwC6oBu1vHiuKQzFjGL4XDSu4g9qjz9qVk" },
  { symbol: "COPE", address: "8HGyAAB1yoM1ttS7pXjHMa3dukTFGQggnFFH3hJZgzQh" },
  { symbol: "FIDA", address: "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp" },
]

export const getTokenPublicKey = (symbol: string): PublicKey | undefined => {
  const token = TOKENS.find((t) => t.symbol === symbol)
  return token ? new PublicKey(token.address) : undefined
}

