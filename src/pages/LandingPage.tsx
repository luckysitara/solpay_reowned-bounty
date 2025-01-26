import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Zap, Shield, Repeat, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"
import { useAppKit } from "@solana/app-kit"

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false)
  const { getTokenAccounts } = useAppKit()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-solana-purple via-jupiter-purple to-solana-blue text-white">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl font-bold">SolPay</h1>
          </motion.div>
          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ duration: 0.5, delay: 0.2 }}>
            <WalletMultiButton className="!bg-white !text-solana-purple hover:!bg-opacity-90 transition-all duration-200" />
          </motion.div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            The Future of <span className="text-jupiter-blue">Decentralized Payments</span>
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            SolPay revolutionizes transactions on Solana. Fast, secure, and effortless payments for the Web3 era.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-solana-purple hover:bg-opacity-90">
              Get Started <ArrowRight className="ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-solana-purple"
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="relative mb-16"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <img
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80"
            alt="Solana blockchain visualization"
            className="w-full h-64 object-cover rounded-lg shadow-lg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <p className="text-2xl font-bold text-white">Powered by Solana AppKit</p>
          </div>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {[
            { icon: Zap, title: "Lightning Fast", description: "Process transactions in seconds" },
            { icon: Shield, title: "Secure", description: "Built on Solana's robust blockchain" },
            { icon: Repeat, title: "Recurring Payments", description: "Set up automatic transactions" },
            { icon: Coins, title: "Multi-Token", description: "Support for various SPL tokens" },
          ].map((feature, index) => (
            <div key={index} className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-lg">
              <feature.icon className="w-12 h-12 mb-4 text-jupiter-blue" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white text-opacity-80">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="bg-white bg-opacity-10 rounded-lg p-8 backdrop-blur-lg"
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeIn}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold mb-4">Join the SolPay Community</h3>
          <p className="mb-6">Stay updated with the latest features and announcements.</p>
          <div className="flex gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white bg-opacity-20 border-none text-white placeholder-white placeholder-opacity-60"
            />
            <Button className="bg-jupiter-blue hover:bg-opacity-90">Subscribe</Button>
          </div>
        </motion.div>
      </main>

      <footer className="container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2023 SolPay. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-jupiter-blue transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-jupiter-blue transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-jupiter-blue transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

