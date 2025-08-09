import { HttpResponse, http, type RequestHandler } from "msw";
import { setupWorker } from "msw/browser";
import { config } from "../config";
import type { BookmarkIn } from "../features/bookmark";

const handlers: RequestHandler[] = [
  http.get(config.apiEndpoint, () => {
    return HttpResponse.json([
      {
        id: "1",
        title: "Example Bookmark",
        url: "https://example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "Another Bookmark",
        url: "https://another-example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "3",
        title: "Third Bookmark",
        url: "https://third-example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] satisfies BookmarkIn[]);
  }),
];

export const worker = setupWorker(...handlers);
