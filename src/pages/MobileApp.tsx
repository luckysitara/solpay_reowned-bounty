import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QRCode from "qrcode.react"

const MobileApp = () => {
  const { connected, publicKey } = useWallet()
  const [amount, setAmount] = useState("")
  const [qrValue, setQrValue] = useState("")

  const generateQRCode = () => {
    if (!amount || !publicKey) return
    setQrValue(`solana:${publicKey.toString()}?amount=${amount}`)
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-4">SolPay Mobile</h1>
      {!connected ? (
        <div className="text-center">
          <p className="text-white mb-4">Connect your wallet to use SolPay</p>
          <WalletMultiButton className="!bg-primary !text-dark hover:!bg-primary/90" />
        </div>
      ) : (
        <Tabs defaultValue="pay" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pay">Pay</TabsTrigger>
            <TabsTrigger value="receive">Receive</TabsTrigger>
          </TabsList>
          <TabsContent value="pay" className="space-y-4">
            <div>
              <Label htmlFor="payAmount">Amount (SOL)</Label>
              <Input
                id="payAmount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={() => alert("Payment feature not implemented")}>
              Pay
            </Button>
          </TabsContent>
          <TabsContent value="receive" className="space-y-4">
            <div>
              <Label htmlFor="receiveAmount">Amount (SOL)</Label>
              <Input
                id="receiveAmount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={generateQRCode}>
              Generate QR Code
            </Button>
            {qrValue && (
              <div className="mt-4 bg-white p-4 rounded-lg flex justify-center">
                <QRCode value={qrValue} size={200} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default MobileApp

