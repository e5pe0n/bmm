import * as changeKeys from "change-case/keys";
import { z } from "zod";
import { config } from "../../config";

const bookmarkSchema = z.object({
  id: z.coerce.string(),
  title: z.string(),
  url: z.url(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type BookmarkIn = z.input<typeof bookmarkSchema>;
export type Bookmark = z.infer<typeof bookmarkSchema>;

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const res = await fetch(`${config.apiEndpoint}/bookmarks`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((error) => {
    throw new Error("failed to fetch bookmarks.", {
      cause: error,
    });
  });

  if (!res.ok) {
    throw new Error(`failed to fetch bookmarks: ${res.statusText}`);
  }

  const jsonData = await res.json();
  const camelCaseJsonData = changeKeys.camelCase(jsonData, 2);
  const valiRes = z.array(bookmarkSchema).safeParse(camelCaseJsonData);

  if (!valiRes.success) {
    throw new Error(
      `failed to fetch bookmarks:\n${z.prettifyError(valiRes.error)}`,
      {
        cause: valiRes.error,
      },
    );
  }

  return valiRes.data;
}
