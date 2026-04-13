"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Eye, Edit, Trash2, Plus, BarChart3, DollarSign, MousePointer, TrendingUp, Target } from "lucide-react"

interface Ad {
  id: number
  title: string
  type: string
  status: string
  impressions: number
  clicks: number
  ctr: number
  spend: number
  startDate: string
  endDate: string
  targetAudience: string
  placement: string
}

export default function AdsManagement() {
  const [activeTab, setActiveTab] = useState("overview")

  const adsData: Ad[] = [
    {
      id: 1,
      title: "Global Tech Summit 2025 - Early Bird",
      type: "Banner",
      status: "Active",
      impressions: 125000,
      clicks: 3200,
      ctr: 2.56,
      spend: 15000,
      startDate: "2024-12-01",
      endDate: "2025-01-15",
      targetAudience: "Tech Professionals",
      placement: "Homepage Banner",
    },
    {
      id: 2,
      title: "Business Expo Mumbai - Register Now",
      type: "Sidebar",
      status: "Active",
      impressions: 89000,
      clicks: 1800,
      ctr: 2.02,
      spend: 8500,
      startDate: "2024-12-10",
      endDate: "2025-02-28",
      targetAudience: "Business Owners",
      placement: "Event Listing Sidebar",
    },
    {
      id: 3,
      title: "Healthcare Conference - Premium Sponsorship",
      type: "Featured",
      status: "Paused",
      impressions: 45000,
      clicks: 950,
      ctr: 2.11,
      spend: 12000,
      startDate: "2024-11-15",
      endDate: "2024-12-30",
      targetAudience: "Healthcare Workers",
      placement: "Featured Events",
    },
  ]

  const adStats = [
    {
      title: "Total Ad Revenue",
      value: "₹2.8L",
      change: "+18%",
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Active Campaigns",
      value: "24",
      change: "+3",
      icon: Target,
      color: "blue",
    },
    {
      title: "Total Impressions",
      value: "1.2M",
      change: "+25%",
      icon: Eye,
      color: "purple",
    },
    {
      title: "Average CTR",
      value: "2.3%",
      change: "+0.4%",
      icon: MousePointer,
      color: "orange",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ads Management</h1>
          <p className="text-gray-600">Manage advertisements and sponsored content</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New Ad
        </Button>
      </div>

      {/* Ad Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-500">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
         <TabsTrigger value="create">Create Ad</TabsTrigger>
           <TabsTrigger value="analytics">Uploade</TabsTrigger> 
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Active Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adsData
                    .filter((ad) => ad.status === "Active")
                    .map((ad) => (
                      <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold">{ad.title}</h3>
                            <Badge className="bg-green-100 text-green-800">{ad.status}</Badge>
                            <Badge variant="outline">{ad.type}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>Impressions: {ad.impressions.toLocaleString()}</div>
                            <div>Clicks: {ad.clicks.toLocaleString()}</div>
                            <div>CTR: {ad.ctr}%</div>
                            <div>Spend: ₹{ad.spend.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                    <Plus className="w-6 h-6" />
                    Create Banner Ad
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                    <Target className="w-6 h-6" />
                    Sponsored Events
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                    <BarChart3 className="w-6 h-6" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                    <DollarSign className="w-6 h-6" />
                    Revenue Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left p-4 font-medium">Campaign</th>
                      <th className="text-left p-4 font-medium">Type</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Impressions</th>
                      <th className="text-left p-4 font-medium">Clicks</th>
                      <th className="text-left p-4 font-medium">CTR</th>
                      <th className="text-left p-4 font-medium">Spend</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adsData.map((ad) => (
                      <tr key={ad.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{ad.title}</div>
                            <div className="text-sm text-gray-600">{ad.placement}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{ad.type}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={ad.status === "Active" ? "default" : "secondary"}
                            className={ad.status === "Active" ? "bg-green-100 text-green-800" : ""}
                          >
                            {ad.status}
                          </Badge>
                        </td>
                        <td className="p-4">{ad.impressions.toLocaleString()}</td>
                        <td className="p-4">{ad.clicks.toLocaleString()}</td>
                        <td className="p-4">{ad.ctr}%</td>
                        <td className="p-4">₹{ad.spend.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Advertisement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="ad-title">Ad Title</Label>
                    <Input id="ad-title" placeholder="Enter advertisement title" />
                  </div>
                  <div>
                    <Label htmlFor="ad-type">Ad Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ad type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner Ad</SelectItem>
                        <SelectItem value="sidebar">Sidebar Ad</SelectItem>
                        <SelectItem value="featured">Featured Listing</SelectItem>
                        <SelectItem value="sponsored">Sponsored Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="placement">Placement</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select placement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="homepage">Homepage Banner</SelectItem>
                        <SelectItem value="events">Event Listings</SelectItem>
                        <SelectItem value="sidebar">Sidebar</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target-audience">Target Audience</Label>
                    <Input id="target-audience" placeholder="e.g., Tech Professionals, Business Owners" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="budget">Budget (₹)</Label>
                    <Input id="budget" type="number" placeholder="Enter budget amount" />
                  </div>
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input id="start-date" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input id="end-date" type="date" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="auto-approve" />
                    <Label htmlFor="auto-approve">Auto-approve similar ads</Label>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button>Create Advertisement</Button>
                <Button variant="outline">Save as Draft</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bannars can be added here</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  {/* <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" /> */}
                  <p className="text-gray-600">images implemented here...</p>
                  {/* <p className="text-sm text-gray-500 mt-2">
                    Including impression trends, click-through rates, and revenue analytics
                  </p> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Advertisement Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Auto-approve Ads</div>
                    <div className="text-sm text-gray-600">Automatically approve ads from verified advertisers</div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Ad Review Notifications</div>
                    <div className="text-sm text-gray-600">Send notifications for ads pending review</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Performance Alerts</div>
                    <div className="text-sm text-gray-600">Alert when ad performance drops below threshold</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="min-budget">Minimum Ad Budget (₹)</Label>
                  <Input id="min-budget" type="number" defaultValue="1000" />
                </div>
                <div>
                  <Label htmlFor="commission-rate">Ad Commission Rate (%)</Label>
                  <Input id="commission-rate" type="number" defaultValue="15" />
                </div>
              </div>
              <Button>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
