"use client";

import { FormEvent, useState } from "react";

const INQUIRY_OPTIONS = [
  { value: "", label: "Inquiry Type" },
  { value: "Organizer", label: "Organizer" },
  { value: "Exhibitor", label: "Exhibitor" },
  { value: "Visitor", label: "Visitor" },
  { value: "Partnership", label: "Partnership" },
] as const;

export function ContactInquiryForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessNote(null);
    setWarning(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone: phone.trim() || undefined,
          inquiryType,
          message: messageBody,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        warning?: string;
      };
      if (!res.ok || !data.success) {
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.");
        return;
      }
      setSuccessNote("Thank you — we received your message.");
      if (typeof data.warning === "string" && data.warning) {
        setWarning(data.warning);
      }
      setFullName("");
      setEmail("");
      setPhone("");
      setInquiryType("");
      setMessageBody("");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
      <input
        type="text"
        name="fullName"
        autoComplete="name"
        required
        maxLength={200}
        placeholder="Full Name"
        className="border rounded-md px-3 py-2 text-sm"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        disabled={submitting}
      />
      <input
        type="email"
        name="email"
        autoComplete="email"
        required
        placeholder="Email Address"
        className="border rounded-md px-3 py-2 text-sm"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={submitting}
      />
      <input
        type="tel"
        name="phone"
        autoComplete="tel"
        placeholder="Phone Number"
        className="border rounded-md px-3 py-2 text-sm"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        disabled={submitting}
      />

      <select
        name="inquiryType"
        required
        className="border rounded-md px-3 py-2 text-sm"
        value={inquiryType}
        onChange={(e) => setInquiryType(e.target.value)}
        disabled={submitting}
      >
        {INQUIRY_OPTIONS.map((o) => (
          <option key={o.value || "placeholder"} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <textarea
        name="message"
        required
        maxLength={20000}
        placeholder="Your Message"
        rows={4}
        className="border rounded-md px-3 py-2 text-sm md:col-span-2"
        value={messageBody}
        onChange={(e) => setMessageBody(e.target.value)}
        disabled={submitting}
      />

      {error ? (
        <p className="text-sm text-red-600 md:col-span-2" role="alert">
          {error}
        </p>
      ) : null}
      {successNote ? (
        <p className="text-sm text-green-700 md:col-span-2" role="status">
          {successNote}
        </p>
      ) : null}
      {warning ? (
        <p className="text-sm text-amber-800 md:col-span-2" role="status">
          {warning}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 disabled:opacity-60 md:col-span-2"
      >
        {submitting ? "Sending…" : "Submit Inquiry"}
      </button>
    </form>
  );
}
