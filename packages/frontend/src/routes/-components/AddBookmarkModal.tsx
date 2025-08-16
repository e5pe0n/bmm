import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type z from "zod";
import { addBookmark, addBookmarkSchema } from "../../features/bookmark";

const formSchema = addBookmarkSchema;

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  title: "",
  url: "",
  tagIds: [],
} as const;

export default function AddBookmarkModal() {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const queryClient = useQueryClient();

  const onSubmit = async (data: FormValues) => {
    try {
      // Call the API to add the bookmark
      await addBookmark(data);
      const modal = document.getElementById("add-bookmark-modal");
      if (modal instanceof HTMLDialogElement) {
        modal.close();
      }
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    } catch (error) {
      console.error("Error adding bookmark:", error);
    }
  };

  return (
    <dialog
      id="add-bookmark-modal"
      className="modal"
      onClose={() => {
        reset(defaultValues);
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
          <h1 className="text-lg pb-2">Add Bookmark</h1>
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
              Add
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
