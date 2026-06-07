import { sendEmail } from "../utils/Email.js";
import { createNotification } from "../utils/notifier.js";

export const submitContact = async (req, res) => {
  try {
    const { name, email, company, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: "Name, email, subject, and message are required." });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "orderduksjuice@gmail.com";

    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fefefe; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: #f5c518; padding: 24px 32px;">
          <h1 style="color: #1a1a2e; margin: 0; font-size: 22px;">New Contact Form Submission</h1>
        </div>
        <div style="padding: 32px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #6b7280; width: 100px; vertical-align: top; font-size: 13px;">Name</td>
              <td style="padding: 10px 0; color: #111827; font-weight: 500;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; width: 100px; vertical-align: top; font-size: 13px; border-top: 1px solid #f3f4f6;">Email</td>
              <td style="padding: 10px 0; color: #111827; font-weight: 500; border-top: 1px solid #f3f4f6;">
                <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a>
              </td>
            </tr>
            ${company ? `
            <tr>
              <td style="padding: 10px 0; color: #6b7280; width: 100px; vertical-align: top; font-size: 13px; border-top: 1px solid #f3f4f6;">Company</td>
              <td style="padding: 10px 0; color: #111827; font-weight: 500; border-top: 1px solid #f3f4f6;">${company}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding: 10px 0; color: #6b7280; width: 100px; vertical-align: top; font-size: 13px; border-top: 1px solid #f3f4f6;">Subject</td>
              <td style="padding: 10px 0; color: #111827; font-weight: 500; border-top: 1px solid #f3f4f6;">${subject}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; width: 100px; vertical-align: top; font-size: 13px; border-top: 1px solid #f3f4f6;">Message</td>
              <td style="padding: 10px 0; color: #111827; border-top: 1px solid #f3f4f6; line-height: 1.6;">${message.replace(/\n/g, "<br>")}</td>
            </tr>
          </table>
        </div>
        <div style="background: #f9fafb; padding: 16px 32px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center;">
          Sent from the Duks Juice contact form
        </div>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `Contact Form: ${subject}`,
      html,
    });

    createNotification({
      type: "new_contact",
      title: "New Contact Form Submission",
      message: `${name} (${email}) sent a message: ${subject}`,
      link: null,
      metadata: { name, email, subject },
    });

    res.status(200).json({ success: true, message: "Message sent successfully." });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ success: false, message: "Failed to send message. Please try again later." });
  }
};
