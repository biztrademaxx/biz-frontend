import { Button } from "@/components/ui/button";

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

export default function BecomeOrganizer() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-16 space-y-12">

      {/* HERO */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Become an Organizer on BizTradeFairs.com
        </h1>
        <p className="mt-3 text-gray-600 font-medium">
          Take Your Events Global. Grow Faster. Sell More.
        </p>
        <p className="mt-4 text-gray-600">
          Promote, manage, and scale your events across industries and geographies.
          Connect with exhibitors, buyers, and professionals worldwide.
        </p>
      </div>

      {/* BENEFITS */}
      <Section title="Why List Your Event With Us">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card title="🌍 Global Visibility">
            Showcase your event to a worldwide audience actively searching for trade fairs.
          </Card>
          <Card title="📣 Targeted Promotion">
            Reach the right industries, exhibitors, and decision-makers.
          </Card>
          <Card title="🤝 Lead Generation">
            Connect directly with exhibitors, sponsors, and visitors.
          </Card>
          <Card title="💻 Dedicated Event Page">
            Get a professional event profile with images and updates.
          </Card>
          <Card title="📊 Performance Insights">
            Track engagement, inquiries, and interest (premium feature).
          </Card>
        </div>
      </Section>

      {/* FEATURES */}
      <Section title="What You Can Do">
        <div className="grid gap-6 md:grid-cols-2">

          <Card title="Create & Manage Events">
            <ul className="space-y-1">
              <li>• Add event details, venue, dates</li>
              <li>• Upload images & brochures</li>
              <li>• Update anytime</li>
            </ul>
          </Card>

          <Card title="Attract Exhibitors & Sponsors">
            <ul className="space-y-1">
              <li>• Showcase opportunities</li>
              <li>• Highlight sponsorships</li>
              <li>• Receive inquiries</li>
            </ul>
          </Card>

          <Card title="Boost Event Reach">
            <ul className="space-y-1">
              <li>• Featured listings</li>
              <li>• Email & social promotion</li>
              <li>• Industry targeting</li>
            </ul>
          </Card>

          <Card title="Build Organizer Profile">
            <ul className="space-y-1">
              <li>• Show portfolio</li>
              <li>• Highlight past events</li>
              <li>• Build credibility</li>
            </ul>
          </Card>

        </div>
      </Section>

      {/* WHO CAN JOIN */}
      <Section title="Who Can Join">
        <ul className="grid gap-3 sm:grid-cols-2 text-sm">
          <li>✔️ Trade fair organizers</li>
          <li>✔️ Industry associations</li>
          <li>✔️ Conference organizers</li>
          <li>✔️ Event companies</li>
          <li>✔️ Independent curators</li>
        </ul>
      </Section>

      {/* HOW IT WORKS */}
      <Section title="How It Works">
        <div className="grid gap-6 md:grid-cols-4 text-center">

          <div className="p-4 border rounded-lg">
            <p className="font-semibold">1️⃣ Register</p>
            <p className="text-sm text-gray-600">Create your account</p>
          </div>

          <div className="p-4 border rounded-lg">
            <p className="font-semibold">2️⃣ List Event</p>
            <p className="text-sm text-gray-600">Add details & publish</p>
          </div>

          <div className="p-4 border rounded-lg">
            <p className="font-semibold">3️⃣ Promote</p>
            <p className="text-sm text-gray-600">Get inquiries</p>
          </div>

          <div className="p-4 border rounded-lg">
            <p className="font-semibold">4️⃣ Grow</p>
            <p className="text-sm text-gray-600">Scale participation</p>
          </div>

        </div>
      </Section>

      {/* PREMIUM */}
      <Section title="Featured Benefits (Premium)">
        <ul className="grid gap-3 sm:grid-cols-2 text-sm">
          <li>⭐ Homepage featured placement</li>
          <li>🎯 Category-based promotion</li>
          <li>📧 Email campaigns</li>
          <li>🎥 Video integration</li>
          <li>📈 Advanced analytics</li>
        </ul>
      </Section>

      {/* WHY US */}
      <Section title="Why BizTradeFairs.com Stands Out">
        <ul className="grid gap-3 sm:grid-cols-2 text-sm">
          <li>✔️ Industry-focused platform</li>
          <li>✔️ Built for trade fairs</li>
          <li>✔️ Real-world + digital impact</li>
          <li>✔️ Built by exhibition experts</li>
        </ul>
      </Section>

      {/* CTA */}
      <div className="bg-blue-600 text-white rounded-xl p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">
          Start Growing Your Event Today
        </h3>
        <p className="text-blue-100 mb-6">
          Step into a digital-first ecosystem that drives real results.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button className="bg-white text-blue-600 hover:bg-gray-100">
            List Your Event
          </Button>
          <Button variant="outline" className="border-white text-black hover:bg-white hover:text-blue-600">
            Create Organizer Account
          </Button>
        </div>
      </div>

      {/* SUPPORT */}
      <div className="text-center">
        <h3 className="font-semibold text-lg">Need Assistance?</h3>
        <p className="text-gray-600 mt-2">
          support@biztradefairs.com
        </p>
      </div>

      {/* FINAL CTA */}
      <div className="text-center">
        <p className="text-gray-600">
          Join the future of trade fairs and global business networking.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          BizTradeFairs.com — Powering Your Event Growth
        </p>
      </div>

    </main>
  );
}