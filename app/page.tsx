import MemeGame from "@/components/MemeGame";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/team/auth");
}
