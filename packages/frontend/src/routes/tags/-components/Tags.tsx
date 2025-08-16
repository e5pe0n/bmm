import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { deleteTags, fetchTags, type Tag } from "../../../features/tag";
import AddTagModal from "./AddTagModal";
import EditTagModal from "./EditTagModal";
import TagTable from "./TagTable";

type FormValues = {
  selectedTagIds: Tag["id"][];
};

export default function Tags() {
  const { data, error } = useSuspenseQuery({
    queryKey: ["tags"],
    queryFn: fetchTags,
  });

  if (error) {
    throw new Error("Failed to fetch tags", {
      cause: error,
    });
  }

  const { handleSubmit, control, watch, reset } = useForm<FormValues>({
    defaultValues: {
      selectedTagIds: [],
    },
  });

  const queryClient = useQueryClient();

  const onSubmit = async (data: FormValues) => {
    try {
      await deleteTags(data.selectedTagIds);
      reset({
        selectedTagIds: [], // Reset the selected IDs after submission
      });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    } catch (error) {
      console.error("Error deleting tags:", error);
    }
  };

  const selectedTagIds = watch("selectedTagIds");

  const [editingTag, setEditingTag] = useState<Tag | null>(null);

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
                    const modal = document.getElementById("add-tag-modal");
                    if (modal instanceof HTMLDialogElement) {
                      modal.showModal();
                    }
                  }}
                >
                  Add
                </button>
                <button
                  disabled={selectedTagIds.length === 0}
                  type="submit"
                  className="btn btn-error"
                >
                  Delete
                </button>
              </div>
            </div>
            <Controller
              name="selectedTagIds"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TagTable
                  tags={data.map((v) => {
                    return {
                      ...v,
                      onClickEdit: () => {
                        setEditingTag(v);
                        const modal = document.getElementById("edit-tag-modal");
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
      <AddTagModal />
      {editingTag && <EditTagModal {...editingTag} />}
    </>
  );
}
