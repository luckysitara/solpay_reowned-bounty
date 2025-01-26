import { Link } from "react-router-dom"

const Home = () => {
  const stats = [
    { label: "Total Volume", value: "$10M+" },
    { label: "Active Merchants", value: "1,000+" },
    { label: "Daily Transactions", value: "50k+" },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Web3's Leading Payment
          <span className="block text-primary">Gateway Platform</span>
        </h1>
        <p className="text-xl text-white/80 mb-8">
          Fast, secure, and decentralized payments for the future of commerce
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/merchant"
            className="px-8 py-3 bg-primary text-dark rounded-full font-semibold hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/support"
            className="px-8 py-3 bg-secondary text-white rounded-full font-semibold hover:bg-secondary/90 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-lg border border-white/10 backdrop-blur-sm">
            <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
            <div className="text-white/80">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Home

