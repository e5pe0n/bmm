import { range } from "@e5pe0n/ts-lib";
import { GoChevronLeft, GoChevronRight } from "react-icons/go";

type Props = {
  pageIndex: number;
  lastPageIndex: number;
  onClickPageIndex?: (pageIndex: number) => void;
};

export default function Pagination({
  pageIndex,
  lastPageIndex,
  onClickPageIndex,
}: Props) {
  const paginations = range(pageIndex - 2, pageIndex + 3).filter(
    (i) => i >= 0 && i <= lastPageIndex,
  );

  return (
    <div className="flex justify-between">
      <button
        className="btn btn-ghost"
        type="button"
        onClick={() => onClickPageIndex?.(pageIndex - 1)}
        disabled={pageIndex <= 0}
      >
        <GoChevronLeft />
      </button>
      <div className="flex items-center gap-4">
        {pageIndex >= 3 && (
          <button
            className="btn btn-link px-0"
            type="button"
            onClick={() => onClickPageIndex?.(0)}
          >
            {1}
          </button>
        )}
        {pageIndex >= 4 && <span>...</span>}
        {paginations.map((i) =>
          i === pageIndex ? (
            <span className="font-bold" key={`pagination-${i}`}>
              {i + 1}
            </span>
          ) : (
            <button
              className="btn btn-link px-0"
              key={`pagination-${i}`}
              type="button"
              onClick={() => onClickPageIndex?.(i)}
            >
              {i + 1}
            </button>
          ),
        )}
        {pageIndex + 3 < lastPageIndex && <span>...</span>}
        {pageIndex + 3 <= lastPageIndex && (
          <button
            className="btn btn-link px-0"
            type="button"
            onClick={() => onClickPageIndex?.(lastPageIndex)}
          >
            {lastPageIndex + 1}
          </button>
        )}
      </div>
      <button
        className="btn btn-ghost"
        type="button"
        onClick={() => onClickPageIndex?.(pageIndex + 1)}
        disabled={pageIndex >= lastPageIndex}
      >
        <GoChevronRight />
      </button>
    </div>
  );
}
