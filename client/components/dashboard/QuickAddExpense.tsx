import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function QuickAddExpense() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", category: "General" });

  useEffect(() => {
    const openHandler = () => setOpen(true);
    const closeHandler = () => setOpen(false);
    const openQuick = () => setOpen(true);
    const onToggleMasked = () => {};
    document.addEventListener("open-quick-expense", openQuick as EventListener);
    return () => {
      document.removeEventListener("open-quick-expense", openQuick as EventListener);
    };
  }, []);

  const submit = async () => {
    const amount = Number(form.amount);
    if (!form.title || !amount) {
      toast.error("Please fill title and amount");
      return;
    }
    toast.success(`Added expense: ${form.title} - ₹${amount.toFixed(2)}`);
    setOpen(false);
    setForm({ title: "", amount: "", category: "General" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Quick Add Expense</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm text-muted-foreground">Title</label>
            <input
              className="w-full rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
              placeholder="Coffee, Uber, Groceries..."
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-muted-foreground">Amount</label>
            <input
              type="number"
              className="w-full rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm text-muted-foreground">Category</label>
            <select
              className="w-full rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
              value={form.category}
              onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
            >
              <option>General</option>
              <option>Food</option>
              <option>Travel</option>
              <option>Bills</option>
              <option>Shopping</option>
            </select>
          </div>
          <Button onClick={submit} className="mt-2">Add Expense</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
