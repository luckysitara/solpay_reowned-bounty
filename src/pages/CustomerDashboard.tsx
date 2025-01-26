import { useWallet } from "@solana/wallet-adapter-react"
import { useAppKit } from "@solana/app-kit"
import { useState, useEffect } from "react"

const CustomerDashboard = () => {
  const { connected, publicKey } = useWallet()
  const { getTokenAccounts, getTransactions } = useAppKit()
  const [tokenAccounts, setTokenAccounts] = useState([])
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    if (publicKey) {
      fetchTokenAccountsAndTransactions()
    }
  }, [publicKey])

  const fetchTokenAccountsAndTransactions = async () => {
    if (publicKey) {
      try {
        const accounts = await getTokenAccounts(publicKey)
        setTokenAccounts(accounts)

        const txs = await getTransactions(publicKey)
        setTransactions(txs)
      } catch (error) {
        console.error("Error fetching data:", error)
      }
    }
  }

  if (!connected) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-white/80">Please connect your wallet to view your transactions.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-bold text-white mb-8">Customer Dashboard</h1>

      <div className="mb-8">
        <img
          src="https://images.unsplash.com/photo-1633158829799-96bb13cab779?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
          alt="Customer wallet visualization"
          className="w-full h-48 object-cover rounded-lg shadow-lg"
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="p-6 rounded-lg border border-white/10 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Wallet Information</h2>
          <p className="text-white/80">
            Connected Address: <span className="text-primary">{publicKey?.toString()}</span>
          </p>
        </div>

        <div className="p-6 rounded-lg border border-white/10 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Token Accounts</h2>
          {tokenAccounts.length > 0 ? (
            <ul className="space-y-2">
              {tokenAccounts.map((account, index) => (
                <li key={index} className="text-white/80">
                  {account.mint}: {account.balance}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/80">No token accounts found.</p>
          )}
        </div>

        <div className="p-6 rounded-lg border border-white/10 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
          {transactions.length > 0 ? (
            <ul className="space-y-2">
              {transactions.map((tx, index) => (
                <li key={index} className="text-white/80">
                  {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)} -{" "}
                  {new Date(tx.blockTime * 1000).toLocaleString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/80">No transactions found.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard

