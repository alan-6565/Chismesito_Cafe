import { redirect } from "next/navigation";

// The giveaway lives on the homepage now; keep old links working.
export default function GiveawayPage() {
  redirect("/#giveaway");
}
