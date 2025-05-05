import { z } from "zod";
import CategorySchema from "./category-schema";

const BeerSchema = z.object({
  _id: z.string().optional(),
  companyId: z.string().optional(),
  image: z.string().min(1).nullable().optional(),
  name: z.string().min(1, "Name is required"),
  style: z.string().min(1, "Style is required"),
  abv: z.number().optional().nullable(),
  ibu: z.number().optional().nullable(),
  category: z
    .union([z.array(CategorySchema), z.array(z.string())])
    .refine((val) => val.length > 0, {
      message: "At least one category is required",
    }),
  malt: z.array(z.string()).default([]),
  hops: z.array(z.string()).default([]),
  description: z.string().optional(),
  nameSake: z.string().optional(),
  notes: z.string().optional(),
  archived: z.boolean().default(false),
  releasedOn: z.preprocess(
    (val: any) => (val ? new Date(val) : null),
    z.date().nullable().optional()
  ),
});

export default BeerSchema;
export type BeerFormValues = z.infer<typeof BeerSchema>;
