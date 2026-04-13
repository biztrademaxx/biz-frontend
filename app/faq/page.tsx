import Link from "next/link";

export const metadata = {
  title: "FAQ | Biz Trade Fairs",
  description: "Frequently asked questions about Biz Trade Fairs.",
};

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Frequently asked questions</h1>
      <p className="mb-8 text-gray-600">
        We are expanding this section. For help with your account, events, or venues, please{" "}
        <Link href="/login" className="text-blue-700 underline hover:text-blue-900">
          sign in
        </Link>{" "}
        or contact us through the site.
      </p>
      <p className="text-sm text-gray-500">
        <Link href="/" className="text-blue-700 underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
