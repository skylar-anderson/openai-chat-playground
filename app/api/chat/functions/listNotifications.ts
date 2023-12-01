import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "GET /notifications";

const meta: ChatCompletionCreateParams.Function = {
  name: "listNotifications",
  description: `List all notifications for the current user, sorted by most recently updated. Typically when you use this function, you will need to render responses in a notificationsList block`,
  parameters: {
    type: "object",
    properties: {
      all: {
        type: "boolean",
        description:
          "Optional. If true, show notifications marked as read. Defaults to false.",
      },
      page: {
        type: "number",
        description:
          "Optional. Defaults to 1. The page of commits to return, defaults to 1",
      },
      participating: {
        type: "boolean",
        description:
          "Optional. If true, only shows notifications in which the user is directly participating or mentioned. Defaults to false.",
      }
    },
    required: [],
  },
};

async function run(all:boolean=false, participating:boolean=false, page:number=1) {
  type ListNotificationsResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  try {
    const response = await githubApiRequest<ListNotificationsResponse>(ENDPOINT, {
      all, participating, page,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        "Accept": "application/vnd.github+json"
      },
    });
    return response?.data.map((notification) => ({
      text: `*${notification.subject.title}* by ${notification.repository.full_name} (${notification.reason})`,
      subject: notification.subject,
      reason: notification.reason,
      unread: notification.unread,
      url: notification.url,

    }));
  } catch (error) {
    console.log("Failed to fetch notifications!");
    console.log(error);
    return "An error occured when trying to fetch notifications.";
  }
}

export default { run, meta };
