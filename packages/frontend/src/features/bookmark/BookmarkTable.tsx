import type { Bookmark } from ".";

type Props = {
  bookmarks: Bookmark[];
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
          </tr>
        ))}
      </tbody>
    </table>
  );
}
