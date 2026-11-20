"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteButton({
  id,
  title,
  deleteUrl,
  onDeleted,
}: {
  id: string;
  title: string;
  deleteUrl?: string;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${title}"? This can't be undone.`)) return;
    setPending(true);
    await fetch(deleteUrl ?? `/api/admin/posts/${id}`, { method: "DELETE" });
    if (onDeleted) {
      onDeleted();
    } else {
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
