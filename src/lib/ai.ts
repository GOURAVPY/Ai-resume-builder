import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const MODEL = "claude-opus-5-5";

let client: Anthropic | null = null;
function getClient() {
  client ??= new Anthropic();
  return client;
}

export class AiNotConfiguredError extends Error {
  constructor() {
    super("AI isn't set up yet. Add ANTHROPIC_API_KEY to the .env.local file and restart the app.");
  }
}

function assertConfigured() {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) throw new AiNotConfiguredError();
}

const textOf = (content: Anthropic.Beta.BetaContentBlock[]) =>
  content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

type Ask = {
  system: string;
  messages: Anthropic.Beta.BetaMessageParam[];
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
};

// One Claude request; returns the reply text. If a safety check declines,
// the server-side fallback lets another model answer instead.
export async function ask({ system, messages, effort = "low", maxTokens = 16000 }: Ask) {
  assertConfigured();
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });
  if (response.stop_reason === "refusal") throw new Error("The AI couldn't help with that request.");
  return textOf(response.content);
}

// Streams the reply text as it's written, for the chat page.
export function askStream({ system, messages, effort = "low", maxTokens = 16000 }: Ask) {
  assertConfigured();
  const stream = getClient().beta.messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    output_config: { effort },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") controller.enqueue(encoder.encode("\n\n(The AI couldn't help with that request.)"));
      } catch (e) {
        controller.enqueue(encoder.encode(`\n\n(${aiErrorMessage(e)})`));
      } finally {
        controller.close();
      }
    },
  });
}

// Asks for JSON matching a schema and parses it.
export async function askJson<T>(args: Ask & { schema: Record<string, unknown> }): Promise<T> {
  assertConfigured();
  const response = await getClient().beta.messages.create({
    model: MODEL,
    max_tokens: args.maxTokens ?? 16000,
    system: args.system,
    messages: args.messages,
    output_config: { effort: args.effort ?? "low", format: { type: "json_schema", schema: args.schema } },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });
  if (response.stop_reason === "refusal") throw new Error("The AI couldn't help with that request.");
  return JSON.parse(textOf(response.content)) as T;
}

export function aiErrorMessage(e: unknown) {
  if (e instanceof AiNotConfiguredError) return e.message;
  if (e instanceof Anthropic.AuthenticationError) return "The AI key is invalid. Check ANTHROPIC_API_KEY in .env.local.";
  if (e instanceof Anthropic.RateLimitError) return "The AI is busy right now. Please try again in a minute.";
  if (e instanceof Anthropic.APIError) return "The AI service had a problem. Please try again.";
  if (e instanceof Error) return e.message;
  return "AI request failed.";
}

export function aiErrorResponse(e: unknown) {
  const status = e instanceof AiNotConfiguredError ? 503 : 502;
  return NextResponse.json({ error: aiErrorMessage(e) }, { status });
}
