"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Mail, Loader2, Shield, CheckCircle, Scan } from "lucide-react"
import { VisitorBadge } from "./visitor-badge"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

interface BadgeGeneratorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendee: {
    id: string
    firstName: string
    lastName: string
    email: string
    jobTitle?: string
    company?: string
  }
  event: {
    id: string
    title: string
    images?: string[]
  }
  organizer: {
    avatar?: string
    organizationName?: string
  }
}

export function BadgeGeneratorDialog({ open, onOpenChange, attendee, event, organizer }: BadgeGeneratorDialogProps) {
  const [badgeDataUrl, setBadgeDataUrl] = useState<string>("")
  const [sending, setSending] = useState(false)
  const { toast } = useToast()

  const handleDownload = () => {
    if (!badgeDataUrl) return

    const link = document.createElement("a")
    link.download = `badge-${attendee.firstName}-${attendee.lastName}.png`
    link.href = badgeDataUrl
    link.click()

    toast({
      title: "✅ Badge Downloaded",
      description: "Professional badge has been saved to your device.",
    })
  }

  const handleSendEmail = async () => {
    try {
      setSending(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast({
        title: "📨 Badge Sent",
        description: `The badge has been sent to ${attendee.email}`,
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to send the badge. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <DialogTitle className="text-xl font-bold">Professional Visitor Badge</DialogTitle>
            </div>
            <DialogDescription>
              For <span className="font-semibold text-gray-900">{attendee.firstName} {attendee.lastName}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Badge Preview */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-2">
                {badgeDataUrl ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      Ready to Export
                    </Badge>
                  </>
                ) : (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generating...
                  </Badge>
                )}
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-6 rounded-xl border-2 border-blue-100/50">
                {badgeDataUrl ? (
                  <div className="relative">
                    <img
                      src={badgeDataUrl}
                      alt="Professional Visitor Badge"
                      className="max-w-full h-auto rounded-lg shadow-lg"
                      style={{ maxHeight: "300px" }}
                    />
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-xs">
                        <Scan className="w-3 h-3 mr-1" />
                        Scan Ready
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 space-y-3">
                    <div className="relative">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <div className="absolute inset-0 border-2 border-blue-200 rounded-full animate-ping"></div>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-700">Creating your badge</p>
                      <p className="text-sm text-gray-500">This will just take a moment...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features & Actions */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-blue-600">HD Quality</div>
                  <div className="text-xs text-gray-500">Print Ready</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-green-600">Scan Ready</div>
                  <div className="text-xs text-gray-500">QR Code</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-purple-600">Professional</div>
                  <div className="text-xs text-gray-500">Design</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleDownload} 
                  disabled={!badgeDataUrl}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                
                <Button 
                  onClick={handleSendEmail} 
                  disabled={!badgeDataUrl || sending}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {sending ? "Sending..." : "Email Badge"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <VisitorBadge attendee={attendee} event={event} organizer={organizer} onGenerated={setBadgeDataUrl} />
    </>
  )
}