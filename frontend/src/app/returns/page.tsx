import { Header } from "@/components/header"
import { Check } from "lucide-react"

export default function ReturnsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header />
      <main className="flex-1 px-6 py-8 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-[#333] dark:text-[#F0EDE8]">Returns & Exchanges</h1>
          <div className="w-12 h-0.5 bg-[#C5A028] mt-3" />
        </div>

        <div className="space-y-8 text-sm text-[#6B6B6B] dark:text-[#9C9C9C] leading-relaxed">
          <section>
            <h2 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8] mb-2">30-Day Return Policy</h2>
            <p>We want you to love your purchase. If you are not completely satisfied, you may return unworn items within 30 days of delivery for a full refund or exchange.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8] mb-2">Eligibility</h2>
            <ul className="space-y-2">
              {[
                "Items must be unworn, unwashed, and in original condition with all tags attached",
                "Original packaging must be included",
                "Sale items marked as final sale cannot be returned",
                "Custom or altered items are not eligible for return",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8] mb-2">How to Initiate a Return</h2>
            <ol className="space-y-2 list-decimal list-inside">
              <li>Email us at <a href="mailto:hello@viraasat.com" className="text-[#800020] dark:text-[#B8860B] hover:underline">hello@viraasat.com</a> with your order number</li>
              <li>Pack the item securely in its original packaging</li>
              <li>Ship the item to the address provided in our return confirmation email</li>
              <li>Refunds are processed within 5-7 business days after we receive the item</li>
            </ol>
          </section>

          <section>
            <h2 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8] mb-2">Shipping Costs</h2>
            <p>Return shipping is free for exchanges. For refunds, the return shipping cost will be deducted from your refund amount unless the item is defective or incorrect.</p>
          </section>

          <section>
            <h2 className="font-heading text-lg text-[#333] dark:text-[#F0EDE8] mb-2">Exchanges</h2>
            <p>We offer free exchanges for size or fit issues. Email us at <a href="mailto:hello@viraasat.com" className="text-[#800020] dark:text-[#B8860B] hover:underline">hello@viraasat.com</a> with your order number and desired size, and we will ship the replacement at no extra cost.</p>
          </section>

          <section className="border-t border-[#E5E0DB] dark:border-[#333] pt-6">
            <p className="text-xs text-[#9C9C9C]">For any questions, reach out to <a href="mailto:hello@viraasat.com" className="text-[#800020] dark:text-[#B8860B] hover:underline">hello@viraasat.com</a>. We are here to help!</p>
          </section>
        </div>
      </main>
    </div>
  )
}
