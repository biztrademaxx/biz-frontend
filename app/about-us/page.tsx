import Link from "next/link";

export const metadata = {
  title: "About Us | BizTradeFairs.com",
  description:
    "BizTradeFairs.com connects industries through global trade fairs, exhibitions, and B2B events.",
};

const Section = ({ title, children }: any) => (
  <section className="mb-14">
    <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
    <div className="text-gray-600 leading-relaxed space-y-3">
      {children}
    </div>
  </section>
);

const Card = ({ title, children }: any) => (
  <div className="border rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <div className="text-sm text-gray-600">{children}</div>
  </div>
);

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-16 space-y-12">

      {/* HERO */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          About BizTradeFairs.com
        </h1>
        <p className="mt-4 text-gray-600 leading-relaxed">
          BizTradeFairs.com is a dynamic global platform dedicated to connecting industries,
          businesses, and professionals through trade fairs, exhibitions, and B2B events.
          We simplify how the world discovers and benefits from business opportunities.
        </p>
        <p className="mt-3 text-gray-500 text-sm">
          Exhibitions today are more than events — they are ecosystems where innovation meets opportunity.
        </p>
      </div>

      {/* WHO WE ARE */}
      <Section title="Who We Are">
        <p>
          We are a team of exhibition professionals, digital strategists, and industry experts
          with deep-rooted experience across manufacturing, engineering, real estate, fitness,
          and industrial sectors.
        </p>

        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card title="Event Organizers">
            Maximize visibility, reach the right audience, and grow participation.
          </Card>

          <Card title="Exhibitors">
            Connect with qualified buyers and generate real business leads.
          </Card>

          <Card title="Visitors & Buyers">
            Discover relevant global events and industry opportunities.
          </Card>
        </div>
      </Section>

      {/* WHAT WE DO */}
      <Section title="What We Do">
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="🌍 Event Discovery">
            Explore exhibitions by industry, location, or organizer — all in one place.
          </Card>

          <Card title="📣 Event Promotion">
            Promote events with targeted reach and increased engagement.
          </Card>

          <Card title="🤝 Business Networking">
            Connect exhibitors, buyers, suppliers, and professionals seamlessly.
          </Card>

          <Card title="💻 Digital Presence">
            Showcase exhibitor profiles beyond physical events.
          </Card>

          <Card title="📊 Content & Insights">
            Stay ahead with industry news, interviews, and expert insights.
          </Card>
        </div>
      </Section>

      {/* VISION + MISSION */}
      <div className="grid gap-8 md:grid-cols-2">

        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Our Vision</h3>
          <p className="text-gray-600">
            To become the world’s most trusted digital ecosystem for trade fairs and
            business networking, enabling seamless industry connections.
          </p>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="font-semibold text-lg mb-2">Our Mission</h3>
          <ul className="text-gray-600 space-y-1 text-sm">
            <li>• Digitize trade fair discovery</li>
            <li>• Drive measurable business growth</li>
            <li>• Enable global B2B collaboration</li>
          </ul>
        </div>

      </div>

      {/* WHY CHOOSE */}
      <Section title="Why Choose BizTradeFairs.com">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="p-4 border rounded-lg text-sm">✔️ Industry-focused platform</div>
          <div className="p-4 border rounded-lg text-sm">✔️ Global reach with local relevance</div>
          <div className="p-4 border rounded-lg text-sm">✔️ Powerful promotion tools</div>
          <div className="p-4 border rounded-lg text-sm">✔️ Enhanced exhibitor visibility</div>
          <div className="p-4 border rounded-lg text-sm">✔️ Scalable & user-friendly</div>
        </div>
      </Section>

      {/* COMMITMENT */}
      <Section title="Our Commitment">
        <p>
          We are committed to shaping the future of exhibitions by combining traditional trade
          show strength with modern digital reach. Whether you are organizing, exhibiting,
          or exploring opportunities — BizTradeFairs.com is your trusted partner.
        </p>
      </Section>

      {/* CTA */}
      <div className="bg-blue-600 text-white rounded-xl p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Join the Ecosystem</h3>
        <p className="mb-4 text-blue-100">
          Be part of a growing global network where businesses connect and opportunities grow.
        </p>

        <p className="font-medium mb-4">
          Discover. Connect. Grow.
        </p>

        <Link
          href="/"
          className="inline-block bg-white text-blue-600 px-6 py-2 rounded-md font-medium hover:bg-gray-100"
        >
          Explore Events
        </Link>
      </div>

    </main>
  );
}