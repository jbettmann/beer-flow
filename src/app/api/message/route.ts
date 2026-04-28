import { auth } from "@/auth";
import { chatbotPrompt } from "@/app/helpers/constants/chatbot-prompt";
import {
  ChatGPTMessage,
  OpenAIStream,
  OpenAIStreamPayload,
} from "@/lib/opendai-stream";
import { MessageArraySchema } from "@/lib/validators/message";
import { NextResponse } from "next/server";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_MESSAGES = 20;
const MAX_MESSAGE_CHARS = 1000;
const MAX_TOTAL_CHARS = 6000;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  if (process.env.ENABLE_MESSAGE_API !== "true") {
    return jsonError("Not found", 404);
  }

  const session = await auth();
  if (!session?.user) {
    return jsonError("Unauthorized", 401);
  }

  const contentLength = req.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
    return jsonError("Request too large", 413);
  }

  const rawBody = await req.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return jsonError("Request too large", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsedMessagesResult = MessageArraySchema.safeParse(
    (body as { messages?: unknown })?.messages
  );
  if (!parsedMessagesResult.success) {
    return jsonError("Invalid messages payload", 400);
  }

  const parsedMessages = parsedMessagesResult.data;
  if (parsedMessages.length > MAX_MESSAGES) {
    return jsonError("Too many messages", 413);
  }

  const totalChars = parsedMessages.reduce(
    (sum, message) => sum + message.text.length,
    0
  );
  if (
    totalChars > MAX_TOTAL_CHARS ||
    parsedMessages.some((message) => message.text.length > MAX_MESSAGE_CHARS)
  ) {
    return jsonError("Message content too large", 413);
  }

  const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message) => {
    return {
      role: "user",
      content: message.text,
    };
  });

  outboundMessages.unshift({
    role: "system",
    content: chatbotPrompt,
  });

  const payload: OpenAIStreamPayload = {
    model: "gpt-3.5-turbo",
    messages: outboundMessages,
    temperature: 0.4,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 150,
    stream: true,
    n: 1,
  };

  try {
    const stream = await OpenAIStream(payload);

    return new Response(stream);
  } catch {
    return jsonError("Unable to process message request", 502);
  }
}
