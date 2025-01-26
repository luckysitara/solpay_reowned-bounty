import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import QRCode from "qrcode.react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useNotification } from "../contexts/NotificationContext"

type Invoice = {
  id: string
  amount: number
  description: string
  recipient: string
  date: Date
}

export function InvoiceGenerator() {
  const { publicKey } = useWallet()
  const { showNotification } = useNotification()
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [invoices, setInvoices] = useState<Invoice[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey) return

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      amount: Number.parseFloat(amount),
      description,
      recipient: publicKey.toString(),
      date: new Date(),
    }

    setInvoices([newInvoice, ...invoices])
    showNotification({
      title: "Invoice Generated",
      description: `Invoice for ${amount} SOL has been created`,
      type: "success",
    })

    setAmount("")
    setDescription("")
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (SOL)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Invoice description"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Generate Invoice
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Recent Invoices</h3>
        {invoices.map((invoice) => (
          <div key={invoice.id} className="p-4 rounded-lg border border-white/10">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-white">{invoice.amount} SOL</p>
                <p className="text-sm text-white/60">{invoice.description}</p>
                <p className="text-sm text-white/60">Created: {invoice.date.toLocaleDateString()}</p>
              </div>
              <div className="bg-white p-2 rounded">
                <QRCode
                  value={`solana:${invoice.recipient}?amount=${invoice.amount}&reference=${invoice.id}`}
                  size={100}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

