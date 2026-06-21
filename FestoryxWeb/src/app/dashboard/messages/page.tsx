import { getOrgQueries } from "@/actions/org-query.actions";
import { serializePrisma } from "@/lib/utils";
import { MessagesListClient } from "./messages-list-client";

export const revalidate = 0; // Disable static caching for admin messages

export default async function AdminMessagesPage() {
  const rawQueries = await getOrgQueries();
  const mapped = rawQueries.map((q) => ({
    id: q.id,
    name: q.name,
    email: q.email,
    subject: q.subject,
    message: q.message,
    isRead: q.status !== "PENDING",
    createdAt: q.createdAt,
  }));
  const messages = serializePrisma(mapped);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white md:text-3xl font-heading">
          Contact Messages
        </h1>
        <p className="mt-1 text-gray-400">
          View and manage questions, feedback, and support queries submitted by visitors to your organization page.
        </p>
      </div>

      <MessagesListClient initialMessages={messages} />
    </div>
  );
}
