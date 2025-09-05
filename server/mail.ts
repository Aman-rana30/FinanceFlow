import nodemailer from "nodemailer";

export type MailResult = { ok: true } | { ok: false; error: string };

function getTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function sendWelcomeEmail(to: string, name?: string): Promise<MailResult> {
  const transport = getTransport();
  if (!transport) return { ok: false, error: "smtp_not_configured" };
  
  const brand = "FinanceFlow";
  const appUrl = process.env.APP_URL || "http://localhost:8080";
  const subject = `Welcome to ${brand}!`;
  
  // Enhanced HTML email with bluish-purple gradient and better styling
  const html = `
    <div style="font-family:Inter,Segoe UI,Arial,sans-serif;padding:24px;background:#0E1217;color:#e6f0ff;">
      <div style="max-width:640px;margin:auto;background:#0B0F14;border:1px solid #22303d;border-radius:16px;padding:32px">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;background:linear-gradient(135deg, #6366f1, #a855f7);border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;">
            <span style="font-size:28px;">✨</span>
          </div>
        </div>
        
        <h1 style="margin:0 0 16px;font-size:24px;text-align:center;background:linear-gradient(135deg, #6366f1, #a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">Welcome${name ? ", "+name : ""}!</h1>
        
        <p style="margin:0 0 24px;opacity:.9;font-size:16px;line-height:1.6;text-align:center;">
          Thanks for creating your account at <b>${brand}</b>. You're ready to take control of your financial future with our AI-powered platform.
        </p>
        
        <div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;margin-bottom:24px;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#a855f7;">What you can do now:</h2>
          <ul style="margin:0 0 0;padding-left:24px;opacity:.9;line-height:1.8;">
            <li><span style="color:#6366f1;font-weight:bold;">Track Expenses</span> - Monitor your spending habits with detailed categorization</li>
            <li><span style="color:#6366f1;font-weight:bold;">Set Financial Goals</span> - Create and track progress toward your savings targets</li>
            <li><span style="color:#6366f1;font-weight:bold;">Get AI Insights</span> - Receive personalized financial advice from our AI coach</li>
            <li><span style="color:#6366f1;font-weight:bold;">View Analytics</span> - Visualize your financial health with interactive charts</li>
          </ul>
        </div>
        
        <div style="text-align:center;margin-bottom:24px;">
          <a href="${appUrl}/dashboard" style="display:inline-block;background:linear-gradient(135deg, #6366f1, #a855f7);color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;">Go to Dashboard</a>
        </div>
        
        <p style="margin:24px 0 0;opacity:.7;font-size:14px;text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:24px;">
          If you didn't create this account, please <a href="mailto:${process.env.SMTP_USER}" style="color:#6366f1;text-decoration:none;">contact us</a> immediately.
        </p>
      </div>
    </div>`;
    
  const from = process.env.SMTP_FROM || process.env.SMTP_USER!;
  await transport.sendMail({ to, from, subject, html });
  return { ok: true };
}
