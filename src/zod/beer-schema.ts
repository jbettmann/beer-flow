import { z } from "zod";
import CategorySchema from "./category-schema";

const BeerSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"), // ObjectId string
  image: z.string().url("Invalid image URL").nullable().optional(),
  name: z.string().min(1, "Name is required"),
  style: z.string().min(1, "Style is required"),
  abv: z.number().optional().nullable(),
  ibu: z.number().optional().nullable(),
  category: z.array(CategorySchema).default([]), // Embedding categorySchema
  malt: z.array(z.string()).default([]),
  hops: z.array(z.string()).default([]),
  description: z.string().optional(),
  nameSake: z.string().optional(),
  notes: z.string().optional(),
  archived: z.boolean().default(false),
  releasedOn: z.union([z.string().datetime(), z.date()]).optional().nullable(),
});

export default BeerSchema;
export type BeerFormValues = z.infer<typeof BeerSchema>;
