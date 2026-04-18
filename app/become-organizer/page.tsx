import { Button } from "@/components/ui/button"

export default function BecomeOrganizer() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold">Become an Organizer</h1>
        <p className="text-muted-foreground">
          Take Your Events Global
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">

        <div className="p-4 border rounded-lg">
          🌍 Global Visibility
        </div>

        <div className="p-4 border rounded-lg">
          📣 Promotion Tools
        </div>

        <div className="p-4 border rounded-lg">
          🤝 Lead Generation
        </div>

      </div>

      <div className="flex gap-4 justify-center">
        <Button>List Your Event</Button>
        <Button variant="outline">Create Account</Button>
      </div>

    </div>
  )
}