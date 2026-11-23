import { AdminNav } from "@/components/admin/AdminNav";
import { AwardEditor } from "@/components/admin/AwardEditor";

export default function NewAwardPage() {
  return (
    <>
      <AdminNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-sm font-semibold text-muted">
          <span className="text-accent">$</span> new award
        </h1>
        <AwardEditor mode="create" />
      </main>
    </>
  );
}
