import { useState } from "react"
import { useJupiter } from "@jup-ag/react-hook"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNotification } from "../contexts/NotificationContext"

const TokenSwap = () => {
  const { publicKey } = useWallet()
  const { showNotification } = useNotification()
  const [inputAmount, setInputAmount] = useState("")
  const [outputAmount, setOutputAmount] = useState("")

  const inputMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") // USDC
  const outputMint = new PublicKey("So11111111111111111111111111111111111111112") // Wrapped SOL

  const { exchange, routes, loading, error } = useJupiter({
    amount: Number.parseFloat(inputAmount) * 1e6, // USDC has 6 decimals
    inputMint,
    outputMint,
    slippage: 1, // 1% slippage
    debounceTime: 250,
  })

  const handleSwap = async () => {
    if (!publicKey) {
      showNotification({
        title: "Wallet not connected",
        description: "Please connect your wallet to perform a swap",
        type: "error",
      })
      return
    }

    try {
      const result = await exchange()
      if ("error" in result) {
        throw new Error(result.error)
      }
      showNotification({
        title: "Swap Successful",
        description: `Swapped ${inputAmount} USDC for ${outputAmount} SOL`,
        type: "success",
      })
    } catch (err) {
      showNotification({
        title: "Swap Failed",
        description: err.message,
        type: "error",
      })
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Token Swap</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="inputAmount">USDC Amount</Label>
          <Input
            id="inputAmount"
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="Enter USDC amount"
          />
        </div>
        <div>
          <Label htmlFor="outputAmount">Estimated SOL</Label>
          <Input id="outputAmount" type="number" value={outputAmount} readOnly placeholder="Estimated SOL amount" />
        </div>
        <Button onClick={handleSwap} disabled={loading || !routes || routes.length === 0} className="w-full">
          {loading ? "Calculating..." : "Swap"}
        </Button>
      </div>
      {error && <p className="text-red-500 mt-2">{error.message}</p>}
    </div>
  )
}

export default TokenSwap

