import { redirect } from "next/navigation";

export default function SuperAdminSSORedirectPage() {
  const quizArenaUrl = process.env.NEXT_PUBLIC_QUIZ_ARENA_URL || "http://localhost:3002";
  redirect(`${quizArenaUrl}/admin`);
}
