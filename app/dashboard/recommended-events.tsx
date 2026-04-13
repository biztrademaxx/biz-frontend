"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { apiFetch } from "@/lib/api";

interface Event {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  images?: { url: string }[];
  categories?: string[];
  tags?: string[];
  location?: { city?: string; venue?: string };
}

interface RecommendedEventsProps {
  userId: string;
  interests: string[]; // ✅ Pass from profile
}

export default function RecommendedEvents({ userId, interests }: RecommendedEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await apiFetch<any>("/api/events", { auth: false });
        const eventsData: Event[] = Array.isArray(data)
          ? data
          : Array.isArray(data.events)
          ? data.events
          : [];

        setEvents(eventsData);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userId]);

  // ✅ Filter events by user’s profile interests
  const filteredEvents =
    interests && interests.length > 0
      ? events.filter((e) =>
          e.categories?.some((cat) => interests.includes(cat))
        )
      : events;

  if (loading) return <p className="text-center mt-4">Loading events...</p>;
  if (error) return <p className="text-center mt-4 text-red-600">Error: {error}</p>;
  if (!filteredEvents.length)
    return <p className="text-center mt-4">No recommended events found.</p>;

  return (
    <div className="space-y-8">
      {/* Events Grid → One card per row */}
      <div className="grid grid-cols-1 gap-8">
        {filteredEvents.map((event) => (
          <Card
            key={event.id}
            className="shadow-lg hover:shadow-xl transition-all w-full rounded-2xl overflow-hidden"
          >
            {/* Image */}
            {event.images?.[0] && (
              <div className="h-72 w-full overflow-hidden">
                <img
                  src={event.images[0].url}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
            )}

            <CardHeader>
              <CardTitle className="text-2xl font-bold">{event.title}</CardTitle>
              {(event.tags ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(event.tags ?? []).map((tag) => (
                    <Badge key={tag} className="px-2 py-1 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-3 text-gray-700">
              {event.startDate && event.endDate && (
                <p className="text-sm">
                  📅 {format(new Date(event.startDate), "dd MMM yyyy")} -{" "}
                  {format(new Date(event.endDate), "dd MMM yyyy")}
                </p>
              )}

              {event.location?.venue && (
                <p className="text-sm">📍 Venue: {event.location.venue}</p>
              )}
              {event.location?.city && (
                <p className="text-sm">🏙 City: {event.location.city}</p>
              )}

              {(event.categories ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {(event.categories ?? []).map((cat) => (
                    <Badge
                      key={cat}
                      variant="secondary"
                      className="px-2 py-1 text-xs"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
