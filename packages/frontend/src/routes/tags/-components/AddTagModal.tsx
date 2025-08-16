import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type z from "zod";
import { addTag, addTagSchema, type Color } from "../../../features/tag";

const formSchema = addTagSchema;

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  name: "",
  color: "#ffffff" as Color,
} as const;

export default function AddTagModal() {
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
      // Call the API to add the tag
      await addTag(data);
      const modal = document.getElementById("add-tag-modal");
      if (modal instanceof HTMLDialogElement) {
        modal.close();
      }
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  return (
    <dialog
      id="add-tag-modal"
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
          <h1 className="text-lg pb-2">Add Tag</h1>
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
