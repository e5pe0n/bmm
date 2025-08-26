import { use } from "react";
import AddBookmarkForm from "./AddBookmarkForm";

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

  return (
    <AddBookmarkForm
      defaultValues={{
        title: tab.title ?? "",
        url: tab.url ?? "",
        tagIds: [],
      }}
    />
  );
}
