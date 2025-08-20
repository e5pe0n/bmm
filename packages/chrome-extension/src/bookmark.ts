import * as changeKeys from "change-case/keys";

type Bookmark = {
  title: string;
  url: string;
  tagIds: number[];
};

export async function saveBookmark(data: Bookmark) {
  const snakeCaseData = changeKeys.snakeCase(data, 4);
  const res = await fetch("http://localhost:3000/v1/bookmarks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(snakeCaseData),
  });

  if (!res.ok) {
    throw new Error(`failed to save bookmark; ${res.statusText}`);
  }
}
