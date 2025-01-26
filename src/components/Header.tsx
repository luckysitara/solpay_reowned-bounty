import { useWallet } from "@solana/wallet-adapter-react"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { Link } from "react-router-dom"

const Header = () => {
  const { connected } = useWallet()

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          SolPay
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/merchant">Merchant</Link>
            </li>
            <li>
              <Link to="/customer">Customer</Link>
            </li>
            <li>
              <Link to="/support">Support</Link>
            </li>
          </ul>
        </nav>
        <WalletMultiButton />
      </div>
    </header>
  )
}

export default Header

