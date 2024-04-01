import type { ChatCompletionCreateParams } from "openai/resources/chat";
import OpenAI from "openai";

const meta: ChatCompletionCreateParams.Function = {
  name: "analyzeImage",
  description: `This function utilizes GPT 4 Vision to analyze an image and answer questions about it`,
  parameters: {
    type: "object",
    properties: {
      question: {
        type: "string",
        description:
          "Required. What do you want to know about the image? You can ask specific questions or for a general description. Use the user's questionining to help you determine an answer",
      },
    },
    required: ["question"],
  },
};

async function analyzeImage(question: string, imageUrl: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Review the attached image and response with a detailed description of the image.  Ensure that you provide enough detail and clarity that the following question about the image can be answered: ${question}`,
          },
          {
            type: "image_url",
            image_url: imageUrl,
          },
        ],
      },
    ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  });

  return response.choices[0].message.content;
}

async function run(question: string, imageUrl?: string) {
  if (!imageUrl) {
    return "Error! No image was provided.";
  }

  return analyzeImage(
    question || "Describe what is captured by this image.",
    imageUrl,
  );
}

export default { run, meta };
