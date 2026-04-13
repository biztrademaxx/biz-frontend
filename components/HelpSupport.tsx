"use client"

import { useState } from "react"
import { HelpSupportTicketsSection } from "@/components/support/HelpSupportTicketsSection"
import {
    Phone,
    Mail,
    MessageCircle,
    Building,
    Clock,
    ChevronDown,
    ChevronUp,
    Send,
    HelpCircle,
    Calendar,
    Star,
    Ticket,
    Bell,
    Download,
    User
} from "lucide-react"

interface FAQ {
    question: string
    answer: string
}

const faqList: FAQ[] = [
    {
        question: "What is the Visitor Dashboard?",
        answer: "The Visitor Dashboard is your personal space on Biztradefairs.com where you can manage your exhibition visits, networking, meetings, and preferences.",
    },
    {
        question: "What options are available in the side menu of my dashboard?",
        answer: `The Visitor Dashboard side menu includes:
• My Profile – Manage your personal details, business info, and preferences.
• My Exhibitions – View and manage the exhibitions you have registered for.
• Meeting Scheduler – Book and track meetings with exhibitors and other visitors.
• Networking Hub – Connect with exhibitors, delegates, and fellow visitors.
• Wishlist – Save events, exhibitors, and products you're interested in.
• My Tickets / Badges – Access and download your visitor pass or tickets.
• Notifications & Messages – Stay updated with event alerts and messages.
• Resources – Download brochures, floor plans, and exhibitor catalogues.
• Help & Support – Contact our support team for assistance.`,
    },
    {
        question: "How do I register for an exhibition through the dashboard?",
        answer: "Go to Biztradefairs.com → Browse Events, choose the event you want, and click Register. Once registered, the event will appear in your dashboard.",
    },
    {
        question: "Can I connect with exhibitors before the event?",
        answer: "Yes. Use the Networking Hub or Meeting Scheduler to send connection requests, chat, or book meetings with exhibitors before the exhibition.",
    },
    {
        question: "Where can I find my entry ticket or visitor badge?",
        answer: "You can download your ticket/badge under My Tickets / Badges. A copy will also be sent to your registered email.",
    },
    {
        question: "How do I create my wishlist of exhibitors or products?",
        answer: "Go to the event/exhibitor list and click the star icon (★) or Add to Favorites. All saved items will appear in Favorites / Wishlist in your dashboard.",
    },
    {
        question: "How do I schedule meetings with exhibitors?",
        answer: "Open Meeting Scheduler, browse exhibitor profiles, and select Book a Meeting. You can propose a time slot, and once confirmed, it will show up in your meeting calendar.",
    },
    {
        question: "How will I be notified about updates?",
        answer: "You will receive updates under Notifications & Messages in your dashboard. Important alerts will also be sent to your email and mobile (if enabled).",
    },
    {
        question: "Can I manage multiple event registrations in one dashboard?",
        answer: "Yes. All your registered exhibitions are visible under My Events. You can switch between them to view details, meetings, and saved items.",
    },
    {
        question: "What should I do if I face technical issues?",
        answer: "Go to Help & Support in the side menu. You can browse help articles, chat with support, or raise a ticket for assistance.",
    },
]

export function HelpSupport() {
    const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null)
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })

    const toggleFAQ = (index: number) => {
        setOpenFAQIndex(openFAQIndex === index ? null : index)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Contact Form Submitted", formData)
        // Add API call here
        alert("Message sent successfully!")
        setFormData({ name: "", email: "", subject: "", message: "" })
    }

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-12">
            {/* Header Section */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    This FAQ designed to address common questions and provide quick, clear answers to help you
                    understand more about our services/products
                </p>
            </div>

            {/* Contact Support Section */}
            {/* <section className="grid md:grid-cols-2 gap-8"> */}
            {/* Contact Info Card */}


            {/* Contact Form Card */}
            {/* <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Send className="text-blue-600" size={28} />
            Send Us a Message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Your Email"
                    className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Subject</label>
              <div className="relative">
                <HelpCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subject of your inquiry"
                  className="w-full border border-gray-300 rounded-md pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Please describe your issue or question in detail..."
                rows={5}
                className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2 w-full font-medium"
            >
              <Send size={20} />
              Send Message
            </button>
          </form>
        </div> */}
            {/* </section> */}

            {/* FAQs Section */}
            <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <HelpCircle className="text-blue-600" size={28} />
                    Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                    {faqList.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-lg overflow-hidden transition-all hover:shadow-sm"
                        >
                            <button
                                className="w-full flex items-center gap-4 p-6 font-medium text-left bg-gray-50 hover:bg-gray-100 transition"
                                onClick={() => toggleFAQ(index)}
                            >
                                {/* + / - button on left */}
                                <span className="text-2xl font-bold text-gray-600 w-6 flex-shrink-0">
                                    {openFAQIndex === index ? "−" : "+"}
                                </span>

                                {/* Question text on right */}
                                <span className="text-gray-900 text-lg">{faq.question}</span>
                            </button>

                            {openFAQIndex === index && (
                                <div className="p-6 text-gray-700 bg-white whitespace-pre-line border-t border-gray-200">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>


            </section>

            <HelpSupportTicketsSection />

            <div className="bg-white p-8 rounded-xl shadow-lg space-y-6 border border-gray-100">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MessageCircle className="text-blue-600" size={28} />
                    Contact Support
                </h2>
                <p className="text-gray-700">
                    Welcome to the Support Center of <span className="font-semibold text-blue-600">BizTradeFairs.com</span>.
                    We're here to make your visitor journey smooth, easy, and productive.
                </p>

                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-3">
                            <Mail className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Email Support</h3>
                                <p className="text-gray-700 text-sm mt-1">For non-urgent queries, feedback, or documentation support:</p>
                                <p className="text-blue-600 font-medium mt-2">support@biztradefairs.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-start gap-3">
                            <Phone className="text-green-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Phone Support</h3>
                                <p className="text-gray-700 text-sm mt-1">Our helpline is open for visitors during business hours:</p>
                                <p className="text-green-600 font-medium mt-2">+91-9148319993</p>
                                <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                                    <Clock size={16} />
                                    <span>Monday – Friday, 9:30 AM – 6:30 PM (IST)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-start gap-3">
                            <Building className="text-purple-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Corporate Office</h3>
                                <p className="text-gray-700 text-sm mt-1">BizTradeFairs.com</p>
                                <p className="text-gray-700 text-sm">Maxx Business Media Pvt. Ltd.</p>
                                <p className="text-gray-700 text-sm mt-1">
                                    T9, 3rd Floor, Swastik Manandi Arcade, SC Road, Seshadripuram, Bengaluru – 560020, INDIA
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-start gap-3">
                            <Clock className="text-amber-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Live Chat</h3>
                                <p className="text-gray-700 text-sm mt-1">
                                    Click on the Chat Now button at the bottom of your screen to connect with our support team instantly.
                                </p>
                                <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                                    <Clock size={16} />
                                    <span>Monday – Friday, 9:30 AM – 6:30 PM (IST)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links Section */}
            {/* <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
          <HelpCircle className="text-blue-600" size={28} />
          Quick Help Resources
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition flex flex-col items-center text-center">
            <Calendar className="text-blue-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-900">Event Registration</h3>
            <p className="text-sm text-gray-600 mt-1">How to register for events</p>
          </a>
          
          <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition flex flex-col items-center text-center">
            <Star className="text-green-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-900">Wishlist</h3>
            <p className="text-sm text-gray-600 mt-1">Save favorite exhibitors</p>
          </a>
          
          <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition flex flex-col items-center text-center">
            <Ticket className="text-purple-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-900">Tickets & Badges</h3>
            <p className="text-sm text-gray-600 mt-1">Access your event passes</p>
          </a>
          
          <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition flex flex-col items-center text-center">
            <Bell className="text-amber-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <p className="text-sm text-gray-600 mt-1">Manage your alerts</p>
          </a>
        </div>
      </section> */}
        </div>
    )
}