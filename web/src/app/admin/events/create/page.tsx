import { redirect } from "next/navigation"

export default function CreateEventRedirect() {
  redirect("/admin/world-data/events/create")
}
