import * as changeKeys from "change-case/keys";
import { z } from "zod";
import { config } from "../../config";

export const tagIdSchema = z.number().brand<"TagId">();
export const colorSchema = z
  .string()
  .brand<"Color">()
  .regex(/^#[0-9a-f]{6}$/);
export type Color = z.infer<typeof colorSchema>;

export const tagSchema = z.object({
  id: tagIdSchema,
  name: z.string(),
  color: colorSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TagIn = z.input<typeof tagSchema>;
export type Tag = z.infer<typeof tagSchema>;

export async function fetchTags() {
  const res = await fetch(`${config.apiEndpoint}/tags`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((error) => {
    throw new Error("failed to fetch tags.", {
      cause: error,
    });
  });

  if (!res.ok) {
    throw new Error(`failed to fetch tags: ${res.statusText}`);
  }

  const jsonData = await res.json();
  const camelCaseJsonData = changeKeys.camelCase(jsonData, 4);
  const valiRes = z.array(tagSchema).safeParse(camelCaseJsonData);

  if (!valiRes.success) {
    throw new Error(
      `failed to fetch tags:\n${z.prettifyError(valiRes.error)}`,
      {
        cause: valiRes.error,
      },
    );
  }

  return valiRes.data;
}

export const addTagSchema = z.object({
  name: z.string().min(1),
  color: colorSchema,
});

type AddTag = z.infer<typeof addTagSchema>;

export async function addTag(data: AddTag): Promise<void> {
  const snakeCaseData = changeKeys.snakeCase(data, 4);
  const res = await fetch(`${config.apiEndpoint}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(snakeCaseData),
  }).catch((error) => {
    throw new Error("failed to add tag.", {
      cause: error,
    });
  });

  if (!res.ok) {
    throw new Error(`failed to add tag: ${res.statusText}`);
  }
}

const deleteIdsSchema = z.array(z.coerce.number());

export async function deleteTags(ids: Tag["id"][]): Promise<void> {
  const valiRes = deleteIdsSchema.safeParse(ids);

  if (!valiRes.success) {
    throw new Error(
      `failed to delete tags:\n${z.prettifyError(valiRes.error)}`,
      {
        cause: valiRes.error,
      },
    );
  }

  const res = await fetch(`${config.apiEndpoint}/tags`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(valiRes.data),
  }).catch((error) => {
    throw new Error("failed to delete tags.", {
      cause: error,
    });
  });

  if (!res.ok) {
    throw new Error(`failed to delete tags: ${res.statusText}`);
  }
}
export const editTagSchema = z.object({
  id: tagIdSchema,
  name: z.string().min(1),
  color: colorSchema,
});

type EditTag = z.infer<typeof editTagSchema>;

export async function editTag(data: EditTag): Promise<void> {
  const snakeCaseData = changeKeys.snakeCase(data, 4);
  const res = await fetch(`${config.apiEndpoint}/tags`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(snakeCaseData),
  }).catch((error) => {
    throw new Error("failed to edit tag.", {
      cause: error,
    });
  });

  if (!res.ok) {
    throw new Error(`failed to edit tag: ${res.statusText}`);
  }
}
