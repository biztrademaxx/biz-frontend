"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function VisitorBadgeSettings() {
  const [showCompany, setShowCompany] = useState(true)
  const [showQRCode, setShowQRCode] = useState(true)
  const [showLogo, setShowLogo] = useState(true)
  const [layout, setLayout] = useState("standard")
  const [themeColor, setThemeColor] = useState("#2563eb") // default blue
  const [previewName, setPreviewName] = useState("John Doe")
  const [previewCompany, setPreviewCompany] = useState("Tech Corp")

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Visitor Badge Settings</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-4">
          <div>
            <Label>Badge Layout</Label>
            <Select value={layout} onValueChange={setLayout}>
              <SelectTrigger>
                <SelectValue placeholder="Select layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Theme Color</Label>
            <Input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="w-16 h-10 p-1"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="company">Show Company</Label>
            <Switch id="company" checked={showCompany} onCheckedChange={setShowCompany} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="qrcode">Show QR Code</Label>
            <Switch id="qrcode" checked={showQRCode} onCheckedChange={setShowQRCode} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="logo">Show Logo</Label>
            <Switch id="logo" checked={showLogo} onCheckedChange={setShowLogo} />
          </div>

          <div>
            <Label>Preview Name</Label>
            <Input value={previewName} onChange={(e) => setPreviewName(e.target.value)} />
          </div>

          <div>
            <Label>Preview Company</Label>
            <Input value={previewCompany} onChange={(e) => setPreviewCompany(e.target.value)} />
          </div>

          <Button className="w-full">Save Settings</Button>
        </div>

        {/* Preview */}
        <div className="flex items-center justify-center">
          <div
            className={`border rounded-lg shadow-md p-4 text-center`}
            style={{
              width: layout === "compact" ? "200px" : "280px",
              height: layout === "compact" ? "140px" : "200px",
              borderColor: themeColor,
            }}
          >
            {showLogo && (
              <div className="mb-2">
                <div
                  className="w-12 h-12 mx-auto rounded-full"
                  style={{ backgroundColor: themeColor }}
                />
              </div>
            )}
            <div className="font-bold text-lg">{previewName}</div>
            {showCompany && <div className="text-sm text-gray-500">{previewCompany}</div>}
            {showQRCode && (
              <div className="mt-2">
                <div className="w-16 h-16 bg-gray-200 mx-auto flex items-center justify-center text-xs">
                  QR
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
