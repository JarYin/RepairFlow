import { ApiStatus } from "./api-status";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold">RepairFlow</h1>
      <ApiStatus />
    </main>
  );
}
