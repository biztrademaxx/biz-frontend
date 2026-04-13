"use client"

export function FAQs() {
  const faqList = [
    { q: "How do I reset my password?", a: "Go to settings > account > reset password." },
    { q: "How can I contact support?", a: "Use the Contact tab under Help & Support." },
    { q: "Where can I see my past events?", a: "Check the Past Events section in your dashboard." },
  ]

  return (
    <div className="space-y-4">
        <p>Page Will Update Shortly</p>
      {/* <h2 className="text-lg font-semibold">Frequently Asked Questions</h2>
      <ul className="space-y-3">
        {faqList.map((faq, i) => (
          <li key={i} className="p-3 border rounded-lg bg-gray-50">
            <p className="font-medium">{faq.q}</p>
            <p className="text-sm text-gray-600">{faq.a}</p>
          </li>
        ))}
      </ul> */}
    </div>
  )
}
