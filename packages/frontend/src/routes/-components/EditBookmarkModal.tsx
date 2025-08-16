import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type z from "zod";
import {
  type Bookmark,
  editBookmark,
  editBookmarkSchema,
} from "../../features/bookmark";

const formSchema = editBookmarkSchema;

type FormValues = z.infer<typeof formSchema>;

type Props = Pick<Bookmark, "id" | "title" | "url">;

export default function EditBookmarkModal(props: Props) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    values: {
      ...props,
      tagIds: [],
    },
    resolver: zodResolver(formSchema),
  });

  const queryClient = useQueryClient();

  const onSubmit = async (data: FormValues) => {
    try {
      // Call the API to edit the bookmark
      await editBookmark(data);
      const modal = document.getElementById("edit-bookmark-modal");
      if (modal instanceof HTMLDialogElement) {
        modal.close();
      }
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    } catch (error) {
      console.error("Error editing bookmark:", error);
    }
  };

  return (
    <dialog
      id="edit-bookmark-modal"
      className="modal"
      onClose={() => {
        reset(props);
      }}
    >
      <div className="modal-box">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button
            type="submit"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
        </form>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 p-3">
          <h1 className="text-lg pb-2">Edit Bookmark</h1>
          <fieldset className="fieldset">
            <label htmlFor="title-input" className="label">
              Title
            </label>
            <input
              id="title-input"
              className="input w-full"
              type="text"
              {...register("title")}
            />
            <ErrorMessage
              errors={errors}
              name="title"
              render={({ message }) => {
                return <p className="label text-error">{message}</p>;
              }}
            />
          </fieldset>
          <fieldset className="fieldset">
            <label htmlFor="url-input" className="label">
              URL
            </label>
            <input
              id="url-input"
              className="input w-full"
              type="url"
              {...register("url")}
            />
            <ErrorMessage
              errors={errors}
              name="url"
              render={({ message }) => {
                return <p className="label text-error">{message}</p>;
              }}
            />
          </fieldset>
          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit">close</button>
      </form>
    </dialog>
  );
}
