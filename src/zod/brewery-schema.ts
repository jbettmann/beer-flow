import { z } from "zod";

const BrewerySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  owner: z.string().min(1, "Owner ID is required"), // Should be an ObjectId string
  admin: z.array(z.string()).default([]), // ObjectIds
  staff: z.array(z.string()).default([]),
  beers: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  image: z.string().url("Invalid image URL").optional(),
});

export default BrewerySchema;
export type Brewery = z.infer<typeof BrewerySchema>;
