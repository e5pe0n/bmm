import { useSuspenseQuery } from "@tanstack/react-query";
import { fetchBookmarks } from ".";
import BookmarkTable from "./BookmarkTable";

export default function Bookmarks() {
  const { data, error } = useSuspenseQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
  });

  if (error) {
    throw new Error("Failed to fetch bookmarks", {
      cause: error,
    });
  }

  return <div>{data && <BookmarkTable bookmarks={data} />}</div>;
}
