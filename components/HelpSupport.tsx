"use client"


import { devLog } from "@/lib/dev-log"

import { useState } from "react"
import { HelpSupportTicketsSection } from "@/components/support/HelpSupportTicketsSection"
import { cn } from "@/lib/utils"
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

export function HelpSupport({ variant = "default" }: { variant?: "default" | "venue" }) {
    const venue = variant === "venue"
    const accentIcon = "text-[#004A96]"
    const accentSoft = "bg-blue-50 rounded-lg border border-blue-100"
    const sectionShell = venue
        ? "rounded-2xl border border-slate-100 bg-white p-8 shadow-sm"
        : "rounded-xl border border-gray-100 bg-white p-8 shadow-lg"
    const contactCardClass = (colorClasses: string) =>
        cn("min-w-0 overflow-hidden rounded-lg p-3 sm:p-4", colorClasses)
    const faqItemRadius = venue ? "rounded-2xl" : "rounded-lg"

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
        devLog("Contact Form Submitted", formData)
        // Add API call here
        alert("Message sent successfully!")
        setFormData({ name: "", email: "", subject: "", message: "" })
    }

    return (
        <div className={cn(
            "w-full min-w-0 max-w-full mx-auto",
            venue ? "space-y-6 sm:space-y-10 md:space-y-12 py-2 sm:py-4" : "max-w-6xl space-y-8 py-6 px-3 sm:space-y-12 sm:py-12 sm:px-6"
        )}>
            {/* Header Section */}
            <div className="text-center min-w-0">
                <h1 className={cn(
                    "font-bold text-gray-900 mb-3 sm:mb-4",
                    venue ? "text-2xl sm:text-3xl md:text-4xl" : "text-4xl mb-4"
                )}>Help & Support</h1>
                <p className={cn(
                    "text-gray-600 max-w-3xl mx-auto break-words px-1",
                    venue ? "text-base sm:text-lg md:text-xl" : "text-xl"
                )}>
                    {venue
                        ? "Welcome to the Venue Help & Support section. This FAQ guides venue partners in managing listings, bookings, and communications through the Biztradefairs.com Venue Dashboard."
                        : "This FAQ designed to address common questions and provide quick, clear answers to help you understand more about our services/products"}
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
            <section className={cn(sectionShell, "min-w-0 overflow-hidden", venue ? "p-4 sm:p-6 md:p-8" : "p-4 sm:p-6 md:p-8")}>
                <h2 className={cn(
                    "font-bold mb-4 sm:mb-6 flex items-center gap-2 flex-wrap",
                    venue ? "text-xl sm:text-2xl" : "text-2xl"
                )}>
                    <HelpCircle className={cn(accentIcon, "shrink-0")} size={venue ? 24 : 28} />
                    <span className="min-w-0">Frequently Asked Questions</span>
                </h2>
                <div className={venue ? "space-y-3 sm:space-y-4" : "space-y-4"}>
                    {faqList.map((faq, index) => (
                        <div
                            key={index}
                            className={cn(
                                `border border-gray-200 ${faqItemRadius} overflow-hidden transition-all hover:shadow-sm`,
                                venue && "min-w-0"
                            )}
                        >
                            <button
                                type="button"
                                className={cn(
                                    "w-full flex items-start gap-3 font-medium text-left bg-gray-50 hover:bg-gray-100 transition min-w-0",
                                    venue ? "p-4 sm:p-6" : "p-6 items-center gap-4"
                                )}
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className={cn(
                                    "font-bold text-gray-600 shrink-0 leading-none",
                                    venue ? "text-xl sm:text-2xl w-5 sm:w-6 pt-0.5" : "text-2xl w-6"
                                )}>
                                    {openFAQIndex === index ? "−" : "+"}
                                </span>

                                <span className={cn(
                                    "text-gray-900 min-w-0 flex-1 break-words text-left",
                                    venue ? "text-base sm:text-lg" : "text-lg"
                                )}>{faq.question}</span>
                            </button>

                            {openFAQIndex === index && (
                                <div className={cn(
                                    "text-gray-700 bg-white whitespace-pre-line border-t border-gray-200 break-words",
                                    venue ? "p-4 sm:p-6 text-sm sm:text-base" : "p-6"
                                )}>
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>


            </section>

            <HelpSupportTicketsSection iconAccentClass={accentIcon} />

            <div className={cn(sectionShell, "min-w-0 space-y-4 overflow-hidden sm:space-y-6", venue ? "p-4 sm:p-6 md:p-8" : "p-4 sm:p-6 md:p-8")}>
                <h2 className={cn(
                    "font-bold flex items-center gap-2 flex-wrap",
                    venue ? "text-xl sm:text-2xl" : "text-2xl"
                )}>
                    <MessageCircle className={cn(accentIcon, "shrink-0")} size={venue ? 24 : 28} />
                    <span className="min-w-0">Contact Support</span>
                </h2>
                <p className={cn("text-gray-700 break-words", venue ? "text-sm sm:text-base" : "")}>
                    Welcome to the {venue ? "Venue " : ""}Support Center of <span className={`font-semibold ${accentIcon}`}>BizTradeFairs.com</span>.
                    {venue
                        ? " We're here to help you maximize your venue's potential and streamline your event management process."
                        : " We're here to make your visitor journey smooth, easy, and productive."}
                </p>

                <div className={venue ? "space-y-3 sm:space-y-4" : "space-y-4"}>
                    <div className={contactCardClass(accentSoft)}>
                        <div className="flex min-w-0 items-start gap-3">
                            <Mail className={`${accentIcon} mt-1 shrink-0`} size={20} />
                            <div className="min-w-0 flex-1 overflow-hidden">
                                <h3 className={cn("font-semibold text-gray-900", venue ? "text-sm sm:text-base" : "text-sm sm:text-base")}>Email Support</h3>
                                <p className={cn("mt-1 text-gray-700 break-words", venue ? "text-xs sm:text-sm" : "text-xs sm:text-sm")}>For non-urgent queries, feedback, or documentation support:</p>
                                <a
                                    href="mailto:support@biztradefairs.com"
                                    className={cn(accentIcon, "mt-2 block max-w-full break-all text-sm font-medium sm:text-base")}
                                >
                                    support@biztradefairs.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className={contactCardClass("rounded-lg border border-green-100 bg-green-50")}>
                        <div className="flex min-w-0 items-start gap-3">
                            <Phone className="mt-1 shrink-0 text-green-600" size={20} />
                            <div className="min-w-0 flex-1 overflow-hidden">
                                <h3 className={cn("font-semibold text-gray-900", venue ? "text-sm sm:text-base" : "text-sm sm:text-base")}>Phone Support</h3>
                                <p className={cn("mt-1 text-gray-700 break-words", venue ? "text-xs sm:text-sm" : "text-xs sm:text-sm")}>Our helpline is open for visitors during business hours:</p>
                                <a
                                    href="tel:+919148319993"
                                    className="mt-2 block break-words text-sm font-medium text-green-600 sm:text-base"
                                >
                                    +91-9148319993
                                </a>
                                <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-gray-600 mt-2">
                                    <Clock size={16} className="shrink-0" />
                                    <span>Monday – Friday, 9:30 AM – 6:30 PM (IST)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={contactCardClass("rounded-lg border border-purple-100 bg-purple-50")}>
                        <div className="flex min-w-0 items-start gap-3">
                            <Building className="mt-1 shrink-0 text-purple-600" size={20} />
                            <div className="min-w-0 flex-1 overflow-hidden">
                                <h3 className={cn("font-semibold text-gray-900", venue && "text-sm sm:text-base")}>Corporate Office</h3>
                                <p className={cn("text-gray-700 mt-1", venue ? "text-xs sm:text-sm" : "text-sm")}>BizTradeFairs.com</p>
                                <p className={cn("text-gray-700", venue ? "text-xs sm:text-sm" : "text-sm")}>Maxx Business Media Pvt. Ltd.</p>
                                <p className={cn("text-gray-700 mt-1 break-words", venue ? "text-xs sm:text-sm" : "text-sm")}>
                                    T9, 3rd Floor, Swastik Manandi Arcade, SC Road, Seshadripuram, Bengaluru – 560020, INDIA
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={contactCardClass("rounded-lg border border-amber-100 bg-amber-50")}>
                        <div className="flex min-w-0 items-start gap-3">
                            <Clock className="mt-1 shrink-0 text-amber-600" size={20} />
                            <div className="min-w-0 flex-1 overflow-hidden">
                                <h3 className={cn("font-semibold text-gray-900", venue && "text-sm sm:text-base")}>Live Chat</h3>
                                <p className={cn("text-gray-700 mt-1 break-words", venue ? "text-xs sm:text-sm" : "text-sm")}>
                                    Click on the Chat Now button at the bottom of your screen to connect with our support team instantly.
                                </p>
                                <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-gray-600 mt-2">
                                    <Clock size={16} className="shrink-0" />
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