import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ComponentPropsWithRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { z } from "zod";
import { saveBookmark } from "./bookmark";
import { addTag, Color, type Tag } from "./tag";

const faviconBaseUrl = "https://www.google.com/s2/favicons";

export function getFaviconUrl(url: URL): string {
  const hostname = url.hostname;
  return `${faviconBaseUrl}?domain=${hostname}`;
}

type State =
  | {
      status: "new";
    }
  | {
      status: "loading";
    }
  | {
      status: "success";
    }
  | {
      status: "error";
      error: string;
    };

const tagIdSchema = z.number().brand<"TagId">();

const formSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  tagIds: z.array(tagIdSchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  defaultValues: FormValues;
  tags: Tag[];
} & Omit<ComponentPropsWithRef<"form">, "defaultValues">;

export default function AddBookmarkForm({
  defaultValues,
  tags,
  ...rest
}: Props) {
  const defaultOptions = tags.map((tag) => {
    return {
      value: tag.id,
      label: tag.name,
      color: tag.color,
    };
  });
  const [options, setOptions] = useState(defaultOptions);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
  } = useForm({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const [state, setState] = useState<State>({ status: "new" });

  const handleCreate = async (inputValue: string) => {
    setState({ status: "new" });
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
    setState({ status: "new" });
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setState({
        status: "loading",
      });
      await saveBookmark(data);
    } catch (error) {
      console.error("failed to save a bookmark.", error);
      setState({ status: "error", error: "failed to save a bookmark." });
      return;
    }
    setState({ status: "success" });
    window.close();
  };

  return (
    <form {...rest} onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="flex gap-1 items-center">
        <img
          src={getFaviconUrl(new URL(defaultValues.url))}
          aria-label="favicon"
        />
        <label htmlFor="title-input" className="floating-label">
          <input
            id="title-input"
            {...register("title")}
            type="text"
            className="input input-xs"
          />
          <span>Title</span>
        </label>
      </div>
      <ErrorMessage
        errors={errors}
        name="title"
        render={({ message }) => {
          return <p className="label text-error">{message}</p>;
        }}
      />
      <div>
        <Controller
          control={control}
          name="tagIds"
          render={({ field }) => {
            return (
              <CreatableSelect
                isClearable
                isLoading={state.status === "loading"}
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
                  field.onChange(newValue ? newValue.map((v) => v.value) : []);
                }}
                onCreateOption={handleCreate}
              />
            );
          }}
        />
        <ErrorMessage
          errors={errors}
          name="tagIds"
          render={({ message }) => {
            return <p className="label text-error">{message}</p>;
          }}
        />
      </div>
      {state.status === "error" && <p className="text-error">{state.error}</p>}
      <div className="flex justify-end">
        {state.status === "loading" ? (
          <button className="btn btn-primary btn-xs" type="submit" disabled>
            <span className="loading loading-spinner"></span>
            Save
          </button>
        ) : (
          <button className="btn btn-primary btn-xs" type="submit">
            Save
          </button>
        )}
      </div>
    </form>
  );
}
