import { WelcomeEmail } from "./templates/WelcomeEmail";
import { createElement } from "react";

// Mock email service for development
// In production, you would use a real email service like Resend
const mockEmailService = {
  emails: {
    send: async (options: any) => {
      console.log("MOCK EMAIL SENT:", options);
      return { id: "mock-email-id", success: true };
    }
  }
};

// Use mockEmailService in development
const emailClient = mockEmailService;

export async function sendWelcomeEmail(to: string, name: string) {
  console.log(`Sending welcome email to ${to} for ${name}`);
  
  try {
    await emailClient.emails.send({
      from: process.env.EMAIL_FROM || "no-reply@yourdomain.com",
      to,
      subject: "Welcome!",
      react: createElement(WelcomeEmail, { name }),
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
