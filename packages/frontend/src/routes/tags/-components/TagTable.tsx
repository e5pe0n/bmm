import { GoPencil } from "react-icons/go";
import type { Tag } from "../../../features/tag";

type Props = {
  tags: (Tag & {
    onClickEdit?: (() => void) | (() => Promise<void>);
  })[];
  values: Tag["id"][];
  onChange: (selectedIds: Tag["id"][]) => void;
};

export default function TagTable({ tags, values, onChange }: Props) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th></th>
          <th>Name</th>
          <th>Color</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {tags.map((tag) => (
          <tr key={tag.id}>
            <td>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={values.includes(tag.id)}
                onChange={(e) => {
                  const selectedIds = new Set(values);
                  if (e.target.checked) {
                    selectedIds.add(tag.id);
                  } else {
                    selectedIds.delete(tag.id);
                  }
                  onChange(Array.from(selectedIds));
                }}
              />
            </td>
            <td>{tag.name}</td>
            <td className="flex items-center gap-2">
              <div
                className="size-4"
                style={{ backgroundColor: tag.color }}
              ></div>
              <span>{tag.color}</span>
            </td>
            <td>
              <button
                className="cursor-pointer"
                type="button"
                onClick={tag.onClickEdit}
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
