import Link from "next/link";

export const metadata = {
  title: "Careers | BizTradeFairs.com",
  description: "Join BizTradeFairs and build the future of global trade networking.",
};

const Section = ({ title, children }: any) => (
  <section className="mb-14">
    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
    <div className="text-gray-600 space-y-3">{children}</div>
  </section>
);

const Card = ({ title, children }: any) => (
  <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <div className="text-sm text-gray-600">{children}</div>
  </div>
);

export default function CareersPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-16 space-y-12">

      {/* HERO */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Careers at BizTradeFairs.com
        </h1>
        <p className="mt-3 text-gray-600 font-medium">
          Build the Future of Global Trade Networking
        </p>
        <p className="mt-4 text-gray-600">
          We’re not just building a platform — we’re creating a global ecosystem
          that connects industries, businesses, and opportunities.
        </p>
      </div>

      {/* WHY JOIN */}
      <Section title="Why Join Us">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card title="🚀 Fast-Growing Platform">
            Be part of a rapidly expanding digital marketplace for trade fairs.
          </Card>
          <Card title="🌍 Global Exposure">
            Work with international organizers and industries.
          </Card>
          <Card title="💡 Innovation Culture">
            We encourage fresh ideas and ownership.
          </Card>
          <Card title="🤝 Collaborative Environment">
            Work with industry professionals and experts.
          </Card>
          <Card title="📈 Growth Opportunities">
            Continuous learning and career growth.
          </Card>
        </div>
      </Section>

      {/* WHO WE ARE LOOKING FOR */}
      <Section title="Who We’re Looking For">
        <p>
          We’re building a diverse and driven team. If you’re proactive,
          entrepreneurial, and ready to take ownership, we want to hear from you.
        </p>
      </Section>

      {/* OPENINGS */}
      <Section title="Current Openings">
        <div className="grid gap-6 md:grid-cols-2">

          <Card title="📢 Business Development Executive">
            <ul className="space-y-1">
              <li>• Onboard event organizers</li>
              <li>• Generate exhibitor leads</li>
              <li>• Build industry relationships</li>
            </ul>
          </Card>

          <Card title="💻 Digital Marketing Specialist">
            <ul className="space-y-1">
              <li>• Execute campaigns</li>
              <li>• Manage SEO & ads</li>
              <li>• Drive traffic</li>
            </ul>
          </Card>

          <Card title="👨‍💻 Web Developer / Product Engineer">
            <ul className="space-y-1">
              <li>• Build platform features</li>
              <li>• Improve UI/UX</li>
              <li>• Scale dashboards</li>
            </ul>
          </Card>

          <Card title="📝 Content & Media Executive">
            <ul className="space-y-1">
              <li>• Create blogs & videos</li>
              <li>• Cover events</li>
              <li>• Manage content strategy</li>
            </ul>
          </Card>

          <Card title="🎯 Operations & Event Coordinator">
            <ul className="space-y-1">
              <li>• Coordinate with organizers</li>
              <li>• Support onboarding</li>
              <li>• Ensure smooth operations</li>
            </ul>
          </Card>

        </div>
      </Section>

      {/* LIFE */}
      <Section title="Life at BizTradeFairs.com">
        <ul className="grid gap-3 sm:grid-cols-2 text-sm">
          <li>✔️ Open and transparent culture</li>
          <li>✔️ Performance-driven growth</li>
          <li>✔️ Real-world exposure</li>
          <li>✔️ Work on live events</li>
          <li>✔️ Flexible environment</li>
        </ul>
      </Section>

      {/* VALUES */}
      <Section title="Our Values">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">Integrity — We build trust</div>
          <div className="p-4 border rounded-lg">Innovation — We embrace change</div>
          <div className="p-4 border rounded-lg">Customer Success — Your growth matters</div>
          <div className="p-4 border rounded-lg">Ownership — We deliver results</div>
        </div>
      </Section>

      {/* APPLY */}
      <div className="bg-blue-600 text-white rounded-xl p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">How to Apply</h3>
        <p className="mb-4 text-blue-100">
          Send your resume and portfolio to:
        </p>
        <p className="font-medium mb-4">careers@biztradefairs.com</p>
        <p className="text-sm text-blue-100 mb-4">
          Subject: Application for [Job Role]
        </p>

        <Link
          href="/"
          className="inline-block bg-white text-blue-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100"
        >
          Explore Platform
        </Link>
      </div>

      {/* FOOTER CTA */}
      <div className="text-center">
        <p className="text-gray-600">
          Let’s build something big together.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Be a part of BizTradeFairs.com — where opportunities meet innovation.
        </p>
      </div>

    </main>
  );
}