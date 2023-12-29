import { createIssue } from "@/app/utils/github";
import { NextRequest, NextResponse } from "next/server";
const ENDPOINT = "POST /repos/{owner}/{repo}/issues";

export async function POST(request: NextRequest) {
  if (!request.body) {
    return "No body provided.";
  }
  const { repository, title, body, labels, assignees } = await request.json();
  try {
    const issue = await createIssue({
      repository,
      title,
      body,
      labels,
      assignees,
    });
    return NextResponse.json({ status: "success", issue });
  } catch (error) {
    console.log("Failed to create issue!");
    console.log(error);
    return "An error occured when trying to create that issue.";
  }
}
