import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Zap, Sparkles, Bot, Send, Copy, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "Optimize my monthly budget with 2 simple changes",
  "How much should I increase my SIP to reach ₹10L in 5 years?",
  "Cut non-essential spend by 15% without hurting lifestyle",
  "Plan to repay my credit card debt in 6 months",
];

export default function Coach() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I’m your AI Coach. Ask me about budgeting, SIPs, or optimizing expenses. Keep it specific for better, actionable tips.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState("practical");
  const [goal, setGoal] = useState("optimize-expenses");

  // Typewriter effect for assistant messages
  const typeOut = async (full: string) => {
    return new Promise<string>((resolve) => {
      let i = 0;
      const id = setInterval(() => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== "assistant") return prev;
          const updated = prev.slice();
          updated[updated.length - 1] = { ...last, content: full.slice(0, i) };
          return updated;
        });
        i += Math.max(1, Math.floor(full.length / 80));
        if (i >= full.length) {
          clearInterval(id);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (!last || last.role !== "assistant") return prev;
            const updated = prev.slice();
            updated[updated.length - 1] = { ...last, content: full };
            return updated;
          });
          resolve(full);
        }
      }, 20);
    });
  };

  const buildPrompt = () => {
    const toneLine = `Tone: ${tone}`;
    const goalLine = `Goal: ${goal.replace(/-/g, " ")}`;
    const history = messages
      .slice(-4)
      .map((m) => (m.role === "user" ? `User: ${m.content}` : `Coach: ${m.content}`))
      .join("\n");
    return `${toneLine}\n${goalLine}\n\nContext:\n${history}\n\nQuestion:\n${prompt}`.trim();
  };

  const ask = async () => {
    const text = prompt.trim();
    if (!text) return;
    setLoading(true);
    const userMsg: Message = { id: Date.now(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg, { id: Date.now() + 1, role: "assistant", content: "" }]);
    setPrompt("");
    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const msg = data.message || "I couldn't generate a response. Please try again.";
      await typeOut(msg);
    } catch (e: any) {
      toast.error(e?.message || "Failed to contact coach");
      setMessages((prev) => {
        const updated = prev.slice();
        updated[updated.length - 1] = {
          id: Date.now() + 2,
          role: "assistant",
          content: "I ran into a problem fetching advice. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLast = async () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant" && m.content);
    if (!last) return;
    await navigator.clipboard.writeText(last.content);
    toast.success("Copied response");
  };

  const regenerate = async () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setPrompt(lastUser.content);
    await ask();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      ask();
    }
  };

  return (
    <div className="relative">
      {/* Parallax neon glows */}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5, scale: [1, 1.05, 1] }} transition={{ duration: 12, repeat: Infinity }} className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-neon-teal/20 to-neon-violet/20 blur-3xl" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.45, scale: [1, 0.96, 1] }} transition={{ duration: 14, repeat: Infinity }} className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-tr from-neon-violet/20 to-fuchsia-500/20 blur-3xl" />
      </motion.div>

      <div className="container py-8 max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Bot className="w-8 h-8 text-neon-teal" />
              AI Coach
            </h1>
            <p className="text-muted-foreground mt-1">Actionable, India-first personal finance guidance</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyLast} disabled={loading}>
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={regenerate} disabled={loading}>
              <RotateCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Re-generate
            </Button>
          </div>
        </div>

        {/* Quick suggestions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => setPrompt(s)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-2 text-sm"><Sparkles className="w-4 h-4 text-neon-teal" />{s}</div>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="practical">Practical</SelectItem>
              <SelectItem value="encouraging">Encouraging</SelectItem>
              <SelectItem value="strict">Strict</SelectItem>
            </SelectContent>
          </Select>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Goal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="optimize-expenses">Optimize expenses</SelectItem>
              <SelectItem value="grow-investments">Grow investments</SelectItem>
              <SelectItem value="reduce-debt">Reduce debt</SelectItem>
              <SelectItem value="tax-planning">Tax planning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Chat composer */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
          <textarea
            className="w-full min-h-[110px] rounded-xl bg-background/60 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-neon-teal/60"
            placeholder="Ask: Can I afford a vacation if I increase my SIP by 10%?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <div className="mt-3 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Press Ctrl/⌘ + Enter to send</div>
            <Button
              onClick={ask}
              disabled={loading}
              className="group relative overflow-hidden border-0 bg-background text-foreground hover:bg-background/90 shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_32px_rgba(168,85,247,0.55)]"
            >
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-fuchsia-500/20 to-violet-500/20" />
              {loading ? (
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 animate-pulse text-fuchsia-400" />
                  <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Thinking…</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-fuchsia-400" />
                  <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">Ask Coach</span>
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl border border-neon-teal/30 bg-neon-teal/10 p-4"
                    : "mr-auto max-w-[85%] rounded-2xl border border-white/10 bg-white/5 p-4"
                }
              >
                <div className="text-sm whitespace-pre-wrap">{m.content}</div>
                {m.role === "assistant" && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <button className="hover:text-foreground" onClick={() => navigator.clipboard.writeText(m.content)}>
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button className="hover:text-foreground" onClick={regenerate}>
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
