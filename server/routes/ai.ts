import type { RequestHandler } from "express";

const GEMINI_URL = (model: string, key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

export const coachHandler: RequestHandler = async (req, res) => {
  try {
    const { prompt, model = "gemini-1.5-flash" } = req.body ?? {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required" });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return res.status(200).json({
        provider: "gemini",
        model,
        mock: true,
        message:
          "Connect GEMINI_API_KEY to enable live AI. Here's a demo response:\n\nIncreasing your SIP by 10% could boost your long-term savings significantly. Based on average market returns of 12% annually, this small increase could grow your portfolio by approximately ₹15,000-₹20,000 extra over 5 years (assuming a current monthly SIP of ₹10,000).\n\nNext steps:\n1. Review your current budget to identify where you can free up the additional 10%\n2. Set up an automatic increase with your bank or investment platform\n3. Consider tax-saving ELSS funds if you haven't maximized your 80C deductions\n\nFor personalized calculations, use the simulator tool in your dashboard.",
      });
    }

    const resp = await fetch(GEMINI_URL(model, key), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text:
                  "You are an expert financial coach specializing in personal finance for Indian users. Your role is to provide practical, actionable financial advice tailored to the Indian context.\n\n" +
                  "Guidelines:\n" +
                  "- Keep answers concise (under 250 words) and easy to understand\n" +
                  "- Provide specific, actionable advice with clear steps\n" +
                  "- Include relevant Indian financial concepts (SIPs, PPF, ELSS, etc.) when appropriate\n" +
                  "- Mention assumptions you're making about the user's financial situation\n" +
                  "- Use ₹ symbol for currency amounts\n" +
                  "- Suggest practical next steps the user can take\n\n" +
                  "Question:\n" + prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ error: "gemini_error", details: text });
    }
    const data = await resp.json();
    const message = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return res.json({ provider: "gemini", model, message });
  } catch (e: any) {
    return res.status(500).json({ error: "server_error", message: e?.message });
  }
};
