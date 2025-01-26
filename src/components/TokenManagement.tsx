import { useState, useEffect } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getAccount } from "@solana/spl-token"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNotification } from "../contexts/NotificationContext"
import { TOKENS } from "../config/constants"

export function TokenManagement() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const { showNotification } = useNotification()
  const [tokenBalances, setTokenBalances] = useState<{ [key: string]: number }>({})
  const [newTokenAddress, setNewTokenAddress] = useState("")

  useEffect(() => {
    if (publicKey) {
      fetchTokenBalances()
    }
  }, [publicKey])

  const fetchTokenBalances = async () => {
    if (!publicKey) return

    const balances: { [key: string]: number } = {}

    for (const token of TOKENS) {
      try {
        const mintPublicKey = new PublicKey(token.address)
        const ata = await getAssociatedTokenAddress(mintPublicKey, publicKey)
        const account = await getAccount(connection, ata)
        balances[token.symbol] = Number(account.amount) / Math.pow(10, account.mint.decimals)
      } catch (error) {
        console.error(`Error fetching balance for ${token.symbol}:`, error)
        balances[token.symbol] = 0
      }
    }

    setTokenBalances(balances)
  }

  const addCustomToken = async () => {
    if (!publicKey) return

    try {
      const mintPublicKey = new PublicKey(newTokenAddress)
      const ata = await getAssociatedTokenAddress(mintPublicKey, publicKey)
      const account = await getAccount(connection, ata)
      const balance = Number(account.amount) / Math.pow(10, account.mint.decimals)

      setTokenBalances((prev) => ({
        ...prev,
        [newTokenAddress]: balance,
      }))

      showNotification({
        title: "Token Added",
        description: `New token added with balance: ${balance}`,
        type: "success",
      })

      setNewTokenAddress("")
    } catch (error) {
      showNotification({
        title: "Error Adding Token",
        description: error.message,
        type: "error",
      })
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Token Management</h2>
      <div className="space-y-4">
        {Object.entries(tokenBalances).map(([symbol, balance]) => (
          <div key={symbol} className="flex justify-between items-center">
            <span className="text-white">{symbol}</span>
            <span className="text-white">{balance.toFixed(6)}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label htmlFor="newTokenAddress">Add Custom Token</Label>
        <Input
          id="newTokenAddress"
          value={newTokenAddress}
          onChange={(e) => setNewTokenAddress(e.target.value)}
          placeholder="Enter token mint address"
        />
        <Button onClick={addCustomToken}>Add Token</Button>
      </div>
    </div>
  )
}

