"use client"

import { useRef, useEffect } from "react"
import QRCode from "qrcode"

interface VisitorBadgeProps {
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
  onGenerated?: (dataUrl: string) => void
}

export function VisitorBadge({ attendee, event, organizer, onGenerated }: VisitorBadgeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    generateBadge()
  }, [attendee, event, organizer])

  const generateBadge = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = 630
    canvas.height = 360

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#f8fafc")
    gradient.addColorStop(1, "#f1f5f9")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Main card
    ctx.fillStyle = "#ffffff"
    ctx.shadowColor = "rgba(0, 0, 0, 0.08)"
    ctx.shadowBlur = 15
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 4
    ctx.fillRect(25, 25, canvas.width - 50, canvas.height - 50)
    ctx.shadowColor = "transparent"

    // Border
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 1
    ctx.strokeRect(25, 25, canvas.width - 50, canvas.height - 50)

    // Header
    const headerGradient = ctx.createLinearGradient(25, 25, canvas.width - 25, 85)
    headerGradient.addColorStop(0, "#3b82f6")
    headerGradient.addColorStop(1, "#1d4ed8")
    ctx.fillStyle = headerGradient
    ctx.fillRect(25, 25, canvas.width - 50, 60)

    // Event title
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 18px 'Arial', sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    const eventTitle = event.title.length > 35 ? event.title.substring(0, 35) + "..." : event.title
    ctx.fillText(eventTitle.toUpperCase(), canvas.width / 2, 55)

    // Left section - Attendee info
    const leftSectionX = 45
    const infoStartY = 110

    // Badge type
    ctx.fillStyle = "#10b981"
    ctx.font = "bold 12px 'Arial', sans-serif"
    ctx.textAlign = "left"
    ctx.fillText("VISITOR BADGE", leftSectionX, infoStartY - 10)

    // Attendee name
    ctx.fillStyle = "#1f2937"
    ctx.font = "bold 26px 'Arial', sans-serif"
    const fullName = `${attendee.firstName} ${attendee.lastName}`
    ctx.fillText(fullName, leftSectionX, infoStartY + 30)

    // Divider line
    ctx.strokeStyle = "#f1f5f9"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(leftSectionX, infoStartY + 45)
    ctx.lineTo(leftSectionX + 320, infoStartY + 45)
    ctx.stroke()

    // Contact info
    const contactStartY = infoStartY + 75

    // Email
    ctx.fillStyle = "#374151"
    ctx.font = "14px 'Arial', sans-serif"
    ctx.fillText("Email:", leftSectionX, contactStartY)
    ctx.fillStyle = "#1f2937"
    ctx.font = "14px 'Arial', sans-serif"
    ctx.fillText(attendee.email, leftSectionX + 50, contactStartY)

    // Job Title
    if (attendee.jobTitle) {
      ctx.fillStyle = "#374151"
      ctx.font = "14px 'Arial', sans-serif"
      ctx.fillText("Title:", leftSectionX, contactStartY + 25)
      ctx.fillStyle = "#1f2937"
      ctx.font = "14px 'Arial', sans-serif"
      ctx.fillText(attendee.jobTitle, leftSectionX + 50, contactStartY + 25)
    }

    // Company
    if (attendee.company) {
      ctx.fillStyle = "#374151"
      ctx.font = "14px 'Arial', sans-serif"
      ctx.fillText("Company:", leftSectionX, contactStartY + 50)
      ctx.fillStyle = "#1f2937"
      ctx.font = "14px 'Arial', sans-serif"
      ctx.fillText(attendee.company, leftSectionX + 70, contactStartY + 50)
    }

    // Event info
    ctx.fillStyle = "#374151"
    ctx.font = "14px 'Arial', sans-serif"
    ctx.fillText("Event:", leftSectionX, contactStartY + 85)
    ctx.fillStyle = "#1f2937"
    ctx.font = "14px 'Arial', sans-serif"
    const eventName = event.title.length > 25 ? event.title.substring(0, 25) + "..." : event.title
    ctx.fillText(eventName, leftSectionX + 50, contactStartY + 85)

    // Right section - QR Code
    const qrSize = 140
    const qrX = canvas.width - 45 - qrSize
    const qrY = 100

    try {
      // ⚠️ IMPORTANT: This is the fix - SIMPLE TEXT, NOT JSON
      const qrData = `VISITOR BADGE
--------------------
Name: ${attendee.firstName} ${attendee.lastName}
Email: ${attendee.email}
${attendee.jobTitle ? `Title: ${attendee.jobTitle}` : ''}
${attendee.company ? `Company: ${attendee.company}` : ''}
--------------------
Event: ${event.title}
ID: ${attendee.id}
Date: ${new Date().toLocaleDateString()}
--------------------
Verified Attendee`

      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: qrSize * 2,
        margin: 1,
        color: {
          dark: "#1f2937",
          light: "#ffffff",
        },
      })

      const qrImage = new Image()
      qrImage.src = qrCodeDataUrl
      await new Promise((resolve) => {
        qrImage.onload = resolve
      })

      // QR code container
      ctx.fillStyle = "#ffffff"
      ctx.strokeStyle = "#e2e8f0"
      ctx.lineWidth = 1
      ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 30)
      ctx.strokeRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 30)

      // Draw QR code
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

      // ⚠️ IMPORTANT: Remove "JSON DATA FORMAT" text
      // QR code label - CHANGED FROM "JSON DATA FORMAT"
      ctx.fillStyle = "#6b7280"
      ctx.font = "10px 'Arial', sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("SCAN FOR DETAILS", qrX + qrSize / 2, qrY + qrSize + 20)

    } catch (error) {
      console.error("Error generating QR code:", error)
      // Error placeholder
      ctx.fillStyle = "#fef2f2"
      ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 30)
      ctx.strokeStyle = "#fecaca"
      ctx.lineWidth = 1
      ctx.strokeRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 30)
      
      ctx.fillStyle = "#dc2626"
      ctx.font = "10px 'Arial', sans-serif"
      ctx.textAlign = "center"
      ctx.fillText("QR CODE", qrX + qrSize / 2, qrY + qrSize / 2)
      ctx.fillText("UNAVAILABLE", qrX + qrSize / 2, qrY + qrSize / 2 + 12)
    }

    // Footer
    const footerY = canvas.height - 35

    // Issued date
    ctx.fillStyle = "#9ca3af"
    ctx.font = "10px 'Arial', sans-serif"
    ctx.textAlign = "left"
    ctx.fillText(`Issued: ${new Date().toLocaleDateString()}`, 45, footerY)

    // Attendee ID
    ctx.fillStyle = "#9ca3af"
    ctx.font = "10px 'Arial', sans-serif"
    ctx.textAlign = "right"
    ctx.fillText(`ID: ${attendee.id.substring(0, 8)}`, canvas.width - 45, footerY)

    // Callback
    if (onGenerated) {
      onGenerated(canvas.toDataURL("image/png"))
    }
  }

  return (
    <div className="hidden">
      <canvas ref={canvasRef} />
    </div>
  )
}