import { z } from "zod";

export const tagIdSchema = z.number().brand<"TagId">();
export const colorSchema = z
  .string()
  .brand<"Color">()
  .regex(/^#[0-9a-f]{6}$/);

export const tagSchema = z.object({
  id: tagIdSchema,
  name: z.string(),
  color: colorSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TagIn = z.input<typeof tagSchema>;
export type Tag = z.infer<typeof tagSchema>;
