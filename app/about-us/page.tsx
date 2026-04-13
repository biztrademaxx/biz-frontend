import Link from "next/link";

export const metadata = {
  title: "About Us | Biz Trade Fairs",
  description: "About Biz Trade Fairs — discover trade fairs worldwide.",
};

export default function AboutUsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">About Biz Trade Fairs</h1>
      <p className="mb-4 text-gray-600 leading-relaxed">
        Biz Trade Fairs helps you discover global trade fairs, connect with opportunities, and grow
        your business network.
      </p>
      <p className="text-sm text-gray-500">
        <Link href="/" className="text-blue-700 underline">
          Back to home
        </Link>
      </p>
    </main>
  );
}
