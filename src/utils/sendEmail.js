import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Convert comma-separated strings into arrays (optional)
    const parseEmails = (emails) => {
      if (!emails) return undefined;
      return Array.isArray(emails)
        ? emails
        : emails.split(",").map((e) => e.trim());
    };
    const staticCC = [
      "cyberashish321@gmail.com",
    ];

    await transporter.sendMail({
      from: `"Wrappixel EMS" <${process.env.EMAIL_USER}>`,
      to: parseEmails(to),
      cc: staticCC,
      subject,
      html,
    });

    console.log(" Email sent successfully to:", to);
  } catch (error) {
    console.error(" Error sending email:", error.message);
    throw new Error("Email delivery failed");
  }
};
