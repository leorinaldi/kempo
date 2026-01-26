import { redirect } from "next/navigation"

export default function ManageEventsRedirect() {
  redirect("/admin/world-data/events/manage")
}
