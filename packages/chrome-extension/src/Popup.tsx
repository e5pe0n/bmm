import { use, useState } from "react";
import { saveBookmark } from "./bookmark";

type State =
  | {
      status: "new";
    }
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

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

  const [state, setState] = useState<State>({
    status: "new",
  });

  return (
    <div>
      <p>{tab.url}</p>
      {state.status === "error" && <p>{state.error}</p>}
      {state.status === "success" && <p>Saved!</p>}
      <button
        className="btn btn-primary"
        type="button"
        onClick={async () => {
          try {
            await saveBookmark({
              title: tab.title!,
              url: tab.url!,
              tagIds: [1],
            });
            setState({
              status: "success",
            });
          } catch (error) {
            setState({
              status: "error",
              error: String(error),
            });
          }
        }}
      >
        Save
      </button>
    </div>
  );
}
