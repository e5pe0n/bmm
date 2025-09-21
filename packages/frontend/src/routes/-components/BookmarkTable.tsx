import { rankItem } from "@tanstack/match-sorter-utils";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type FilterFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type PaginationState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import { GoPencil, GoSearch } from "react-icons/go";
import Select from "react-select";
import DebouncedInputString from "../../components/DebouncedInput";
import Pagination from "../../components/Pagination";
import Tag from "../../components/Tag";
import type { Bookmark } from "../../features/bookmark";
import type { Tag as ITag } from "../../features/tag";
import { getFaviconUrl } from "../../utils";

declare module "@tanstack/react-table" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
}

const fuzzyFilter: FilterFn<unknown> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
  return itemRank.passed;
};

type BookmarkRow = Bookmark & {
  onClickEdit?: (() => void) | (() => Promise<void>);
};

type Option = {
  label: ITag["name"];
  value: ITag["id"];
  color: ITag["color"];
};

type Props = {
  bookmarks: BookmarkRow[];
  tags: ITag[];
  values: Bookmark["id"][];
  onChange: (selectedIds: Bookmark["id"][]) => void;
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

  const [globalFilter, setGlobalFilter] = useState("");
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
      enableGlobalFilter: false,
    },
    {
      id: "icon",
      cell: (info) => {
        return (
          <img
            src={getFaviconUrl(new URL(info.row.original.url))}
            aria-label="favicon"
          />
        );
      },
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
              <Tag
                key={`bookmark-${info.row.original.id}-tag-${tag.id}`}
                tag={tag}
              />
            );
          })}
        </div>
      ),
      enableGlobalFilter: false,
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
      enableGlobalFilter: false,
    },
  ];

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: bookmarks,
    columns,
    state: {
      columnFilters,
      globalFilter,
      pagination,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: "fuzzy",
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const tagsColumn = table.getColumn("tags")!;

  return (
    <>
      <div className="p-4 space-y-2">
        <label htmlFor="search-input" className="input w-full">
          <GoSearch />
          <DebouncedInputString
            id="search-input"
            type="search"
            placeholder="Search..."
            onChange={(value) => {
              setGlobalFilter(value);
            }}
          />
        </label>
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
        <Pagination
          pageIndex={table.getState().pagination.pageIndex}
          onClickPageIndex={table.setPageIndex}
          lastPageIndex={Math.max(table.getPageCount() - 1, 0)}
        />
      </div>
    </>
  );
}
