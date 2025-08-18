import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import chroma from "chroma-js";
import { useState } from "react";
import { GoPencil } from "react-icons/go";
import Select from "react-select";
import type { Bookmark } from "../../features/bookmark";
import type { Tag } from "../../features/tag";

type Props = {
  bookmarks: BookmarkRow[];
  tags: Tag[];
  values: Bookmark["id"][];
  onChange: (selectedIds: Bookmark["id"][]) => void;
};

type BookmarkRow = Bookmark & {
  onClickEdit?: (() => void) | (() => Promise<void>);
};

type Option = {
  label: Tag["name"];
  value: Tag["id"];
  color: Tag["color"];
};

export default function BookmarkTable({
  bookmarks,
  tags,
  values,
  onChange,
}: Props) {
  const options: Option[] = tags.map((tag) => {
    return {
      value: tag.id,
      label: tag.name,
      color: tag.color,
    };
  });

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<BookmarkRow>[] = [
    {
      id: "checkbox",
      cell: (info) => (
        <input
          type="checkbox"
          className="checkbox checkbox-primary"
          checked={values.includes(info.row.original.id)}
          onChange={(e) => {
            const selectedIds = new Set(values);
            const checkedId = info.row.original.id;
            if (e.target.checked) {
              selectedIds.add(checkedId);
            } else {
              selectedIds.delete(checkedId);
            }
            onChange(Array.from(selectedIds));
          }}
        />
      ),
    },
    {
      header: "title",
      accessorKey: "title",
    },
    {
      header: "url",
      accessorKey: "url",
      cell: (info) => (
        <a className="link" href={info.row.original.url}>
          {info.row.original.url}
        </a>
      ),
    },
    {
      header: "tags",
      accessorKey: "tags",
      filterFn: (row, _, filterValue: Option["value"][]) => {
        const tagIds = row.original.tags.map((tag) => tag.id);
        return filterValue.every((v) => tagIds.includes(v));
      },
      cell: (info) => (
        <div className="flex gap-2">
          {info.row.original.tags.map((tag) => {
            return (
              <div
                key={`bookmark-${info.row.original.id}-tag-${tag.id}`}
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
        </div>
      ),
    },
    {
      id: "edit",
      cell: (info) => (
        <button
          className="cursor-pointer"
          type="button"
          onClick={info.row.original.onClickEdit}
        >
          <GoPencil />
        </button>
      ),
    },
  ];

  const table = useReactTable({
    data: bookmarks,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const tagsColumn = table.getColumn("tags")!;

  return (
    <>
      <div className="p-4">
        <Select
          className="w-full"
          placeholder="tags"
          id="select-tags"
          options={options}
          isMulti
          value={options.filter((option) => {
            const filterValue =
              (tagsColumn.getFilterValue() as Option["value"][]) ?? [];
            return filterValue.includes(option.value);
          })}
          onChange={(newValue) => {
            tagsColumn.setFilterValue(newValue.map((option) => option.value));
          }}
        />
      </div>
      <div>
        <table className="table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => {
              return (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
