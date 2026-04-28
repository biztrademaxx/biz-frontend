"use client"


import { devLog } from "@/lib/dev-log"

import { useState } from "react"
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
    Users,
    BarChart,
    Megaphone,
    FileText,
    Settings,
    Ticket
} from "lucide-react"

interface FAQ {
    question: string
    answer: string
}

const faqList: FAQ[] = [
    {
        question: "What is the Organizer Dashboard?",
        answer: "The Organizer Dashboard is your central control panel on Biztradefairs.com, allowing you to manage your exhibitions, exhibitor registrations, visitor engagement, sponsorships, and analytics — all from one place.",
    },
    {
        question: "What options are available in the side menu of my dashboard?",
        answer: `Your Organizer Dashboard side menu includes:
• My Events – Manage all your live, upcoming, and past exhibitions.
• Exhibitor Management – View and approve exhibitor applications, assign booths, and manage exhibitor listings.
• Visitor Management – Track visitor registrations, send invitations, and monitor visitor data.
• Meetings & Networking – View scheduled meetings between exhibitors and visitors, and oversee networking activities.
• Sponsorships & Ads – Manage sponsor listings, digital ads, and premium exhibitor placements.
• Leads & Reports – Access analytics on visitor engagement, exhibitor performance, and lead generation.
• Notifications & Communication – Send event updates, announcements, or alerts to exhibitors and visitors.
• Resources – Upload event brochures, floor plans, exhibitor manuals, and other documents.
• Help & Support – Connect with Biztradefairs.com support for any assistance.`,
    },
    {
        question: "How do I create and publish a new exhibition?",
        answer: "Click 'Create Event' under My Events, fill in the required event details, upload your logo, and add exhibitor/visitor registration options. Once approved by the Biztradefairs team, your event will go live on the platform.",
    },
    {
        question: "How can I approve or manage exhibitor registrations?",
        answer: "Go to Exhibitor Management, where you can view pending, approved, or rejected exhibitors. You can assign booth numbers, upload floor plans, and update exhibitor profiles.",
    },
    {
        question: "How do I track visitor registrations and analytics?",
        answer: "Under Visitor Management, you can monitor real-time registration data, demographics, and visitor categories. Use Leads & Reports to access detailed analytics and export data.",
    },
    {
        question: "Can I send updates or announcements to exhibitors and visitors?",
        answer: "Yes. Use Notifications & Communication to send bulk messages, event reminders, and announcements directly to registered exhibitors or visitors via email and dashboard alerts.",
    },
    {
        question: "How do I manage sponsors and advertisements for my event?",
        answer: "Open Sponsorships & Ads, where you can add sponsor logos, create ad placements, and manage paid promotions within your event page.",
    },
    {
        question: "Can I view all scheduled meetings during my exhibition?",
        answer: "Yes. Under Meetings & Networking, you can view the list of confirmed meetings between exhibitors and visitors, helping you monitor engagement during the show.",
    },
    {
        question: "How do I access event reports and performance insights?",
        answer: "All performance metrics are available under Leads & Reports. You can download summaries on visitor turnout, exhibitor engagement, lead quality, and overall event reach.",
    },
    {
        question: "What should I do if I face any technical issues or need platform assistance?",
        answer: `Go to Help & Support in the side menu. You can:
• Browse detailed FAQs and setup guides.
• Chat with our support team for instant help.
• Raise a support ticket for technical issues or feature requests.`,
    },
]

export function OrganizerHelpSupport() {
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
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-12">
            {/* Header Section */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Help & Support</h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Welcome to the Organizer Help & Support section.
                    This FAQ is designed to address common questions and provide clear guidance to help you efficiently manage your exhibitions and events on Biztradefairs.com.
                </p>
            </div>

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
                                <span className="text-2xl font-bold text-gray-600 w-6 flex-shrink-0">
                                    {openFAQIndex === index ? "−" : "+"}
                                </span>
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

            {/* Contact Support Section */}
            <div className="bg-white p-8 rounded-xl shadow-lg space-y-6 border border-gray-100">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <MessageCircle className="text-blue-600" size={28} />
                    Contact Support
                </h2>
                <p className="text-gray-700">
                    Welcome to the Organizer Support Center of <span className="font-semibold text-blue-600">BizTradeFairs.com</span>.
                    We're here to ensure your event management experience is seamless, efficient, and successful.
                </p>

                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-3">
                            <Mail className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Organizer Email Support</h3>
                                <p className="text-gray-700 text-sm mt-1">For event management queries, technical support, and platform assistance:</p>
                                <p className="text-blue-600 font-medium mt-2">organizer-support@biztradefairs.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-start gap-3">
                            <Phone className="text-green-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Priority Phone Support</h3>
                                <p className="text-gray-700 text-sm mt-1">Dedicated helpline for organizers during extended business hours:</p>
                                <p className="text-green-600 font-medium mt-2">+91-9148319993</p>
                                <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                                    <Clock size={16} />
                                    <span>Monday – Saturday, 9:00 AM – 7:00 PM (IST)</span>
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
                                <h3 className="font-semibold text-gray-900">Priority Live Chat</h3>
                                <p className="text-gray-700 text-sm mt-1">
                                    Click on the Chat Now button for instant connection with our organizer support team.
                                </p>
                                <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
                                    <Clock size={16} />
                                    <span>Monday – Saturday, 9:00 AM – 7:00 PM (IST)</span>
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
                        <Calendar className="text-blue-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Event Creation</h3>
                        <p className="text-sm text-gray-600 mt-1">Create and manage events</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition flex flex-col items-center text-center">
                        <Users className="text-green-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Exhibitor Management</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage exhibitor applications</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition flex flex-col items-center text-center">
                        <BarChart className="text-purple-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Analytics & Reports</h3>
                        <p className="text-sm text-gray-600 mt-1">View event performance</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition flex flex-col items-center text-center">
                        <Megaphone className="text-amber-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Communications</h3>
                        <p className="text-sm text-gray-600 mt-1">Send announcements</p>
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