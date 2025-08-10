import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { deleteBookmarks, fetchBookmarks, type Bookmark } from ".";
import BookmarkTable from "./BookmarkTable";
import { Controller, useForm } from "react-hook-form";

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

  return (
    <div>
      {data && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-end">
            <button
              disabled={selectedBookmarkIds.length === 0}
              type="submit"
              className="btn btn-error"
            >
              Delete
            </button>
          </div>
          <Controller
            name="selectedBookmarkIds"
            control={control}
            render={({ field: { onChange, value } }) => (
              <BookmarkTable
                bookmarks={data}
                values={value}
                onChange={onChange}
              />
            )}
          />
        </form>
      )}
    </div>
  );
}
