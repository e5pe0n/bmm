import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import TagCreatableSelect from "../../components/TagCreatableSelect";
import type z from "zod";
import {
  type Bookmark,
  editBookmark,
  editBookmarkSchema,
} from "../../features/bookmark";
import type { Tag } from "../../features/tag";

const formSchema = editBookmarkSchema;

type FormValues = z.infer<typeof formSchema>;

type Props = {
  bookmark: Pick<Bookmark, "id" | "title" | "url" | "tags">;
  tags: Tag[];
};

export default function EditBookmarkModal({ bookmark, tags }: Props) {
  const options = tags.map((tag) => {
    return {
      value: tag.id,
      label: tag.name,
      color: tag.color,
    };
  });

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
  } = useForm({
    values: {
      ...bookmark,
      tagIds: bookmark.tags.map((tag) => tag.id),
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
        reset(bookmark);
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
          <fieldset className="fieldset">
            <label htmlFor="select-tags" className="label">
              Tags
            </label>
            <Controller
              control={control}
              name="tagIds"
              render={({ field }) => {
                return (
                  <TagCreatableSelect
                    id="select-tags"
                    options={options}
                    isMulti
                    value={
                      field.value && field.value.length > 0
                        ? options.filter((option) =>
                            field.value.includes(option.value),
                          )
                        : []
                    }
                    onChange={(newValue) => {
                      field.onChange(
                        newValue ? newValue.map((v) => v.value) : [],
                      );
                    }}
                  />
                );
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
