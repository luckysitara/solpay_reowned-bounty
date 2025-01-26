import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import { NotificationProvider } from "./contexts/NotificationContext"
import Navbar from "./components/Navbar"
import LandingPage from "./pages/LandingPage"
import MerchantDashboard from "./pages/MerchantDashboard"
import CustomerDashboard from "./pages/CustomerDashboard"
import TokenSwap from "./pages/TokenSwap"
import MobileApp from "./pages/MobileApp"
import Support from "./pages/Support"

function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-solana-purple via-jupiter-purple to-solana-blue">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/merchant" element={<MerchantDashboard />} />
            <Route path="/customer" element={<CustomerDashboard />} />
            <Route path="/swap" element={<TokenSwap />} />
            <Route path="/mobile" element={<MobileApp />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </div>
      </Router>
    </NotificationProvider>
  )
}

export default App

