import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets"
import { ConnectionProvider } from "@solana/wallet-adapter-react"
import { AppKitProvider } from "@solana/app-kit"
import { useMemo, useState } from "react"
import { Toaster } from "@/components/ui/toaster"

import { NotificationProvider } from "./contexts/NotificationContext"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import MerchantDashboard from "./pages/MerchantDashboard"
import CustomerDashboard from "./pages/CustomerDashboard"
import Support from "./pages/Support"
import TokenSwap from "./pages/TokenSwap"
import MobileApp from "./pages/MobileApp"

const endpoint = "https://api.mainnet-beta.solana.com"

function App() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  useMemo(() => {
    const initializeApp = async () => {
      try {
        // Simulate app initialization
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setLoading(false)
      } catch (err) {
        setError(err)
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">Error: {error.message}</div>
  }

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppKitProvider>
            <NotificationProvider>
              <Router>
                <div className="min-h-screen bg-gradient-main from-background-start to-background-end">
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/merchant" element={<MerchantDashboard />} />
                    <Route path="/customer" element={<CustomerDashboard />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/swap" element={<TokenSwap />} />
                    <Route path="/mobile" element={<MobileApp />} />
                  </Routes>
                </div>
                <Toaster />
              </Router>
            </NotificationProvider>
          </AppKitProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App

