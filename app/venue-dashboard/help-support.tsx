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
    MapPin,
    Calendar,
    FileText,
    BarChart,
    Users,
    Image,
    MessageSquare
} from "lucide-react"

interface FAQ {
    question: string
    answer: string
}

const faqList: FAQ[] = [
    {
        question: "What is the Venue Dashboard?",
        answer: "The Venue Dashboard is your dedicated control panel on Biztradefairs.com, where you can manage your venue profile, facilities, bookings, upcoming events, and organizer interactions — all in one place.",
    },
    {
        question: "What options are available in the side menu of my dashboard?",
        answer: `Your Venue Dashboard side menu includes:
• Venue Profile – Add or update your venue details, photos, amenities, and location.
• Bookings & Enquiries – View and manage event booking requests, enquiries, and confirmations.
• Event Calendar – Track scheduled and upcoming exhibitions or conferences hosted at your venue.
• Floor Plans & Spaces – Upload and manage floor layouts, hall capacities, and available spaces.
• Organizers & Clients – View and communicate with event organizers who have booked or shown interest in your venue.
• Resources – Upload venue brochures, rate cards, and service catalogues.
• Notifications & Messages – Stay informed with organizer communications and booking alerts.
• Analytics & Reports – Review venue performance, booking trends, and inquiry data.
• Help & Support – Connect with the Biztradefairs.com support team for assistance.`,
    },
    {
        question: "How do I list my venue on Biztradefairs.com?",
        answer: "Go to Venue Profile and click Add New Venue. Fill in your venue name, address, contact info, facilities, and upload high-quality images. Once approved by our team, your venue will go live on the platform.",
    },
    {
        question: "How can I manage booking requests and enquiries?",
        answer: "Under Bookings & Enquiries, you can view all incoming event requests, send quotations, confirm bookings, or communicate directly with organizers through the message center.",
    },
    {
        question: "How do I upload or update my floor plans?",
        answer: "Go to Floor Plans & Spaces and upload your latest layouts. Include details such as hall dimensions, entry points, and booth configurations to help organizers plan effectively.",
    },
    {
        question: "Can I track the events happening at my venue?",
        answer: "Yes. The Event Calendar displays all your confirmed and upcoming exhibitions, conferences, and meetings. You can also view historical event data for reference.",
    },
    {
        question: "How can I communicate with event organizers?",
        answer: "Use the Organizers & Clients section or the Messages & Notifications tab to send or reply to messages, share quotations, and coordinate event logistics.",
    },
    {
        question: "Can I upload additional marketing materials or service details?",
        answer: "Yes. Use the Resources section to upload brochures, photos, rate cards, catering details, and other value-added services your venue offers.",
    },
    {
        question: "How can I view venue performance and analytics?",
        answer: "Go to Analytics & Reports to review your venue's visibility, booking statistics, and inquiry conversions over time.",
    },
    {
        question: "What should I do if I face technical issues or need help?",
        answer: `Go to Help & Support in the side menu. You can:
• Browse detailed FAQs and setup guides.
• Chat with our support team for quick assistance.
• Raise a support ticket for technical or account-related issues.`,
    },
]

export function VenueHelpSupport() {
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
                    Welcome to the Venue Help & Support section.
                    This FAQ is designed to guide venue partners in managing their listings, bookings, event schedules, and communications efficiently through the Biztradefairs.com Venue Dashboard.
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
                    Welcome to the Venue Support Center of <span className="font-semibold text-blue-600">BizTradeFairs.com</span>.
                    We're here to help you maximize your venue's potential and streamline your event management process.
                </p>

                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-3">
                            <Mail className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Venue Email Support</h3>
                                <p className="text-gray-700 text-sm mt-1">For venue listings, booking management, and partnership queries:</p>
                                <p className="text-blue-600 font-medium mt-2">venue-support@biztradefairs.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-start gap-3">
                            <Phone className="text-green-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Venue Partnership Helpline</h3>
                                <p className="text-gray-700 text-sm mt-1">Dedicated support line for venue partners during business hours:</p>
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
                                <h3 className="font-semibold text-gray-900">Live Chat Support</h3>
                                <p className="text-gray-700 text-sm mt-1">
                                    Click on the Chat Now button for instant connection with our venue support team.
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

            {/* Quick Help Resources Section */}
            {/* <section className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                    <HelpCircle className="text-blue-600" size={28} />
                    Quick Help Resources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition flex flex-col items-center text-center">
                        <MapPin className="text-blue-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Venue Listing</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage your venue profile</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition flex flex-col items-center text-center">
                        <Calendar className="text-green-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Bookings & Calendar</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage event bookings</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition flex flex-col items-center text-center">
                        <Image className="text-purple-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Floor Plans</h3>
                        <p className="text-sm text-gray-600 mt-1">Upload venue layouts</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition flex flex-col items-center text-center">
                        <BarChart className="text-amber-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Analytics</h3>
                        <p className="text-sm text-gray-600 mt-1">View venue performance</p>
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