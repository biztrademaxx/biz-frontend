"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Heart, MapPin, Share2, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface FavoriteEvent {
  id: string
  title: string
  date: string
  location: string
  description: string
  categories: string[]
  interested: number
  going: number
  rating: number
  image: string
  isFavorite: boolean
}

export function Favourites() {
  const [favorites, setFavorites] = useState<FavoriteEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavorites = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockData: FavoriteEvent[] = [
        {
          id: "1",
          title: "Fitness Fest 2025",
          date: "Thu 04 – Sat 06 June 2025",
          location: "Bangalore, India",
          description:
            "Aston University is a unique four-day celebration with liberty-loving friends from around the world. Packed with thought-provoking presentations to refresh intellectual foundations of a free society.",
          categories: ["Conference", "Education"],
          interested: 518,
          going: 220,
          rating: 4.5,
          image: "/image/download2.jpg",
          isFavorite: true,
        },
      ]

      setFavorites(mockData)
      setLoading(false)
    }

    fetchFavorites()
  }, [])

  const toggleFavorite = (id: string) => {
    setFavorites(prev =>
      prev.map(event =>
        event.id === id ? { ...event, isFavorite: !event.isFavorite } : event
      )
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section title */}
      <h2 className="text-xl font-semibold border-b pb-2">Favourites</h2>

      {favorites.map(event => (
        <Card key={event.id} className="flex flex-col md:flex-row overflow-hidden shadow-sm">
          {/* Left Image */}
          <div className="relative w-full md:w-1/3 h-48 md:h-auto">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Right Content */}
          <div className="flex flex-col justify-between p-4 w-full relative">
            {/* Title + Fav Icon */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-sm text-muted-foreground">{event.date}</p>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {event.location}
                </div>
              </div>
              <button onClick={() => toggleFavorite(event.id)}>
                <Heart
                  className="h-6 w-6 text-red-500"
                  fill={event.isFavorite ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground mt-2">
              {event.description}
            </p>

            {/* Categories */}
            <div className="flex gap-2 mt-2">
              {event.categories.map(cat => (
                <Badge key={cat} variant="secondary">
                  {cat}
                </Badge>
              ))}
            </div>

            {/* Footer Stats */}
            <div className="flex justify-between items-center mt-3">
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>⭐ Interested {event.interested}</span>
                <span>👥 Going {event.going}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-600 font-medium">
                  {event.rating.toFixed(1)}
                </span>
                <Share2 className="h-5 w-5 cursor-pointer" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
