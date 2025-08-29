import { HttpResponse, http, type RequestHandler } from "msw";
import { setupWorker } from "msw/browser";
import { config } from "../config";
import type { BookmarkIn } from "../features/bookmark";

const handlers: RequestHandler[] = [
  http.get(config.apiEndpoint, () => {
    return HttpResponse.json([
      {
        id: 1,
        title: "Example Bookmark",
        url: "https://example.com",
        tags: [
          {
            id: 1,
            name: "Linux",
            color: "#0000ff",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 2,
            name: "Rust",
            color: "#00ff00",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: "Another Bookmark",
        url: "https://another-example.com",
        tags: [
          {
            id: 1,
            name: "Linux",
            color: "#0000ff",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 3,
            name: "TypeScript",
            color: "#ff0000",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        title: "Third Bookmark",
        url: "https://third-example.com",
        tags: [
          {
            id: 2,
            name: "Rust",
            color: "#00ff00",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 3,
            name: "TypeScript",
            color: "#ff0000",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ] satisfies BookmarkIn[]);
  }),
];

export const worker = setupWorker(...handlers);
