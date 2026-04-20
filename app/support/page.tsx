import Link from "next/link";

export const metadata = {
  title: "Support Center | BizTradeFairs.com",
  description: "Get help, guides, and support for BizTradeFairs platform.",
};

const Section = ({ title, children }: any) => (
  <section className="mb-12">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
    {children}
  </section>
);

const Card = ({ title, items }: any) => (
  <div className="border rounded-lg p-5 bg-white shadow-sm">
    <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
    <ul className="space-y-2 text-sm text-gray-600">
      {items.map((item: string, i: number) => (
        <li key={i}>• {item}</li>
      ))}
    </ul>
  </div>
);

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Support Center
        </h1>
        <p className="text-gray-600 mt-3">
          How can we help you today?
        </p>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
          Welcome to BizTradeFairs.com Support Center — your one-stop destination for help,
          guidance, and resources to grow your business through events.
        </p>
      </div>

      {/* Search */}
      <div className="mb-12">
        <input
          type="text"
          placeholder="Search for help, topics, or questions…"
          className="w-full rounded-md border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {/* Categories */}
      <Section title="Browse by Category">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card
            title="📢 For Event Organizers"
            items={[
              "How to register as an organizer",
              "How to list an event",
              "Editing and updating event details",
              "Promotion & featured listings",
              "Managing exhibitor inquiries",
            ]}
          />

          <Card
            title="🏢 For Exhibitors"
            items={[
              "How to find relevant events",
              "Contacting event organizers",
              "Creating exhibitor profile",
              "Promoting products/services",
            ]}
          />

          <Card
            title="🎯 For Visitors & Buyers"
            items={[
              "How to search for events",
              "Filter by industry & location",
              "Event registration process",
              "Save and track events",
            ]}
          />

          <Card
            title="⚙️ Account & Technical"
            items={[
              "Account registration & login",
              "Password reset",
              "Profile management",
              "Troubleshooting issues",
            ]}
          />

          <Card
            title="💳 Plans & Payments"
            items={[
              "Free vs Premium plans",
              "Featured listings benefits",
              "Payment methods",
              "Refund policy",
            ]}
          />
        </div>
      </Section>

      {/* Popular Articles */}
      <Section title="Popular Help Articles">
        <ul className="space-y-2 text-gray-600">
          <li>• How to list your first event</li>
          <li>• How to generate exhibitor leads</li>
          <li>• How to promote your event</li>
          <li>• How to upgrade to featured listing</li>
          <li>• How to contact organizers</li>
        </ul>
      </Section>

      {/* Guides */}
      <Section title="Guides & Tutorials (Coming Soon)">
        <ul className="space-y-2 text-gray-600">
          <li>• Step-by-step video guides</li>
          <li>• Platform walkthroughs</li>
          <li>• Marketing tips</li>
          <li>• Exhibitor strategies</li>
        </ul>
      </Section>

      {/* Contact */}
      <Section title="Need More Help?">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="border rounded-lg p-5 text-center">
            <p className="font-semibold">📩 Email Support</p>
            <p className="text-sm text-gray-600 mt-2">
              support@biztradefairs.com
            </p>
          </div>

          <div className="border rounded-lg p-5 text-center">
            <p className="font-semibold">📞 Call Support</p>
            <p className="text-sm text-gray-600 mt-2">
              +91 XXXXX XXXXX
            </p>
          </div>

          <div className="border rounded-lg p-5 text-center">
            <p className="font-semibold">🕒 Support Hours</p>
            <p className="text-sm text-gray-600 mt-2">
              Mon – Sat | 10:00 AM – 6:00 PM
            </p>
          </div>
        </div>
      </Section>

      {/* Quick Actions */}
      <Section title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">
            List Your Event
          </Link>
          <Link href="/" className="btn-primary">
            Become Organizer
          </Link>
          <Link href="/" className="btn-primary">
            Browse Events
          </Link>
          <Link href="/contact" className="btn-primary">
            Contact Support
          </Link>
        </div>
      </Section>

      {/* Promise */}
      <div className="mt-12 bg-gray-100 rounded-lg p-6 text-center">
        <h3 className="font-semibold text-lg">Our Promise</h3>
        <p className="text-gray-600 mt-2">
          We provide fast, reliable, and business-focused support to help you succeed.
        </p>
        <p className="text-sm text-gray-500 mt-3">
          Grow with confidence — your success is our priority.
        </p>
      </div>
    </main>
  );
}