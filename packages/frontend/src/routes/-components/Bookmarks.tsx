import { useQueryClient, useSuspenseQueries } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  type Bookmark,
  deleteBookmarks,
  fetchBookmarks,
} from "../../features/bookmark";
import { fetchTags } from "../../features/tag";
import AddBookmarkModal from "./AddBookmarkModal";
import BookmarkTable from "./BookmarkTable";
import EditBookmarkModal from "./EditBookmarkModal";

type FormValues = {
  selectedBookmarkIds: Bookmark["id"][];
};

export default function Bookmarks() {
  const [
    { data: bookmarks, error: bookmarksError },
    { data: tags, error: tagsError },
  ] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["bookmarks"],
        queryFn: fetchBookmarks,
      },
      {
        queryKey: ["tags"],
        queryFn: fetchTags,
      },
    ],
  });

  if (bookmarksError) {
    throw new Error("failed to fetch bookmarks", {
      cause: bookmarksError,
    });
  }
  if (tagsError) {
    throw new Error("failed to fetch tags", {
      cause: tagsError,
    });
  }

  const { handleSubmit, control, watch, reset } = useForm<FormValues>({
    defaultValues: {
      selectedBookmarkIds: [],
    },
  });

  const queryClient = useQueryClient();

  const onSubmit = async (data: FormValues) => {
    try {
      await deleteBookmarks(data.selectedBookmarkIds);
      reset({
        selectedBookmarkIds: [], // Reset the selected IDs after submission
      });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    } catch (error) {
      console.error("Error deleting bookmarks:", error);
    }
  };

  const selectedBookmarkIds = watch("selectedBookmarkIds");

  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  return (
    <>
      <div>
        {bookmarks && tags && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-end">
              <div className="flex space-x-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const modal = document.getElementById("add-bookmark-modal");
                    if (modal instanceof HTMLDialogElement) {
                      modal.showModal();
                    }
                  }}
                >
                  Add
                </button>
                <button
                  disabled={selectedBookmarkIds.length === 0}
                  type="submit"
                  className="btn btn-error"
                >
                  Delete
                </button>
              </div>
            </div>
            <Controller
              name="selectedBookmarkIds"
              control={control}
              render={({ field: { onChange, value } }) => (
                <BookmarkTable
                  bookmarks={bookmarks.map((v) => {
                    return {
                      ...v,
                      onClickEdit: () => {
                        setEditingBookmark(v);
                        const modal = document.getElementById(
                          "edit-bookmark-modal",
                        );
                        if (modal instanceof HTMLDialogElement) {
                          modal.showModal();
                        }
                      },
                    };
                  })}
                  tags={tags}
                  values={value}
                  onChange={onChange}
                />
              )}
            />
          </form>
        )}
      </div>
      {tags && <AddBookmarkModal tags={tags} />}
      {tags && editingBookmark && (
        <EditBookmarkModal bookmark={editingBookmark} tags={tags} />
      )}
    </>
  );
}
