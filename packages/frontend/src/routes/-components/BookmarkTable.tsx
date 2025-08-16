import chroma from "chroma-js";
import { GoPencil } from "react-icons/go";
import type { Bookmark } from "../../features/bookmark";

type Props = {
  bookmarks: (Bookmark & {
    onClickEdit?: (() => void) | (() => Promise<void>);
  })[];
  values: Bookmark["id"][];
  onChange: (selectedIds: Bookmark["id"][]) => void;
};

export default function BookmarkTable({ bookmarks, values, onChange }: Props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th></th>
          <th>Title</th>
          <th>URL</th>
          <th>Tags</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {bookmarks.map((bookmark) => (
          <tr key={bookmark.id}>
            <td>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={values.includes(bookmark.id)}
                onChange={(e) => {
                  const selectedIds = new Set(values);
                  if (e.target.checked) {
                    selectedIds.add(bookmark.id);
                  } else {
                    selectedIds.delete(bookmark.id);
                  }
                  onChange(Array.from(selectedIds));
                }}
              />
            </td>
            <td>{bookmark.title}</td>
            <td>
              <a className="link" href={bookmark.url}>
                {bookmark.url}
              </a>
            </td>
            <td className="flex gap-1">
              {bookmark.tags.map((tag) => {
                return (
                  <div
                    key={tag.id}
                    className="badge"
                    style={{
                      backgroundColor: tag.color,
                      color:
                        // https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast
                        chroma.contrast(tag.color, "white") > 4.5
                          ? "white"
                          : "black",
                    }}
                  >
                    {tag.name}
                  </div>
                );
              })}
            </td>
            <td>
              <button
                className="cursor-pointer"
                type="button"
                onClick={bookmark.onClickEdit}
              >
                <GoPencil />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
