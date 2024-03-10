"use server";

import { experimental_StreamingReactResponse } from "ai";

import { ChatCompletionMessageParam } from "openai/resources/chat";
import { SettingsProps } from "./types";
import { createOpenAIStream } from "./openai-stream";

type RequestProps = {
  messages: ChatCompletionMessageParam[];
  data: { imageUrl?: string; settings: SettingsProps };
};

export async function handler(
  body: RequestProps,
): Promise<experimental_StreamingReactResponse> {
  const {
    messages,
    data: { imageUrl, settings },
  } = body;

  const { stream, data } = await createOpenAIStream(
    messages,
    settings,
    imageUrl,
  );
    console.log("Handler")
  return new experimental_StreamingReactResponse(stream, {
    data,
    ui({ content, data }) {
      console.log(data[0])
      return <div>lol wat{content}</div>
      if (data?.[0] != null) {
        const value = data[0] as any;

        switch (value.type) {
          case "weather": {
            return (
              <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{value.location}</h2>
                  <svg
                    className=" w-8 h-8"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                  </svg>
                </div>
                <p className="text-4xl font-semibold mt-2">
                  {value.temperature}° {value.format}
                </p>
              </div>
            );
          }

          case "image": {
            return (
              <div className="border-8 border-[#8B4513] dark:border-[#5D2E1F] rounded-lg overflow-hidden">
                <img
                  alt="Framed Image"
                  className="aspect-square object-cover w-full"
                  height="500"
                  src={value.url}
                  width="500"
                />
              </div>
            );
          }
        }
      }

      return <div><strong>Response!!</strong>{}</div>;
    },
  });
}
