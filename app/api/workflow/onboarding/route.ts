import { db } from "@/database/db";
import { users } from "@/database/schema";
import { serve } from "@upstash/workflow/nextjs";
import { eq } from "drizzle-orm";
import emailjs from "@emailjs/browser"; // ✅ Meilleure pratique ici

type InitialData = {
  email: string;
  fullName: string;
};

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const THREE_DAY_IN_MS = 3 * ONE_DAY_IN_MS;
const THIRTY_DAY_IN_MS = 30 * ONE_DAY_IN_MS;

export const { POST } = serve<InitialData>(async (context) => {
  const { email, fullName } = context.requestPayload;

  await context.run("new-signup", async () => {
    await sendEmail("Welcome to the platform", email, fullName);
  });

  await context.sleep("wait-for-3-days", THREE_DAY_IN_MS / 1000); // ⏱️ sleep prend des secondes

  while (true) {
    const state = await context.run("check-user-state", async () => {
      return await getUserState(email);
    });

    if (state === "non-active") {
      await context.run("send-email-non-active", async () => {
        await sendEmail("Email to non-active users", email, fullName);
      });
    } else if (state === "active") {
      await context.run("send-email-active", async () => {
        await sendEmail("Send newsletter to active users", email, fullName);
      });
    }

    await context.sleep("wait-for-1-month", THIRTY_DAY_IN_MS / 1000); // 🗓️ en secondes aussi
  }
});

async function sendEmail(message: string, email: string, fullName: string) {
  const serviceId = "service_fsmnwpc";
  const templateId = "template_ajwf14k";
  const publicKey = "DYDcAuZIuVUhPe8Xq";

  const templateParams = {
    to_email: email,
    to_name: fullName,
    message: message,
  };

  try {
    await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log(`✅ Email envoyé à ${email} : ${message}`);
  } catch (error) {
    console.error("❌ Erreur envoi email:", error);
  }
}

type UserState = "non-active" | "active";

const getUserState = async (email: string): Promise<UserState> => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (user.length === 0) return "non-active";

  const lastActivityDate = new Date(user[0].lastActivityDate!);
  const now = new Date();
  const timeDifference = now.getTime() - lastActivityDate.getTime();

  if (
    timeDifference > THREE_DAY_IN_MS &&
    timeDifference <= THIRTY_DAY_IN_MS
  ) {
    return "non-active";
  }

  return "active";
};
