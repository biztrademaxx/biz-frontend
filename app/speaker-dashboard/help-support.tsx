"use client"

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
    Mic,
    FileText,
    Calendar,
    Users,
    MessageSquare,
    Star,
    Upload
} from "lucide-react"

interface FAQ {
    question: string
    answer: string
}

const faqList: FAQ[] = [
    {
        question: "What is the Speaker Dashboard?",
        answer: "The Speaker Dashboard is your personalized space on Biztradefairs.com where you can manage your speaking sessions, upload presentations, connect with attendees, and track event updates — all in one convenient place.",
    },
    {
        question: "What options are available in the side menu of my dashboard?",
        answer: `Your Speaker Dashboard side menu includes:
• My Sessions – View and manage the sessions you're scheduled to speak at.
• Profile & Bio – Update your personal profile, professional bio, photo, and designation.
• Presentations & Resources – Upload your presentation slides, session materials, or handouts.
• Schedule & Agenda – View the event schedule, session timings, and venue details.
• Networking Hub – Connect with other speakers, exhibitors, and attendees before or after your session.
• Messages & Notifications – Stay updated with organizer announcements, attendee queries, and event reminders.
• Leads & Feedback – Access session feedback and engagement insights from attendees.
• Help & Support – Get assistance from the Biztradefairs team whenever you need it.`,
    },
    {
        question: "How do I confirm my participation as a speaker?",
        answer: "Once invited or approved, go to My Sessions and click Confirm Participation. You can then review your session details, topic, and timing.",
    },
    {
        question: "How can I upload my presentation or session material?",
        answer: "Go to Presentations & Resources, click Upload Files, and add your presentation in PDF or PPT format. You can also upload supporting documents or videos for attendees to download.",
    },
    {
        question: "Can I update my profile and photo?",
        answer: "Yes. Go to Profile & Bio, where you can add your professional background, photo, contact info, and social media links. A complete profile helps increase your visibility to attendees.",
    },
    {
        question: "How do I view my speaking schedule?",
        answer: "Under Schedule & Agenda, you can see all your confirmed sessions, time slots, stage location, and event-day itinerary.",
    },
    {
        question: "Can I interact with attendees before or after my session?",
        answer: "Yes. Use the Networking Hub to connect with registered visitors, exhibitors, and other speakers. You can send messages, accept requests, or schedule meetings.",
    },
    {
        question: "How will I receive updates or announcements from the organizer?",
        answer: "All updates will appear under Messages & Notifications in your dashboard. Important reminders and changes will also be sent to your registered email and mobile number.",
    },
    {
        question: "Can I see feedback or engagement from attendees?",
        answer: "Yes. Under Leads & Feedback, you can view attendee ratings, questions, and engagement metrics related to your session.",
    },
    {
        question: "What should I do if I face any technical issues or need support?",
        answer: `Go to Help & Support in the side menu. You can:
• Browse FAQs and setup guides.
• Chat live with our support team.
• Raise a ticket for technical issues or schedule changes.`,
    },
]

export function SpeakerHelpSupport() {
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
                    Welcome to the Speaker Help & Support section.
                    This FAQ is designed to help speakers manage their participation, sessions, and engagement at exhibitions and conferences hosted on Biztradefairs.com.
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
                    Welcome to the Speaker Support Center of <span className="font-semibold text-blue-600">BizTradeFairs.com</span>.
                    We're here to ensure your speaking experience is seamless, engaging, and professionally rewarding.
                </p>

                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-3">
                            <Mail className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Speaker Email Support</h3>
                                <p className="text-gray-700 text-sm mt-1">For session management, presentation uploads, and speaker-related queries:</p>
                                <p className="text-blue-600 font-medium mt-2">speaker-support@biztradefairs.com</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-start gap-3">
                            <Phone className="text-green-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <h3 className="font-semibold text-gray-900">Speaker Helpline</h3>
                                <p className="text-gray-700 text-sm mt-1">Dedicated support line for speakers during business hours:</p>
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
                                    Click on the Chat Now button for instant connection with our speaker support team.
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
                        <Mic className="text-blue-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Session Management</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage your speaking sessions</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition flex flex-col items-center text-center">
                        <Upload className="text-green-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Presentation Upload</h3>
                        <p className="text-sm text-gray-600 mt-1">Upload session materials</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 transition flex flex-col items-center text-center">
                        <Calendar className="text-purple-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Schedule & Agenda</h3>
                        <p className="text-sm text-gray-600 mt-1">View your speaking schedule</p>
                    </a>
                    
                    <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-200 transition flex flex-col items-center text-center">
                        <Star className="text-amber-600 mb-2" size={32} />
                        <h3 className="font-semibold text-gray-900">Feedback & Ratings</h3>
                        <p className="text-sm text-gray-600 mt-1">View attendee feedback</p>
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