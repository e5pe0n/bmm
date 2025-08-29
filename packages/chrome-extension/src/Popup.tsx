import { use } from "react";
import AddBookmarkForm from "./AddBookmarkForm";
import { fetchTags } from "./tag";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function Popup() {
  const [tab] = use(
    chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    }),
  );

  if (!tab) {
    throw new Error("current tab not found.");
  }

  const { data: tags } = useSuspenseQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  return (
    <div className="py-2">
      <AddBookmarkForm
        defaultValues={{
          title: tab.title ?? "",
          url: tab.url ?? "",
          tagIds: [],
        }}
        tags={tags}
      />
    </div>
  );
}
