"use client"


import { devLog } from "@/lib/dev-log"

import { useState, type ChangeEvent, type FormEvent } from "react"
import { HelpSupportTicketsSection } from "@/components/support/HelpSupportTicketsSection"
import {
    Phone,
    Mail,
    MessageCircle,
    Building,
    Clock,
    HelpCircle,
    User,
    Send,
    Calendar,
    Star,
    Ticket,
    Bell,
    Download,
    BarChart,
    Users,
    Package,
    Mailbox
} from "lucide-react"
import { cn } from "@/lib/utils"
import { exGlassCard, exPageTitle, exLink } from "./dashboard-theme"

interface FAQ {
    question: string
    answer: string
}

const faqList: FAQ[] = [
    {
        question: "What is the Exhibitor Dashboard?",
        answer: "The Exhibitor Dashboard is your personalized space on Biztradefairs.com where you can manage your exhibition participation, booth details, leads, meetings, and company profile — all in one place.",
    },
    {
        question: "What options are available in the side menu of my dashboard?",
        answer: `The Exhibitor Dashboard side menu includes:
• Company Profile – Manage your business details, products, and contact information.
• My Exhibitions – View and manage all exhibitions where your company is participating.
• Leads & Enquiries – Track and respond to visitor inquiries and business leads.
• Meeting Scheduler – Schedule and manage meetings with registered visitors and buyers.
• Products & Brochures – Upload and manage your product listings, catalogues, and promotional materials.
• Notifications & Messages – Stay updated with organizer announcements and visitor messages.
• Analytics & Reports – Monitor booth performance, visitor interactions, and lead statistics.
• Help & Support – Reach out to our support team for any assistance.`,
    },
    {
        question: "How do I register my company for an exhibition?",
        answer: "Go to Biztradefairs.com → Browse Events, select the exhibition you wish to participate in, and click 'Exhibit Now'. Once registered, the event will appear in your Exhibitor Dashboard.",
    },
    {
        question: "Can I connect with visitors before the event?",
        answer: "Yes. Use the Meeting Scheduler or Leads & Enquiries sections to view visitor interest, send connection requests, or schedule meetings ahead of the event.",
    },
    {
        question: "Where can I upload my company profile and product details?",
        answer: "Go to Company Profile and Products & Brochures to add your company description, logo, product range, and promotional materials. This information helps attract more visitors to your booth.",
    },
    {
        question: "How do I schedule meetings with visitors or buyers?",
        answer: "Open Meeting Scheduler, browse visitor or buyer profiles, and click Book a Meeting. You can suggest a preferred time slot, and once confirmed, it will appear in your meeting calendar.",
    },
    {
        question: "How will I be notified about visitor inquiries or event updates?",
        answer: "All updates will appear under Notifications & Messages. You'll also receive important alerts via your registered email and mobile (if enabled).",
    },
    {
        question: "Can I manage multiple exhibitions in one dashboard?",
        answer: "Yes. All your ongoing and past exhibitions are listed under My Exhibitions. You can switch between them to manage booth details, leads, and reports.",
    },
    {
        question: "How do I monitor visitor engagement and booth performance?",
        answer: "Under Analytics & Reports, you can track visitor interest, meeting stats, product views, and other engagement insights in real time.",
    },
    {
        question: "What should I do if I face technical issues?",
        answer: "Go to Help & Support in the side menu. You can browse FAQs, start a live chat with our support team, or raise a ticket for assistance.",
    },
]

export function ExhibitorHelpSupport() {
    const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null)
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })

    const toggleFAQ = (index: number) => {
        setOpenFAQIndex(openFAQIndex === index ? null : index)
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        devLog("Contact Form Submitted", formData)
        // Add API call here
        alert("Message sent successfully!")
        setFormData({ name: "", email: "", subject: "", message: "" })
    }

    return (
        <div className="w-full min-w-0 max-w-full mx-auto space-y-6 sm:space-y-10 md:space-y-12 py-2 sm:py-4">
            {/* Header Section */}
            <div className="text-center min-w-0">
                <h1 className={cn(exPageTitle, "mb-3 sm:mb-4 text-center")}>Help & Support</h1>
                <p className="text-base text-gray-600 max-w-3xl mx-auto sm:text-lg md:text-xl break-words px-1">
                    This FAQ section is designed to address common exhibitor questions and provide quick, clear answers to help you manage your participation effectively on Biztradefairs.com.
                </p>
            </div>

            {/* FAQs Section */}
            <section className={cn(exGlassCard, "p-4 sm:p-6 md:p-8 min-w-0 overflow-hidden")}>
                <h2 className="mb-4 sm:mb-6 flex items-center gap-2 text-xl font-bold text-slate-800 sm:text-2xl flex-wrap">
                    <HelpCircle className="text-[#004A96] shrink-0" size={24} />
                    <span className="min-w-0">Frequently Asked Questions</span>
                </h2>
                <div className="space-y-3 sm:space-y-4">
                    {faqList.map((faq, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-lg border border-white/60 transition-all hover:shadow-sm min-w-0"
                        >
                            <button
                                type="button"
                                className="flex w-full items-start gap-3 bg-white/40 p-4 text-left font-medium transition hover:bg-white/55 sm:p-6 min-w-0"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className="flex w-5 sm:w-6 flex-shrink-0 items-center justify-center text-xl sm:text-2xl font-bold text-slate-600 leading-none pt-0.5">
                                    {openFAQIndex === index ? "−" : "+"}
                                </span>
                                <span className="text-base text-slate-900 sm:text-lg min-w-0 flex-1 break-words text-left">{faq.question}</span>
                            </button>

                            {openFAQIndex === index && (
                                <div className="whitespace-pre-line border-t border-white/50 bg-white/35 p-4 sm:p-6 text-slate-700 backdrop-blur-sm break-words text-sm sm:text-base">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <HelpSupportTicketsSection iconAccentClass="text-[#004A96]" />

            {/* Contact Support Section */}
            <div className={cn(exGlassCard, "space-y-4 sm:space-y-6 p-4 sm:p-6 md:p-8 min-w-0 overflow-hidden")}>
                <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800 sm:text-2xl flex-wrap">
                    <MessageCircle className="text-[#004A96] shrink-0" size={24} />
                    <span className="min-w-0">Contact Support</span>
                </h2>
                <p className="text-slate-700 text-sm sm:text-base break-words">
                    Welcome to the Exhibitor Support Center of <span className={cn(exLink, "font-semibold")}>BizTradeFairs.com</span>.
                    We're here to make your exhibition journey successful, efficient, and productive.
                </p>

                <div className="space-y-3 sm:space-y-4">
                    <div className="rounded-lg border border-[#004A96]/20 bg-[#004A96]/10 p-3 sm:p-4 min-w-0 overflow-hidden">
                        <div className="flex items-start gap-3 min-w-0">
                            <Mail className="mt-0.5 flex-shrink-0 text-[#004A96]" size={20} />
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Email Support</h3>
                                <p className="mt-1 text-xs text-slate-700 sm:text-sm break-words">For exhibitor queries, booth management, and documentation support:</p>
                                <p className={cn(exLink, "mt-2 font-medium break-all text-sm sm:text-base")}>exhibitor-support@biztradefairs.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-100 min-w-0 overflow-hidden">
                        <div className="flex items-start gap-3 min-w-0">
                            <Phone className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Phone Support</h3>
                                <p className="mt-1 text-xs text-slate-700 sm:text-sm break-words">Dedicated helpline for exhibitors during business hours:</p>
                                <p className="text-green-600 font-medium mt-2 text-sm sm:text-base">+91-9148319993</p>
                                <div className="flex flex-wrap items-center gap-1 text-xs sm:text-sm text-gray-600 mt-2">
                                    <Clock size={16} className="shrink-0" />
                                    <span>Monday – Friday, 9:30 AM – 6:30 PM (IST)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100 min-w-0 overflow-hidden">
                        <div className="flex items-start gap-3 min-w-0">
                            <Building className="text-[#004A96] mt-0.5 flex-shrink-0" size={20} />
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Corporate Office</h3>
                                <p className="text-xs text-slate-700 sm:text-sm">BizTradeFairs.com</p>
                                <p className="text-xs text-slate-700 sm:text-sm">Maxx Business Media Pvt. Ltd.</p>
                                <p className="mt-1 text-xs text-slate-700 sm:text-sm break-words">
                                    T9, 3rd Floor, Swastik Manandi Arcade, SC Road, Seshadripuram, Bengaluru – 560020, INDIA
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 sm:p-4 bg-amber-50 rounded-lg border border-amber-100 min-w-0 overflow-hidden">
                        <div className="flex items-start gap-3 min-w-0">
                            <Clock className="text-amber-600 mt-0.5 flex-shrink-0" size={20} />
                            <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Live Chat</h3>
                                <p className="mt-1 text-xs text-slate-700 sm:text-sm break-words">
                                    Click on the Chat Now button at the bottom of your screen to connect with our exhibitor support team instantly.
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

            {/* Quick Help Resources Section */}
            {/* <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <HelpCircle className="text-blue-600" size={28} />
                    Quick Help Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition flex flex-col items-center text-center">
                        <Users className="text-blue-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Booth Management</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage your exhibition booth</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition flex flex-col items-center text-center">
                        <Mailbox className="text-green-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Leads & Enquiries</h3>
                        <p className="text-sm text-gray-600 mt-1">Track visitor inquiries</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition flex flex-col items-center text-center">
                        <Package className="text-[#004A96] mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Products & Brochures</h3>
                        <p className="text-sm text-gray-600 mt-1">Upload product catalogues</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition flex flex-col items-center text-center">
                        <BarChart className="text-amber-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Analytics & Reports</h3>
                        <p className="text-sm text-gray-600 mt-1">Monitor performance</p>
                    </a>
                </div>
            </section> */}

            {/* Contact Form Section */}
            {/* <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Send className="text-blue-600" size={28} />
                    Send Us a Message
                </h2> */}
                {/* <form onSubmit={handleSubmit} className="space-y-6">
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
                </form> */}
            {/* </section> */}
        </div>
    )
}