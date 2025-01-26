import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useAppKit } from "@solana/app-kit"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RecurringPayments } from "../components/RecurringPayments"
import { InvoiceGenerator } from "../components/InvoiceGenerator"
import { useNotification } from "../contexts/NotificationContext"

const MerchantDashboard = () => {
  const { connected, publicKey } = useWallet()
  const { showNotification } = useNotification()
  const { getBalance, getTransactions } = useAppKit()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [filter, setFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")

  useEffect(() => {
    if (publicKey) {
      fetchBalanceAndTransactions()
    }
  }, [publicKey])

  const fetchBalanceAndTransactions = async () => {
    if (publicKey) {
      try {
        const balanceResult = await getBalance(publicKey)
        setBalance(balanceResult)

        const transactionsResult = await getTransactions(publicKey)
        setTransactions(transactionsResult)
        setFilteredTransactions(transactionsResult)
      } catch (error) {
        showNotification({
          title: "Error",
          description: "Failed to fetch balance and transactions",
          type: "error",
        })
      }
    }
  }

  const handleFilterChange = (value) => {
    setFilter(value)
    if (value === "all") {
      setFilteredTransactions(transactions)
    } else {
      setFilteredTransactions(transactions.filter((tx) => tx.type === value))
    }
  }

  const handleSortChange = (value) => {
    setSortOrder(value)
    setFilteredTransactions(
      [...filteredTransactions].sort((a, b) => {
        return value === "asc" ? a.timestamp - b.timestamp : b.timestamp - a.timestamp
      }),
    )
  }

  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-white/80">Please connect your wallet to access the merchant dashboard.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Merchant Dashboard</h1>
        <p className="text-white/80">Balance: {balance.toFixed(2)} SOL</p>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="p-6 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
          <div className="flex justify-between mb-4">
            <Select onValueChange={handleFilterChange} defaultValue={filter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="receive">Received</SelectItem>
                <SelectItem value="send">Sent</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={handleSortChange} defaultValue={sortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-4">
            {filteredTransactions.map((tx) => (
              <div key={tx.signature} className="p-4 rounded border border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">
                      {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                    </p>
                    <p className="text-sm text-white/60">{new Date(tx.timestamp * 1000).toLocaleString()}</p>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        tx.type === "receive" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {tx.type === "receive" ? "Received" : "Sent"}
                    </span>
                    <p className="text-white font-medium mt-1">{tx.amount.toFixed(2)} SOL</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recurring" className="p-6 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Recurring Payments</h2>
          <RecurringPayments />
        </TabsContent>

        <TabsContent value="invoices" className="p-6 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Invoice Generator</h2>
          <InvoiceGenerator />
        </TabsContent>

        <TabsContent value="settings" className="p-6 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Payment Settings</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="merchantName">Merchant Name</Label>
              <Input id="merchantName" placeholder="Enter your business name" />
            </div>
            <div>
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select defaultValue="SOL">
                <SelectTrigger id="defaultCurrency">
                  <SelectValue placeholder="Select default currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="USDC">USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button>Save Settings</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MerchantDashboard

