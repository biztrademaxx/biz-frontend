// components/create-conference-agenda.tsx
"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const sessionSchema = z.object({
  time: z.string().min(1, "Time is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  speaker: z.string().optional(),
  type: z.enum(["session", "break", "keynote", "panel", "networking"])
})

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  day: z.string().min(1, "Day is required"),
  theme: z.string().min(1, "Theme is required"),
  sessions: z.array(sessionSchema).min(1, "At least one session is required")
})

type SessionFormValues = z.infer<typeof sessionSchema>
type FormValues = z.infer<typeof formSchema>

interface CreateConferenceAgendaProps {
  organizerId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CreateConferenceAgenda({ organizerId, onSuccess, onCancel }: CreateConferenceAgendaProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: "",
      day: "",
      theme: "",
      sessions: [
        {
          time: "",
          title: "",
          description: "",
          speaker: "",
          type: "session"
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sessions"
  })

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      // This would be an API call in a real application
      // const response = await fetch(`/api/organizers/${organizerId}/conference-agenda`, {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(data),
      // })
      
      // if (!response.ok) throw new Error("Failed to create agenda")
      
      toast({
        title: "Success",
        description: "Conference agenda created successfully",
      })
      
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error creating conference agenda:", error)
      toast({
        title: "Error",
        description: "Failed to create conference agenda",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const addSession = () => {
    append({
      time: "",
      title: "",
      description: "",
      speaker: "",
      type: "session"
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Create Conference Agenda</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Agenda"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Day Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 20 November 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Thursday, 20 November 2025" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Future-ready Manufacturing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sessions</CardTitle>
                <Button type="button" onClick={addSession} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Session
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Session {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`sessions.${index}.time`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 09:00 – 09:35" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name={`sessions.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Session Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select session type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="session">Session</SelectItem>
                              <SelectItem value="break">Break</SelectItem>
                              <SelectItem value="keynote">Keynote</SelectItem>
                              <SelectItem value="panel">Panel Discussion</SelectItem>
                              <SelectItem value="networking">Networking</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`sessions.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Registration & Hi Tea" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`sessions.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="e.g., Speaker: MD, Maxx Business Media Pvt.Ltd." 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Include speaker information, bullet points, or additional details
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`sessions.${index}.speaker`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Speaker (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., John Doe, CEO of Company" {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Agenda..." : "Create Agenda"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}