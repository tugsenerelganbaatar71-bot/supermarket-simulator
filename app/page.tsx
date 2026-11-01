import Link from "next/link";
import { EntranceScene } from "@/features/store-entrance/entrance-scene";
import { logout } from "./auth/actions";

// The home page is a 3D plaza: click a building to open that game page.
export default function Home() {
  return (
    <main className="relative flex-1">
      <div className="absolute inset-0">
        <EntranceScene />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 p-4 text-center">
        <h1 className="title-3d text-4xl font-black text-emerald-500">
          🛒 Supermarket Simulator
        </h1>
        <p className="mt-1 text-sm font-medium text-emerald-950">
          Click a building to play · drag to look around
        </p>
      </div>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-4 rounded-xl bg-white/85 px-5 py-2 text-sm shadow-sm">
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Log in
        </Link>
        <Link href="/signup" className="font-medium text-emerald-700 hover:underline">
          Sign up
        </Link>
        <form action={logout}>
          <button type="submit" className="text-zinc-600 hover:underline">
            Log out
          </button>
        </form>
      </div>
    </main>
  );
}
