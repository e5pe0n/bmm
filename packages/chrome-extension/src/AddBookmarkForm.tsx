import { ErrorMessage } from "@hookform/error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const tagIdSchema = z.number().brand<"TagId">();

const formSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  tagIds: z.array(tagIdSchema).min(1),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  defaultValues: FormValues;
};

export default function AddBookmarkForm({ defaultValues }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormValues) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex">
        <label htmlFor="title-input">Title:</label>
        <input
          id="title-input"
          {...register("title")}
          type="text"
          className="input input-xs w-fit"
        />
      </div>
      <ErrorMessage
        errors={errors}
        name="title"
        render={({ message }) => {
          return <p className="label text-error">{message}</p>;
        }}
      />
      <div className="flex justify-end">
        <button className="btn btn-primary btn-xs" type="submit">
          Save
        </button>
      </div>
    </form>
  );
}
