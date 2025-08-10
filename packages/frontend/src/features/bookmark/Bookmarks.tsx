import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { deleteBookmarks, fetchBookmarks, type Bookmark } from ".";
import BookmarkTable from "./BookmarkTable";
import { Controller, useForm } from "react-hook-form";
import AddBookmarkModal from "./AddBookmarkModal";
import EditBookmarkModal from "./EditBookmarkModal";
import { useState } from "react";

type FormValues = {
  selectedBookmarkIds: Bookmark["id"][];
};

export default function Bookmarks() {
  const { data, error } = useSuspenseQuery({
    queryKey: ["bookmarks"],
    queryFn: fetchBookmarks,
  });

  if (error) {
    throw new Error("Failed to fetch bookmarks", {
      cause: error,
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
        {data && (
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
                  bookmarks={data.map((v) => {
                    return {
                      ...v,
                      onClickMenu: () => {
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
                  values={value}
                  onChange={onChange}
                />
              )}
            />
          </form>
        )}
      </div>
      <AddBookmarkModal />
      {editingBookmark && <EditBookmarkModal {...editingBookmark} />}
    </>
  );
}
