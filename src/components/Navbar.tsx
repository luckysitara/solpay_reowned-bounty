import { Link } from "react-router-dom"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useWallet } from "@solana/wallet-adapter-react"

const Navbar = () => {
  const { connected } = useWallet()

  return (
    <nav className="border-b border-white/10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">SolPay</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/merchant" className="text-white hover:text-primary transition-colors">
              Merchant
            </Link>
            <Link to="/customer" className="text-white hover:text-primary transition-colors">
              Customer
            </Link>
            <Link to="/swap" className="text-white hover:text-primary transition-colors">
              Swap
            </Link>
            <Link to="/mobile" className="text-white hover:text-primary transition-colors">
              Mobile
            </Link>
            <Link to="/support" className="text-white hover:text-primary transition-colors">
              Support
            </Link>
            <WalletMultiButton className="!bg-primary !text-dark hover:!bg-primary/90" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

