import { NextResponse } from "next/server";
import { aiErrorResponse, ask } from "@/lib/ai";
import { requireUser } from "@/lib/auth";

export async function POST(request: Request) {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;
  const { type, data, notes } = await request.json();
  const resignation = type === "resignation";
  const kind = resignation ? "a polite, professional resignation letter" : "a tailored cover letter (3–4 short paragraphs)";
  try {
    const text = await ask({
      system: `You write ${kind}. Start with the salutation and end with the sign-off and the writer's name. Leave out the date and addresses; the app adds those. Don't invent facts the writer didn't give. Reply with only the letter text.`,
      messages: [
        {
          role: "user",
          content: [
            `Writer: ${data?.fullName || "(not given)"}`,
            `${resignation ? "Current role" : "Role applying for"}: ${data?.role || "(not given)"}`,
            `Recipient: ${data?.recipient || "(not given)"}`,
            `Company: ${data?.company || "(not given)"}`,
            `Notes: ${notes || "(none)"}`,
            data?.body ? `Current draft to improve:\n${data.body}` : "",
          ].join("\n"),
        },
      ],
    });
    return NextResponse.json({ text });
  } catch (e) {
    return aiErrorResponse(e);
  }
}
