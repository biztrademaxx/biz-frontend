"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default function ContactPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-lg text-muted-foreground">
          Let’s Connect & Grow Together
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Have questions, need support, or looking to partner with us?
          We’d love to hear from you. We are committed to helping organizers,
          exhibitors, and visitors succeed through our platform.
        </p>
      </div>

      {/* Contact Info */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle>📩 Email Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>support@biztradefairs.com</p>
          </CardContent>
        </Card>

        {/* Phone */}
        <Card>
          <CardHeader>
            <CardTitle>📞 Call Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>+91 XXXXX XXXXX</p>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle>📍 Office Address</CardTitle>
          </CardHeader>
          <CardContent>
            <p>BizTradeFairs.com</p>
            <p>(Operated by Maxx Business Media Pvt. Ltd.)</p>
            <p>Bengaluru, Karnataka, India</p>
          </CardContent>
        </Card>

        {/* Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle>🕒 Working Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Monday – Saturday</p>
            <p>10:00 AM – 6:00 PM (IST)</p>
          </CardContent>
        </Card>

      </div>

      {/* Contact Categories */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-center">Contact by Purpose</h2>

        <div className="grid md:grid-cols-2 gap-6">

          <Card>
            <CardHeader>
              <CardTitle>📢 Event Organizers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>• Listing your event</p>
              <p>• Promotion & marketing packages</p>
              <p>• Exhibitor lead generation</p>
              <p className="font-medium">Email: organizers@biztradefairs.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🏢 Exhibitors & Sponsors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>• Participation inquiries</p>
              <p>• Brand promotion opportunities</p>
              <p>• Featured listings</p>
              <p className="font-medium">Email: sales@biztradefairs.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🎯 Visitors & General Queries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>• Finding events</p>
              <p>• Platform assistance</p>
              <p>• Account support</p>
              <p className="font-medium">Email: support@biztradefairs.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🤝 Partnerships</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>• Media partnerships</p>
              <p>• Industry associations</p>
              <p>• Strategic collaborations</p>
              <p className="font-medium">Email: partnerships@biztradefairs.com</p>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Send Us a Message</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input placeholder="Your name" />
            </div>

            <div>
              <Label>Email Address</Label>
              <Input type="email" placeholder="your@email.com" />
            </div>

            <div>
              <Label>Phone Number</Label>
              <Input placeholder="+91 XXXXX XXXXX" />
            </div>

            <div>
              <Label>Inquiry Type</Label>
              <select className="w-full border rounded-md p-2">
                <option>General</option>
                <option>Organizer</option>
                <option>Exhibitor</option>
                <option>Partnership</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Message</Label>
            <Textarea placeholder="Write your message..." rows={4} />
          </div>

          <Button className="w-full">Submit Inquiry</Button>
        </CardContent>
      </Card>

      {/* Social */}
      <div className="text-center space-y-3">
        <h2 className="text-lg font-semibold">Follow Us</h2>
        <div className="flex justify-center gap-6 text-sm text-blue-600">
          <a href="#">LinkedIn</a>
          <a href="#">Instagram</a>
          <a href="#">Facebook</a>
          <a href="#">YouTube</a>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
        Whether you’re organizing an event, exploring opportunities, or growing your business—
        BizTradeFairs.com is your partner in success.
        <br />
        <span className="font-medium">
          Let’s build connections that drive business forward.
        </span>
      </div>

    </div>
  )
}