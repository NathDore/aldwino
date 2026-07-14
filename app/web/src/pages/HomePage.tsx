import { useHealthQuery } from "@/features/health";

export function HomePage() {
  const { data, isLoading, isError, error } = useHealthQuery();

  return (
    <main className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
      <div className="rounded-lg border border-slate-800 p-8 text-center">
        <h1 className="text-2xl font-semibold">Aldwino</h1>
        {isLoading && <p className="mt-2 text-slate-400">Checking backend...</p>}
        {isError && (
          <p className="mt-2 text-red-400">Backend unreachable: {(error as Error).message}</p>
        )}
        {data && (
          <p className="mt-2 text-emerald-400">
            Backend status: {data.status} (checked {data.checkedAt})
          </p>
        )}
      </div>
    </main>
  );
}
