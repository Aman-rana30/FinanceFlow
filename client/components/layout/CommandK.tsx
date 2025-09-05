import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useNavigate } from "react-router-dom";
import { useUIStore } from "@/store/ui";

const routes = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Investments", to: "/investments" },
  { label: "Stocks", to: "/stocks" },
  { label: "Expenses & Budgets", to: "/expenses" },
  { label: "Goals", to: "/goals" },
  { label: "Insights", to: "/insights" },
  { label: "Challenges", to: "/challenges" },
  { label: "Coach", to: "/coach" },
  { label: "Auth", to: "/auth" },
  { label: "Settings", to: "/settings" },
];

export function CommandK() {
  const navigate = useNavigate();
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {routes.map((r) => (
            <CommandItem
              key={r.to}
              onSelect={() => {
                navigate(r.to);
                setOpen(false);
              }}
            >
              {r.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => { setOpen(false); document.dispatchEvent(new CustomEvent("open-quick-expense")); }}>
            Quick add expense
          </CommandItem>
          <CommandItem onSelect={() => { setOpen(false); document.dispatchEvent(new CustomEvent("toggle-masked")); }}>
            Toggle masked amounts
          </CommandItem>
          <CommandItem onSelect={() => { setOpen(false); document.dispatchEvent(new CustomEvent("toggle-panic")); }}>
            Panic hide numbers
          </CommandItem>
          <CommandItem onSelect={() => { setOpen(false); navigate("/settings"); }}>
            Open settings
          </CommandItem>
          <CommandItem onSelect={() => { setOpen(false); import("@/store/auth").then(m => m.useAuth.getState().logout()); navigate("/auth"); }}>
            Logout
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
