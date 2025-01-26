import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotification } from "../contexts/NotificationContext"

type RecurringPayment = {
  id: string
  amount: number
  frequency: string
  recipient: string
  nextPayment: Date
}

export function RecurringPayments() {
  const [payments, setPayments] = useState<RecurringPayment[]>([])
  const { showNotification } = useNotification()
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [frequency, setFrequency] = useState("monthly")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newPayment: RecurringPayment = {
      id: Date.now().toString(),
      amount: Number.parseFloat(amount),
      frequency,
      recipient,
      nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }

    setPayments([...payments, newPayment])
    showNotification({
      title: "Recurring Payment Created",
      description: `Payment of ${amount} SOL will be sent ${frequency}`,
      type: "success",
    })

    setAmount("")
    setRecipient("")
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
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Solana address"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select value={frequency} onValueChange={setFrequency}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full">
          Create Recurring Payment
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Active Recurring Payments</h3>
        {payments.map((payment) => (
          <div key={payment.id} className="p-4 rounded-lg border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white">
                  {payment.amount} SOL to {payment.recipient.slice(0, 6)}...{payment.recipient.slice(-4)}
                </p>
                <p className="text-sm text-white/60">
                  {payment.frequency} - Next payment: {payment.nextPayment.toLocaleDateString()}
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  setPayments(payments.filter((p) => p.id !== payment.id))
                  showNotification({
                    title: "Recurring Payment Cancelled",
                    description: "The recurring payment has been cancelled",
                    type: "info",
                  })
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

