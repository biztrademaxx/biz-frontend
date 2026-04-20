import Link from "next/link";

export const metadata = {
  title: "Contact Us | BizTradeFairs.com",
  description: "Get in touch with BizTradeFairs support and team.",
};

const Section = ({ title, children }: any) => (
  <section className="mb-12">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
    {children}
  </section>
);

const Card = ({ title, children }: any) => (
  <div className="border rounded-lg p-5 bg-white shadow-sm">
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    <div className="text-sm text-gray-600">{children}</div>
  </div>
);

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:py-16 space-y-12">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Contact Us
        </h1>
        <p className="text-gray-600 mt-3 font-medium">
          Let’s Connect & Grow Together
        </p>
        <p className="text-sm text-gray-500 mt-2 max-w-2xl mx-auto">
          Have questions, need support, or looking to partner with us?
          We’d love to hear from you.
        </p>
      </div>

      {/* Contact Info */}
      <Section title="Get in Touch">
        <div className="grid gap-6 md:grid-cols-3">
          <Card title="📩 Email Us">
            support@biztradefairs.com
          </Card>

          <Card title="📞 Call Us">
            +91 XXXXX XXXXX
          </Card>

          <Card title="📍 Office Address">
            BizTradeFairs.com <br />
            (Operated by Maxx Business Media Pvt. Ltd.) <br />
            Bengaluru, Karnataka, India
          </Card>
        </div>
      </Section>

      {/* Working Hours */}
      <Section title="Working Hours">
        <p className="text-gray-600">
          Monday – Saturday <br />
          10:00 AM – 6:00 PM (IST)
        </p>
      </Section>

      {/* Contact by Purpose */}
      <Section title="Contact by Purpose">
        <div className="grid gap-6 md:grid-cols-2">

          <Card title="📢 For Event Organizers">
            <ul className="space-y-1">
              <li>• Listing your event</li>
              <li>• Promotion & marketing</li>
              <li>• Exhibitor lead generation</li>
            </ul>
            <p className="mt-2 font-medium">
              Email: organizers@biztradefairs.com
            </p>
          </Card>

          <Card title="🏢 For Exhibitors & Sponsors">
            <ul className="space-y-1">
              <li>• Participation inquiries</li>
              <li>• Brand promotion</li>
              <li>• Featured listings</li>
            </ul>
            <p className="mt-2 font-medium">
              Email: sales@biztradefairs.com
            </p>
          </Card>

          <Card title="🎯 For Visitors & General Queries">
            <ul className="space-y-1">
              <li>• Finding events</li>
              <li>• Platform assistance</li>
              <li>• Account support</li>
            </ul>
            <p className="mt-2 font-medium">
              Email: support@biztradefairs.com
            </p>
          </Card>

          <Card title="🤝 Partnerships & Collaborations">
            <ul className="space-y-1">
              <li>• Media partnerships</li>
              <li>• Industry associations</li>
              <li>• Strategic collaborations</li>
            </ul>
            <p className="mt-2 font-medium">
              Email: partnerships@biztradefairs.com
            </p>
          </Card>

        </div>
      </Section>

      {/* Contact Form */}
      <Section title="Send Us a Message">
        <form className="grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Full Name"
            className="border rounded-md px-3 py-2 text-sm"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="border rounded-md px-3 py-2 text-sm"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="border rounded-md px-3 py-2 text-sm"
          />

          <select className="border rounded-md px-3 py-2 text-sm">
            <option>Inquiry Type</option>
            <option>Organizer</option>
            <option>Exhibitor</option>
            <option>Visitor</option>
            <option>Partnership</option>
          </select>

          <textarea
            placeholder="Your Message"
            rows={4}
            className="border rounded-md px-3 py-2 text-sm md:col-span-2"
          />

          <button className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 md:col-span-2">
            Submit Inquiry
          </button>
        </form>
      </Section>

      {/* Social */}
      <Section title="Follow Us">
        <div className="flex gap-4 flex-wrap text-blue-600">
          <Link href="#">LinkedIn</Link>
          <Link href="#">Instagram</Link>
          <Link href="#">Facebook</Link>
          <Link href="#">YouTube</Link>
        </div>
      </Section>

      {/* Footer Message */}
      <div className="bg-gray-100 p-6 rounded-lg text-center">
        <h3 className="font-semibold text-lg">We’re Here to Help</h3>
        <p className="text-gray-600 mt-2">
          Whether you're organizing an event or exploring opportunities,
          BizTradeFairs.com is your partner in success.
        </p>
        <p className="text-sm text-gray-500 mt-3">
          Let’s build connections that drive business forward.
        </p>
      </div>

    </main>
  );
}