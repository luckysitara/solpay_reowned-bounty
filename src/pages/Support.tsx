const Support = () => {
  const faqs = [
    {
      question: "How do I connect my wallet?",
      answer:
        "Click the 'Connect Wallet' button in the top right corner and select your preferred wallet (Phantom or Solflare).",
    },
    {
      question: "How do I make a payment?",
      answer:
        "Scan the QR code provided by the merchant using your mobile wallet app, or click the payment link to automatically open your wallet.",
    },
    {
      question: "What are the fees?",
      answer: "SolPay charges a minimal 0.5% fee on all transactions. Network fees apply separately.",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-3xl font-bold text-white mb-8">Support Center</h1>

      <div className="grid grid-cols-1 gap-8">
        <div className="p-6 rounded-lg border border-white/10 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-white/10 last:border-0 pb-4 last:pb-0">
                <h3 className="text-lg font-medium text-primary mb-2">{faq.question}</h3>
                <p className="text-white/80">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-lg border border-white/10 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
          <p className="text-white/80 mb-4">
            Need more help? Send us a message and we'll get back to you as soon as possible.
          </p>
          <a
            href="mailto:support@solpay.com"
            className="inline-block px-6 py-3 bg-primary text-dark rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}

export default Support

