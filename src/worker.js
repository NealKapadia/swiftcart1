const MAX = { name: 100, email: 200, message: 5000 };
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });

// Strip CR/LF so user input can't inject extra email headers.
const oneLine = (s) => String(s ?? "").replace(/[\r\n]+/g, " ").trim();

async function handleContact(request, env) {
  if (request.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405);

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request" }, 400);
  }

  // Honeypot: real visitors never fill this hidden field; bots usually do.
  if (data.company) return json({ ok: true });

  const name = oneLine(data.name);
  const email = oneLine(data.email);
  const message = String(data.message ?? "").trim();

  if (!name || !email || !message) return json({ ok: false, error: "Please fill in every field." }, 400);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "Please enter a valid email address." }, 400);
  if (name.length > MAX.name || email.length > MAX.email || message.length > MAX.message) {
    return json({ ok: false, error: "That message is too long." }, 400);
  }

  const text =
    `New message from the SwiftCart website contact form\n\n` +
    `Name:  ${name}\nEmail: ${email}\n\n${message}\n\n` +
    `---\nReply to this email to respond directly to ${name}.`;

  if (!env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY secret is not set");
    return json({ ok: false, error: "Sorry, the contact form isn't set up yet. Please email us directly." }, 500);
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: `SwiftCart Website <${env.CONTACT_FROM}>`,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject: `SwiftCart question from ${name}`,
        text,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
  } catch (err) {
    console.error("Contact email failed:", err);
    return json({ ok: false, error: "Sorry, we couldn't send your message. Please email us directly." }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") return handleContact(request, env);
    return env.ASSETS.fetch(request);
  },
};
