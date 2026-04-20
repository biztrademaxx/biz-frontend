export const metadata = {
  title: "Refund Policy | BizTradeFairs.com",
  description: "Read the refund policy for BizTradeFairs platform.",
};

const Section = ({ title, children }: any) => (
  <section className="bg-white border rounded-xl p-6 shadow-sm space-y-3">
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    <div className="text-sm text-gray-600 leading-relaxed space-y-3">
      {children}
    </div>
  </section>
);

export default function RefundPolicy() {
  return (
    <main className="bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-10">

        {/* HERO */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Refund Policy
          </h1>
          <p className="text-sm text-gray-500">Effective Date: (Add Date)</p>
          <p className="text-gray-600">
            At BizTradeFairs.com, we are committed to providing high-quality digital services to 
            event organizers, exhibitors, and users. Please read our refund policy carefully 
            before making any payments on the platform.
          </p>
        </div>

        {/* ALERT */}
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          ⚠️ All payments made on BizTradeFairs.com are final and non-refundable.
        </div>

        {/* SECTION 1 */}
        <Section title="1. No Refund Policy">
          <p>
            All payments made on BizTradeFairs.com are final and non-refundable.
          </p>
          <p>
            Once a payment is successfully processed for any service, including but not limited to:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Event listing fees</li>
            <li>Featured listings</li>
            <li>Promotional packages</li>
            <li>Advertising services</li>
            <li>Any other paid offerings</li>
          </ul>
          <p>
            No refunds, cancellations, or chargebacks will be entertained under any circumstances.
          </p>
        </Section>

        {/* SECTION 2 */}
        <Section title="2. Additional Services (Non-Refundable)">
          <p>
            Any additional services purchased are also strictly non-refundable, including:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Stall-related add-ons (if applicable)</li>
            <li>Furniture, electrical, or branding requirements</li>
            <li>Digital promotions and marketing services</li>
            <li>Custom packages or upgrades</li>
          </ul>
          <p>
            Once these services are confirmed and processed, they cannot be canceled or refunded.
          </p>
        </Section>

        {/* SECTION 3 */}
        <Section title="3. Payment Errors">
          <p>In case of duplicate payments or technical errors:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Users must notify us within 48 hours of the transaction</li>
            <li>
              After verification, the excess amount (if applicable) may be reviewed for adjustment 
              or refund at our sole discretion
            </li>
          </ul>
        </Section>

        {/* SECTION 4 */}
        <Section title="4. Service Delivery">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              BizTradeFairs.com provides digital services such as event listings, promotions, 
              and visibility tools
            </li>
            <li>
              Once the service is activated or delivered, it is considered consumed and non-reversible
            </li>
          </ul>
        </Section>

        {/* SECTION 5 */}
        <Section title="5. Organizer & Third-Party Responsibility">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              BizTradeFairs.com acts as a platform connecting organizers, exhibitors, and visitors
            </li>
            <li>
              We are not responsible for cancellations, postponements, or changes made by event organizers
            </li>
            <li>
              Any disputes regarding event participation, bookings, or services must be resolved directly 
              with the respective organizer
            </li>
          </ul>
        </Section>

        {/* SECTION 6 */}
        <Section title="6. Exceptional Cases">
          <p>
            Refunds, if any, will be considered only under exceptional circumstances and solely at the 
            discretion of BizTradeFairs.com management. Approval is not guaranteed.
          </p>
        </Section>

        {/* SECTION 7 */}
        <Section title="7. Contact for Payment Issues">
          <p>For any billing-related queries, please contact:</p>

          <div className="grid gap-4 md:grid-cols-2 mt-2">
            <div className="border rounded-lg p-4">
              <p className="font-medium">📩 Email</p>
              <p className="text-sm text-gray-600">accounts@biztradefairs.com</p>
            </div>

            <div className="border rounded-lg p-4">
              <p className="font-medium">📞 Phone</p>
              <p className="text-sm text-gray-600">+91 XXXXX XXXXX</p>
            </div>
          </div>
        </Section>

        {/* SECTION 8 */}
        <Section title="8. Policy Acceptance">
          <p>
            By making a payment on BizTradeFairs.com, you acknowledge that you have read, 
            understood, and agreed to this Refund Policy.
          </p>
        </Section>

        {/* IMPORTANT NOTE */}
        <div className="bg-gray-100 border rounded-xl p-5 text-sm text-gray-700">
          <strong>Important Note:</strong> We strongly encourage all users to review 
          service details carefully before making any payments.
        </div>

      </div>
    </main>
  );
}