import {StreamingTextResponse } from "ai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import { SettingsProps } from "../../types";
import { createOpenAIStream } from "@/app/openai-stream";

export const runtime = "edge";

type RequestProps = {
  messages: ChatCompletionMessageParam[];
  data: { imageUrl?: string; settings: SettingsProps };
};

export async function POST(req: Request) {
  const body: RequestProps = await req.json();
  const {
    messages,
    data: { imageUrl, settings },
  } = body;

  const { stream, data } = await createOpenAIStream(messages, settings, imageUrl);

  return new StreamingTextResponse(stream, {}, data);
}