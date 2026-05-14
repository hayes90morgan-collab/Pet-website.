import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, puppy } = req.body;

  try {
    // Save to database
    await supabase.from("buyers").insert([
      { name, email, puppy, created_at: new Date() }
    ]);

    // Send email
    await resend.emails.send({
      from: "Luxury Puppies <onboarding@resend.dev>",
      to: email,
      subject: "🐶 Adoption Request Received",
      html: `<h2>Thank you ${name}</h2><p>Your request for ${puppy} is received.</p>`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
