import { useEffect } from "react";
import { useAuth } from "@/store/auth";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { user, hydrate, logout } = useAuth();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <div className="container py-10">
      <div className="grid gap-6 max-w-2xl">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h1 className="text-2xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your profile and session.</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold">Profile</h2>
          <div className="mt-3 text-sm grid gap-2">
            <div><span className="text-muted-foreground">Name:</span> {user?.name || "—"}</div>
            <div><span className="text-muted-foreground">Email:</span> {user?.email || "—"}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
          <h2 className="text-lg font-semibold mb-3">Session</h2>
          <Button variant="secondary" onClick={() => logout()}>Logout</Button>
        </div>
      </div>
    </div>
  );
}
