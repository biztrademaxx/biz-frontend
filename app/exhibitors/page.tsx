import { redirect } from "next/navigation"

/** Public footer link — browse events (exhibitor discovery lives on event pages). */
export default function ExhibitorsRedirectPage() {
  redirect("/event")
}
