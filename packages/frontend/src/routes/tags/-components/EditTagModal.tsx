import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type z from "zod";
import { editTag, editTagSchema, type Tag } from "../../../features/tag";

const formSchema = editTagSchema;

type FormValues = z.infer<typeof formSchema>;

type Props = Pick<Tag, "id" | "name" | "color">;

export default function EditTagModal(props: Props) {
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm({
    values: {
      ...props,
    },
    resolver: zodResolver(formSchema),
  });

  const queryClient = useQueryClient();

  const onSubmit = async (data: FormValues) => {
    try {
      // Call the API to edit the tag
      await editTag(data);
      const modal = document.getElementById("edit-tag-modal");
      if (modal instanceof HTMLDialogElement) {
        modal.close();
      }
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    } catch (error) {
      console.error("Error editing tag:", error);
    }
  };

  return (
    <dialog
      id="edit-tag-modal"
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
          <h1 className="text-lg pb-2">Edit Tag</h1>
          <fieldset className="fieldset">
            <label htmlFor="name-input" className="label">
              Name
            </label>
            <input
              id="name-input"
              className="input w-full"
              type="text"
              {...register("name")}
            />
            <ErrorMessage
              errors={errors}
              name="name"
              render={({ message }) => {
                return <p className="label text-error">{message}</p>;
              }}
            />
          </fieldset>
          <fieldset className="fieldset">
            <label htmlFor="color-input" className="label">
              Color
            </label>
            <input
              id="color-input"
              className="input w-full"
              type="color"
              {...register("color")}
            />
            <ErrorMessage
              errors={errors}
              name="color"
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
