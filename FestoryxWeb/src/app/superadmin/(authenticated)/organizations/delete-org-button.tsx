"use client";

import { deleteOrganization } from "@/actions/organization.actions";
import { useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteOrgButton({ orgId, orgName }: { orgId: string; orgName: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to permanently delete organization "${orgName}"? This action will cascade and delete all events, members, submissions, and registrations!`)) {
      startTransition(async () => {
        try {
          await deleteOrganization(orgId);
          toast.success("Organization deleted successfully.");
        } catch (error: any) {
          toast.error(error.message || "Failed to delete organization.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="px-3 py-1.5 bg-red-900/40 border border-red-800/30 hover:bg-red-900/60 text-rose-400 rounded-[5px] text-xs font-semibold transition-colors flex items-center gap-1 disabled:opacity-50"
    >
      {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      <span>Delete Org</span>
    </button>
  );
}
