"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function ContactSupport() {
  const [form, setForm] = useState({ name: "", email: "", message: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Support request submitted:", form)
    alert("Your support request has been submitted.")
    setForm({ name: "", email: "", message: "" })
  }

  return (
    <div className="max-w-md space-y-4">
        <p>Page Will update ShortLy</p>
      {/* <h2 className="text-lg font-semibold">Contact Support</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <Input
          type="email"
          placeholder="Your Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <Textarea
          placeholder="Your Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />
        <Button type="submit" className="w-full">Submit</Button>
      </form> */}
    </div>
  )
}
