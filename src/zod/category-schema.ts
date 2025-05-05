import { z } from "zod";

const CategorySchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Category is required"),
});
export default CategorySchema;
export type Category = z.infer<typeof CategorySchema>;
