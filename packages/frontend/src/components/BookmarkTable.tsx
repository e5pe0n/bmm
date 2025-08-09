import type { Bookmark } from "../features/bookmark";

type Props = {
  bookmarks: Bookmark[];
};

export default function BookmarkTable({ bookmarks }: Props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>URL</th>
          <th>Created At</th>
          <th>Updated At</th>
        </tr>
      </thead>
      <tbody>
        {bookmarks.map((bookmark) => (
          <tr key={bookmark.id}>
            <td>{bookmark.id}</td>
            <td>{bookmark.title}</td>
            <td>
              <a className="link" href={bookmark.url}>
                {bookmark.url}
              </a>
            </td>
            <td>{bookmark.createdAt.toISOString()}</td>
            <td>{bookmark.updatedAt.toISOString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
