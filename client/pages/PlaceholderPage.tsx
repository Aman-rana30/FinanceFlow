import { ReactNode } from "react";

export default function PlaceholderPage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="container py-10">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground mt-2">This screen is scaffolded. Continue prompting to fill in this page's functionality.</p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    </div>
  );
}
