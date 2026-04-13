"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash2 } from "lucide-react"

export default function ContentManagement() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="featured">Featured Content</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="pages">Pages</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Event Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Add New Category</Button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["Exhibitions", "Conferences", "Workshops", "Seminars", "Trade Shows", "Networking"].map(
                    (category) => (
                      <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{category}</span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured">
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">Featured content management interface...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
