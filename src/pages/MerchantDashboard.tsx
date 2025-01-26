import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useConnection } from "@solana/wallet-adapter-react"
import { useAppKit } from "@solana/app-kit"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RecurringPayments } from "../components/RecurringPayments"
import { InvoiceGenerator } from "../components/InvoiceGenerator"
import { useNotification } from "../contexts/NotificationContext"
import { createTransaction, signAndConfirmTransaction } from "../utils/solanaPay"
import { PublicKey } from "@solana/web3.js"
import QRCode from "qrcode.react"
import { TokenManagement } from "../components/TokenManagement"
import TokenSwap from "./TokenSwap"
import { Settings } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { TOKENS, getTokenPublicKey } from "../config/constants"

const MerchantDashboard = () => {
  const { connected, publicKey } = useWallet()
  const { connection } = useConnection()
  const { showNotification } = useNotification()
  const { getBalance, getTransactions, getTokenAccounts, transferSol } = useAppKit()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [filter, setFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")
  const [amount, setAmount] = useState("")
  const [recipient, setRecipient] = useState("")
  const [token, setToken] = useState("SOL")
  const [qrValue, setQrValue] = useState("")

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

  const handleCreatePayment = async () => {
    if (!publicKey || !amount || !recipient) return

    try {
      const recipientPubkey = new PublicKey(recipient)
      const amountValue = Number.parseFloat(amount)

      let signature

      if (token === "SOL") {
        signature = await transferSol(recipientPubkey, amountValue)
      } else {
        const tokenPublicKey = getTokenPublicKey(token)
        const transaction = await createTransaction(
          connection,
          publicKey,
          recipientPubkey,
          amountValue,
          tokenPublicKey,
          undefined,
          `Payment from ${publicKey.toBase58()}`,
        )
        signature = await signAndConfirmTransaction(connection, transaction, publicKey)
      }

      showNotification({
        title: "Payment Successful",
        description: `Transaction signature: ${signature}`,
        type: "success",
      })

      // Refresh balance and transactions
      fetchBalanceAndTransactions()
    } catch (error) {
      showNotification({
        title: "Payment Failed",
        description: error.message,
        type: "error",
      })
    }
  }

  const generateQRCode = () => {
    if (!amount || !publicKey) return
    const paymentUrl = `solana:${publicKey.toString()}?amount=${amount}&token=${token}`
    setQrValue(paymentUrl)
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

      <div className="mb-8">
        <img
          src="https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
          alt="Merchant dashboard visualization"
          className="w-full h-48 object-cover rounded-lg shadow-lg"
        />
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="recurring">Recurring</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="createPayment">Create Payment</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
          <TabsTrigger value="swap">Swap</TabsTrigger>
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
                        tx.type === "receive"
                          ? "bg-solana-green/20 text-solana-green"
                          : "bg-solana-magenta/20 text-solana-magenta"
                      }`}
                    >
                      {tx.type === "receive" ? "Received" : "Sent"}
                    </span>
                    <p className="text-white font-medium mt-1">
                      {tx.amount.toFixed(2)} {tx.token}
                    </p>
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

        <TabsContent value="createPayment" className="p-6 rounded-lg border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-4">Create Payment</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter recipient's Solana address"
              />
            </div>
            <div>
              <Label htmlFor="token">Token</Label>
              <Select value={token} onValueChange={setToken}>
                <SelectTrigger id="token">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {TOKENS.map((t) => (
                    <SelectItem key={t.symbol} value={t.symbol}>
                      {t.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreatePayment} className="bg-jupiter-purple hover:bg-jupiter-blue text-white">
              Create Payment
            </Button>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Generate Payment QR Code</h3>
            <Button onClick={generateQRCode} className="bg-jupiter-purple hover:bg-jupiter-blue text-white">
              Generate QR Code
            </Button>
            {qrValue && (
              <div className="mt-4 bg-white p-4 rounded-lg inline-block">
                <QRCode value={qrValue} size={200} />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="p-6 rounded-lg border border-white/10">
          <TokenManagement />
        </TabsContent>

        <TabsContent value="swap" className="p-6 rounded-lg border border-white/10">
          <TokenSwap />
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
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="automaticPayouts" />
              <Label htmlFor="automaticPayouts">Enable Automatic Payouts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="emailNotifications" />
              <Label htmlFor="emailNotifications">Email Notifications</Label>
            </div>
            <Button className="bg-jupiter-purple hover:bg-jupiter-blue text-white">
              <Settings className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MerchantDashboard

