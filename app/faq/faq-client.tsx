"use client";

import { useState } from "react";
import Link from "next/link";

type FAQItem = {
  question: string;
  answer: string;
};

function Accordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div
          key={index}
          className="border rounded-lg bg-white shadow-sm overflow-hidden"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex justify-between items-center px-4 py-3 text-left font-medium"
          >
            {item.question}
            <span className="text-xl">
              {openIndex === index ? "−" : "+"}
            </span>
          </button>

          {openIndex === index && (
            <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FaqClient() {
  return (
    <main className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-12">

        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">
            Help & Support
          </h1>
          <p className="text-gray-600 mt-3">
            We’re here to help you succeed on BizTradeFairs.com
          </p>
        </div>

        {/* QUICK HELP */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-2">👤 Visitors & Buyers</h3>
            <p className="text-sm text-gray-600">
              Discover events, explore industries, and connect with exhibitors.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-2">🏢 Exhibitors</h3>
            <p className="text-sm text-gray-600">
              Showcase your brand and connect with event organizers.
            </p>
          </div>

          <div className="border rounded-lg p-4 bg-white">
            <h3 className="font-semibold mb-2">📢 Organizers</h3>
            <p className="text-sm text-gray-600">
              List events, promote, and generate leads.
            </p>
          </div>
        </div>

        {/* GENERAL */}
        <section>
          <h2 className="text-xl font-semibold mb-4">General Questions</h2>
          <Accordion
            items={[
              {
                question: "1. What is BizTradeFairs.com?",
                answer:
                  "BizTradeFairs.com is a global platform that helps users discover, promote, and participate in trade fairs, exhibitions, and B2B events.",
              },
              {
                question: "2. Is it free to use the platform?",
                answer:
                  "Yes, browsing events is free. Organizers can list events with basic features, while premium options are available.",
              },
              {
                question: "3. Who can use BizTradeFairs.com?",
                answer:
                  "Event organizers, exhibitors, industry professionals, and visitors.",
              },
            ]}
          />
        </section>

        {/* ORGANIZERS */}
        <section>
          <h2 className="text-xl font-semibold mb-4">For Event Organizers</h2>
          <Accordion
            items={[
              {
                question: "4. How do I list my event?",
                answer:
                  "Register as an organizer, create your profile, and add event details.",
              },
              {
                question: "5. How can I promote my event?",
                answer:
                  "Use featured listings, targeted campaigns, and digital marketing support.",
              },
              {
                question: "6. Can I edit my event after publishing?",
                answer:
                  "Yes, you can update event details anytime via dashboard.",
              },
              {
                question: "7. How do I get exhibitor leads?",
                answer:
                  "Exhibitors can contact you directly through your event page.",
              },
            ]}
          />
        </section>

        {/* EXHIBITORS */}
        <section>
          <h2 className="text-xl font-semibold mb-4">For Exhibitors</h2>
          <Accordion
            items={[
              {
                question: "8. How can I participate in an event?",
                answer:
                  "Browse events and contact organizers directly.",
              },
              {
                question: "9. Can I promote my company on the platform?",
                answer:
                  "Yes, exhibitors can create profiles and showcase products.",
              },
            ]}
          />
        </section>

        {/* VISITORS */}
        <section>
          <h2 className="text-xl font-semibold mb-4">For Visitors</h2>
          <Accordion
            items={[
              {
                question: "10. How do I find relevant events?",
                answer:
                  "Use filters like industry, location, and category.",
              },
              {
                question: "11. Do I need to register?",
                answer:
                  "Depends on the organizer. Check event page.",
              },
            ]}
          />
        </section>

        {/* TECH */}
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Technical & Account Support
          </h2>
          <Accordion
            items={[
              {
                question: "12. I forgot my password. What should I do?",
                answer:
                  "Use the 'Forgot Password' option on login page.",
              },
              {
                question: "13. I am facing issues with my account.",
                answer:
                  "Contact support with issue details.",
              },
              {
                question: "14. How do I delete my account?",
                answer:
                  "Request deletion via support email.",
              },
            ]}
          />
        </section>

        {/* CONTACT */}
        <div className="bg-white border rounded-xl p-6 text-center">
          <h3 className="font-semibold text-lg">Still Need Help?</h3>
          <p className="text-gray-600 mt-2">
            support@biztradefairs.com
          </p>
        </div>

        {/* BACK */}
        <p className="text-center text-sm">
          <Link href="/" className="text-blue-600 underline">
            Back to Home
          </Link>
        </p>

      </div>
    </main>
  );
}