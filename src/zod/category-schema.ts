import { z } from "zod";

const CategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export default CategorySchema;
export type Category = z.infer<typeof CategorySchema>;
