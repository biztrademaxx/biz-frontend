"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Bell,
  Mail,
  Send,
  Users,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  Plus,
  Target,
  Clock,
  TrendingUp,
  MessageSquare,
  Calendar,
  Filter,
  Download,
  LayoutTemplateIcon as Template,
  Sparkles,
  Copy,
  Globe,
  ChevronDown,
} from "lucide-react"

interface Promotion {
  id: string
  type: "push" | "email"
  title: string
  content: string
  targetCategories: string[]
  status: "draft" | "scheduled" | "sent" | "sending"
  priority: "low" | "medium" | "high"
  createdAt: string
  scheduledAt?: string
  sentAt?: string
  stats: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced?: number
    unsubscribed?: number
  }
  engagement: {
    openRate: number
    clickRate: number
    deliveryRate: number
  }
}

interface CampaignTemplate {
  id: string
  name: string
  type: "push" | "email"
  category: string
  title: string
  content: string
  suggestedCategories: string[]
  priority: "low" | "medium" | "high"
  description: string
  icon: string
}

const campaignTemplates: CampaignTemplate[] = [
  // Push Notification Templates
  {
    id: "push-event-reminder",
    name: "Event Reminder",
    type: "push",
    category: "Event Management",
    title: "🎯 Don't Miss Out - Event Starting Soon!",
    content: "Your registered event starts in 2 hours. Get ready for an amazing experience! Tap to view details.",
    suggestedCategories: ["attendees"],
    priority: "high",
    description: "Remind users about upcoming events they've registered for",
    icon: "⏰",
  },
  {
    id: "push-new-event",
    name: "New Event Alert",
    type: "push",
    category: "Event Promotion",
    title: "🚀 Exciting New Event Just Added!",
    content: "A new event in your favorite category is now available. Early bird tickets are 30% off!",
    suggestedCategories: ["technology", "business"],
    priority: "medium",
    description: "Notify users about new events in their preferred categories",
    icon: "🎉",
  },
  {
    id: "push-last-chance",
    name: "Last Chance Tickets",
    type: "push",
    category: "Urgency",
    title: "⚡ Last Few Tickets Available!",
    content: "Only 10 tickets left for this popular event. Secure your spot before it's too late!",
    suggestedCategories: ["all"],
    priority: "high",
    description: "Create urgency for events with limited availability",
    icon: "🔥",
  },
  {
    id: "push-early-bird",
    name: "Early Bird Discount",
    type: "push",
    category: "Promotions",
    title: "🐦 Early Bird Special - 40% Off!",
    content: "Limited time offer! Get 40% off early bird tickets. Offer expires in 24 hours.",
    suggestedCategories: ["attendees", "technology", "business"],
    priority: "high",
    description: "Promote early bird discounts and special offers",
    icon: "💰",
  },
  {
    id: "push-weekend-events",
    name: "Weekend Events",
    type: "push",
    category: "Weekly Promotion",
    title: "🌟 Amazing Weekend Events Await!",
    content: "Discover exciting events happening this weekend in your city. Something for everyone!",
    suggestedCategories: ["all"],
    priority: "medium",
    description: "Weekly promotion of weekend events",
    icon: "🎪",
  },
  {
    id: "push-category-spotlight",
    name: "Category Spotlight",
    type: "push",
    category: "Category Focus",
    title: "🎨 Arts & Culture Events This Month",
    content: "Explore amazing arts and culture events happening this month. From galleries to concerts!",
    suggestedCategories: ["arts"],
    priority: "medium",
    description: "Highlight events from specific categories",
    icon: "🎭",
  },

  // Email Campaign Templates
  {
    id: "email-weekly-digest",
    name: "Weekly Event Digest",
    type: "email",
    category: "Newsletter",
    title: "📅 Your Weekly Event Digest - Don't Miss These!",
    content: `Hi there!

Here are the most exciting events happening this week that we think you'll love:

🚀 FEATURED EVENTS:
• Tech Innovation Summit - January 25th
• Business Networking Mixer - January 27th  
• Healthcare Conference 2024 - January 28th

🎯 PERSONALIZED FOR YOU:
Based on your interests, we've found 5 more events you might enjoy.

💰 SPECIAL OFFERS:
Get 25% off any event ticket this week with code WEEKLY25

Ready to discover something amazing?

Best regards,
The Events Team`,
    suggestedCategories: ["all"],
    priority: "medium",
    description: "Weekly newsletter with curated events and offers",
    icon: "📰",
  },
  {
    id: "email-event-announcement",
    name: "New Event Announcement",
    type: "email",
    category: "Event Launch",
    title: "🎉 Exciting New Event: Technology Innovation Summit 2024",
    content: `We're thrilled to announce our biggest event of the year!

🚀 TECHNOLOGY INNOVATION SUMMIT 2024
📅 Date: March 15-16, 2024
📍 Location: Convention Center, Downtown
👥 Expected Attendees: 2,000+ professionals

WHAT TO EXPECT:
✨ 50+ industry speakers
✨ Hands-on workshops
✨ Networking opportunities
✨ Latest tech innovations
✨ Startup showcase

EARLY BIRD SPECIAL:
Register before February 1st and save 40%!
Regular Price: $299 → Early Bird: $179

This event sells out every year, so secure your spot today.

[REGISTER NOW - 40% OFF]

Questions? Reply to this email or call us at (555) 123-4567.

See you there!
The Events Team`,
    suggestedCategories: ["technology", "business"],
    priority: "high",
    description: "Comprehensive announcement for major new events",
    icon: "📢",
  },
  {
    id: "email-abandoned-cart",
    name: "Abandoned Registration",
    type: "email",
    category: "Recovery",
    title: "🎫 Complete Your Event Registration - 15% Off Inside!",
    content: `Hi there!

We noticed you started registering for an amazing event but didn't complete your booking. 

THE EVENT YOU WERE INTERESTED IN:
🎯 Business Leadership Conference
📅 February 10, 2024
📍 Grand Hotel, City Center
💰 Original Price: $199

SPECIAL OFFER JUST FOR YOU:
Complete your registration in the next 24 hours and get 15% off!
Your Price: $169 (Save $30)

WHY ATTEND:
• Learn from industry leaders
• Network with 500+ professionals  
• Get actionable business strategies
• Includes lunch and materials

This offer expires in 24 hours, and seats are filling up fast.

[COMPLETE REGISTRATION - 15% OFF]

Need help? Just reply to this email.

Best regards,
The Events Team`,
    suggestedCategories: ["attendees"],
    priority: "high",
    description: "Re-engage users who abandoned event registration",
    icon: "🛒",
  },
  {
    id: "email-post-event",
    name: "Post-Event Follow-up",
    type: "email",
    category: "Follow-up",
    title: "🙏 Thank You for Attending - Resources & Next Steps",
    content: `Thank you for making our event amazing!

We hope you had a fantastic experience at the Technology Innovation Summit. Your participation made it truly special.

📊 EVENT HIGHLIGHTS:
• 1,200+ attendees
• 25 inspiring speakers
• 15 hands-on workshops
• 500+ new connections made

🎁 YOUR EVENT RESOURCES:
• Presentation slides from all speakers
• Workshop materials and templates
• Attendee contact directory
• Event photos and videos

[DOWNLOAD ALL RESOURCES]

🔮 WHAT'S NEXT:
• Join our LinkedIn community for ongoing discussions
• Mark your calendar: Next summit is June 15, 2024
• Early bird tickets available at 50% off for returning attendees

📝 HELP US IMPROVE:
Your feedback matters! Please take 2 minutes to share your experience:
[QUICK FEEDBACK SURVEY]

Thank you again for being part of our community!

The Events Team`,
    suggestedCategories: ["attendees"],
    priority: "medium",
    description: "Thank attendees and provide post-event resources",
    icon: "🎊",
  },
  {
    id: "email-organizer-welcome",
    name: "Organizer Welcome",
    type: "email",
    category: "Onboarding",
    title: "🎉 Welcome to Our Platform - Let's Create Amazing Events!",
    content: `Welcome to the Events Platform family!

We're excited to help you create and manage successful events. You're now part of a community of 8,900+ event organizers worldwide.

🚀 GET STARTED:
1. Complete your organizer profile
2. Create your first event listing
3. Set up payment processing
4. Launch your event to our 95,000+ users

💡 SUCCESS TIPS:
• Use high-quality event images
• Write compelling event descriptions
• Set competitive pricing
• Engage with attendees regularly

🎯 PLATFORM BENEFITS:
• Reach 95,000+ potential attendees
• Advanced analytics and insights
• Secure payment processing
• 24/7 customer support
• Marketing tools and promotion options

📚 HELPFUL RESOURCES:
• Organizer handbook and best practices
• Video tutorials and webinars
• Success stories from top organizers
• Community forum and support

[ACCESS ORGANIZER DASHBOARD]

Need help getting started? Our team is here to support you every step of the way.

Welcome aboard!
The Events Team`,
    suggestedCategories: ["organizers"],
    priority: "high",
    description: "Welcome new organizers and guide them through setup",
    icon: "👋",
  },
  {
    id: "email-seasonal-promotion",
    name: "Seasonal Event Promotion",
    type: "email",
    category: "Seasonal",
    title: "🌸 Spring Into Action - Amazing Events This Season!",
    content: `Spring is here, and so are incredible events!

🌸 SPRING EVENT HIGHLIGHTS:
• Outdoor festivals and concerts
• Business conferences and seminars  
• Health and wellness workshops
• Art exhibitions and cultural events
• Food and wine tastings

🎯 EVENTS NEAR YOU:
We've curated the best spring events in your area:

📅 THIS WEEKEND:
• Spring Food Festival - Saturday
• Outdoor Yoga Workshop - Sunday
• Art Gallery Opening - Sunday

📅 COMING UP:
• Business Innovation Summit - March 20
• Health & Wellness Expo - March 25
• Spring Concert Series - March 30

💰 SPRING SPECIAL:
Use code SPRING2024 for 20% off any event ticket!
Valid until March 31st.

[BROWSE ALL SPRING EVENTS]

Don't let this beautiful season pass by without experiencing something new!

Happy Spring!
The Events Team`,
    suggestedCategories: ["all"],
    priority: "medium",
    description: "Seasonal promotion highlighting relevant events",
    icon: "🌺",
  },
]

const targetAudiences = [
  {
    id: "all",
    name: "All Users",
    count: 95000,
    icon: Users,
    color: "bg-blue-100 text-blue-800",
    type: "audience",
    categories: [],
    countries: [],
  },
  {
    id: "attendees",
    name: "Event Attendees",
    count: 67000,
    icon: Users,
    color: "bg-green-100 text-green-800",
    type: "audience",
    categories: [
      { id: "technology", name: "Technology", count: 12500, color: "bg-indigo-100 text-indigo-800" },
      { id: "business", name: "Business", count: 8900, color: "bg-orange-100 text-orange-800" },
      { id: "healthcare", name: "Healthcare", count: 6700, color: "bg-red-100 text-red-800" },
      { id: "education", name: "Education", count: 5400, color: "bg-yellow-100 text-yellow-800" },
      { id: "arts", name: "Arts & Culture", count: 4200, color: "bg-pink-100 text-pink-800" },
      { id: "sports", name: "Sports & Fitness", count: 3800, color: "bg-emerald-100 text-emerald-800" },
      { id: "food", name: "Food & Beverage", count: 3200, color: "bg-amber-100 text-amber-800" },
      { id: "travel", name: "Travel & Tourism", count: 2900, color: "bg-cyan-100 text-cyan-800" },
      { id: "automotive", name: "Automotive", count: 2100, color: "bg-slate-100 text-slate-800" },
      { id: "realestate", name: "Real Estate", count: 1800, color: "bg-teal-100 text-teal-800" },
      { id: "entertainment", name: "Entertainment", count: 1500, color: "bg-violet-100 text-violet-800" },
      { id: "retail", name: "Retail & Fashion", count: 1200, color: "bg-rose-100 text-rose-800" },
    ],
    countries: [
      {
        id: "india",
        name: "India",
        count: 25000,
        color: "bg-orange-100 text-orange-800",
        cities: [
          { id: "mumbai", name: "Mumbai", count: 4500 },
          { id: "delhi", name: "Delhi", count: 4200 },
          { id: "bangalore", name: "Bangalore", count: 3800 },
          { id: "hyderabad", name: "Hyderabad", count: 2800 },
          { id: "chennai", name: "Chennai", count: 2500 },
          { id: "pune", name: "Pune", count: 2200 },
          { id: "kolkata", name: "Kolkata", count: 1800 },
          { id: "ahmedabad", name: "Ahmedabad", count: 1400 },
        ],
      },
      {
        id: "usa",
        name: "United States",
        count: 18000,
        color: "bg-blue-100 text-blue-800",
        cities: [
          { id: "newyork", name: "New York", count: 3800 },
          { id: "losangeles", name: "Los Angeles", count: 3200 },
          { id: "chicago", name: "Chicago", count: 2400 },
          { id: "houston", name: "Houston", count: 2000 },
          { id: "phoenix", name: "Phoenix", count: 1800 },
          { id: "philadelphia", name: "Philadelphia", count: 1600 },
          { id: "sanantonio", name: "San Antonio", count: 1400 },
          { id: "sandiego", name: "San Diego", count: 1200 },
        ],
      },
      {
        id: "uk",
        name: "United Kingdom",
        count: 8000,
        color: "bg-green-100 text-green-800",
        cities: [
          { id: "london", name: "London", count: 3000 },
          { id: "manchester", name: "Manchester", count: 1500 },
          { id: "birmingham", name: "Birmingham", count: 1200 },
          { id: "glasgow", name: "Glasgow", count: 800 },
          { id: "liverpool", name: "Liverpool", count: 700 },
          { id: "leeds", name: "Leeds", count: 500 },
          { id: "sheffield", name: "Sheffield", count: 300 },
        ],
      },
      {
        id: "germany",
        name: "Germany",
        count: 6000,
        color: "bg-red-100 text-red-800",
        cities: [
          { id: "berlin", name: "Berlin", count: 1800 },
          { id: "munich", name: "Munich", count: 1400 },
          { id: "hamburg", name: "Hamburg", count: 1000 },
          { id: "cologne", name: "Cologne", count: 800 },
          { id: "frankfurt", name: "Frankfurt", count: 600 },
          { id: "stuttgart", name: "Stuttgart", count: 400 },
        ],
      },
      {
        id: "canada",
        name: "Canada",
        count: 4000,
        color: "bg-purple-100 text-purple-800",
        cities: [
          { id: "toronto", name: "Toronto", count: 1500 },
          { id: "vancouver", name: "Vancouver", count: 1000 },
          { id: "montreal", name: "Montreal", count: 800 },
          { id: "calgary", name: "Calgary", count: 400 },
          { id: "ottawa", name: "Ottawa", count: 300 },
        ],
      },
    ],
  },
  {
    id: "exhibitors",
    name: "Exhibitors",
    count: 8900,
    icon: Users,
    color: "bg-purple-100 text-purple-800",
    type: "audience",
    categories: [
      { id: "technology", name: "Technology", count: 2200, color: "bg-indigo-100 text-indigo-800" },
      { id: "business", name: "Business", count: 1800, color: "bg-orange-100 text-orange-800" },
      { id: "healthcare", name: "Healthcare", count: 1500, color: "bg-red-100 text-red-800" },
      { id: "manufacturing", name: "Manufacturing", count: 1200, color: "bg-gray-100 text-gray-800" },
      { id: "automotive", name: "Automotive", count: 900, color: "bg-slate-100 text-slate-800" },
      { id: "food", name: "Food & Beverage", count: 700, color: "bg-amber-100 text-amber-800" },
      { id: "retail", name: "Retail & Fashion", count: 500, color: "bg-rose-100 text-rose-800" },
    ],
    countries: [
      {
        id: "india",
        name: "India",
        count: 3500,
        color: "bg-orange-100 text-orange-800",
        cities: [
          { id: "mumbai", name: "Mumbai", count: 800 },
          { id: "delhi", name: "Delhi", count: 700 },
          { id: "bangalore", name: "Bangalore", count: 600 },
          { id: "chennai", name: "Chennai", count: 400 },
          { id: "pune", name: "Pune", count: 350 },
          { id: "hyderabad", name: "Hyderabad", count: 300 },
          { id: "kolkata", name: "Kolkata", count: 250 },
          { id: "ahmedabad", name: "Ahmedabad", count: 100 },
        ],
      },
      {
        id: "usa",
        name: "United States",
        count: 2800,
        color: "bg-blue-100 text-blue-800",
        cities: [
          { id: "newyork", name: "New York", count: 600 },
          { id: "losangeles", name: "Los Angeles", count: 500 },
          { id: "chicago", name: "Chicago", count: 400 },
          { id: "houston", name: "Houston", count: 300 },
          { id: "phoenix", name: "Phoenix", count: 250 },
          { id: "philadelphia", name: "Philadelphia", count: 200 },
          { id: "sanantonio", name: "San Antonio", count: 150 },
          { id: "sandiego", name: "San Diego", count: 100 },
        ],
      },
      {
        id: "germany",
        name: "Germany",
        count: 1200,
        color: "bg-red-100 text-red-800",
        cities: [
          { id: "berlin", name: "Berlin", count: 300 },
          { id: "munich", name: "Munich", count: 250 },
          { id: "hamburg", name: "Hamburg", count: 200 },
          { id: "cologne", name: "Cologne", count: 150 },
          { id: "frankfurt", name: "Frankfurt", count: 200 },
          { id: "stuttgart", name: "Stuttgart", count: 100 },
        ],
      },
      {
        id: "uk",
        name: "United Kingdom",
        count: 800,
        color: "bg-green-100 text-green-800",
        cities: [
          { id: "london", name: "London", count: 400 },
          { id: "manchester", name: "Manchester", count: 150 },
          { id: "birmingham", name: "Birmingham", count: 100 },
          { id: "glasgow", name: "Glasgow", count: 80 },
          { id: "liverpool", name: "Liverpool", count: 70 },
        ],
      },
      {
        id: "canada",
        name: "Canada",
        count: 600,
        color: "bg-purple-100 text-purple-800",
        cities: [
          { id: "toronto", name: "Toronto", count: 250 },
          { id: "vancouver", name: "Vancouver", count: 150 },
          { id: "montreal", name: "Montreal", count: 100 },
          { id: "calgary", name: "Calgary", count: 60 },
          { id: "ottawa", name: "Ottawa", count: 40 },
        ],
      },
    ],
  },
  {
    id: "organizers",
    name: "Event Organizers",
    count: 4500,
    icon: Users,
    color: "bg-indigo-100 text-indigo-800",
    type: "audience",
    categories: [
      { id: "corporate", name: "Corporate Events", count: 1200, color: "bg-blue-100 text-blue-800" },
      { id: "conferences", name: "Conferences", count: 1000, color: "bg-green-100 text-green-800" },
      { id: "exhibitions", name: "Exhibitions", count: 800, color: "bg-purple-100 text-purple-800" },
      { id: "tradeshows", name: "Trade Shows", count: 600, color: "bg-orange-100 text-orange-800" },
      { id: "seminars", name: "Seminars", count: 500, color: "bg-red-100 text-red-800" },
      { id: "workshops", name: "Workshops", count: 400, color: "bg-yellow-100 text-yellow-800" },
    ],
    countries: [
      {
        id: "india",
        name: "India",
        count: 1800,
        color: "bg-orange-100 text-orange-800",
        cities: [
          { id: "mumbai", name: "Mumbai", count: 400 },
          { id: "delhi", name: "Delhi", count: 350 },
          { id: "bangalore", name: "Bangalore", count: 300 },
          { id: "chennai", name: "Chennai", count: 200 },
          { id: "pune", name: "Pune", count: 180 },
          { id: "hyderabad", name: "Hyderabad", count: 150 },
          { id: "kolkata", name: "Kolkata", count: 120 },
          { id: "ahmedabad", name: "Ahmedabad", count: 100 },
        ],
      },
      {
        id: "usa",
        name: "United States",
        count: 1500,
        color: "bg-blue-100 text-blue-800",
        cities: [
          { id: "newyork", name: "New York", count: 350 },
          { id: "losangeles", name: "Los Angeles", count: 280 },
          { id: "chicago", name: "Chicago", count: 220 },
          { id: "houston", name: "Houston", count: 180 },
          { id: "phoenix", name: "Phoenix", count: 150 },
          { id: "philadelphia", name: "Philadelphia", count: 120 },
          { id: "sanantonio", name: "San Antonio", count: 100 },
          { id: "sandiego", name: "San Diego", count: 100 },
        ],
      },
      {
        id: "uk",
        name: "United Kingdom",
        count: 600,
        color: "bg-green-100 text-green-800",
        cities: [
          { id: "london", name: "London", count: 300 },
          { id: "manchester", name: "Manchester", count: 100 },
          { id: "birmingham", name: "Birmingham", count: 80 },
          { id: "glasgow", name: "Glasgow", count: 50 },
          { id: "liverpool", name: "Liverpool", count: 40 },
          { id: "leeds", name: "Leeds", count: 30 },
        ],
      },
      {
        id: "germany",
        name: "Germany",
        count: 400,
        color: "bg-red-100 text-red-800",
        cities: [
          { id: "berlin", name: "Berlin", count: 120 },
          { id: "munich", name: "Munich", count: 100 },
          { id: "hamburg", name: "Hamburg", count: 70 },
          { id: "cologne", name: "Cologne", count: 50 },
          { id: "frankfurt", name: "Frankfurt", count: 40 },
          { id: "stuttgart", name: "Stuttgart", count: 20 },
        ],
      },
      {
        id: "canada",
        name: "Canada",
        count: 200,
        color: "bg-purple-100 text-purple-800",
        cities: [
          { id: "toronto", name: "Toronto", count: 80 },
          { id: "vancouver", name: "Vancouver", count: 50 },
          { id: "montreal", name: "Montreal", count: 40 },
          { id: "calgary", name: "Calgary", count: 20 },
          { id: "ottawa", name: "Ottawa", count: 10 },
        ],
      },
    ],
  },
  {
    id: "speakers",
    name: "Speakers",
    count: 3200,
    icon: Users,
    color: "bg-yellow-100 text-yellow-800",
    type: "audience",
    categories: [
      { id: "keynote", name: "Keynote Speakers", count: 800, color: "bg-red-100 text-red-800" },
      { id: "industry", name: "Industry Experts", count: 700, color: "bg-blue-100 text-blue-800" },
      { id: "academic", name: "Academic Speakers", count: 600, color: "bg-green-100 text-green-800" },
      { id: "motivational", name: "Motivational Speakers", count: 500, color: "bg-purple-100 text-purple-800" },
      { id: "technical", name: "Technical Speakers", count: 400, color: "bg-indigo-100 text-indigo-800" },
      { id: "panel", name: "Panel Speakers", count: 200, color: "bg-orange-100 text-orange-800" },
    ],
    countries: [
      {
        id: "india",
        name: "India",
        count: 1200,
        color: "bg-orange-100 text-orange-800",
        cities: [
          { id: "mumbai", name: "Mumbai", count: 280 },
          { id: "delhi", name: "Delhi", count: 250 },
          { id: "bangalore", name: "Bangalore", count: 220 },
          { id: "chennai", name: "Chennai", count: 150 },
          { id: "pune", name: "Pune", count: 120 },
          { id: "hyderabad", name: "Hyderabad", count: 100 },
          { id: "kolkata", name: "Kolkata", count: 50 },
          { id: "ahmedabad", name: "Ahmedabad", count: 30 },
        ],
      },
      {
        id: "usa",
        name: "United States",
        count: 1000,
        color: "bg-blue-100 text-blue-800",
        cities: [
          { id: "newyork", name: "New York", count: 250 },
          { id: "losangeles", name: "Los Angeles", count: 200 },
          { id: "chicago", name: "Chicago", count: 150 },
          { id: "houston", name: "Houston", count: 120 },
          { id: "phoenix", name: "Phoenix", count: 100 },
          { id: "philadelphia", name: "Philadelphia", count: 80 },
          { id: "sanantonio", name: "San Antonio", count: 60 },
          { id: "sandiego", name: "San Diego", count: 40 },
        ],
      },
      {
        id: "uk",
        name: "United Kingdom",
        count: 500,
        color: "bg-green-100 text-green-800",
        cities: [
          { id: "london", name: "London", count: 250 },
          { id: "manchester", name: "Manchester", count: 80 },
          { id: "birmingham", name: "Birmingham", count: 60 },
          { id: "glasgow", name: "Glasgow", count: 40 },
          { id: "liverpool", name: "Liverpool", count: 35 },
          { id: "leeds", name: "Leeds", count: 25 },
          { id: "sheffield", name: "Sheffield", count: 10 },
        ],
      },
      {
        id: "germany",
        name: "Germany",
        count: 300,
        color: "bg-red-100 text-red-800",
        cities: [
          { id: "berlin", name: "Berlin", count: 100 },
          { id: "munich", name: "Munich", count: 80 },
          { id: "hamburg", name: "Hamburg", count: 50 },
          { id: "cologne", name: "Cologne", count: 30 },
          { id: "frankfurt", name: "Frankfurt", count: 25 },
          { id: "stuttgart", name: "Stuttgart", count: 15 },
        ],
      },
      {
        id: "canada",
        name: "Canada",
        count: 200,
        color: "bg-purple-100 text-purple-800",
        cities: [
          { id: "toronto", name: "Toronto", count: 80 },
          { id: "vancouver", name: "Vancouver", count: 50 },
          { id: "montreal", name: "Montreal", count: 40 },
          { id: "calgary", name: "Calgary", count: 20 },
          { id: "ottawa", name: "Ottawa", count: 10 },
        ],
      },
    ],
  },
  {
    id: "venues",
    name: "Venues",
    count: 1800,
    icon: Users,
    color: "bg-teal-100 text-teal-800",
    type: "audience",
    categories: [
      { id: "convention", name: "Convention Centers", count: 500, color: "bg-blue-100 text-blue-800" },
      { id: "hotels", name: "Hotels", count: 400, color: "bg-green-100 text-green-800" },
      { id: "conference", name: "Conference Halls", count: 300, color: "bg-purple-100 text-purple-800" },
      { id: "outdoor", name: "Outdoor Venues", count: 250, color: "bg-orange-100 text-orange-800" },
      { id: "exhibition", name: "Exhibition Centers", count: 200, color: "bg-red-100 text-red-800" },
      { id: "auditoriums", name: "Auditoriums", count: 150, color: "bg-yellow-100 text-yellow-800" },
    ],
    countries: [
      {
        id: "india",
        name: "India",
        count: 700,
        color: "bg-orange-100 text-orange-800",
        cities: [
          { id: "mumbai", name: "Mumbai", count: 150 },
          { id: "delhi", name: "Delhi", count: 140 },
          { id: "bangalore", name: "Bangalore", count: 120 },
          { id: "chennai", name: "Chennai", count: 80 },
          { id: "pune", name: "Pune", count: 70 },
          { id: "hyderabad", name: "Hyderabad", count: 60 },
          { id: "kolkata", name: "Kolkata", count: 50 },
          { id: "ahmedabad", name: "Ahmedabad", count: 30 },
        ],
      },
      {
        id: "usa",
        name: "United States",
        count: 600,
        color: "bg-blue-100 text-blue-800",
        cities: [
          { id: "newyork", name: "New York", count: 150 },
          { id: "losangeles", name: "Los Angeles", count: 120 },
          { id: "chicago", name: "Chicago", count: 100 },
          { id: "houston", name: "Houston", count: 80 },
          { id: "phoenix", name: "Phoenix", count: 60 },
          { id: "philadelphia", name: "Philadelphia", count: 40 },
          { id: "sanantonio", name: "San Antonio", count: 30 },
          { id: "sandiego", name: "San Diego", count: 20 },
        ],
      },
      {
        id: "uk",
        name: "United Kingdom",
        count: 250,
        color: "bg-green-100 text-green-800",
        cities: [
          { id: "london", name: "London", count: 120 },
          { id: "manchester", name: "Manchester", count: 40 },
          { id: "birmingham", name: "Birmingham", count: 30 },
          { id: "glasgow", name: "Glasgow", count: 20 },
          { id: "liverpool", name: "Liverpool", count: 20 },
          { id: "leeds", name: "Leeds", count: 15 },
          { id: "sheffield", name: "Sheffield", count: 5 },
        ],
      },
      {
        id: "germany",
        name: "Germany",
        count: 150,
        color: "bg-red-100 text-red-800",
        cities: [
          { id: "berlin", name: "Berlin", count: 50 },
          { id: "munich", name: "Munich", count: 40 },
          { id: "hamburg", name: "Hamburg", count: 25 },
          { id: "cologne", name: "Cologne", count: 15 },
          { id: "frankfurt", name: "Frankfurt", count: 15 },
          { id: "stuttgart", name: "Stuttgart", count: 5 },
        ],
      },
      {
        id: "canada",
        name: "Canada",
        count: 100,
        color: "bg-purple-100 text-purple-800",
        cities: [
          { id: "toronto", name: "Toronto", count: 40 },
          { id: "vancouver", name: "Vancouver", count: 25 },
          { id: "montreal", name: "Montreal", count: 20 },
          { id: "calgary", name: "Calgary", count: 10 },
          { id: "ottawa", name: "Ottawa", count: 5 },
        ],
      },
    ],
  },
]

// Add new state variables for the hierarchical structure

// Add handler functions

// Update the calculateTargetAudience function

const mockPromotions: Promotion[] = [
  {
    id: "1",
    type: "push",
    title: "🚀 New Tech Conference Alert!",
    content: "Join the biggest technology conference of the year. Early bird tickets available now with 30% discount!",
    targetCategories: ["technology", "business"],
    status: "sent",
    priority: "high",
    createdAt: "2024-01-15T10:30:00",
    sentAt: "2024-01-15T14:00:00",
    stats: { sent: 21400, delivered: 20980, opened: 15980, clicked: 3196, bounced: 420 },
    engagement: { openRate: 76.2, clickRate: 20.0, deliveryRate: 98.0 },
  },
  {
    id: "2",
    type: "email",
    title: "📅 Weekly Event Newsletter - January Edition",
    content:
      "Discover amazing events happening this week in your area. From tech meetups to cultural festivals, we've got you covered!",
    targetCategories: ["all"],
    status: "sent",
    priority: "medium",
    createdAt: "2024-01-14T09:00:00",
    sentAt: "2024-01-14T18:00:00",
    stats: { sent: 95000, delivered: 93100, opened: 38000, clicked: 7600, bounced: 1900, unsubscribed: 45 },
    engagement: { openRate: 40.8, clickRate: 20.0, deliveryRate: 98.0 },
  },
  {
    id: "3",
    type: "push",
    title: "🏥 Healthcare Summit 2024 - Register Now",
    content: "Leading healthcare professionals gathering for innovation discussions. Limited seats available!",
    targetCategories: ["healthcare"],
    status: "scheduled",
    priority: "high",
    createdAt: "2024-01-13T16:45:00",
    scheduledAt: "2024-01-20T09:00:00",
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0 },
    engagement: { openRate: 0, clickRate: 0, deliveryRate: 0 },
  },
  {
    id: "4",
    type: "email",
    title: "🍽️ Food Festival Weekend - Taste the World",
    content: "Experience cuisines from around the globe this weekend! Special discounts for early registrations.",
    targetCategories: ["food", "entertainment"],
    status: "sending",
    priority: "medium",
    createdAt: "2024-01-12T11:20:00",
    stats: { sent: 2800, delivered: 2750, opened: 890, clicked: 156, bounced: 50 },
    engagement: { openRate: 32.4, clickRate: 17.5, deliveryRate: 98.2 },
  },
  {
    id: "5",
    type: "push",
    title: "🎨 Art Exhibition Opening Tonight",
    content:
      "Don't miss the grand opening of the contemporary art exhibition featuring local and international artists.",
    targetCategories: ["arts"],
    status: "draft",
    priority: "low",
    createdAt: "2024-01-11T14:15:00",
    stats: { sent: 0, delivered: 0, opened: 0, clicked: 0 },
    engagement: { openRate: 0, clickRate: 0, deliveryRate: 0 },
  },
]

export default function PromotionsManagement() {
  const [activeTab, setActiveTab] = useState("overview")
  const [promotions, setPromotions] = useState<Promotion[]>(mockPromotions)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [selectedPromotionType, setSelectedPromotionType] = useState<"push" | "email">("push")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null)
  const [newPromotion, setNewPromotion] = useState({
    title: "",
    content: "",
    scheduledAt: "",
    priority: "medium" as "low" | "medium" | "high",
    sendImmediately: true,
  })

  // Add new state variables for the hierarchical structure
  const [expandedAudiences, setExpandedAudiences] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  const handleUseTemplate = (template: CampaignTemplate) => {
    setSelectedPromotionType(template.type)
    setNewPromotion({
      title: template.title,
      content: template.content,
      scheduledAt: "",
      priority: template.priority,
      sendImmediately: true,
    })
    setSelectedCategories(template.suggestedCategories)
    setIsTemplateDialogOpen(false)
    setIsCreateDialogOpen(true)
  }

  const handleCreatePromotion = () => {
    const newPromo: Promotion = {
      id: Date.now().toString(),
      type: selectedPromotionType,
      title: newPromotion.title,
      content: newPromotion.content,
      targetCategories: selectedCategories,
      status: newPromotion.sendImmediately ? "sending" : "scheduled",
      priority: newPromotion.priority,
      createdAt: new Date().toISOString(),
      scheduledAt: newPromotion.sendImmediately ? undefined : newPromotion.scheduledAt,
      stats: { sent: 0, delivered: 0, opened: 0, clicked: 0 },
      engagement: { openRate: 0, clickRate: 0, deliveryRate: 0 },
    }

    setPromotions((prev) => [newPromo, ...prev])
    setIsCreateDialogOpen(false)
    setNewPromotion({
      title: "",
      content: "",
      scheduledAt: "",
      priority: "medium",
      sendImmediately: true,
    })
    setSelectedCategories([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800 border-green-200"
      case "sending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "push":
        return <Bell className="w-5 h-5 text-blue-600" />
      case "email":
        return <Mail className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5" />
    }
  }

  const filteredPromotions = promotions.filter((promo) => {
    const statusMatch = filterStatus === "all" || promo.status === filterStatus
    const typeMatch = filterType === "all" || promo.type === filterType
    return statusMatch && typeMatch
  })

  const totalStats = promotions.reduce(
    (acc, promo) => ({
      sent: acc.sent + promo.stats.sent,
      delivered: acc.delivered + promo.stats.delivered,
      opened: acc.opened + promo.stats.opened,
      clicked: acc.clicked + promo.stats.clicked,
    }),
    { sent: 0, delivered: 0, opened: 0, clicked: 0 },
  )

  const avgEngagement = {
    openRate:
      promotions.length > 0 ? promotions.reduce((acc, p) => acc + p.engagement.openRate, 0) / promotions.length : 0,
    clickRate:
      promotions.length > 0 ? promotions.reduce((acc, p) => acc + p.engagement.clickRate, 0) / promotions.length : 0,
    deliveryRate:
      promotions.length > 0 ? promotions.reduce((acc, p) => acc + p.engagement.deliveryRate, 0) / promotions.length : 0,
  }

  const pushTemplates = campaignTemplates.filter((t) => t.type === "push")
  const emailTemplates = campaignTemplates.filter((t) => t.type === "email")

  // Add handler functions
  const handleAudienceToggle = (audienceId: string) => {
    setExpandedAudiences((prev) =>
      prev.includes(audienceId) ? prev.filter((id) => id !== audienceId) : [...prev, audienceId],
    )
  }

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Update the calculateTargetAudience function
  // Enhanced target audience calculation with detailed breakdown
  const calculateTargetAudience = () => {
    // If "All Users" is selected, return the total count
    if (selectedCategories.includes("all")) {
      return { total: targetAudiences.find((aud) => aud.id === "all")?.count || 0, breakdown: ["All Users: 95,000"] }
    }

    let totalUsers = 0
    const processedIds = new Set() // Prevent double counting
    const breakdown:any = [] // Store breakdown details

    selectedCategories.forEach((selectedId) => {
      // Skip if already processed to avoid double counting
      if (processedIds.has(selectedId)) return

      // Check if it's a main audience (like "attendees", "exhibitors", etc.)
      const mainAudience = targetAudiences.find((aud) => aud.id === selectedId)
      if (mainAudience) {
        totalUsers += mainAudience.count
        processedIds.add(selectedId)
        breakdown.push(`${mainAudience.name}: ${mainAudience.count.toLocaleString()}`)
        return
      }

      // Parse the selectedId to understand the hierarchy
      const idParts = selectedId.split("-")

      if (idParts.length >= 2) {
        const [audienceId, secondPart, thirdPart, fourthPart] = idParts

        const audience = targetAudiences.find((aud) => aud.id === audienceId)
        if (!audience) return

        // Handle "all-categories" and "all-countries" selections
        if (secondPart === "all" && thirdPart === "categories") {
          const categoryTotal = audience.categories?.reduce((sum, cat) => sum + cat.count, 0) || 0
          totalUsers += categoryTotal
          processedIds.add(selectedId)
          breakdown.push(`All ${audience.name} Categories: ${categoryTotal.toLocaleString()}`)
          return
        }

        if (secondPart === "all" && thirdPart === "countries") {
          const countryTotal = audience.countries?.reduce((sum, country) => sum + country.count, 0) || 0
          totalUsers += countryTotal
          processedIds.add(selectedId)
          breakdown.push(`All ${audience.name} Countries: ${countryTotal.toLocaleString()}`)
          return
        }

        // Handle individual city selections: audienceId-countryId-cityId
        if (thirdPart && fourthPart === undefined && !thirdPart.includes("all")) {
          // Check if it's a city selection
          const country = audience.countries?.find((c) => c.id === secondPart)
          const city = country?.cities?.find((c) => c.id === thirdPart)
          if (city && !processedIds.has(selectedId)) {
            totalUsers += city.count
            processedIds.add(selectedId)
            breakdown.push(`${city.name}, ${country?.name}: ${city.count.toLocaleString()}`)
            return
          }
        }

        // Handle "all cities" selection: audienceId-countryId-all-cities
        if (thirdPart === "all" && fourthPart === "cities") {
          const country = audience.countries?.find((c) => c.id === secondPart)
          if (country && !processedIds.has(selectedId)) {
            const cityTotal = country.cities?.reduce((sum, city) => sum + city.count, 0) || 0
            totalUsers += cityTotal
            processedIds.add(selectedId)
            breakdown.push(`All cities in ${country.name}: ${cityTotal.toLocaleString()}`)
          }
          return
        }

        // Handle individual category or country selections: audienceId-categoryId or audienceId-countryId
        if (secondPart && !thirdPart) {
          const category = audience.categories?.find((cat) => cat.id === secondPart)
          const country = audience.countries?.find((c) => c.id === secondPart)

          if (category && !processedIds.has(selectedId)) {
            totalUsers += category.count
            processedIds.add(selectedId)
            breakdown.push(`${category.name} (${audience.name}): ${category.count.toLocaleString()}`)
          } else if (country && !processedIds.has(selectedId)) {
            totalUsers += country.count
            processedIds.add(selectedId)
            breakdown.push(`${country.name} (${audience.name}): ${country.count.toLocaleString()}`)
          }
        }
      }
    })

    return { total: totalUsers, breakdown }
  }

  // Add a helper function to get the breakdown details
  const getTargetAudienceBreakdown = () => {
    const result = calculateTargetAudience()
    return typeof result === "object" ? result : { total: result, breakdown: [] }
  }

  // Update the function call to handle both old and new return formats
  const getTargetAudienceTotal = () => {
    const result = calculateTargetAudience()
    return typeof result === "object" ? result.total : result
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promotions Management</h1>
          <p className="text-gray-600 mt-1">
            Manage push notifications and email campaigns with targeted user engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 bg-transparent border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <Template className="w-4 h-4" />
                Use Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                  Campaign Templates
                </DialogTitle>
                <DialogDescription>
                  Choose from our professionally crafted templates to create effective campaigns quickly
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="push" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="push" className="gap-2">
                    <Bell className="w-4 h-4" />
                    Push Templates ({pushTemplates.length})
                  </TabsTrigger>
                  <TabsTrigger value="email" className="gap-2">
                    <Mail className="w-4 h-4" />
                    Email Templates ({emailTemplates.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="push" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pushTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{template.icon}</div>
                              <div>
                                <h3 className="font-semibold text-lg">{template.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                            <Badge className={getPriorityColor(template.priority)}>{template.priority}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <p className="font-medium text-sm mb-1">Title:</p>
                            <p className="text-sm text-gray-700 mb-2">{template.title}</p>
                            <p className="font-medium text-sm mb-1">Content:</p>
                            <p className="text-sm text-gray-700">{template.content}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Targets: {template.suggestedCategories.join(", ")}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleUseTemplate(template)}
                              className="gap-1 bg-blue-600 hover:bg-blue-700"
                            >
                              <Copy className="w-3 h-3" />
                              Use Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="email" className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 gap-4">
                    {emailTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-green-500"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{template.icon}</div>
                              <div>
                                <h3 className="font-semibold text-lg">{template.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {template.category}
                                </Badge>
                              </div>
                            </div>
                            <Badge className={getPriorityColor(template.priority)}>{template.priority}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <p className="font-medium text-sm mb-2">Subject Line:</p>
                            <p className="text-sm text-gray-700 mb-3">{template.title}</p>
                            <p className="font-medium text-sm mb-2">Email Content Preview:</p>
                            <div className="text-sm text-gray-700 max-h-32 overflow-y-auto whitespace-pre-line">
                              {template.content.substring(0, 300)}...
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Targets: {template.suggestedCategories.join(", ")}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleUseTemplate(template)}
                              className="gap-1 bg-green-600 hover:bg-green-700"
                            >
                              <Copy className="w-3 h-3" />
                              Use Template
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Plus className="w-4 h-4" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Create New Campaign</DialogTitle>
                <DialogDescription>
                  Create targeted promotions for specific user categories with advanced options
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Campaign Type Selection */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Choose Your Campaign Type</Label>
                  <p className="text-sm text-gray-600">Select the best way to reach your audience:</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPromotionType === "push"
                          ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200"
                          : "hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPromotionType("push")}
                    >
                      <CardContent className="p-6 text-center">
                        <Bell className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                        <h3 className="font-semibold text-lg mb-2">📱 Push Notification</h3>
                        <p className="text-sm text-gray-600 mb-3">Perfect for urgent announcements and quick updates</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>✅ Instant delivery to mobile devices</div>
                          <div>✅ High visibility and open rates</div>
                          <div>✅ Great for time-sensitive messages</div>
                        </div>
                        <div className="mt-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          Best for: Event reminders, flash sales, breaking news
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedPromotionType === "email"
                          ? "ring-2 ring-green-500 bg-green-50 border-green-200"
                          : "hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPromotionType("email")}
                    >
                      <CardContent className="p-6 text-center">
                        <Mail className="w-12 h-12 mx-auto mb-3 text-green-600" />
                        <h3 className="font-semibold text-lg mb-2">📧 Email Campaign</h3>
                        <p className="text-sm text-gray-600 mb-3">Ideal for detailed information and storytelling</p>
                        <div className="text-xs text-gray-500 space-y-1">
                          <div>✅ Rich content with images and formatting</div>
                          <div>✅ Detailed analytics and tracking</div>
                          <div>✅ Professional appearance</div>
                        </div>
                        <div className="mt-3 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Best for: Newsletters, detailed announcements, promotions
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Campaign Details */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="title" className="text-base font-semibold">
                        Campaign Title
                      </Label>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {selectedPromotionType === "push"
                          ? "Keep it short & catchy"
                          : "This becomes your email subject"}
                      </span>
                    </div>
                    <Input
                      id="title"
                      value={newPromotion.title}
                      onChange={(e) => setNewPromotion((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder={
                        selectedPromotionType === "push"
                          ? "🚀 Your exciting push notification title"
                          : "📧 Your compelling email subject line"
                      }
                      className="text-lg"
                    />
                    <div className="text-xs text-gray-500">
                      {selectedPromotionType === "push"
                        ? "💡 Good examples: '🎉 Flash Sale - 50% Off!', '⏰ Event starts in 1 hour'"
                        : "💡 Good examples: 'Weekly Event Digest', 'Exclusive Invitation: Tech Summit 2024'"}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="content" className="text-base font-semibold">
                        Campaign Content
                      </Label>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {selectedPromotionType === "push"
                          ? "Max 100 characters recommended"
                          : "Be detailed and engaging"}
                      </span>
                    </div>
                    <Textarea
                      id="content"
                      value={newPromotion.content}
                      onChange={(e) => setNewPromotion((prev) => ({ ...prev, content: e.target.value }))}
                      placeholder={
                        selectedPromotionType === "push"
                          ? "Write a compelling message that will grab attention on mobile devices..."
                          : "Create engaging email content with rich formatting and clear call-to-action..."
                      }
                      rows={selectedPromotionType === "push" ? 3 : 6}
                      className="resize-none"
                    />
                    <div className="flex justify-between text-sm">
                      <div className="text-gray-500">
                        {selectedPromotionType === "push"
                          ? "📱 Push notifications work best with 50-100 characters"
                          : "📧 Email content can be longer and more detailed with formatting options"}
                      </div>
                      <div className="text-gray-400">{newPromotion.content.length} characters</div>
                    </div>
                  </div>
                </div>

                {/* Priority and Scheduling */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Campaign Priority</Label>
                    <Select
                      value={newPromotion.priority}
                      onValueChange={(value: "low" | "medium" | "high") =>
                        setNewPromotion((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low Priority</SelectItem>
                        <SelectItem value="medium">🟡 Medium Priority</SelectItem>
                        <SelectItem value="high">🔴 High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-base font-semibold">Delivery Options</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={newPromotion.sendImmediately}
                        onCheckedChange={(checked) =>
                          setNewPromotion((prev) => ({ ...prev, sendImmediately: checked }))
                        }
                      />
                      <Label>Send immediately after creation</Label>
                    </div>
                    {!newPromotion.sendImmediately && (
                      <Input
                        type="datetime-local"
                        value={newPromotion.scheduledAt}
                        onChange={(e) => setNewPromotion((prev) => ({ ...prev, scheduledAt: e.target.value }))}
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                {/* Target Audience */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Target Audience</Label>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>💡 Tip: Select specific groups to target your campaign</span>
                    </div>
                  </div>

                  {/* User Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">How to Select Your Audience:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>
                        • <strong>Main Groups:</strong> Select entire user types (All Users, Attendees, Exhibitors,
                        etc.)
                      </li>
                      <li>
                        • <strong>Categories:</strong> Click the arrow to expand and choose specific interests
                      </li>
                      <li>
                        • <strong>Locations:</strong> Target users by country or specific cities
                      </li>
                      <li>
                        • <strong>Mix & Match:</strong> Combine different selections for precise targeting
                      </li>
                    </ul>
                  </div>
                  <div className="max-h-96 overflow-y-auto border rounded-lg bg-gray-50">
                    <div className="space-y-2 p-4">
                      {targetAudiences.map((audience) => (
                        <div key={audience.id} className="border rounded-lg bg-white">
                          {/* Audience Header */}
                          <div className="flex items-center justify-between p-3">
                            <div className="flex items-center space-x-3 flex-1">
                              <Checkbox
                                id={audience.id}
                                checked={selectedCategories.includes(audience.id)}
                                onCheckedChange={() => {
                                  if (selectedCategories.includes(audience.id)) {
                                    setSelectedCategories(selectedCategories.filter((cat) => cat !== audience.id))
                                  } else {
                                    setSelectedCategories([...selectedCategories, audience.id])
                                  }
                                }}
                              />
                              <Label htmlFor={audience.id} className="flex-1 cursor-pointer">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold">{audience.name}</span>
                                  <Badge variant="secondary" className={`text-xs ${audience.color}`}>
                                    {audience.count.toLocaleString()}
                                  </Badge>
                                </div>
                              </Label>
                            </div>
                            {(audience.categories.length > 0 || audience.countries.length > 0) && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAudienceToggle(audience.id)}
                                className="p-1 h-8 w-8"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${
                                    expandedAudiences.includes(audience.id) ? "rotate-180" : ""
                                  }`}
                                />
                              </Button>
                            )}
                          </div>

                          {/* Expanded Content */}
                          {expandedAudiences.includes(audience.id) && (
                            <div className="px-3 pb-3 border-t bg-gray-50 space-y-4">
                              {/* Categories Section */}
                              {audience.categories.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Users className="w-3 h-3" />
                                    Categories
                                  </h5>

                                  {/* All Categories Option */}
                                  <div className="mb-2 p-2 rounded bg-white border">
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        id={`${audience.id}-all-categories`}
                                        checked={selectedCategories.includes(`${audience.id}-all-categories`)}
                                        onCheckedChange={() => {
                                          if (selectedCategories.includes(`${audience.id}-all-categories`)) {
                                            // Remove all category selections for this audience
                                            setSelectedCategories(
                                              selectedCategories.filter(
                                                (cat) =>
                                                  !audience.categories.some(
                                                    (category) => cat === `${audience.id}-${category.id}`,
                                                  ) && cat !== `${audience.id}-all-categories`,
                                              ),
                                            )
                                          } else {
                                            // Add all categories for this audience
                                            const allCategoryIds = audience.categories.map(
                                              (category) => `${audience.id}-${category.id}`,
                                            )
                                            setSelectedCategories([
                                              ...selectedCategories.filter(
                                                (cat) =>
                                                  !audience.categories.some(
                                                    (category) => cat === `${audience.id}-${category.id}`,
                                                  ),
                                              ),
                                              `${audience.id}-all-categories`,
                                              ...allCategoryIds,
                                            ])
                                          }
                                        }}
                                      />
                                      <Label
                                        htmlFor={`${audience.id}-all-categories`}
                                        className="flex-1 cursor-pointer"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-semibold">All Categories</span>
                                          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800">
                                            {audience.categories
                                              .reduce((total, category) => total + category.count, 0)
                                              .toLocaleString()}
                                          </Badge>
                                        </div>
                                      </Label>
                                    </div>
                                  </div>

                                  {/* Individual Categories */}
                                  <div className="grid grid-cols-2 gap-2">
                                    {audience.categories.map((category) => (
                                      <div
                                        key={category.id}
                                        className="flex items-center space-x-2 p-2 rounded hover:bg-white transition-colors border"
                                      >
                                        <Checkbox
                                          id={`${audience.id}-${category.id}`}
                                          checked={
                                            selectedCategories.includes(`${audience.id}-${category.id}`) ||
                                            selectedCategories.includes(`${audience.id}-all-categories`)
                                          }
                                          onCheckedChange={() => {
                                            if (selectedCategories.includes(`${audience.id}-${category.id}`)) {
                                              setSelectedCategories(
                                                selectedCategories.filter(
                                                  (cat) =>
                                                    cat !== `${audience.id}-${category.id}` &&
                                                    cat !== `${audience.id}-all-categories`,
                                                ),
                                              )
                                            } else {
                                              setSelectedCategories([
                                                ...selectedCategories.filter(
                                                  (cat) => cat !== `${audience.id}-all-categories`,
                                                ),
                                                `${audience.id}-${category.id}`,
                                              ])
                                            }
                                          }}
                                        />
                                        <Label
                                          htmlFor={`${audience.id}-${category.id}`}
                                          className="flex-1 cursor-pointer"
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium">{category.name}</span>
                                            <Badge variant="outline" className={`text-xs ${category.color}`}>
                                              {category.count.toLocaleString()}
                                            </Badge>
                                          </div>
                                        </Label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Countries Section */}
                              {audience.countries.length > 0 && (
                                <div>
                                  <h5 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    <Globe className="w-3 h-3" />
                                    Countries & Cities
                                  </h5>
                                  <div className="space-y-2">
                                    {/* All Countries Option */}
                                    <div className="border rounded bg-white p-2">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${audience.id}-all-countries`}
                                          checked={selectedCategories.includes(`${audience.id}-all-countries`)}
                                          onCheckedChange={() => {
                                            if (selectedCategories.includes(`${audience.id}-all-countries`)) {
                                              // Remove all country selections for this audience
                                              setSelectedCategories(
                                                selectedCategories.filter(
                                                  (cat) =>
                                                    !cat.startsWith(`${audience.id}-`) ||
                                                    (!cat.includes("-india") &&
                                                      !cat.includes("-usa") &&
                                                      !cat.includes("-uk") &&
                                                      !cat.includes("-germany") &&
                                                      !cat.includes("-canada") &&
                                                      cat !== `${audience.id}-all-countries`),
                                                ),
                                              )
                                            } else {
                                              // Add all countries for this audience
                                              const allCountryIds = audience.countries.map(
                                                (country) => `${audience.id}-${country.id}`,
                                              )
                                              setSelectedCategories([
                                                ...selectedCategories.filter(
                                                  (cat) =>
                                                    !cat.startsWith(`${audience.id}-`) ||
                                                    (!cat.includes("-india") &&
                                                      !cat.includes("-usa") &&
                                                      !cat.includes("-uk") &&
                                                      !cat.includes("-germany") &&
                                                      !cat.includes("-canada")),
                                                ),
                                                `${audience.id}-all-countries`,
                                                ...allCountryIds,
                                              ])
                                            }
                                          }}
                                        />
                                        <Label
                                          htmlFor={`${audience.id}-all-countries`}
                                          className="flex-1 cursor-pointer"
                                        >
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs font-semibold">All Countries</span>
                                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                                              {audience.countries
                                                .reduce((total, country) => total + country.count, 0)
                                                .toLocaleString()}
                                            </Badge>
                                          </div>
                                        </Label>
                                      </div>
                                    </div>

                                    {/* Individual Countries */}
                                    {audience.countries.map((country) => (
                                      <div key={`${audience.id}-${country.id}`} className="border rounded bg-white">
                                        {/* Country Header */}
                                        <div className="flex items-center justify-between p-2">
                                          <div className="flex items-center space-x-2 flex-1">
                                            <Checkbox
                                              id={`${audience.id}-${country.id}`}
                                              checked={
                                                selectedCategories.includes(`${audience.id}-${country.id}`) ||
                                                selectedCategories.includes(`${audience.id}-all-countries`)
                                              }
                                              onCheckedChange={() => {
                                                if (selectedCategories.includes(`${audience.id}-${country.id}`)) {
                                                  // Remove this country and all its cities
                                                  setSelectedCategories(
                                                    selectedCategories.filter(
                                                      (cat) =>
                                                        cat !== `${audience.id}-${country.id}` &&
                                                        !cat.startsWith(`${audience.id}-${country.id}-`) &&
                                                        cat !== `${audience.id}-all-countries`,
                                                    ),
                                                  )
                                                } else {
                                                  // Add this country
                                                  setSelectedCategories([
                                                    ...selectedCategories.filter(
                                                      (cat) => cat !== `${audience.id}-all-countries`,
                                                    ),
                                                    `${audience.id}-${country.id}`,
                                                  ])
                                                }
                                              }}
                                            />
                                            <Label
                                              htmlFor={`${audience.id}-${country.id}`}
                                              className="flex-1 cursor-pointer"
                                            >
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs font-medium">{country.name}</span>
                                                <Badge variant="outline" className={`text-xs ${country.color}`}>
                                                  {country.count.toLocaleString()}
                                                </Badge>
                                              </div>
                                            </Label>
                                          </div>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleCategoryToggle(`${audience.id}-${country.id}-expanded`)
                                            }
                                            className="p-1 h-6 w-6"
                                          >
                                            <ChevronDown
                                              className={`w-3 h-3 transition-transform ${
                                                expandedCategories.includes(`${audience.id}-${country.id}-expanded`)
                                                  ? "rotate-180"
                                                  : ""
                                              }`}
                                            />
                                          </Button>
                                        </div>

                                        {/* Cities List */}
                                        {expandedCategories.includes(`${audience.id}-${country.id}-expanded`) && (
                                          <div className="px-2 pb-2 border-t bg-gray-50">
                                            {/* All Cities Option */}
                                            <div className="mt-2 mb-2 p-1 rounded bg-white">
                                              <div className="flex items-center space-x-1">
                                                <Checkbox
                                                  id={`${audience.id}-${country.id}-all-cities`}
                                                  checked={
                                                    selectedCategories.includes(
                                                      `${audience.id}-${country.id}-all-cities`,
                                                    ) ||
                                                    selectedCategories.includes(`${audience.id}-${country.id}`) ||
                                                    selectedCategories.includes(`${audience.id}-all-countries`)
                                                  }
                                                  onCheckedChange={() => {
                                                    if (
                                                      selectedCategories.includes(
                                                        `${audience.id}-${country.id}-all-cities`,
                                                      )
                                                    ) {
                                                      // Remove all cities for this country
                                                      setSelectedCategories(
                                                        selectedCategories.filter(
                                                          (cat) =>
                                                            !cat.startsWith(`${audience.id}-${country.id}-`) ||
                                                            cat === `${audience.id}-${country.id}-expanded`,
                                                        ),
                                                      )
                                                    } else {
                                                      // Add all cities for this country
                                                      const allCityIds = country.cities.map(
                                                        (city) => `${audience.id}-${country.id}-${city.id}`,
                                                      )
                                                      setSelectedCategories([
                                                        ...selectedCategories.filter(
                                                          (cat) =>
                                                            !cat.startsWith(`${audience.id}-${country.id}-`) ||
                                                            cat === `${audience.id}-${country.id}-expanded`,
                                                        ),
                                                        `${audience.id}-${country.id}-all-cities`,
                                                        ...allCityIds,
                                                      ])
                                                    }
                                                  }}
                                                />
                                                <Label
                                                  htmlFor={`${audience.id}-${country.id}-all-cities`}
                                                  className="flex-1 cursor-pointer"
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold">All Cities</span>
                                                    <Badge
                                                      variant="outline"
                                                      className="text-xs bg-green-100 text-green-800"
                                                    >
                                                      {country.cities
                                                        .reduce((total, city) => total + city.count, 0)
                                                        .toLocaleString()}
                                                    </Badge>
                                                  </div>
                                                </Label>
                                              </div>
                                            </div>

                                            {/* Individual Cities */}
                                            <div className="grid grid-cols-2 gap-1">
                                              {country.cities.map((city) => (
                                                <div
                                                  key={`${audience.id}-${country.id}-${city.id}`}
                                                  className="flex items-center space-x-1 p-1 rounded hover:bg-white transition-colors"
                                                >
                                                  <Checkbox
                                                    id={`${audience.id}-${country.id}-${city.id}`}
                                                    checked={
                                                      selectedCategories.includes(
                                                        `${audience.id}-${country.id}-${city.id}`,
                                                      ) ||
                                                      selectedCategories.includes(
                                                        `${audience.id}-${country.id}-all-cities`,
                                                      ) ||
                                                      selectedCategories.includes(`${audience.id}-${country.id}`) ||
                                                      selectedCategories.includes(`${audience.id}-all-countries`)
                                                    }
                                                    onCheckedChange={() => {
                                                      if (
                                                        selectedCategories.includes(
                                                          `${audience.id}-${country.id}-${city.id}`,
                                                        )
                                                      ) {
                                                        setSelectedCategories(
                                                          selectedCategories.filter(
                                                            (cat) =>
                                                              cat !== `${audience.id}-${country.id}-${city.id}` &&
                                                              cat !== `${audience.id}-${country.id}-all-cities` &&
                                                              cat !== `${audience.id}-${country.id}` &&
                                                              cat !== `${audience.id}-all-countries`,
                                                          ),
                                                        )
                                                      } else {
                                                        setSelectedCategories([
                                                          ...selectedCategories.filter(
                                                            (cat) =>
                                                              cat !== `${audience.id}-${country.id}-all-cities` &&
                                                              cat !== `${audience.id}-${country.id}` &&
                                                              cat !== `${audience.id}-all-countries`,
                                                          ),
                                                          `${audience.id}-${country.id}-${city.id}`,
                                                        ])
                                                      }
                                                    }}
                                                  />
                                                  <Label
                                                    htmlFor={`${audience.id}-${country.id}-${city.id}`}
                                                    className="flex-1 cursor-pointer"
                                                  >
                                                    <div className="flex items-center justify-between">
                                                      <span className="text-xs">{city.name}</span>
                                                      <Badge variant="outline" className="text-xs">
                                                        {city.count.toLocaleString()}
                                                      </Badge>
                                                    </div>
                                                  </Label>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedCategories.length > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Target className="w-5 h-5 text-blue-600 mt-1" />
                          <div className="flex-1">
                            <div className="font-semibold text-blue-800 mb-2">
                              Target Audience: {(() => {
                                const result = getTargetAudienceBreakdown()
                                return result.total.toLocaleString()
                              })()} users
                            </div>
                            <div className="text-sm text-blue-600 mb-3">
                              Selected: {selectedCategories.length} target{selectedCategories.length !== 1 ? "s" : ""}
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="space-y-2">
                              <div className="text-xs font-medium text-blue-700 mb-1">Breakdown:</div>
                              <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                                {(() => {
                                  const result = getTargetAudienceBreakdown()
                                  return result.breakdown.map((item:any, index:any) => (
                                    <div
                                      key={index}
                                      className="text-xs text-blue-600 bg-white px-2 py-1 rounded border"
                                    >
                                      {item}
                                    </div>
                                  ))
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <DialogFooter className="gap-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePromotion}
                  disabled={!newPromotion.title || !newPromotion.content || selectedCategories.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {newPromotion.sendImmediately ? "Create & Send" : "Create & Schedule"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{promotions.length}</p>
                <p className="text-xs text-gray-500 mt-1">Active campaigns</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages Sent</p>
                <p className="text-3xl font-bold text-gray-900">{totalStats.sent.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">↗ {avgEngagement.deliveryRate.toFixed(1)}% delivery rate</p>
              </div>
              <Send className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Opens</p>
                <p className="text-3xl font-bold text-gray-900">{totalStats.opened.toLocaleString()}</p>
                <p className="text-xs text-purple-600 mt-1">↗ {avgEngagement.openRate.toFixed(1)}% open rate</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900">{totalStats.clicked.toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-1">↗ {avgEngagement.clickRate.toFixed(1)}% click rate</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Instructions */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 mt-1">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">How to Use Filters:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
                <div>
                  <strong>Status Filter:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>
                      • <strong>Draft:</strong> Campaigns being created
                    </li>
                    <li>
                      • <strong>Scheduled:</strong> Set to send later
                    </li>
                    <li>
                      • <strong>Sending:</strong> Currently being delivered
                    </li>
                    <li>
                      • <strong>Sent:</strong> Successfully delivered
                    </li>
                  </ul>
                </div>
                <div>
                  <strong>Type Filter:</strong>
                  <ul className="mt-1 space-y-1">
                    <li>
                      • <strong>Push Notifications:</strong> Mobile alerts
                    </li>
                    <li>
                      • <strong>Email Campaigns:</strong> Email messages
                    </li>
                    <li>
                      • <strong>All Types:</strong> Show everything
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Label className="text-sm font-medium">Filters:</Label>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="sending">Sending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="push">Push Notifications</SelectItem>
                <SelectItem value="email">Email Campaigns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Campaigns List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            All Campaigns ({filteredPromotions.length})
          </TabsTrigger>
          <TabsTrigger value="push" className="gap-2">
            <Bell className="w-4 h-4" />
            Push Notifications ({filteredPromotions.filter((p) => p.type === "push").length})
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Campaigns ({filteredPromotions.filter((p) => p.type === "email").length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid gap-6">
            {filteredPromotions.map((promotion) => (
              <Card key={promotion.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        {getTypeIcon(promotion.type)}
                        <h3 className="text-xl font-semibold text-gray-900">{promotion.title}</h3>
                        <Badge className={`${getStatusColor(promotion.status)} border`}>{promotion.status}</Badge>
                        <Badge className={`${getPriorityColor(promotion.priority)} border`}>
                          {promotion.priority} priority
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">{promotion.content}</p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {new Date(promotion.createdAt).toLocaleDateString()}</span>
                        </div>
                        {promotion.scheduledAt && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Scheduled: {new Date(promotion.scheduledAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          <span>Categories: {promotion.targetCategories.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                        <Edit className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-red-600 hover:text-red-700 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {promotion.stats.sent > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{promotion.stats.sent.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Sent</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {promotion.stats.delivered.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">Delivered</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">{promotion.stats.opened.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Opened</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{promotion.stats.clicked.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Clicked</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600">
                          {promotion.engagement.openRate.toFixed(1)}%
                        </p>
                        <p className="text-sm text-gray-600">Open Rate</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="push" className="space-y-4 mt-6">
          <div className="grid gap-6">
            {filteredPromotions
              .filter((p) => p.type === "push")
              .map((promotion) => (
                <Card key={promotion.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Bell className="w-6 h-6 text-blue-600" />
                          <h3 className="text-xl font-semibold text-gray-900">{promotion.title}</h3>
                          <Badge className={`${getStatusColor(promotion.status)} border`}>{promotion.status}</Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{promotion.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📱 Push Notification</span>
                          <span>Created: {new Date(promotion.createdAt).toLocaleDateString()}</span>
                          <span>Categories: {promotion.targetCategories.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                    {promotion.stats.sent > 0 && (
                      <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="text-xl font-bold text-blue-600">{promotion.stats.sent.toLocaleString()}</p>
                          <p className="text-xs text-gray-600">Sent</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-600">
                            {promotion.stats.delivered.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">Delivered</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-purple-600">{promotion.stats.opened.toLocaleString()}</p>
                          <p className="text-xs text-gray-600">Opened</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-orange-600">
                            {promotion.engagement.openRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-600">Open Rate</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4 mt-6">
          <div className="grid gap-6">
            {filteredPromotions
              .filter((p) => p.type === "email")
              .map((promotion) => (
                <Card key={promotion.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Mail className="w-6 h-6 text-green-600" />
                          <h3 className="text-xl font-semibold text-gray-900">{promotion.title}</h3>
                          <Badge className={`${getStatusColor(promotion.status)} border`}>{promotion.status}</Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{promotion.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>📧 Email Campaign</span>
                          <span>Created: {new Date(promotion.createdAt).toLocaleDateString()}</span>
                          <span>Categories: {promotion.targetCategories.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                    {promotion.stats.sent > 0 && (
                      <div className="grid grid-cols-5 gap-4 pt-4 border-t">
                        <div className="text-center">
                          <p className="text-xl font-bold text-blue-600">{promotion.stats.sent.toLocaleString()}</p>
                          <p className="text-xs text-gray-600">Sent</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-600">
                            {promotion.stats.delivered.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">Delivered</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-purple-600">{promotion.stats.opened.toLocaleString()}</p>
                          <p className="text-xs text-gray-600">Opened</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-orange-600">
                            {promotion.stats.clicked.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600">Clicked</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-indigo-600">
                            {promotion.engagement.clickRate.toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-600">Click Rate</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
