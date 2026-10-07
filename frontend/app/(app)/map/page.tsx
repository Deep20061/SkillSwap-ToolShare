// This page just redirects to the listings map view.
// The full map experience lives at /listings?view=map
import { redirect } from "next/navigation";

export default function MapPage() {
  redirect("/listings?view=map");
}
