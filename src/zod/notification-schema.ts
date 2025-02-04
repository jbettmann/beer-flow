import { z } from "zod";

const NotificationSchema = z.object({
  allow: z.boolean().default(true),
  newBeerRelease: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
  }),
  beerUpdate: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
  }),
});

export default NotificationSchema;
