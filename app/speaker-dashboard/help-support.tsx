"use client"

import { devLog } from "@/lib/dev-log"
import { useState } from "react"
import { HelpSupportTicketsSection } from "@/components/support/HelpSupportTicketsSection"
import { Phone, Mail, MessageCircle, Building, Clock, HelpCircle, Send, ChevronDown } from "lucide-react"

interface FAQ { question: string; answer: string }

const faqList: FAQ[] = [
    { question: "What is the Speaker Dashboard?", answer: "The Speaker Dashboard is your personalized space on Biztradefairs.com where you can manage your speaking sessions, upload presentations, connect with attendees, and track event updates — all in one convenient place." },
    { question: "What options are available in the side menu of my dashboard?", answer: `Your Speaker Dashboard side menu includes:\n• My Sessions – View and manage the sessions you're scheduled to speak at.\n• Profile & Bio – Update your personal profile, professional bio, photo, and designation.\n• Presentations & Resources – Upload your presentation slides, session materials, or handouts.\n• Schedule & Agenda – View the event schedule, session timings, and venue details.\n• Networking Hub – Connect with other speakers, exhibitors, and attendees before or after your session.\n• Messages & Notifications – Stay updated with organizer announcements, attendee queries, and event reminders.\n• Leads & Feedback – Access session feedback and engagement insights from attendees.\n• Help & Support – Get assistance from the Biztradefairs team whenever you need it.` },
    { question: "How do I confirm my participation as a speaker?", answer: "Once invited or approved, go to My Sessions and click Confirm Participation. You can then review your session details, topic, and timing." },
    { question: "How can I upload my presentation or session material?", answer: "Go to Presentations & Resources, click Upload Files, and add your presentation in PDF or PPT format. You can also upload supporting documents or videos for attendees to download." },
    { question: "Can I update my profile and photo?", answer: "Yes. Go to Profile & Bio, where you can add your professional background, photo, contact info, and social media links. A complete profile helps increase your visibility to attendees." },
    { question: "How do I view my speaking schedule?", answer: "Under Schedule & Agenda, you can see all your confirmed sessions, time slots, stage location, and event-day itinerary." },
    { question: "Can I interact with attendees before or after my session?", answer: "Yes. Use the Networking Hub to connect with registered visitors, exhibitors, and other speakers. You can send messages, accept requests, or schedule meetings." },
    { question: "How will I receive updates or announcements from the organizer?", answer: "All updates will appear under Messages & Notifications in your dashboard. Important reminders and changes will also be sent to your registered email and mobile number." },
    { question: "Can I see feedback or engagement from attendees?", answer: "Yes. Under Leads & Feedback, you can view attendee ratings, questions, and engagement metrics related to your session." },
    { question: "What should I do if I face any technical issues or need support?", answer: `Go to Help & Support in the side menu. You can:\n• Browse FAQs and setup guides.\n• Chat live with our support team.\n• Raise a ticket for technical issues or schedule changes.` },
]

const contactCards = [
    {
        icon: <Mail className="w-5 h-5" />,
        title: "Speaker Email Support",
        description: "For session management, presentation uploads, and speaker-related queries:",
        detail: "speaker-support@biztradefairs.com",
        gradient: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
        iconColor: "#2563eb",
        detailColor: "#1d4ed8",
    },
    {
        icon: <Phone className="w-5 h-5" />,
        title: "Speaker Helpline",
        description: "Dedicated support line for speakers during business hours:",
        detail: "+91-9148319993",
        sub: "Mon–Fri, 9:30 AM – 6:30 PM (IST)",
        gradient: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
        iconColor: "#16a34a",
        detailColor: "#15803d",
    },
    {
        icon: <Building className="w-5 h-5" />,
        title: "Corporate Office",
        description: "BizTradeFairs.com — Maxx Business Media Pvt. Ltd.",
        detail: "T9, 3rd Floor, Swastik Manandi Arcade, SC Road, Seshadripuram, Bengaluru – 560020, INDIA",
        gradient: "linear-gradient(135deg, #f3e8ff, #e9d5ff)",
        iconColor: "#7c3aed",
        detailColor: "#4c1d95",
    },
    {
        icon: <MessageCircle className="w-5 h-5" />,
        title: "Live Chat Support",
        description: "Click on Chat Now for instant connection with our speaker support team.",
        detail: "Mon–Fri, 9:30 AM – 6:30 PM (IST)",
        gradient: "linear-gradient(135deg, #fef3c7, #fde68a)",
        iconColor: "#b45309",
        detailColor: "#92400e",
    },
]

export function SpeakerHelpSupport() {
    const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null)
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })

    const toggleFAQ = (index: number) => setOpenFAQIndex(openFAQIndex === index ? null : index)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        devLog("Contact Form Submitted", formData)
        alert("Message sent successfully!")
        setFormData({ name: "", email: "", subject: "", message: "" })
    }

    return (
        <div className="space-y-4 max-w-5xl mx-auto min-w-0">
            {/* Header */}
            <div>
                <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Help & Support</h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">Everything you need to manage your speaker experience</p>
            </div>

            {/* FAQ Section */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(99,102,241,0.04)" }}
            >
                {/* FAQ header */}
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(241,245,249,0.8)", background: "linear-gradient(135deg, rgba(219,234,254,0.2), rgba(237,233,254,0.2))" }}>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }}>
                            <HelpCircle className="w-4 h-4 text-blue-500" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Frequently Asked Questions</h3>
                    </div>
                </div>

                <div className="divide-y divide-slate-100/60">
                    {faqList.map((faq, index) => (
                        <div key={index}>
                            <button
                                className="w-full flex items-start justify-between gap-3 p-4 sm:p-5 text-left hover:bg-slate-50/60 transition-colors"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className="text-sm font-semibold text-slate-700 break-words min-w-0 flex-1">{faq.question}</span>
                                <ChevronDown
                                    className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200"
                                    style={{ transform: openFAQIndex === index ? "rotate(180deg)" : "rotate(0deg)" }}
                                />
                            </button>
                            {openFAQIndex === index && (
                                <div
                                    className="px-4 sm:px-5 pb-4 sm:pb-5 text-sm text-slate-500 leading-relaxed whitespace-pre-line break-words"
                                    style={{ borderTop: "1px solid rgba(241,245,249,0.6)", background: "rgba(248,250,252,0.4)" }}
                                >
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Support Tickets */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 2px 12px rgba(99,102,241,0.04)" }}
            >
                <HelpSupportTicketsSection />
            </div>

            {/* Contact Cards */}
            <div>
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }}>
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Contact Support</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contactCards.map((card, index) => (
                        <div
                            key={index}
                            className="rounded-2xl p-4 space-y-2 hover:shadow-md transition-all duration-200 min-w-0 overflow-hidden"
                            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.9)" }}
                        >
                            <div className="flex items-start gap-3 min-w-0">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: card.gradient }}>
                                    <span style={{ color: card.iconColor }}>{card.icon}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700 break-words min-w-0">{card.title}</p>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed break-words">{card.description}</p>
                            <p className="text-xs font-semibold break-words" style={{ color: card.detailColor }}>{card.detail}</p>
                            {card.sub && (
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                                    <Clock className="w-3 h-3" />{card.sub}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}