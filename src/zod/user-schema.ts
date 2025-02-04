import { z } from "zod";
import NotificationSchema from "./notification-schema";

const UserSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().optional(), // optional since OAuth users may not have one
  breweries: z.array(z.string()).default([]), // Assuming these are ObjectId strings
  image: z.string().url("Invalid image URL").nullable().optional(),
  notifications: NotificationSchema.optional(),
});

export default UserSchema;
export type UserSchemaValues = z.infer<typeof UserSchema>;
