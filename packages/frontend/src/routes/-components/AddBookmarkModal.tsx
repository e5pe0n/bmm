import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import type z from "zod";
import { addBookmark, addBookmarkSchema } from "../../features/bookmark";
import { addTag, Color, type Tag } from "../../features/tag";
import { useState } from "react";

const formSchema = addBookmarkSchema;

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  title: "",
  url: "",
  tagIds: [],
} as const;

type Props = {
  tags: Tag[];
};

export default function AddBookmarkModal({ tags }: Props) {
  const defaultOptions = tags.map((tag) => {
    return {
      value: tag.id,
      label: tag.name,
      color: tag.color,
    };
  });
  const [options, setOptions] = useState(defaultOptions);
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
    getValues,
    setValue,
  } = useForm({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const handleCreate = async (inputValue: string) => {
    setIsLoading(true);
    try {
      const addedTag = await addTag({
        name: inputValue,
        color: Color.new(),
      });
      setOptions([
        ...defaultOptions,
        {
          value: addedTag.id,
          label: addedTag.name,
          color: addedTag.color,
        },
      ]);
      setValue("tagIds", [...getValues("tagIds"), addedTag.id]);
    } catch (error) {
      console.error("error occurred during adding a tag.", error);
    }
    setIsLoading(false);
  };

  const queryClient = useQueryClient();

  const onSubmit = async (data: FormValues) => {
    try {
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
          <fieldset className="fieldset">
            <label htmlFor="select-tags" className="label">
              Tags
            </label>
            <Controller
              control={control}
              name="tagIds"
              render={({ field }) => {
                return (
                  <CreatableSelect
                    isClearable
                    isLoading={isLoading}
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
                    onCreateOption={handleCreate}
                  />
                );
              }}
            />
          </fieldset>
          <div className="flex justify-end pt-12">
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
