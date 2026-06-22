import { redirect } from "next/navigation";

export default function SuperAdminSSORedirectPage() {
  const quizArenaUrl = process.env.NEXT_PUBLIC_QUIZ_ARENA_URL || "https://festoryx-quiz.vercel.app";
  redirect(`${quizArenaUrl}/admin`);
}
