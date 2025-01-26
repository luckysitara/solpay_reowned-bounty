import { useWallet } from "@solana/wallet-adapter-react"

const CustomerDashboard = () => {
  const { connected, publicKey } = useWallet()

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

      <div className="grid grid-cols-1 gap-8">
        <div className="p-6 rounded-lg border border-white/10 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Wallet Information</h2>
          <p className="text-white/80">
            Connected Address: <span className="text-primary">{publicKey?.toString()}</span>
          </p>
        </div>

        <div className="p-6 rounded-lg border border-white/10 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Transactions</h2>
          <div className="text-white/80">
            <p>No transactions yet.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard

