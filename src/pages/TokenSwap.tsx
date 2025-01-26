import { useState, useMemo } from "react"
import { useJupiter } from "@jup-ag/react-hook"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotification } from "../contexts/NotificationContext"
import { TOKENS } from "../config/constants"

const TokenSwap = () => {
  const { publicKey } = useWallet()
  const { showNotification } = useNotification()
  const [inputAmount, setInputAmount] = useState("")
  const [inputToken, setInputToken] = useState("SOL")
  const [outputToken, setOutputToken] = useState("USDC")

  const inputMint = useMemo(
    () => new PublicKey(TOKENS.find((t) => t.symbol === inputToken)?.address || ""),
    [inputToken],
  )
  const outputMint = useMemo(
    () => new PublicKey(TOKENS.find((t) => t.symbol === outputToken)?.address || ""),
    [outputToken],
  )

  const amount = useMemo(() => {
    return Math.round(Number(inputAmount) * Math.pow(10, 9))
  }, [inputAmount])

  const { exchange, routes, loading, error } = useJupiter({
    amount,
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
        description: `Swapped ${inputAmount} ${inputToken} for ${routes[0]?.outAmount || "unknown"} ${outputToken}`,
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-card rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4 text-card-foreground">Token Swap</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="inputAmount">Amount</Label>
          <Input
            id="inputAmount"
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="Enter amount"
          />
        </div>
        <div>
          <Label htmlFor="inputToken">From</Label>
          <Select value={inputToken} onValueChange={setInputToken}>
            <SelectTrigger id="inputToken">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              {TOKENS.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="outputToken">To</Label>
          <Select value={outputToken} onValueChange={setOutputToken}>
            <SelectTrigger id="outputToken">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              {TOKENS.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {routes && routes.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Expected output: {routes[0]?.outAmount || "Unknown"} {outputToken}
          </div>
        )}
        <Button
          onClick={handleSwap}
          disabled={loading || !routes || routes.length === 0}
          className="w-full bg-jupiter-purple hover:bg-jupiter-blue text-white"
        >
          {loading ? "Calculating..." : "Swap"}
        </Button>
      </div>
      {error && <p className="text-destructive mt-2">{error.message}</p>}
    </div>
  )
}

export default TokenSwap

