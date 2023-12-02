import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import { NextRequest, NextResponse } from "next/server";
const ENDPOINT = "GET /notifications/threads/{thread_id}";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = params.id;
  type GetThreadResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  try {
    const newEndpoint = ENDPOINT.replace("{thread_id}", id);
    const response = await githubApiRequest<GetThreadResponse>(newEndpoint, {
      thread_id: id,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.log("Failed to fetch commits!");
    console.log(error);
    return "An error occured when trying to fetch commits.";
  }
}
