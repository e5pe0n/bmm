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

const deleteIdsSchema = z.array(z.coerce.number());

export async function deleteBookmarks(ids: Bookmark["id"][]): Promise<void> {
  const valiRes = deleteIdsSchema.safeParse(ids);

  if (!valiRes.success) {
    throw new Error(
      `failed to delete bookmarks:\n${z.prettifyError(valiRes.error)}`,
      {
        cause: valiRes.error,
      },
    );
  }

  const res = await fetch(`${config.apiEndpoint}/bookmarks`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(valiRes.data),
  }).catch((error) => {
    throw new Error("failed to delete bookmarks.", {
      cause: error,
    });
  });

  if (!res.ok) {
    throw new Error(`failed to delete bookmarks: ${res.statusText}`);
  }
}

export const addBookmarkSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
});

type AddBookmark = z.infer<typeof addBookmarkSchema>;

export async function addBookmark(data: AddBookmark): Promise<void> {
  const res = await fetch(`${config.apiEndpoint}/bookmarks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).catch((error) => {
    throw new Error("failed to add bookmark.", {
      cause: error,
    });
  });

  if (!res.ok) {
    throw new Error(`failed to add bookmark: ${res.statusText}`);
  }
}

export const editBookmarkSchema = z.object({
  id: z.coerce.number(),
  title: z.string().min(1),
  url: z.url(),
});

type EditBookmark = z.infer<typeof editBookmarkSchema>;

export async function editBookmark(data: EditBookmark): Promise<void> {
  const res = await fetch(`${config.apiEndpoint}/bookmarks`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).catch((error) => {
    throw new Error("failed to edit bookmark.", {
      cause: error,
    });
  });

  if (!res.ok) {
    throw new Error(`failed to edit bookmark: ${res.statusText}`);
  }
}
